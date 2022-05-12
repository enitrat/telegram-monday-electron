import {Box, Checkbox, Flex, FormControl, FormLabel, Grid, Input, Select, Text} from "@chakra-ui/react";
import {useBoardState} from "../../hooks/useBoard";
import {useEffect} from "react";
import {DeleteIcon} from "@chakra-ui/icons";

const IncludeItem = ({ keywordItems, deleteKeyword, item, index, disabled}) => {

  const {currentBoard} = useBoardState();
  const boardGroups = currentBoard.groups;

  const onValueChange = (e: any) => {
    item.value = e.target.value
  }

  useEffect(() => {
    JSON.stringify(boardGroups)
    const grpExists = boardGroups.find((group)=>group.title===item.target)
    if(grpExists) {
      item.target = item.target
    }else{
      item.target = boardGroups[0].title
      keywordItems[index] = item;
    }
    // item.target = item.target || boardGroups[0].title
  }, [currentBoard])

  const onSelectEvent = (e: any) => {
    item.target = e.target.value
  }

  return (
    <Flex key={index}
    >
      <Flex flexDir={'row'}>
        <Box marginRight={'10px'}>
          <FormControl id={"include_keyword"}>
            {index === 0 && <FormLabel>Include Keyword</FormLabel>}
            <Input defaultValue={item.value} form={'undefined'} onChange={onValueChange}  background={disabled ? "gray.100" : null} type="text"/>
          </FormControl>
        </Box>
        <Box marginRight={'10px'}>
          <FormControl id={"include_keyword"}>
            {index === 0 && <FormLabel>Target item group</FormLabel>}
            <Select form={'undefined'} background={disabled ? "gray.100" : null} defaultValue={item.target || boardGroups[0].title} onChange={onSelectEvent}>
              {boardGroups.map((group, index) => {
                return (
                  <option key={index} value={group.title}>{group.title}</option>
                )
              })}
            </Select>
          </FormControl>
        </Box>
        <Grid gridTemplateColumns={"2fr 1fr"} width={"150px"}>
          <Flex flexDir={'column'}>
            {index === 0 && <Text fontSize={"md"} fontWeight={"medium"}>export 1:1s</Text>}
            <Flex height={'100%'} justifyContent={"center"}>
              <Checkbox background={disabled ? "gray.100" : null} alignSelf={'center'} defaultChecked={item.exportPrivate}
                        onChange={() => item.exportPrivate = !item.exportPrivate}></Checkbox>
            </Flex>
          </Flex>
          {index !== 0 &&
          <Box marginTop={'5px'}>
            <DeleteIcon onClick={() => deleteKeyword(index)}></DeleteIcon>
          </Box>
          }
        </Grid>
      </Flex>
    </Flex>
  )
}
export default IncludeItem