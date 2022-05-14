import {Button, Flex, Grid, Heading,Text} from "@chakra-ui/react";
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
      <Heading as={'h1'} size={'l'}>Menu</Heading>
      <Grid templateColumns={'1fr 1fr 1fr'} gap={10}>
        <Button width='124px' height={'100px'} borderRadius={'30px'} variant='solid' colorScheme='green'
                marginTop={'100px'} onClick={handleStart}>Export
          Chats
        </Button>
        <Button width='125px' height={'100px'} borderRadius={'30px'} variant='solid' colorScheme='blue'
                marginTop={'100px'} onClick={handleUpdate}>
          <Text wordBreak={'break-all'}>Update boards</Text>
        </Button>
        <Button width='125px' height={'100px'} borderRadius={'30px'} variant='solid' colorScheme='orange'
                marginTop={'100px'} onClick={handleTexting}>
          <Text wordBreak={'break-all'}>Text</Text>
        </Button>
      </Grid>
    </Flex>
  )
}

export default MainMenu;