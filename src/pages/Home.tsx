//@ts-nocheck
import {Container, Image, Text} from "../components/Greetings/styles";
import {useNavigate} from "react-router-dom";
import {useStateConfig} from "../hooks/useConfig";
import tgLogo from "../assets/Telegram_logo.svg.png"
import {Box, Button, chakra, Flex, Heading} from "@chakra-ui/react";
import Config from "./Config";
import {isValidMotionProp, motion} from "framer-motion";


const ChakraBox = chakra(motion.div, {
  /**
   * Allow motion props and the children prop to be forwarded.
   * All other chakra props not matching the motion props will still be forwarded.
   */
  shouldForwardProp: (prop) => isValidMotionProp(prop) || prop === 'children',
});

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
    if (mondayConfig) setMondayConfig(JSON.parse(mondayConfig));

    if (!keyConfig || !mondayConfig) {
      navigate('/config')
    } else {
      navigate('/ready')
    }


  }

  // @ts-ignore
  return (
    <Flex flexDir={'column'} height={'100vh'} padding={'25px'} alignItems={'center'} justifyContent={'center'}>
      <Flex flexDir={'row'} alignItems={'center'} justifyContent={'center'} gap={'50px'} marginBottom={'50px'}>
        <Box maxWidth={"200px"} maxHeight={"200px"}>
          <Image
            src={tgLogo}
            alt="Telegram Logo"
          />
        </Box>
        <Box maxWidth={"300px"} maxHeight={"300px"}>
          <ChakraBox
            animate={{
              scale: [1, 1.1, 1],
            }}
            // @ts-ignore no problem in operation, although type error appears.
            transition={{
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            }}>
            <svg
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="m120.24 143.16c-10.63-.26-19.4-4.95-25-14.74-5.74-10.12-5.49-20.48.63-30.35 14.57-23.49 29.33-46.85 44-70.27 3-4.79 5.93-9.65 9.07-14.35a29.4 29.4 0 0 1 40-9.09c13.81 8.51 18.43 26.21 9.83 40.16q-26.37 42.95-53.49 85.48c-5.57 8.77-14.02 13-25.04 13.16z"
                fill="#ffcb00"/>
              <path
                d="m28.94 143.16c-10.73-.26-19.45-5.16-24.94-14.91-5.66-10.12-5.3-20.5.84-30.37q23.51-37.72 47.23-75.33c2-3.24 4-6.56 6.14-9.7a29.41 29.41 0 0 1 49.41 31.86c-17.52 28.29-35.28 56.48-53.05 84.64-5.77 9.13-14.26 13.65-25.63 13.81z"
                fill="#ff3d57"/>
              <path
                d="m212.13 85.82c16.17.08 29.26 12.93 29.23 28.69 0 16-13.44 28.9-29.76 28.7s-29.18-12.91-29.16-28.74c.02-16.06 13.16-28.75 29.69-28.65z"
                fill="#00d647"/>
            </svg>
          </ChakraBox>
        </Box>
      </Flex>
      <Heading as={'h1'} size={'2xl'} marginBottom={'15px'}>Gramday</Heading>
      <Heading as={'h2'} size={'sm'}>Export your Telegram Groups to the Monday CRM</Heading>
      <Button variant='solid' colorScheme='purple' marginTop={'100px'} onClick={handleStart}>Start</Button>
    </Flex>
  )
}

export default Home