import {Button, Flex, Heading, Input, Select, Spinner} from "@chakra-ui/react"
import {CustomFolder} from "../../shared/types";
import {useEffect, useState} from "react";
import {CHANNEL_EDIT_FOLDERS, CHANNEL_FOLDERS, CHANNEL_GROUPS} from "../../shared/constants";
import {NotificationManager} from "react-notifications";

export const FillFolders = () => {

  const [folders, setFolders] = useState<CustomFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>()
  const [keyword, setKeyword] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingFolders,setLoadingFolders] = useState<boolean>(false)
  useEffect(() => {
    setLoadingFolders(true)

    window.Main.sendAsyncRequest({method: 'startTexting'});
    window.Main.once(CHANNEL_GROUPS, () => {
      window.Main.sendAsyncRequest({method: 'getFolders', params: []});
    })
    window.Main.once(CHANNEL_FOLDERS, (data) => {
      if (!data) {
        NotificationManager.error("Couldn't get participants")
        return;
      }

      setFolders(data)
      setLoadingFolders(false);
    })

  }, []);

  const handleSelection = (e) => {
    setSelectedFolder(e.target.value)
  }

  const handleInput = (e) => {
    setKeyword(e.target.value)
  }

  const handleSubmit = () => {
    setLoading(true)
    console.log(selectedFolder, keyword)
    window.Main.sendAsyncRequest({method: 'fillFolder', params: [selectedFolder, keyword]})
    window.Main.once(CHANNEL_EDIT_FOLDERS, (data) => {
      if (!data) {
        NotificationManager.error("Couldn't edit folder")
        return;
      }

      NotificationManager.success("Success")
      setLoading(false);
    })
  }

  return (
    <Flex flexDir={'column'} alignItems={'center'} width={'100%'}>
      <Flex width={'50%'} flexDir={'column'}>
        <Heading alignSelf={'center'} justifySelf={'center'} as={'h1'} size={'md'} marginBottom={'5px'}>Sort your chats
          in folders</Heading>
        <Heading alignSelf={'center'} justifySelf={'center'} as={'h2'} size={'sm'} marginBottom={'5px'}>Select the
          folder you want to place your chats in</Heading>
        {loadingFolders ? <Spinner/> :
          <Select value={selectedFolder} placeholder='Select option' onChange={handleSelection}>
            {folders.map((folder) => <option value={folder.title}>{folder.title}</option>)}
          </Select>
        }
        <Heading alignSelf={'center'} justifySelf={'center'} as={'h2'} size={'sm'} marginBottom={'5px'}>All chats with
          the following keyword will be added to the folder.</Heading>
        <Input value={keyword} onChange={handleInput}/>
      </Flex>
      <Button onClick={handleSubmit}>{loading ? <Spinner/> : <span>Submit</span>}</Button>
    </Flex>
  )
}