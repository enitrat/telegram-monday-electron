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
  FormHelperText, Select, Spinner
} from '@chakra-ui/react';
import {useStateConfig} from "../../hooks/useConfig";
import {mondayConfigParams} from "./constants";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {MondayBoard} from "../../../shared/types";

export const MondayConfig = () => {

  const {setMondayConfig} = useStateConfig();

  const [init, setInit] = useState(true)
  const [createNew, setCreateNew] = useState(false)
  const [currentConfig, setCurrentConfig] = useState<any>()
  const [allBoards, setAllBoards] = useState<MondayBoard[]>()
  const [selectedBoard, setSelectedBoard] = useState<MondayBoard>()
  const [boardData, setBoardData] = useState<MondayBoard>();
  const [config,setConfig] = useState<any>();

  const navigate = useNavigate()

  useEffect(() => {

    const config = {}
    const mondayConfig = window.Main.sendSyncRequest({
      method: 'getMondayConfig'
    })

    setCurrentConfig(mondayConfig);

    window.Main.sendAsyncRequest({
      method: 'getAllBoards',
    })

    window.Main.on('all_boards', (boards: MondayBoard[]) => {
      setAllBoards(boards);
      if (boards.length > 0) setSelectedBoard(boards[0]);
      mondayConfigParams(boards[0]).forEach((param) => {
        config[param.name]=param.defaultValue;
      });
      setConfig(config)
    })

  }, [])

  const onSelectEvent = (e) => {
    config[e.target.id] = e.target.value
  }

  const onBoardChange = (e) => {
    const newBoard = allBoards.find((board)=>{
      return board.name===e.target.value;
    })
    mondayConfigParams(newBoard).forEach((param) => {
      config[param.name]=param.defaultValue;
    });
    setSelectedBoard(newBoard)
  }


  const handleNewBoard = () => {
    setInit(false);
    setCreateNew(true);
    window.Main.sendAsyncRequest({
      method: 'createNewBoard',
    });

    window.Main.on('create_board', (message) => {
      if (message.result === "success") {
        setMondayConfig(message.data)
      } else {
        //TODO catch this err somewhere
        console.log('there was an error while creating the board')
      }
      navigate('/config');
    })
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();

    window.Main.sendSyncRequest({
      method: 'setMondayConfig',
      params: [config]
    });
    setMondayConfig(config);
    navigate('/config')
  }

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>

      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        {init &&
        <>
          <Button onClick={handleNewBoard}>
            Create a new board
          </Button>
          <Text>If a board named "Telegram Board" exists, it will be replaced by an empty board</Text>
          {allBoards && allBoards.length > 0 &&
          <Button onClick={() => {
            setInit(false);
            setCreateNew(false);
          }}>
            Use an existing board (requires proper configuration)
          </Button>
          }

        </>
        }
        {!init && !createNew &&
        <>
          <Stack align={'center'}>
            <Heading fontSize={'4xl'} textAlign={'center'}>
              Enter your Monday board info
            </Heading>
          </Stack>

          {allBoards && selectedBoard && <>
            <Select value={selectedBoard.name} defaultValue={selectedBoard.name} onChange={onBoardChange}>
              {allBoards.map((board, index) => {
                return (
                  <option key={index} value={board.name}>{board.name}</option>
                )
              })}
            </Select>
            <form onSubmit={handleSubmit}>
              <Box
                rounded={'lg'}
                bg={useColorModeValue('white', 'gray.700')}
                boxShadow={'lg'}
                p={8}>
                <Stack spacing={4}>
                  {mondayConfigParams(selectedBoard).map((param) => {
                    return (
                      <FormControl key={param.name} id={param.name} isRequired={param.required}>
                      <FormLabel htmlFor={param.name}>{param.label}</FormLabel>
                      <Select value={config[param.name]} defaultValue={param.defaultValue} onChange={onSelectEvent}>
                        {param.values.map((value, index) => {
                          return (
                            <option key={index} value={value.title}>{value.title}</option>
                          )
                        })}
                      </Select>
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
                      Save
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </form>
          </>}
        </>
        }
        {createNew && <Spinner/>}
      </Stack>
    </Flex>
  )
}