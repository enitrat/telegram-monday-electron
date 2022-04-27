// @ts-ignore
import settings from "../assets/settings.svg"
import {Box, Flex} from "@chakra-ui/react";
import {useState} from "react";
import ResetConfig from "./ResetConfig";

const Settings = () => {

  const [displayed, setDisplayed] = useState(false);

  return (
    <Flex flexDir={'row'} justifyContent={'flex-end'}>
      <Box>
        {displayed && <ResetConfig/>}
      </Box>

      <Box cursor={'pointer'} justifySelf={'flex-end'}  margin={'5px'}  marginRight={'20px'} width={'100%'} maxWidth={'30px'} onClick={() => setDisplayed(!displayed)}>
        <img src={settings} alt={'settings'}/>
      </Box>

    </Flex>
  )
}

export default Settings
