import {Container, Image, Text} from "../components/Greetings/styles";
import {Button} from "../components/Button";
import {useNavigate} from "react-router-dom";
import {useStateConfig} from "../hooks/useConfig";

const Home = () => {

  const navigate = useNavigate();
  const {setKeyConfig, setMondayConfig} = useStateConfig();


  function handleStart() {

    const keyConfig = window.Main.sendSyncRequest(JSON.stringify({
      method: 'getKeyConfig'
    }))

    const mondayConfig = window.Main.sendSyncRequest(JSON.stringify({
      method: 'getMondayConfig'
    }));


    console.log(keyConfig)
    console.log(mondayConfig)

    if (keyConfig) setKeyConfig(JSON.parse(keyConfig));
    if (mondayConfig) setMondayConfig(JSON.parse(keyConfig));

    if (!keyConfig || !mondayConfig) {
      navigate('/config')
    } else {
      navigate('/ready')
    }


  }

  return (
    <Container>
      <Image
        src="https://www.vectorlogo.zone/logos/reactjs/reactjs-icon.svg"
        alt="ReactJS logo"
      />
      <h1>TeleMonday</h1>
      <h3>Link your telegram chats to the Monday CRM</h3>
      <Button onClick={handleStart}>Start</Button>
    </Container>
  )
}

export default Home