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
  }, [keyConfig, mondayConfig])

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>

      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        {!keyConfig && <KeyConfig/>}
        {keyConfig && !mondayConfig && <MondayConfig/>}
      </Stack>
    </Flex>
  )
}

export default Config;