import { useEffect, useRef, useState } from "react";
import {
  CHANNEL_GROUPS,
  CHANNEL_IDS,
  CHANNEL_LAST_MESSAGES,
  CHANNEL_MESSAGE_SENT,
  CHANNEL_PARTICIPANTS,
} from "../../shared/constants";
import { CustomDialog, CustomParticipant } from "../../shared/types";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Select,
  Spinner,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { NotificationManager } from "react-notifications";
import ScrollableFeed from "react-scrollable-feed";
import { BiCheckboxChecked, BiCheckbox } from "react-icons/bi";
import { ImCheckboxChecked } from "react-icons/im";
import { TbMailFast } from "react-icons/tb";
import { Icon } from "@chakra-ui/icons";
import { RateLimiter } from "limiter";
import Papa from "papaparse";

const hoverProps = {
  cursor: "pointer",
  transition: "all .2s ease-in-out",
  transform: "scale(1.15)",
};

const limiter = new RateLimiter({ tokensPerInterval: 15, interval: "minute" });

const MassDM = () => {
  const [dialogs, setDialogs] = useState<CustomDialog[]>([]);
  const [selectedDialog, setSelectedDialog] = useState<CustomDialog>();
  const [participants, setParticipants] = useState<CustomParticipant[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [messageToSend, setMessageToSend] = useState<string>("");
  const [previousMessages, setPreviousMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const searchInput = useRef(null);
  const fileInput = useRef(null);
  const [excludedUsers, setExcludedUsers] = useState<{
    [key: string]: boolean;
  }>({});
  const [importing, setImporting] = useState<boolean>(false);
  let [msgSent, setMsgSent] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    window.Main.sendAsyncRequest({ method: "startTexting" });
    window.Main.once(CHANNEL_GROUPS, (data) => {
      setDialogs(data);
      setSuggestions(data);
    });

    return () => {
      window.Main.off(CHANNEL_GROUPS, undefined);
    };
  }, []);

  useEffect(() => {
    setParticipants([]);
    setIndex(0);
    if (!selectedDialog) return;
    window.Main.sendAsyncRequest({
      method: "getGroupParticipants",
      params: [selectedDialog.id],
    });
    window.Main.once(CHANNEL_PARTICIPANTS, (data) => {
      if (!data) {
        NotificationManager.error("Couldn't get participants");
        return;
      }
      setParticipants(data);
    });

    return () => {
      window.Main.off(CHANNEL_PARTICIPANTS, undefined);
    };
  }, [selectedDialog]);

  useEffect(() => {
    setPreviousMessages([]);
    if (participants.length === 0) return;
    setPreviousMessages([]);
    window.Main.sendAsyncRequest({
      method: "getUserLastMessages",
      params: [participants[index].id],
    });
    window.Main.once(CHANNEL_LAST_MESSAGES, (data) => {
      if (!data) {
        NotificationManager.error("Couldn't get messages");
        return;
      }
      setPreviousMessages(data);
    });
  }, [index || participants || selectedDialog]);

  const getIdsFromUsernames = (usernames: string[]) => {
    window.Main.sendAsyncRequest({
      method: "getIdsFromUsernames",
      params: [usernames],
    });
    window.Main.once(CHANNEL_IDS, (data) => {
      if (!data) {
        NotificationManager.error("Couldn't get user ids");
        return;
      }
      setParticipants(data);
      setImporting(false);
    });
  };

  useEffect(() => {
    console.log(msgSent);
  }, [msgSent]);

  useEffect(() => {
    console.log(participants);
  }, [participants]);

  const selectDialog = (e) => {
    const value = e.target.value;
    const correspondingDialog = dialogs.find(
      (dialog) => dialog.title === value,
    );
    setInputValue(correspondingDialog.title);
    setSelectedDialog(correspondingDialog);
    fileInput.current.value = null;
  };

  const changeParticipant = (e) => {
    const value = e.target.value;
    setIndex(parseInt(value));
  };

  const excludeUser = (e, participant: CustomParticipant) => {
    const id = Number(participant.id.value).toString();
    let isExcluded = excludedUsers[id] === true;
    excludedUsers[id] = !isExcluded;
    setExcludedUsers({ ...excludedUsers });
  };

  const waitForMsgSent = async (timeout: number, id: any) => {
    return new Promise(async (resolve, reject) => {
      await limiter.removeTokens(1);
      window.Main.sendAsyncRequest({
        method: "sendUserMessage",
        params: [id, messageToSend],
      });
      window.Main.once(CHANNEL_MESSAGE_SENT, (data) => {
        msgSent[Number(id.value).toString()] = true;
        setMsgSent({ ...msgSent });
        resolve(true);
      });
      setTimeout(resolve, 10 * 1000);
    });
  };

  const sendMessages = async () => {
    msgSent = {};
    for (const participant of participants) {
      const id = Number(participant.id.value).toString();
      const isExcluded = excludedUsers[id] === true;
      if (isExcluded) continue;
      const sent = await waitForMsgSent(10 * 1000, participant.id);
      if (!sent)
        NotificationManager.error(
          "Message couldnt be sent to " + participant.username,
        ); // REFACTOR NEW MANAGER NOTIF
    }
  };

  const changeSuggestions = (e) => {
    const value: string = e.target.value as string;
    setInputValue(value);
    const newSuggestions = dialogs.filter((dialog) =>
      dialog.title.toLowerCase().includes(value.toLowerCase()),
    );
    setSuggestions(newSuggestions);
  };

  const handleListUsernamesUpload = (e) => {
    setImporting(true);
    e.preventDefault();
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (!results.meta.fields.includes("username")) {
          NotificationManager.error("CSV file must have a 'username' column");
          setImporting(false);
          return;
        }
        if (results.errors.length > 1) {
          // there is one error when not able to identify delimiter
          NotificationManager.error("Couldn't parse CSV file");
          setImporting(false);
          return;
        }
        // Extract usernames, filtering out rows without a 'username' or with an empty 'username'
        const usernames = results.data
          .filter((row: any) => row.username && row.username.trim() !== "")
          .map((row: any) => row.username);

        await getIdsFromUsernames(usernames);
      },
    });
  };

  const handleListGroupUpload = (e) => {
    setImporting(true);
    setParticipants([]);
    setIndex(0);
    e.preventDefault();
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        if (results.errors.length > 1) {
          // there is one error when not able to identify delimiter
          NotificationManager.error("Couldn't parse CSV file");
          setImporting(false);
          return;
        }
        const selectedGroupNames = results.data.map(
          (group: { title: string }) => group.title.toLowerCase(),
        );
        const matchingGroups = dialogs.filter((dialog) =>
          selectedGroupNames.includes(dialog.title.toLowerCase()),
        );
        processGroups(matchingGroups);
      },
    });
  };

  async function processGroups(groups: CustomDialog[]) {
    const _participants = [];

    for (const group of groups) {
      console.log(group)
      try {
        const data: CustomParticipant[] = await new Promise(
          (resolve, reject) => {
            window.Main.sendAsyncRequest({
              method: "getGroupParticipants",
              params: [group.id],
            });
            window.Main.once(CHANNEL_PARTICIPANTS, (data) => {
              if (!data) {
                reject("Couldn't get participants for group " + group.id);
              } else {
                resolve(data);
              }
            });
          },
        );

        _participants.push(...data);
      } catch (error) {
        NotificationManager.error(error);
      }
    }

    const participantIds = new Set();
    const uniqueParticipants = [];

    for (const _participant of _participants) {
      if (!participantIds.has(_participant.id.value)) {
        participantIds.add(_participant.id.value);
        uniqueParticipants.push(_participant);
      }
    }

    setParticipants(uniqueParticipants);
    setImporting(false);
  }

  return (
    <Flex flexDir={"column"} alignItems={"center"} width={"100%"}>
      <Flex width={"90%"} flexDir={"column"}>
        <Heading
          alignSelf={"center"}
          justifySelf={"center"}
          as={"h1"}
          size={"md"}
          marginBottom={"5px"}
        >
          Select the group whose members you want to text, or import a CSV file
        </Heading>
        {dialogs.length === 0 ? (
          <Spinner />
        ) : (
          <Flex flexDir={"column"}>
            <Input
              autoFocus
              type={"text"}
              ref={searchInput}
              value={inputValue}
              onChange={(e) => changeSuggestions(e)}
            ></Input>
            {document.activeElement === searchInput.current && (
              <Flex
                flexDir={"column"}
                marginTop={"2px"}
                boxShadow={"0px 8px 16px 0px rgba(0,0,0,0.2)"}
                maxHeight={"200px"}
                overflow={"auto"}
              >
                {suggestions.length > 0 &&
                  suggestions.map((suggestion) => {
                    return (
                      <Flex
                        flexDir="column"
                        justifyContent={"center"}
                        key={suggestion.title}
                      >
                        <Button
                          width={"100%"}
                          justifySelf="center"
                          alignSelf={"center"}
                          padding={"1px"}
                          marginBottom="3px"
                          variant={"unstyled"}
                          value={suggestion.title}
                          onClick={(e) => selectDialog(e)}
                        >
                          {suggestion.title}
                        </Button>
                        <Divider />
                      </Flex>
                    );
                  })}
              </Flex>
            )}
            <Flex justifyContent="center" alignItems="center">
              <Box width="50%" p={4} textAlign="center">
                <Text mb={2} fontWeight="bold">
                  Upload a csv list of usernames to text:
                </Text>
                <Text fontSize="sm" mb={4}>
                  The first row is the header with a single column named
                  "username". Each subsequent row (user1, user2, etc.) contains
                  a username.
                </Text>
                <Input
                  type="file"
                  id="csvFileInputUsernames"
                  accept=".csv"
                  ref={fileInput}
                  onChange={handleListUsernamesUpload}
                />
              </Box>

              <Box width="50%" p={4} textAlign="center">
                <Text mb={2} fontWeight="bold">
                  Upload a csv list of groups. All participants of these groups
                  will be texted.
                </Text>
                <Text fontSize="sm" mb={4}>
                  The first row is the header with a single column named
                  "title". Each subsequent row (title1, title2, etc.) contains a
                  group title.
                </Text>
                <Input
                  type="file"
                  id="csvFileInputGroup"
                  accept=".csv"
                  ref={fileInput}
                  onChange={handleListGroupUpload}
                />
              </Box>
            </Flex>
          </Flex>
        )}
      </Flex>
      {importing ? (
        <Box>
          Importing users...
          <Spinner />
        </Box>
      ) : (
        participants &&
        participants.length > 0 && (
          <Box marginTop={"50px"} height={"100%"} width={"90%"}>
            {participants.length > 0 && index <= participants.length && (
              <Flex flexDir={"column"}>
                <Heading
                  alignSelf={"center"}
                  justifySelf={"center"}
                  as={"h2"}
                  size={"sm"}
                  marginBottom={"30px"}
                >
                  Write a message that will be sent to all the selected users.
                </Heading>
                <Flex flexDir={"row"}>
                  <Flex flexDir={"column"} marginTop={"10px"}>
                    <Box width={"100%"} maxHeight={"400px"} p={1}>
                      <ScrollableFeed>
                        {Object.values(participants).map(
                          (participant: CustomParticipant, index) => {
                            const id = Number(participant.id.value).toString();
                            const excluded = excludedUsers[id] === true;
                            return (
                              <Flex
                                borderRadius={"10px"}
                                marginBottom={"5px"}
                                boxShadow={"md"}
                                height={"40px"}
                                width={"150px"}
                                alignItems={"center"}
                                justifyContent={"center"}
                                _hover={{
                                  ...hoverProps,
                                  transform: "scale(1.05)",
                                }}
                                onClick={(e) => excludeUser(e, participant)}
                                flexWrap={"wrap"}
                                key={id}
                              >
                                <Text
                                  textAlign={"center"}
                                  fontSize={"14px"}
                                  wordBreak={"break-word"}
                                >
                                  {excluded ? (
                                    <Box>
                                      <Icon as={BiCheckbox} />
                                      {participant.username}
                                    </Box>
                                  ) : (
                                    <Box>
                                      <Icon as={ImCheckboxChecked} />
                                      {participant.username}
                                    </Box>
                                  )}
                                  {msgSent[id] && (
                                    <Icon as={TbMailFast} color={"green.500"} />
                                  )}
                                </Text>
                              </Flex>
                            );
                          },
                        )}
                      </ScrollableFeed>
                    </Box>
                  </Flex>
                  <Flex
                    marginLeft="30px"
                    width={"50%"}
                    flexDir={"column"}
                    alignItems="center"
                    maxHeight={"300px"}
                    justifyContent={"center"}
                    borderRadius={"20px"}
                    background={"gray.50"}
                    padding={"20px"}
                  >
                    <Flex flexDir={"column"}></Flex>
                    <Box width={"100%"}>
                      <Textarea
                        maxW={"100%"}
                        maxH={"200px"}
                        background={"white"}
                        value={messageToSend}
                        onChange={(e) => setMessageToSend(e.target.value)}
                      ></Textarea>
                    </Box>
                    <Flex
                      width={"100%"}
                      marginTop={"10px"}
                      justifyContent={"space-between"}
                    >
                      <Button color={"green.500"} onClick={sendMessages}>
                        Send message
                      </Button>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            )}
          </Box>
        )
      )}
    </Flex>
  );
};
export default MassDM;
