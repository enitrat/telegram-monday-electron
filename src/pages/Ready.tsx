import {useStateConfig} from "../hooks/useConfig";
import {useEffect, useState} from "react";
import {Box, Button, Flex, Link} from "@chakra-ui/react";
import {Link as ReachLink, useNavigate} from "react-router-dom"
import MessageFeed from "../components/MessageFeed/MessageFeed";
import OptionalConfig from "../components/OptionalConfig/OptionalConfig";
import ResetConfig from "../components/ResetConfig";

export const Ready = () => {
  const navigate = useNavigate();
  const [tgMessages, setTgMessages] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  const stopService = () => {
    window.Main.sendAsyncRequest({method: 'stopTelegram'});
    navigate('/')
  }

  useEffect(() => {
    if (!ready) return
    let allMessages = []

    const startTelegram = () => {
      window.Main.sendAsyncRequest({method: 'startTelegram'});
      window.Main.on('scan_update', handleTelegramUpdate)
    }

    const handleTelegramUpdate = (update: any) => {
      allMessages = [...allMessages, update]
      setTgMessages(allMessages);
    }

    startTelegram();

  }, [ready]);

  return (
    <>
      <ResetConfig/>
      {ready &&
      <><MessageFeed
        messages={tgMessages}/>
        <Button colorScheme={'purple'} marginTop={8} alignSelf={'center'} onClick={stopService}>Stop</Button>
      </>
      }
      {!ready && <OptionalConfig setReady={setReady}/>}
    </>
  );
}

export default Ready;