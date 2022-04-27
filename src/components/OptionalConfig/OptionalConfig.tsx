import {useEffect, useState} from "react";
import {
  Box, Button, Checkbox,
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
import {additionalConfigParams, secondaryBoardConfig} from "./constants";
import FormItem from "../FormItem";

const OptionalConfig = (props) => {

  const {additionalConfig, setAdditionalConfig} = useStateConfig()
  const [secondaryBoard, setSecondaryBoard] = useState<boolean>()
  const [disabled, setDisabled] = useState<boolean>(true)


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
    data['secondary_board'] = secondaryBoard;

    window.Main.sendSyncRequest({
      method: 'setOptionalConfig',
      params: [data]
    });
    setAdditionalConfig(data);
    props.setRunning(true)
  }

  useEffect(() => {
    let storedConfig = window.Main.sendSyncRequest({
      method: 'getOptionalConfig'
    })
    if (!storedConfig) storedConfig = {}
    console.log('board')
    console.log(storedConfig.secondary_board )
    setSecondaryBoard(storedConfig.secondary_board);
    setAdditionalConfig(storedConfig);
  }, [])

  return (
    <Flex
      minH={'100vh - 40px'}
      align={'center'}
      justify={'center'}
      marginX={'200px'}
      borderRadius={'30px'}
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
                  <FormItem param={param} additionalConfig={additionalConfig} disabled={disabled}/>
                )
              })}
              <Box cursor={disabled ? 'not-allowed':null}
              >
                <Box pointerEvents={disabled ? 'none':null}
                >
              {secondaryBoard && <Checkbox defaultChecked={true} onChange={() => setSecondaryBoard(!secondaryBoard)}>second board for 1:1</Checkbox>}
              {!secondaryBoard && <Checkbox defaultChecked={false} onChange={() => setSecondaryBoard(!secondaryBoard)}>second board for 1:1</Checkbox>}
                </Box>
              </Box>
              {secondaryBoard && secondaryBoardConfig.map((param) => {
                return (
                  <FormItem param={param} additionalConfig={additionalConfig} disabled={disabled}/>
                )
              })
              }
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

export default OptionalConfig;