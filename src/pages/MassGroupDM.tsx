import {useEffect, useRef, useState} from "react";
import {
    CHANNEL_GROUPS,
    CHANNEL_MESSAGE_SENT,
} from "../../shared/constants";
import {CustomDialog} from "../../shared/types";
import {Box, Button, Flex, Heading, Input, Select, Spinner, Text, Textarea} from "@chakra-ui/react";
import {NotificationManager} from 'react-notifications';
import ScrollableFeed from "react-scrollable-feed";
import {RateLimiter} from "limiter";
import Papa from "papaparse";


const hoverProps = {
    cursor: "pointer",
    transition: "all .2s ease-in-out",
    transform: "scale(1.15)"
}

const limiter = new RateLimiter({tokensPerInterval: 15, interval: "minute"});


const MassGroupDM = () => {

    const [dialogs, setDialogs] = useState<CustomDialog[]>([])
    const [importedGroups, setImportedGroups] = useState<CustomDialog[]>([])
    const [selectedGroupNames, setSelectedGroupNames] = useState<Set<string>>(new Set())
    const [messageToSend, setMessageToSend] = useState<string>("");
    const [keyword, setKeyword] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [exporting, setExporting] = useState<boolean>(false)
    const [validatingKeyword, setValidatingKeyword] = useState<boolean>(false)
    const searchInput = useRef(null)
    const fileInput = useRef(null)
    let [msgSent, setMsgSent] = useState<{ [key: string]: boolean }>({})

    const filterDialogs = (dialogs: CustomDialog[]) => {
        if (keyword === "") return dialogs;
        return dialogs.filter((dialog) => dialog.title.toLowerCase().includes(keyword.toLowerCase()))
    }

    useEffect(() => {
        console.log(msgSent)
    }, [msgSent])

    const waitForMsgSent = async (timeout: number, groupId: BigInt) => {
        return new Promise(async (resolve) => {
            await limiter.removeTokens(1);
            window.Main.sendAsyncRequest({method: 'sendGroupMessage', params: [groupId, messageToSend]});
            window.Main.once(CHANNEL_MESSAGE_SENT, () => {
                msgSent[Number(groupId).toString()] = true
                setMsgSent({...msgSent})
                resolve(true)
            })
            setTimeout(resolve, 10 * 1000);

        });

    }

    const sendMessages = async () => {
        msgSent = {}
        for (const group of importedGroups) {
            const sent = await waitForMsgSent(10 * 1000, group.id)
            if (!sent) NotificationManager.error('Message couldnt be sent to ' + group.title) // REFACTOR NEW MANAGER NOTIF
        }
    }

    const handleFileUpload = (e) => {
        e.preventDefault();
        window.Main.sendSyncRequest({method: 'logGroups'});
        Papa.parse(e.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const groupNames = results.data.map((group) => group.title.toLowerCase())
                setSelectedGroupNames(new Set(groupNames))
                startImport()
            },
        });
    };

    const handleInput = (e) => {
        setKeyword(e.target.value)
    }

    const keywordValidation = () => {
        setValidatingKeyword(true)
        window.Main.sendAsyncRequest({method: 'startTexting'});
        window.Main.once(CHANNEL_GROUPS, (data) => {
            setDialogs(filterDialogs(data))
            setValidatingKeyword(false)

        })
    }

    const startExport = () => {
        let csvContent = 'title\n';

        setExporting(true)
        // Add book data to the CSV string
        dialogs.forEach((dialog) => {
            csvContent += `"${dialog.title}"\n`;
        });

        // Convert the CSV string to a Blob
        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8'});

        // Create a link element to trigger the download
        //const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        window.Main.download({url: url})
        setExporting(false)
    }

    const filterDialogsByName = (data: CustomDialog[]) => {
        return data.filter((dialog) => selectedGroupNames.has(dialog.title.toLowerCase()))
    }


    const startImport = () => {
        //const titles = new Set(["Aurelien e Mathieu 2", "Aurelien e Mathieu"].map((title)=>title.toLowerCase()))
        //setSelectedGroupNames(titles)
        setLoading(true)
        window.Main.sendAsyncRequest({method: 'startTexting'});
        window.Main.once(CHANNEL_GROUPS, (data) => {
            setImportedGroups(filterDialogsByName(data))
            setLoading(false)
            window.Main.sendSyncRequest({method: 'logGroups', params: [importedGroups]});
            window.Main.sendSyncRequest({method: 'logGroups', params: [dialogs]});
        })
    }


    return (
        <Flex flexDir={'column'} alignItems={'center'} width={'100%'}>
            <Flex width={'50%'} flexDir={'column'}>
                <Heading alignSelf={'center'} justifySelf={'center'} as={'h2'} size={'sm'} marginBottom={'5px'}>All
                    chats with
                    the following keyword will be exported.</Heading>
                <Flex
                    width={'100%'}
                    flexDir={'row'}
                    justifyContent={'space-between'}
                    alignItems={'left'}>
                    <Input width={"80%"} value={keyword} onChange={handleInput}/>
                    <Button onClick={keywordValidation}>{validatingKeyword ? <Spinner/> : <span>Submit '{keyword}'</span>}</Button>
                </Flex>


                {dialogs.length > 0 &&
                    <Button onClick={startExport}>{exporting ? <Spinner/> :
                        <span>Download the list of {dialogs.length} groups</span>}</Button>
                }


                <Heading alignSelf={'center'} marginTop={'25px'} justifySelf={'center'} as={'h1'} size={'md'} marginBottom={'5px'}>Import a
                    CSV file with all the group names</Heading>

                <Flex flexDir={'column'}>
                    <input
                        type={"file"}
                        id={"csvFileInput"}
                        accept={".csv"}
                        ref={fileInput}
                        onChange={handleFileUpload}
                    />
                </Flex>
                {fileInput !== null && fileInput.current !== null && fileInput.current.files.length > 0 &&
                    <Button onClick={startImport}>{loading ? <Spinner/> : <span>Start import</span>}</Button>
                }

            </Flex>

                <Box marginTop={'50px'} height={'100%'} width={'90%'}>
                    {importedGroups.length > 0 &&
                        <Flex flexDir={'column'}>
                            <Heading alignSelf={'center'} justifySelf={'center'} as={'h2'} size={'sm'}
                                     marginBottom={'30px'}>Write a
                                message that will be sent to all the imported groups.</Heading>
                            <Flex flexDir={'row'} alignItems='center' width={"80%"}>
                                <Flex flexDir={'column'} marginTop={'10px'}>
                                    <Box width={"100%"} maxHeight={'200px'} p={1}>
                                        <ScrollableFeed>
                                            {importedGroups.map((group: CustomDialog) => {
                                                return (
                                                    <Flex borderRadius={'10px'}
                                                          marginBottom={'5px'} boxShadow={'md'} height={"40px"}
                                                          width={"150px"}
                                                          alignItems={"center"}
                                                          justifyContent={'center'}
                                                          _hover={{...hoverProps, transform: "scale(1.05)"}}
                                                        //onClick={(e) => excludeUser(e, participant)}
                                                          flexWrap={'wrap'}
                                                        //key={id}
                                                    >
                                                        <Text textAlign={'center'} fontSize={'14px'}
                                                              wordBreak={'break-word'}>
                                                            <Box>
                                                                {group.title}
                                                            </Box>
                                                        </Text>
                                                    </Flex>
                                                )
                                            })
                                            }
                                        </ScrollableFeed>
                                    </Box>
                                </Flex>
                                <Flex width={'100%'} flexDir={'column'} maxHeight={'300px'}
                                      justifyContent={'center'} borderRadius={'20px'} background={'gray.50'}
                                      padding={'20px'}>
                                    <Flex flexDir={'column'}>
                                        <Box width={'100%'}>
                                            <Textarea maxW={'100%'} maxH={'95%'} background={'white'}
                                                      value={messageToSend}
                                                      onChange={(e) => setMessageToSend(e.target.value)}>
                                            </Textarea>
                                        </Box>
                                        <Flex width={'100%'} marginTop={'10px'} justifyContent={'space-between'}>
                                            <Button color={'green.500'} onClick={sendMessages}>Send message
                                                to {importedGroups.length} groups</Button>
                                        </Flex>
                                    </Flex>

                                </Flex>
                            </Flex>
                        </Flex>
                    }
                </Box>

        </Flex>
    )
}
export default MassGroupDM;