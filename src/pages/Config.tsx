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
  const {keyConfig, mondayConfig} = useStateConfig()
  const navigate = useNavigate();

  useEffect(() => {
    if (keyConfig && mondayConfig) navigate('/ready');
    if (!keyConfig) navigate('/key-config')
    if (!mondayConfig) navigate('/monday-config')
  }, [keyConfig, mondayConfig])

  return (<></>)
}

export default Config;