import {Button} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {useStateConfig} from "../hooks/useConfig";

const ResetConfig = () => {

  const navigate = useNavigate()

  const {setKeyConfig, setMondayConfig} = useStateConfig();


  const resetKeyConfig = () => {
    setKeyConfig(undefined)
    window.Main.sendSyncRequest({
      method: 'setKeyConfig',
      params: [undefined]
    });
    navigate('/')
  }

  const resetMondayConfig = () => {
    setMondayConfig(undefined)
    window.Main.sendSyncRequest({
      method: 'setMondayConfig',
      params: [undefined]
    });
    navigate('/')
  }

  return (
    <>
      <Button onClick={resetKeyConfig}>Reset your API Keys</Button>
      <Button onClick={resetMondayConfig}>Reset your Monday configuration</Button>
    </>
  )
}

export default ResetConfig;
