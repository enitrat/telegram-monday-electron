import { useEffect, useRef, useState } from "react";
import { CHANNEL_GROUPS, CHANNEL_PARTICIPANTS } from "../../shared/constants";
import { CustomDialog } from "../../shared/types";
import { NotificationManager } from "react-notifications";
import { Box, Button, Divider, Flex, Heading, Input } from "@chakra-ui/react";

const exportToCSV = () => {
  const [selectedDialog, setSelectedDialog] = useState<CustomDialog>();
  const [participants, setParticipants] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [dialogs, setDialogs] = useState<CustomDialog[]>([]);
  const [suggestions, setSuggestions] = useState<CustomDialog[]>([]);
  const searchInput = useRef();

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
    if (!selectedDialog) return;
    window.Main.sendAsyncRequest({
      method: "getOrderedByLastDMParticipants",
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

  const selectDialog = (e) => {
    const value = e.target.value;
    const correspondingDialog = dialogs.find(
      (dialog) => dialog.title === value,
    );
    setInputValue(correspondingDialog.title);
    setSelectedDialog(correspondingDialog);
  };

  const changeSuggestions = (e) => {
    const value: string = e.target.value as string;
    setInputValue(value);
    const newSuggestions = dialogs.filter((dialog) =>
      dialog.title.toLowerCase().includes(value.toLowerCase()),
    );
    setSuggestions(newSuggestions);
  };

  const startExport = () => {
    const fmt = participants.map((participant) => {
      return { ...participant, id: participant.id.value.toString() };
    });
    const items = fmt;
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(items[0]);
    const csv = [
      header.join(","), // header row first
      ...items.map((row) =>
        header
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(","),
      ),
    ].join("\r\n");
    const encodedUri = encodeURI(csv);
    // console.log(encodedUri)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    window.Main.download({ url: url });
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
          Select the group to export
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
      <Flex>
        {selectedDialog && (
          <Button marginTop={"50px"} onClick={startExport}>
            Download CSV
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
export default exportToCSV;
