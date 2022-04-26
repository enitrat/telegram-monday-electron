import {useStateConfig} from "../hooks/useConfig";
import {useEffect, useState} from "react";
import {Box, Button, Flex, Link} from "@chakra-ui/react";
import {Link as ReachLink, useNavigate} from "react-router-dom"
import MessageFeed from "../components/MessageFeed/MessageFeed";
import AdditionalConfig from "../components/AdditionalConfig/AdditionalConfig";

export const Ready = () => {
  const navigate = useNavigate();
  const [tgMessages, setTgMessages] = useState<any[]>([]);
  const [ready, setReady] = useState(false);

  const stopService = () => {
    window.Main.sendAsyncRequest(JSON.stringify({method: 'stopTelegram'}));
    navigate('/')
  }

  useEffect(() => {
    if (!ready) return
    let allMessages = []

    const startTelegram = () => {
      window.Main.sendAsyncRequest(JSON.stringify({method: 'startTelegram'}));
      window.Main.on('scan_update', handleTelegramUpdate)
    }

    const handleTelegramUpdate = (update: any) => {
      const parsedUpdate = JSON.parse(update);
      allMessages = [...allMessages, parsedUpdate]
      setTgMessages(allMessages);
    }

    startTelegram();

  }, [ready]);

  return (
    <>
      {ready &&
      <><MessageFeed
        messages={tgMessages}/>
        <Button colorScheme={'purple'} marginTop={8} alignSelf={'center'} onClick={stopService}>Stop</Button>
      </>
      }
      {!ready && <AdditionalConfig setReady={setReady}/>}
    </>
  );
}

export default Ready;