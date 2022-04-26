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
import {mondayConfigParams} from "./constants";

export const MondayConfig = () => {

  const {setMondayConfig} = useStateConfig();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {}

    for (const entry of formData.entries()){
      data[entry[0]]=entry[1];
    }
    
    window.Main.sendSyncRequest(JSON.stringify({
      method: 'setMondayConfig',
      params: [data]
    }));
    setMondayConfig(data);

  }

  return (
    <>
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
            {mondayConfigParams.map((param) => {
              return (
                <FormControl id={param.name} isRequired={param.required}>
                  <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
                  <Input id={param.name} name={param.name} type="text" placeholder={param.placeholder}/>
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
    </>
  )
}