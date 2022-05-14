import {useEffect, useState} from "react";
import {
  CHANNEL_GROUPS,
  CHANNEL_LAST_MESSAGES,
  CHANNEL_MESSAGE_SENT,
  CHANNEL_PARTICIPANTS
} from "../../shared/constants";
import {CustomDialog, CustomParticipant} from "../../shared/types";
import {Box, Button, Flex, Grid, GridItem, Heading, Select, Textarea, Text} from "@chakra-ui/react";
import {NotificationManager} from 'react-notifications';
import ScrollableFeed from "react-scrollable-feed";
import {MessageBox} from "../components/MessageBox/MessageBox";

const Texting = () => {

  const [dialogs, setDialogs] = useState<CustomDialog[]>([])
  const [selectedDialog, setSelectedDialog] = useState<CustomDialog>()
  const [participants, setParticipants] = useState<CustomParticipant[]>([])
  const [index, setIndex] = useState<number>(0);
  const [messageToSend, setMessageToSend] = useState<string>("");
  const [previousMessages, setPreviousMessages] = useState([]);

  useEffect(() => {
    window.Main.sendAsyncRequest({method: 'startTexting'});
    window.Main.once(CHANNEL_GROUPS, (data) => {
      setDialogs(data)
    })

    return (() => {
      window.Main.off(CHANNEL_GROUPS, undefined)
    })
  }, [])

  useEffect(() => {
    if (!selectedDialog) return;
    console.log('getting participants for' + selectedDialog.title)
    console.log(selectedDialog.id)
    window.Main.sendAsyncRequest({method: 'getGroupParticipants', params: [selectedDialog.id]});
    window.Main.once(CHANNEL_PARTICIPANTS, (data) => {
      console.log(data)
      if (!data) {
        NotificationManager.error("Couldn't get participants")
        setParticipants([])
        return;
      }
      ;
      setParticipants(data)
    })

    return (() => {
      window.Main.off(CHANNEL_PARTICIPANTS, undefined)
    })
  }, [selectedDialog])

  useEffect(() => {
    if (participants.length === 0) return;
    console.log(participants[index].id)
    window.Main.sendAsyncRequest({method: 'getUserLastMessages', params: [participants[index].id]});
    window.Main.once(CHANNEL_LAST_MESSAGES, (data) => {
      console.log(data)
      if (!data) {
        NotificationManager.error("Couldn't get messages")
        setPreviousMessages([])
        return;
      }
      ;
      setPreviousMessages(data)
    })

  }, [index || participants])

  const selectDialog = (e) => {
    const value = e.target.value
    console.log(value)
    const correspondingDialog = dialogs.find((dialog) => dialog.title === value)
    setSelectedDialog(correspondingDialog)
  }

  const changeParticipant = (e) => {
    const value = e.target.value
    console.log(value)
    setIndex(parseInt(value));
  }

  const sendMessage = () => {
    console.log(messageToSend)
    console.log(participants[index])
    window.Main.sendAsyncRequest({method: 'sendUserMessage', params: [participants[index].id, messageToSend]});
    window.Main.once(CHANNEL_MESSAGE_SENT, (data) => {
      NotificationManager.success('Message sent')
      setMessageToSend("")
      setIndex(index + 1)
    })
  }

  return (
    <Flex flexDir={'column'} alignItems={'center'} width={'100%'}>
      <Flex width={'50%'} flexDir={'column'}>
        <Heading as={'h1'} size={'md'}>Select the group whose members you want to talk to</Heading>
        {dialogs.length > 0 &&
        <Select defaultValue={dialogs[0].title} onChange={(value) => selectDialog(value)}>
          {dialogs.map((dialog, index) => {
            return (
              <option key={`${dialog.title}-${index}`} value={dialog.title}>{dialog.title}</option>
            )
          })}
        </Select>
        }
      </Flex>

      <Box marginTop={'50px'} height={'100%'} width={'90%'}>
        {participants.length > 0 && index <= participants.length &&
        <Flex flexDir={'column'}>
          <Heading alignSelf={'center'} justifySelf={'center'} as={'h2'} size={'sm'} marginBottom={'30px'}>Write a
            message !</Heading>
          <Flex flexDir={'row'}>
            <Flex flexDir={'column'}>
              <Select width='200px' alignSelf={'flex-start'} value={index}
                      onChange={(value) => changeParticipant(value)}>
                {participants.map((participant, index) => {
                  return (
                    <option
                      value={index}>{`${participant.firstName || ""} ${participant.lastName || ""} | @${participant.username}`}</option>
                  )
                })
                }
              </Select>
              <Box marginTop={'10px'} maxHeight={'300px'} p={6}>
                <ScrollableFeed>
                  {previousMessages?.map((message: any, key) => (
                    <MessageBox
                      message={message}
                      key={key}
                    />
                  ))}
                </ScrollableFeed>
              </Box>
            </Flex>
            <Flex marginLeft='30px' width={'60%'} flexDir={'column'} alignItems='center' maxHeight={'300px'}
                  justifyContent={'center'} borderRadius={'20px'} background={'gray.50'} padding={'20px'}>
              <Flex flexDir={'column'}>
                <Text size={'md'}>{participants[index].firstName} {participants[index].lastName}</Text>
                <Text size={'sm'} color={'gray.600'}>@{participants[index].username}</Text>
              </Flex>
              <Box width={'100%'}>
                <Textarea maxW={'100%'} maxH={'200px'} background={'white'} value={messageToSend}
                          onChange={(e) => setMessageToSend(e.target.value)}>
                </Textarea>
              </Box>
              <Flex width={'100%'} marginTop={'10px'} justifyContent={'space-between'}>
                <Button color={'blue.300'} onClick={() => setIndex(index - 1)} disabled={index === 0}>Prev</Button>
                <Button color={'green.500'} onClick={sendMessage}>Send message</Button>
                <Button color={'blue.300'} onClick={() => setIndex(index + 1)}
                        disabled={index === participants.length - 1}>Next</Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        }
      </Box>
    </Flex>
  )
}
export default Texting;