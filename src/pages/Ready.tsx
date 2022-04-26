import {useStateConfig} from "../hooks/useConfig";
import {useEffect, useState} from "react";
import {Button, Link} from "@chakra-ui/react";
import {Link as ReachLink} from "react-router-dom"

export const Ready = () => {
  const {keyConfig, mondayConfig} = useStateConfig()

  const [tgMessages, setTgMessages] = useState<string[]>([]);


  const handleTelegramUpdate = (update: any) => {
    console.log(update);
    setTgMessages([...tgMessages, update]);
  }
  useEffect(() => {
    window.Main.sendAsyncRequest(JSON.stringify({method: 'startTelegram'}));
    window.Main.on('scan_update', handleTelegramUpdate)
  });
  return (
    <>
      <h1>Ready !</h1>
      Your config : {JSON.stringify(keyConfig)}-{JSON.stringify(mondayConfig)}
      {tgMessages.map((message) => {
        return <p>{message}</p>
      })}
      <Link as={ReachLink} to='/'>Go back home</Link>
    </>

  )
}

export default Ready;