import {
  Box, Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  Text,
  MenuList, Select
} from "@chakra-ui/react";
import {useBoardState} from "../../hooks/useBoard";
import {useEffect} from "react";
import {ChevronDownIcon} from "@chakra-ui/icons";

const IncludeItem = ({keywordItems, item, index, disabled}) => {

  const {currentBoard} = useBoardState();
  const boardGroups = currentBoard.groups;


  const onValueChange = (e: any) => {
    item.value = e.target.value
  }

  useEffect(()=>{
    item.target=boardGroups[0].title
  },[])
  const onSelectEvent = (e: any) => {
    item.target = e.target.value
  }

  return (
    <Box key={index}
    >
      <HStack>
        <Box>
          <FormControl id={"include_keyword"} isRequired>
            {index===0 && <FormLabel>Include Keyword</FormLabel>}
            <Input defaultValue={item.value} form={'undefined'} onChange={onValueChange} type="text"/>
          </FormControl>
        </Box>
        <Box>
          <FormControl id={"include_keyword"} isRequired>
            {index===0 && <FormLabel>Target item group</FormLabel>}
            <Select form={'undefined'} defaultValue={boardGroups[0].title} onChange={onSelectEvent}>
              {boardGroups.map((group, index) => {
                return (
                  <option key={index} value={group.title}>{group.title}</option>
                )
              })}
            </Select>
          </FormControl>
        </Box>
      </HStack>
    </Box>
  )
}
export default IncludeItem