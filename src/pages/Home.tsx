//@ts-nocheck
import { useNavigate } from "react-router-dom";
import tgLogo from "../assets/Telegram_logo.svg.png";
import { Box, Button, chakra, Flex, Heading, Image } from "@chakra-ui/react";
import { isValidMotionProp, motion } from "framer-motion";

const ChakraBox = chakra(motion.div, {
  /**
   * Allow motion props and the children prop to be forwarded.
   * All other chakra props not matching the motion props will still be forwarded.
   */
  shouldForwardProp: (prop) => isValidMotionProp(prop) || prop === "children",
});

const Home = () => {
  const navigate = useNavigate();

  function handleStart() {
    navigate("/config?destination=fill");
  }

  function handleUpdate() {
    navigate("/config?destination=update");
  }

  function handleMenu() {
    navigate("/config?destination=menu");
  }

  // @ts-ignore
  return (
    <Flex
      flexDirection="column"
      height="calc(100vh - 40px)" // Adjusted height calculation
      padding="25px"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="50px"
        marginBottom="50px"
      >
        <Box maxWidth="200px" maxHeight="200px">
          <Image src={tgLogo} alt="Telegram Logo" />
        </Box>
        <Box maxWidth="300px" maxHeight="300px">
          <ChakraBox
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            {/* Your SVG */}
          </ChakraBox>
        </Box>
      </Flex>
      <Heading as="h1" size="2xl" marginBottom="15px">
        Gramday
      </Heading>
      <Heading as="h2" size="sm" marginBottom="30px">
        {" "}
        {/* Increased margin bottom */}
        Export your Telegram Groups to the Monday CRM
      </Heading>
      <Flex flexDirection="row" width="350px" justifyContent="center">
        <Button
          width="150px"
          variant="solid"
          colorScheme="blue"
          marginTop="20px" // Adjusted margin top
          onClick={handleMenu}
        >
          Menu
        </Button>
      </Flex>
    </Flex>
  );
};

export default Home;
