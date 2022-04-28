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
  FormHelperText
} from '@chakra-ui/react';
import {useStateConfig} from "../../hooks/useConfig";
import {keyConfigParams} from "./constants";
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const KeyConfig = () => {

  const {setKeyConfig} = useStateConfig();
  const navigate = useNavigate();
  const [currentConfig,setCurrentConfig] = useState<any>()


  useEffect(()=>{
    const keyConfig = window.Main.sendSyncRequest({
      method: 'getKeyConfig'
    })

    setCurrentConfig(keyConfig);

  },[])



  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {}
    for (const entry of formData.entries()){
      data[entry[0]]=entry[1];
    }

    window.Main.sendSyncRequest({
      method: 'setKeyConfig',
      params: [data]
    });
    setKeyConfig(data);
    navigate('/config')

  }

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>

      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
      <Stack align={'center'}>
        <Heading fontSize={'4xl'} textAlign={'center'}>
          Enter your API Keys
        </Heading>
        <Text fontSize={'lg'} color={'gray.600'}>
          to connect your telegram account to monday
        </Text>
        <Text fontSize={'md'} color={'gray.400'}>
          These keys are stored locally and never exposed anywhere
        </Text>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}>
          <Stack spacing={4}>
            {keyConfigParams.map((param) => {
              return (
                <FormControl key={param.name} id={param.name} isRequired={param.required}>
                  <FormLabel>{param.helper}</FormLabel>
                  <Input defaultValue={currentConfig ? currentConfig![param.name]||"" : ""} id={param.name} name={param.name} type="text" placeholder={param.placeholder}/>
                </FormControl>
              )
            })}
            <Stack spacing={10}>
              <Button
                type={'submit'}
                loadingText="Submitting"
                size="lg"
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}>
                Submit
              </Button>
            </Stack>
          </Stack>
        </Box>
      </form>
      </Stack>
    </Flex>
  )
}

export default KeyConfig;