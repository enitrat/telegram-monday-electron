import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Select,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import MessageFeed from "../components/MessageFeed/MessageFeed";
import { useRunningState } from "../hooks/useRunning";
import { ContactOrBotModel, MondayBoard } from "../../shared/types";
import { DeleteIcon } from "@chakra-ui/icons";
import { CHANNEL_CONTACTS, CHANNEL_CONTACTSBOTS } from "../../shared/constants";

export const UpdateBoard = () => {
  const navigate = useNavigate();
  const [tgMessages, setTgMessages] = useState<any[]>([]);
  const [allBoards, setAllBoards] = useState<MondayBoard[]>();
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [config, setConfig] = useState();
  const [ready, setReady] = useState(false);
  const { running, setRunning } = useRunningState();

  const [contactBots, setContactBots] = useState<ContactOrBotModel[]>([]);
  const [userToAdd, setUserToAdd] = useState([]);

  const stopService = () => {
    setReady(false);
    setRunning(false);
    window.Main.sendAsyncRequest({ method: "stopTelegram" });
    navigate("/");
  };

  const onBoardChange = (e, index) => {
    const targetBoard = allBoards.find((board) => board.id === e.target.value);
    //new list from old + changed element
    const newSelection = selectedBoards.map((board, boardIndex) => {
      if (boardIndex === index)
        return {
          name: targetBoard.name,
          id: targetBoard.id,
        };
      return board;
    });

    setSelectedBoards(newSelection);
  };

  const deleteBoard = (index) => {
    let left = selectedBoards.slice(0, index); // Everything before configs[index]
    let right = selectedBoards.slice(index + 1); // Everything after configs[index]
    const newItems = [...left, ...right];
    setSelectedBoards(newItems);
  };

  useEffect(() => {
    let storedConfig = window.Main.sendSyncRequest({
      method: "getOptionalConfig",
    });
    if (!storedConfig) storedConfig = {};
    setConfig(storedConfig);
    setSelectedBoards(storedConfig.updated_boards || []);

    window.Main.sendAsyncRequest({
      method: "getAllBoards",
    });

    window.Main.sendAsyncRequest({
      method: "getContactsAndBots",
    });

    window.Main.once(CHANNEL_CONTACTSBOTS, (data: ContactOrBotModel[]) => {
      console.log(data);
      setContactBots(data);
    });

    window.Main.once("all_boards", (boards: MondayBoard[]) => {
      setAllBoards(boards);
    });

    return () => {
      window.Main.sendAsyncRequest({ method: "stopTelegram" });
    };
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const data = config || {};
    //Include_keywords list
    data["updated_boards"] = selectedBoards;

    window.Main.sendSyncRequest({
      method: "setOptionalConfig",
      params: [data],
    });
    setRunning(true);
  };

  const addBoard = () => {
    setSelectedBoards([
      ...selectedBoards,
      {
        id: allBoards[0].id,
        name: allBoards[0].name,
      },
    ]);
  };

  useEffect(() => {
    if (!running) return;
    let allMessages = [];

    const startTelegram = () => {
      setRunning(true);
      window.Main.sendAsyncRequest({
        method: "startBoardUpdates",
        params: [userToAdd],
      });
      window.Main.on("scan_update", handleTelegramUpdate);
    };

    const handleTelegramUpdate = (update: any) => {
      allMessages = [...allMessages, update];
      setTgMessages(allMessages);
    };

    startTelegram();
  }, [running]);

  return (
    <Flex justifyContent={"center"} height={"100vh-40px"}>
      {running && (
        <>
          <MessageFeed messages={tgMessages} />
        </>
      )}
      {!allBoards && (
        <>
          <Spinner />
          <p>
            Loading your Monday boards. Taking too long ? Retry in a minute or
            reset your Monday configuration
          </p>
        </>
      )}
      {!running && allBoards && selectedBoards && (
        <form onSubmit={handleSubmit}>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            {selectedBoards.map((board, index) => {
              return (
                <Flex flexDir={"column"}>
                  <Flex
                    justifyContent={"center"}
                    alignItems={"center"}
                    key={`${board.name}-${index}`}
                    margin={"10px"}
                  >
                    <Select
                      defaultValue={board.id}
                      onChange={(e) => onBoardChange(e, index)}
                    >
                      {allBoards.map((board) => {
                        return (
                          <option key={board.name} value={board.id}>
                            {board.name}
                          </option>
                        );
                      })}
                    </Select>
                    <DeleteIcon
                      marginLeft={"4px"}
                      onClick={() => deleteBoard(index)}
                    ></DeleteIcon>
                  </Flex>
                  {/* create a component that shows a list of contacts and the updates userToAdd when the user selects one*/}
                </Flex>
              );
            })}
            <Flex
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Select
                placeholder="Add contact to exported groups"
                w={"80%"}
                onChange={(e) => {
                  setUserToAdd([...userToAdd, e.target.value]);
                }}
              >
                {contactBots.map((contact) => {
                  return (
                    <option key={contact.id} value={contact.id}>
                      {contact.username}
                    </option>
                  );
                })}
              </Select>
              {userToAdd.length > 0 && (
                <p>
                  These users will be automatically added to the group chat:
                </p>
              )}
              {userToAdd.map((id) => {
                const userContact = contactBots.find(
                  (contact) => Number(contact.id) === Number(id),
                );
                return (
                  <Box>
                    {`   -  ${userContact?.username}`}
                    <DeleteIcon
                      marginLeft={"4px"}
                      onClick={(e) => {
                        let res = userToAdd.filter((item) => item !== id);
                        setUserToAdd(res);
                      }}
                    ></DeleteIcon>
                  </Box>
                );
              })}
            </Flex>
            <Box margin={"10px"}>
              {selectedBoards.length < allBoards.length && (
                <Button
                  size="lg"
                  bg={"blue.400"}
                  color={"white"}
                  marginRight={"10px"}
                  onClick={addBoard}
                  _hover={{
                    bg: "blue.500",
                  }}
                >
                  Add Board
                </Button>
              )}
              <Button
                type={"submit"}
                loadingText="Starting"
                size="lg"
                bg={"green.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
              >
                Update selected boards
              </Button>
            </Box>
          </Box>
        </form>
      )}
    </Flex>
  );
};

export default UpdateBoard;
