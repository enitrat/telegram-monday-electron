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

  const {additionalConfig, setAdditionalConfig} = useStateConfig()
  const [disabled, setDisabled] = useState(true)


  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {}

    for (const entry of formData.entries()) {
      data[entry[0]] = entry[1];
      if (entry[0] === "exclude_members") {
        const participants = (entry[1] as string).split(',')
        console.log(participants)
      }
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

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Current options
          </Heading>
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
                    <Input id={param.name} name={param.name} type="text" disabled={disabled}
                           value={additionalConfig[param.name] || undefined} placeholder={param.placeholder}/>
                    {!disabled && <FormHelperText>{param.helper}</FormHelperText>}
                  </FormControl>
                )
              })}
              <Stack spacing={10}>

              </Stack>
              {!disabled &&
              <Button
                type={'submit'}
                loadingText="Submitting"
                size="lg"
                bg={'green.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}>
                Start
              </Button>
              }
              {disabled &&
              <>
                <Button
                  size="lg"
                  bg={'blue.400'}
                  color={'white'}
                  onClick={() => setDisabled(false)}
                  _hover={{
                    bg: 'blue.500',
                  }}>
                  Edit
                </Button>
                <Button
                  type={'submit'}
                  loadingText="Starting"
                  size="lg"
                  bg={'green.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}>
                  Start
                </Button>
              </>
              }
            </Stack>
          </Box>

        </form>
      </Stack>
    </Flex>
  )

}

export default AdditionalConfig;