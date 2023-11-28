import { useEffect, useState } from "react";
import { Flex, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import MessageFeed from "../components/MessageFeed/MessageFeed";
import OptionalConfig from "../components/OptionalConfig/OptionalConfig";
import { useRunningState } from "../hooks/useRunning";
import { useBoardState } from "../hooks/useBoard";
import { useStateConfig } from "../hooks/useConfig";
import { MondayBoard } from "../../shared/types";

export const FillBoard = () => {
  const navigate = useNavigate();
  const [tgMessages, setTgMessages] = useState<any[]>([]);

  const { currentBoard, setCurrentBoard } = useBoardState();
  const { mondayConfig } = useStateConfig();
  const [ready, setReady] = useState(false);
  const { running, setRunning } = useRunningState();

  useEffect(() => {
    if (!mondayConfig) return;
    window.Main.sendAsyncRequest({
      method: "getCurrentBoard",
      params: [mondayConfig.board_id],
    });
    window.Main.once("currentBoard", (data: MondayBoard) => {
      setCurrentBoard(data);
    });
  }, [mondayConfig]);

  useEffect(() => {
    if (!running) return;
    let allMessages = [];

    const startTelegram = () => {
      setRunning(true);
      window.Main.sendAsyncRequest({
        method: "startBoardFill",
        params: [currentBoard.id],
      });
      window.Main.on("scan_update", handleTelegramUpdate);
    };

    const handleTelegramUpdate = (update: any) => {
      setTgMessages((prev) => [...prev, update]);
    };

    startTelegram();

    return () => {
      window.Main.sendAsyncRequest({ method: "stopTelegram" });
    };
  }, [running]);

  return (
    <Flex justifyContent={"center"} height={"100vh-40px"}>
      {running && (
        <>
          <MessageFeed messages={tgMessages} />
        </>
      )}
      {!currentBoard && (
        <>
          <Spinner />
          <p>
            Taking too long ? Retry in a minute or reset your Monday
            configuration
          </p>
        </>
      )}
      {!running && currentBoard && <OptionalConfig setRunning={setRunning} />}
    </Flex>
  );
};

export default FillBoard;
