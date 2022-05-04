import {useEffect, useState} from "react";
import {Flex, Spinner} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom"
import MessageFeed from "../components/MessageFeed/MessageFeed";
import OptionalConfig from "../components/OptionalConfig/OptionalConfig";
import {useRunningState} from "../hooks/useRunning";
import {useBoardState} from "../hooks/useBoard";

export const FillBoard = () => {
  const navigate = useNavigate();
  const [tgMessages, setTgMessages] = useState<any[]>([]);

  const {currentBoard, setCurrentBoard} = useBoardState();
  const [ready, setReady] = useState(false);
  const {running, setRunning} = useRunningState();


  const stopService = () => {
    setReady(false)
    setRunning(false);
    window.Main.sendAsyncRequest({method: 'stopTelegram'});
    navigate('/')
  }

  useEffect(() => {

    window.Main.sendAsyncRequest({method: 'getCurrentBoard'});
    window.Main.on('currentBoard', (data) => {
      setCurrentBoard(data)
    })

  }, [])

  useEffect(() => {
    if (!running) return
    let allMessages = []

    const startTelegram = () => {
      setRunning(true)
      window.Main.sendAsyncRequest({method: 'startTelegram', params: [currentBoard.id]});
      window.Main.on('scan_update', handleTelegramUpdate)
    }

    const handleTelegramUpdate = (update: any) => {
      allMessages = [...allMessages, update]
      setTgMessages(allMessages);
    }

    startTelegram();

  }, [running]);

  return (
    <Flex justifyContent={'center'} height={'100vh-40px'}>
      {running &&
      <><MessageFeed
        messages={tgMessages}/>
      </>
      }
      {!currentBoard && <><Spinner/><p>Taking too long ? Retry in a minute or reset your Monday configuration</p></>}
      {!running && currentBoard && <OptionalConfig setRunning={setRunning}/>}
    </Flex>
  );
}

export default FillBoard;