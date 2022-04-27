import Settings from "./Settings";
import {Box, Button, Flex, Grid} from "@chakra-ui/react";
import {useLocation, useNavigate} from "react-router-dom";
import {useRunningState} from "../hooks/useRunning";

const Navbar = () => {

  const location = useLocation();
  const pathName = location.pathname;
  const navigate = useNavigate();
  const {running, setRunning} = useRunningState();

  const stopService = () => {
    setRunning(false);
    window.Main.sendAsyncRequest({method: 'stopTelegram'});
  }

  const handleClick = () => {
    if (running) stopService()
    navigate('/')

  }

  return (
    <Grid gridTemplateColumns={'1fr 1fr'} height={'40px'} flexDir={'row'} alignItems={'center'}>
      <Box margin={'5px'} marginLeft={'10px'}>
        {pathName !== '/' &&
        <Button height={'30px'} width={'70px'} onClick={handleClick} variant={'ghost'}
                colorScheme={"teal"}>{running ? <>Stop</> : <p>Home</p>}</Button>
        }
      </Box>
      <Settings/>
    </Grid>)


}

export default Navbar;
