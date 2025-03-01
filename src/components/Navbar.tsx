import Settings from "./Settings";
import { Button, Flex, Grid } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRunningState } from "../hooks/useRunning";
import ErrorsDisplay from "./Errors";

const Navbar = () => {
  const location = useLocation();
  const pathName = location.pathname;
  const navigate = useNavigate();
  const { running, setRunning } = useRunningState();

  const stopService = () => {
    setRunning(false);
    // window.Main.sendAsyncRequest({method: 'stopTelegram'});
  };

  const handleClick = () => {
    if (running) stopService();
    navigate("/");
  };

  return (
    <Grid
      gridTemplateColumns={"1fr 1fr"}
      height={"40px"}
      flexDir={"row"}
      alignItems={"center"}
    >
      <Flex flexDir={"row"} margin={"5px"} marginLeft={"10px"}>
        {pathName !== "/" && (
          <Button
            height={"30px"}
            width={"70px"}
            onClick={handleClick}
            variant={"ghost"}
            colorScheme={"teal"}
          >
            {running ? <>Stop</> : <p>Home</p>}
          </Button>
        )}
        <ErrorsDisplay />
      </Flex>
      <Settings />
    </Grid>
  );
};

export default Navbar;
