import {useStateConfig} from "../hooks/useConfig";
import {useEffect, useState} from "react";
import {Button} from "@chakra-ui/react";

export const Ready = () => {
  const {keyConfig, mondayConfig} = useStateConfig()

  const [tgMessages, setTgMessages] = useState<string[]>([]);


  const handleTelegramUpdate = (update: any) => {
    console.log(update);
    setTgMessages([...tgMessages, update]);
  }
  useEffect(() => {
    window.Main.sendAsyncRequest(JSON.stringify({method: 'startTelegram'}));
    window.Main.on('telegram-update', handleTelegramUpdate)
  });
  return (
    <>
      <h1>Ready !</h1>
      Your config : {JSON.stringify(keyConfig)}-{JSON.stringify(mondayConfig)}
      {tgMessages.map((message) => {
        return <p>{message}</p>
      })}

    </>

  )
}

export default Ready;