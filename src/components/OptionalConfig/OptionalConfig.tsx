import {useEffect, useState} from "react";
import {
  Box, Button,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue
} from "@chakra-ui/react";
import {useStateConfig} from "../../hooks/useConfig";
import {additionalConfigParams } from "./constants";
import FormItem from "./FormItem";
import IncludeItem from "./IncludeItem";

const defaultItem =
  {
    value: "",
    target: "",
    exportPrivate: false
  }

const OptionalConfig = (props) => {

  const {additionalConfig, setAdditionalConfig} = useStateConfig()
  const [disabled, setDisabled] = useState<boolean>(true)
  const [keywordItems, setKeywordItems] = useState<any[]>([])

  const addKeyword = () => {
    //Just need to add an item with empty values
    const clone = JSON.parse(JSON.stringify(defaultItem));
    setKeywordItems([...keywordItems, clone])
  }

  const deleteKeyword = (index) => {
    //splice mutates the state directly and its not what we want.
    let left = keywordItems.slice(0, index);   // Everything before configs[index]
    let right = keywordItems.slice(index + 1); // Everything after configs[index]
    const newItems = [...left, ...right];
    setKeywordItems(newItems)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {}

    //Regular entries
    for (const entry of formData.entries()) {
      data[entry[0]] = entry[1];
      if (entry[0] === "exclude_members") {
        const participants = (entry[1] as string).split(',')
        data[entry[0]] = participants;

      }
    }

    //Include_keywords list
    data['include_keywords'] = keywordItems;

    console.log('sent config')
    console.log(data)
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
    if (!storedConfig) storedConfig = {include_keywords:[]}
    setAdditionalConfig(storedConfig);

    if (storedConfig.include_keywords.length === 0) {
      const clone = JSON.parse(JSON.stringify(defaultItem));
      setKeywordItems([clone])
    } else {
      setKeywordItems(storedConfig.include_keywords)
    }
  }, [])

  return (
    <Flex
      minH={'100vh - 40px'}
      align={'center'}
      justify={'center'}
      width={'1000px'}
      borderRadius={'30px'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'2xl'} py={12} px={6}>
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
                  <FormItem key={param.name} param={param} additionalConfig={additionalConfig} disabled={disabled}/>
                )
              })}
              <Box cursor={disabled ? 'not-allowed' : null}
              >
                <Box pointerEvents={disabled ? 'none' : null}
                >

                  {keywordItems.map((item, index) => {
                    return (
                      <Box key={index}>
                        <Box justifyContent={'center'} alignItems={'center'} marginTop={'10px'}>
                          <IncludeItem keywordItems={keywordItems} item={item} deleteKeyword={deleteKeyword} index={index} disabled={disabled}/>
                        </Box>
                        {!disabled && index === 0 &&
                        <Text fontSize={'xs'}
                              color={"gray.400"}>{'All chats with this name will be exported to the corresponding item group. Leaving this field empty means that all chats will be exported to this group.'}</Text>}
                      </Box>

                    )
                  })
                  }
                </Box>
              </Box>
              {!disabled && <Button
                size="lg"
                bg={'blue.400'}
                color={'white'}
                onClick={addKeyword}
                _hover={{
                  bg: 'blue.500',
                }}>
                Add keyword
              </Button>
              }
              <Stack spacing={10}>

              </Stack>
              {disabled &&
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
              }
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
            </Stack>
          </Box>

        </form>
      </Stack>
    </Flex>
  )

}

export default OptionalConfig;