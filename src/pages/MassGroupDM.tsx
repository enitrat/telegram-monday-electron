import { useEffect, useRef, useState } from "react";
import { CHANNEL_GROUPS, CHANNEL_MESSAGE_SENT } from "../../shared/constants";
import { CustomDialog } from "../../shared/types";
import {
  Box,
  Button,
  filter,
  Flex,
  Heading,
  Input,
  Progress,
  Select,
  Spinner,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { NotificationManager } from "react-notifications";
import ScrollableFeed from "react-scrollable-feed";
import { RateLimiter } from "limiter";
import Papa from "papaparse";
import { Icon, WarningIcon } from "@chakra-ui/icons";
import { TbMailFast } from "react-icons/tb";

const hoverProps = {
  cursor: "pointer",
  transition: "all .2s ease-in-out",
  transform: "scale(1.15)",
};

enum Status {
  Sent = "SENT",
  Waiting = "WAITING",
  Error = "ERROR",
  Skipped = "SKIPPED",
}

const limiter = new RateLimiter({ tokensPerInterval: 15, interval: "minute" });

const MassGroupDM = () => {
  const [dialogs, setDialogs] = useState<CustomDialog[]>([]);
  let [importedGroups, setImportedGroups] = useState<CustomDialog[]>([]);
  //let [selectedGroupNames, setSelectedGroupNames] = useState<String[]>([])
  let selectedGroupNames: String[] = [];
  const [messageToSend, setMessageToSend] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [validatingKeyword, setValidatingKeyword] = useState<boolean>(false);
  const searchInput = useRef(null);
  const fileInput = useRef(null);
  const [msgSent, setMsgSent] = useState<Record<string, Status>>({});
  let [sending, setSending] = useState<boolean>(false);
  let [progress, setProgress] = useState<number>(0);

  const filterDialogs = (dialogs: CustomDialog[]) => {
    if (keyword === "") return dialogs;
    return dialogs.filter((dialog) =>
      dialog.title.toLowerCase().includes(keyword.toLowerCase()),
    );
  };

  useEffect(() => {
    console.log(msgSent);
  }, [msgSent]);

  const waitForMsgSent = async (timeout, groupId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await limiter.removeTokens(1);
        window.Main.sendAsyncRequest({
          method: "sendGroupMessage",
          params: [groupId, messageToSend],
        });

        window.Main.once(CHANNEL_MESSAGE_SENT, () => resolve(true));
      } catch (error) {
        reject(error);
      }
    });
  };

  const sendMessages = async () => {
    setMsgSent({});
    let _progress = progress;
    for (const group of importedGroups) {
      setMsgSent((prevMsgSent) => ({
        ...prevMsgSent,
        [group.id.value.toString()]: Status.Waiting,
      }));
      const sent = await waitForMsgSent(10 * 1000, group.id);
      if (sent) {
        setMsgSent((prevMsgSent) => ({
          ...prevMsgSent,
          [group.id.value.toString()]: Status.Sent,
        }));
        _progress++;
        setProgress(_progress);
      } else {
        NotificationManager.error("Message couldnt be sent to " + group.title); // REFACTOR NEW MANAGER NOTIF
      }
    }
    setSending(false);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        /*const groupNames = results.data.map((group) => group.title.toLowerCase())
                setSelectedGroupNames(new Set(groupNames))*/
        //setSelectedGroupNames(results.data.map((group) => group.title))
        selectedGroupNames = results.data.map((group) =>
          group.title.toLowerCase(),
        );
        window.Main.sendSyncRequest({
          method: "logGroups",
          params: [results.data],
        });
        window.Main.sendSyncRequest({
          method: "logGroups",
          params: [selectedGroupNames],
        });

        startImport();
      },
    });
  };

  const handleInput = (e) => {
    setKeyword(e.target.value);
  };

  const keywordValidation = () => {
    setValidatingKeyword(true);
    window.Main.sendAsyncRequest({ method: "startTexting" });
    window.Main.once(CHANNEL_GROUPS, (data) => {
      setDialogs(filterDialogs(data));
      setValidatingKeyword(false);
    });
  };

  const startExport = () => {
    let csvContent = "title\n";

    setExporting(true);
    // Add book data to the CSV string
    dialogs.forEach((dialog) => {
      csvContent += `"${dialog.title}"\n`;
    });

    // Convert the CSV string to a Blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

    // Create a link element to trigger the download
    //const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    window.Main.download({ url: url });
    setExporting(false);
  };

  const filterDialogsByName = (data: CustomDialog[]) => {
    window.Main.sendSyncRequest({ method: "logGroups", params: [data] });
    window.Main.sendSyncRequest({
      method: "logGroups",
      params: [selectedGroupNames],
    });
    return data.filter((dialog) =>
      selectedGroupNames.includes(dialog.title.toLowerCase()),
    );
  };

  const startImport = () => {
    //const titles = new Set(["Aurelien e Mathieu 2", "Aurelien e Mathieu"].map((title)=>title.toLowerCase()))
    //setSelectedGroupNames(titles)
    setLoading(true);
    setProgress(0);
    setMsgSent({});
    setMessageToSend("");
    window.Main.sendAsyncRequest({ method: "startTexting" });
    window.Main.once(CHANNEL_GROUPS, (data) => {
      //setImportedGroups()
      let filtered: CustomDialog[] = data as CustomDialog[];
      setImportedGroups(filterDialogsByName(filtered));
      //setImportedGroups(data)
      setLoading(false);
    });
  };

  const renderMessageStatus = (id: string) => {
    switch (msgSent[id]) {
      case Status.Sent:
        return <Icon as={TbMailFast} color={"green.500"} />;
      case Status.Waiting:
        return <Icon as={Spinner} />;
      case Status.Error:
        return <Icon as={WarningIcon} color={"red.500"} />;
      case Status.Skipped:
        return <></>;
    }
  };

  return (
    <Flex flexDir={"column"} alignItems={"center"} width={"100%"}>
      <Flex width={"50%"} flexDir={"column"}>
        <Heading
          alignSelf={"center"}
          justifySelf={"center"}
          as={"h2"}
          size={"sm"}
          marginBottom={"5px"}
        >
          All chats with the following keyword will be exported.
        </Heading>
        <Flex
          width={"100%"}
          flexDir={"row"}
          justifyContent={"space-between"}
          alignItems={"left"}
        >
          <Input width={"80%"} value={keyword} onChange={handleInput} />
          <Button onClick={keywordValidation}>
            {validatingKeyword ? <Spinner /> : <span>Submit '{keyword}'</span>}
          </Button>
        </Flex>

        {dialogs.length > 0 && (
          <Button onClick={startExport}>
            {exporting ? (
              <Spinner />
            ) : (
              <span>Download the list of {dialogs.length} groups</span>
            )}
          </Button>
        )}

        <Heading
          alignSelf={"center"}
          marginTop={"25px"}
          justifySelf={"center"}
          as={"h1"}
          size={"md"}
          marginBottom={"5px"}
        >
          Import a CSV file with all the group names
        </Heading>

        <Flex flexDir={"column"}>
          <input
            type={"file"}
            id={"csvFileInput"}
            accept={".csv"}
            ref={fileInput}
            onChange={handleFileUpload}
          />
        </Flex>
        {fileInput !== null &&
          fileInput.current !== null &&
          fileInput.current.files.length > 0 && (
            <Button onClick={startImport}>
              {loading ? <Spinner /> : <span>Start import</span>}
            </Button>
          )}
      </Flex>

      <Box marginTop={"50px"} height={"100%"} width={"90%"}>
        {importedGroups.length > 0 && (
          <Flex flexDir={"column"}>
            <Heading
              alignSelf={"center"}
              justifySelf={"center"}
              as={"h2"}
              size={"sm"}
              marginBottom={"30px"}
            >
              Write a message that will be sent to all the imported groups.
            </Heading>
            <Flex flexDir={"row"} alignItems="center" width={"80%"}>
              <Flex flexDir={"column"} marginTop={"10px"}>
                <Box width={"100%"} maxHeight={"200px"} p={1}>
                  <ScrollableFeed>
                    {importedGroups.map((group: CustomDialog) => {
                      const id = group.id.value.toString();
                      return (
                        <Flex
                          borderRadius={"10px"}
                          marginBottom={"5px"}
                          boxShadow={"md"}
                          height={"40px"}
                          width={"150px"}
                          alignItems={"center"}
                          justifyContent={"center"}
                          _hover={{ ...hoverProps, transform: "scale(1.05)" }}
                          //onClick={(e) => excludeUser(e, participant)}
                          flexWrap={"wrap"}
                          key={id}
                        >
                          <Text
                            textAlign={"center"}
                            fontSize={"14px"}
                            wordBreak={"break-word"}
                          >
                            <Box>{group.title}</Box>
                            {msgSent[id] && renderMessageStatus(id)}
                          </Text>
                        </Flex>
                      );
                    })}
                  </ScrollableFeed>
                </Box>
              </Flex>
              <Flex
                width={"100%"}
                flexDir={"column"}
                maxHeight={"300px"}
                justifyContent={"center"}
                borderRadius={"20px"}
                background={"gray.50"}
                padding={"20px"}
              >
                <Flex flexDir={"column"}>
                  <Box width={"100%"}>
                    <Textarea
                      maxW={"100%"}
                      maxH={"95%"}
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
                      {sending ? (
                        <span>
                          {" "}
                          {progress} / {importedGroups.length}{" "}
                        </span>
                      ) : (
                        <span>
                          Send message to {importedGroups.length} groups{" "}
                        </span>
                      )}
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Box>
    </Flex>
  );
};
export default MassGroupDM;
