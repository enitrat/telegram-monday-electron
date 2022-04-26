import {useStateConfig} from "../hooks/useConfig";
import {useEffect, useState} from "react";
import {Box, Button, Flex, Link} from "@chakra-ui/react";
import {Link as ReachLink, useNavigate} from "react-router-dom"
import MessageFeed from "../components/MessageFeed/MessageFeed";

export const Ready = () => {
  const {keyConfig, mondayConfig} = useStateConfig()

  const navigate = useNavigate();
  const [tgMessages, setTgMessages] = useState<any[]>([]);
  console.log(tgMessages)

  const stopService = () => {
    window.Main.sendAsyncRequest(JSON.stringify({method: 'stopTelegram'}));
    navigate('/')
  }


  useEffect(() => {
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

  }, []);

  return (
    <Flex
      w="100%"
      maxW={1200}
      height={800}
      maxHeight="calc(100vh - 2rem)"
      flexDirection="column"
      px={8}
      py={8}
      justifyContent={'center'}
    >
      <Box
        maxHeight="100%"
        height="90%"
        bg="gray.200"
        pb={20}
        borderRadius={12}
        overflow="hidden"
        boxShadow="0 2px 2px #0f0f0f04"
      >
        <MessageFeed
          messages={tgMessages}
        />

      </Box>
      <Button colorScheme={'purple'} marginTop={8} alignSelf={'center'} onClick={stopService}>Go back home</Button>
    </Flex>
  );
}

export default Ready;