import KeyConfig from "../components/KeyConfig/KeyConfig";
import {MondayConfig} from "../components/MondayConfig/MondayConfig";
import {useStateConfig} from "../hooks/useConfig";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';


const Config = (props: any) => {
  const {setKeyConfig, setMondayConfig} = useStateConfig()
  const navigate = useNavigate();



  useEffect(() => {

    const keyConfig = window.Main.sendSyncRequest({
      method: 'getKeyConfig'
    })

    const mondayConfig = window.Main.sendSyncRequest({
      method: 'getMondayConfig'
    });
    console.log(keyConfig)
    console.log(mondayConfig)

    if (keyConfig) setKeyConfig(keyConfig);
    if (mondayConfig) setMondayConfig(mondayConfig);

    if (!keyConfig) navigate('/key-config')
    if (keyConfig && !mondayConfig) navigate('/monday-config')
    if (keyConfig && mondayConfig) navigate('/ready');

  }, [])

  return (<></>)
}

export default Config;