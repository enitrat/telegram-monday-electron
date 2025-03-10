import { useEffect, useRef, useState } from "react";
import {
  CHANNEL_GROUPS,
  CHANNEL_LAST_MESSAGES,
  CHANNEL_MESSAGE_SENT,
  CHANNEL_PARTICIPANTS,
} from "../../shared/constants";
import {
  DialogModel,
  MessageModel,
  UserModel,
  ParticipantPlusDate,
} from "../../shared/types";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Select,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { NotificationManager } from "react-notifications";
import ScrollableFeed from "react-scrollable-feed";
import { MessageBox } from "../components/MessageBox/MessageBox";

const Texting = () => {
  const [dialogs, setDialogs] = useState<DialogModel[]>([]);
  const [selectedDialog, setSelectedDialog] = useState<DialogModel>();
  const [participants, setParticipants] = useState<ParticipantPlusDate[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [messageToSend, setMessageToSend] = useState<string>("");
  const [previousMessages, setPreviousMessages] = useState<MessageModel[]>([]);
  const [suggestions, setSuggestions] = useState<DialogModel[]>([]);
  const [inputValue, setInputValue] = useState("");
  const searchInput = useRef(null);

  useEffect(() => {
    window.Main.sendAsyncRequest({ method: "startAndGetGroups" });
    window.Main.once(CHANNEL_GROUPS, (data: DialogModel[]) => {
      setDialogs(data);
      setSuggestions(data);
    });

    return () => {
      window.Main.off(CHANNEL_GROUPS, () => {});
    };
  }, []);

  useEffect(() => {
    setParticipants([]);
    setIndex(0);
    if (!selectedDialog) return;
    window.Main.sendAsyncRequest({
      method: "getOrderedByLastDMParticipants",
      params: [selectedDialog.id],
    });
    window.Main.once(CHANNEL_PARTICIPANTS, (data: ParticipantPlusDate[]) => {
      if (!data) {
        NotificationManager.error("Couldn't get participants");
        return;
      }
      setParticipants(data);
    });

    return () => {
      window.Main.off(CHANNEL_PARTICIPANTS, () => {});
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
    window.Main.once(CHANNEL_LAST_MESSAGES, (data: MessageModel[]) => {
      if (!data) {
        NotificationManager.error("Couldn't get messages");
        return;
      }
      setPreviousMessages(data);
    });
  }, [index || participants || selectedDialog]);

  const selectDialog = (e: any) => {
    const value = e.target.value;
    const correspondingDialog = dialogs.find(
      (dialog) => dialog.title === value,
    );
    setInputValue(correspondingDialog?.title || "");
    setSelectedDialog(correspondingDialog);
  };

  const changeParticipant = (e: any) => {
    const value = e.target.value;
    setIndex(parseInt(value));
  };

  const sendMessage = () => {
    window.Main.sendAsyncRequest({
      method: "sendUserMessage",
      params: [participants[index].id, messageToSend],
    });
    window.Main.once(CHANNEL_MESSAGE_SENT, () => {
      NotificationManager.success("Message sent");
      setMessageToSend("");
      if (index !== participants.length - 1) setIndex(index + 1);
    });
  };

  const changeSuggestions = (e: any) => {
    const value: string = e.target.value as string;
    setInputValue(value);
    const newSuggestions = dialogs.filter((dialog) =>
      dialog.title.toLowerCase().includes(value.toLowerCase()),
    );
    setSuggestions(newSuggestions);
  };

  return (
    <Flex flexDir={"column"} alignItems={"center"} width={"100%"}>
      <Flex width={"50%"} flexDir={"column"}>
        <Heading
          alignSelf={"center"}
          justifySelf={"center"}
          as={"h1"}
          size={"md"}
          marginBottom={"5px"}
        >
          Select the group whose members you want to text
        </Heading>
        {dialogs.length > 0 && (
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
          </Flex>
        )}
      </Flex>

      {document.activeElement !== searchInput.current && (
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
                Write a message !
              </Heading>
              <Flex flexDir={"row"}>
                <Flex flexDir={"column"} width={"50%"}>
                  <Select
                    width="200px"
                    alignSelf={"flex-start"}
                    value={index}
                    onChange={(value) => changeParticipant(value)}
                  >
                    {participants.map((participant, index) => {
                      return (
                        <option
                          key={`${participant.firstName || ""}-${
                            participant.username || ""
                          }`}
                          value={index}
                        >{`${participant.firstName || ""} ${
                          participant.lastName || ""
                        } | @${participant.username}`}</option>
                      );
                    })}
                  </Select>
                  <Box marginTop={"10px"} maxHeight={"300px"} p={6}>
                    <ScrollableFeed>
                      {previousMessages?.map((message: any, key) => (
                        <MessageBox message={message} key={key} />
                      ))}
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
                  <Flex flexDir={"column"}>
                    <Text size={"md"}>
                      {participants[index].firstName}{" "}
                      {participants[index].lastName}
                    </Text>
                    <Text size={"sm"} color={"gray.600"}>
                      @{participants[index].username}
                    </Text>
                  </Flex>
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
                    <Button
                      color={"blue.300"}
                      onClick={() => setIndex(index - 1)}
                      disabled={index === 0}
                    >
                      Prev
                    </Button>
                    <Button color={"green.500"} onClick={sendMessage}>
                      Send message
                    </Button>
                    <Button
                      color={"blue.300"}
                      onClick={() => setIndex(index + 1)}
                      disabled={index === participants.length - 1}
                    >
                      Next
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          )}
        </Box>
      )}
    </Flex>
  );
};
export default Texting;
