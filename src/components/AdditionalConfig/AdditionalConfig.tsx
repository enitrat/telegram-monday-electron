import {useEffect, useState} from "react";
import {
  Box, Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import KeyConfig from "../KeyConfig/KeyConfig";
import {MondayConfig} from "../MondayConfig/MondayConfig";
import {mondayConfigParams} from "../MondayConfig/constants";
import {useStateConfig} from "../../hooks/useConfig";
import {additionalConfigParams} from "./constants";

const AdditionalConfig = (props) => {

  const {additionalConfig,setAdditionalConfig} = useStateConfig()
  // const [additionalConfig, setAdditionalConfig] = useState<any>()


  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {}

    for (const entry of formData.entries()) {
      data[entry[0]] = entry[1];
    }
    console.log(data)

    window.Main.sendSyncRequest(JSON.stringify({
      method: 'setOptionalConfig',
      params: [data]
    }));
    setAdditionalConfig(data);
    props.setReady(true)
  }

  useEffect(() => {
    const storedConfig = window.Main.sendSyncRequest(JSON.stringify({
      method: 'getOptionalConfig'
    }))
    setAdditionalConfig(storedConfig);
  }, [])

  return(
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('gray.50', 'gray.800')}>
        <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
          <Stack align={'center'}>
            <Heading fontSize={'4xl'} textAlign={'center'}>
              Enter your Monday Configuration
            </Heading>
            <Text fontSize={'md'} color={'gray.400'}>
              These settings are stored locally and never exposed anywhere
            </Text>
          </Stack>
          <form onSubmit={handleSubmit}>
            <Box
              rounded={'lg'}
              bg={useColorModeValue('white', 'gray.700')}
              boxShadow={'lg'}
              p={8}>
              <Stack spacing={4}>
                {additionalConfigParams.map((param) => {
                  return (
                    <FormControl id={param.name} isRequired={param.required}>
                      <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
                      <Input id={param.name} name={param.name} type="text" value={additionalConfig[param.name] || undefined} placeholder={param.placeholder}/>
                      <FormHelperText>{param.helper}</FormHelperText>
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
                    Sign up
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </form>
        </Stack>
      </Flex>
  )

}

export default AdditionalConfig;