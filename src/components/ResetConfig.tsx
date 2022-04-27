import {Button} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";
import {useStateConfig} from "../hooks/useConfig";

const ResetConfig = () => {

  const navigate = useNavigate()

  const {setKeyConfig, setMondayConfig} = useStateConfig();


  const resetKeyConfig = () => {
    setKeyConfig(undefined)
    // window.Main.sendSyncRequest({
    //   method: 'setKeyConfig',
    //   params: [undefined]
    // });
    navigate('/key-config')
  }

  const resetMondayConfig = () => {
    setMondayConfig(undefined)
    // window.Main.sendSyncRequest({
    //   method: 'setMondayConfig',
    //   params: [undefined]
    // });
    navigate('/monday-config')
  }

  return (
    <>
      <Button variant={'ghost'} colorScheme={'blue'} onClick={resetKeyConfig}>Edit your API Keys</Button>
      <Button variant={'ghost'} colorScheme={'yellow'} onClick={resetMondayConfig}>Edit your Monday configuration</Button>
    </>
  )
}

export default ResetConfig;
