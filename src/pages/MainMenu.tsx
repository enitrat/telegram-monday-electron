import {Button, Flex, Grid} from "@chakra-ui/react";
import {useNavigate} from "react-router-dom";

const MainMenu = () => {

  const navigate = useNavigate();

  function handleStart() {
    navigate('/config?destination=fill')
  }

  function handleUpdate() {
    navigate('/config?destination=update')
  }

  function handleTexting() {
    navigate('/texting')
  }

  return (
    <Flex flexDir={'column'} justifyContent={'center'} alignItems={'center'}>
      <h1>Menu</h1>
      <Grid templateColumns={'1fr 1fr 1fr'}>
        <Button width='150px' variant='solid' colorScheme='green' marginTop={'100px'} onClick={handleStart}>Export
          Chats</Button>
        <Button width='150px' variant='solid' colorScheme='blue' marginTop={'100px'} onClick={handleUpdate}>Update
          boards</Button>
        <Button width='150px' variant='solid' colorScheme='blue' marginTop={'100px'} onClick={handleTexting}>Speed
          Texting</Button>
      </Grid>
    </Flex>
  )
}

export default MainMenu;