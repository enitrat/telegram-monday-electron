import {useStateConfig} from "../hooks/useConfig";
import {useEffect, useState} from "react";
import {Box, Button, Flex, Link} from "@chakra-ui/react";
import {Link as ReachLink, useNavigate} from "react-router-dom"
import MessageFeed from "../components/MessageFeed/MessageFeed";
import OptionalConfig from "../components/OptionalConfig/OptionalConfig";
import ResetConfig from "../components/ResetConfig";
import Settings from "../components/Settings";
import {useRunningState} from "../hooks/useRunning";
import {useBoardState} from "../hooks/useBoard";

export const Ready = () => {
  const navigate = useNavigate();
  const [tgMessages, setTgMessages] = useState<any[]>([]);

  const {currentBoard, setCurrentBoard} = useBoardState();
  // const [currentBoard,setCurrentBoard] = useState<any>();
  const [ready, setReady] = useState(false);
  const {running, setRunning} = useRunningState();


  const stopService = () => {
    setReady(false)
    setRunning(false);
    window.Main.sendAsyncRequest({method: 'stopTelegram'});
    navigate('/')
  }

  useEffect(()=>{
    window.Main.sendAsyncRequest({method: 'getCurrentBoard'});
    window.Main.on('currentBoard',(data)=>{
      console.log('currentBoard')
      console.log(data)
      setCurrentBoard(data)
    })

  },[])

  useEffect(() => {
    if (!running) return
    let allMessages = []

    const startTelegram = () => {
      setRunning(true)
      window.Main.sendAsyncRequest({method: 'startTelegram'});
      window.Main.on('scan_update', handleTelegramUpdate)
    }

    const handleTelegramUpdate = (update: any) => {
      allMessages = [...allMessages, update]
      setTgMessages(allMessages);
    }

    startTelegram();

  }, [running]);

  return (
    <Box height={'100vh-40px'}>
      {running &&
      <><MessageFeed
        messages={tgMessages}/>
      </>
      }
      {!currentBoard &&<p>Loading</p>}
      {!running && currentBoard && <OptionalConfig setRunning={setRunning}/>}
    </Box>
  );
}

export default Ready;