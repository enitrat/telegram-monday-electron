import { Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const MainMenu = () => {
  const navigate = useNavigate();

  function handleStart() {
    navigate("/config?destination=fill");
  }

  function handleUpdate() {
    navigate("/config?destination=update");
  }

  function handleTexting() {
    navigate("/texting");
  }

  function handleMassDM() {
    navigate("/massDM");
  }

  function handleExport() {
    navigate("/export");
  }

  function handleFillFolders() {
    navigate("/fillFolders");
  }

  function handleMassGroupDM() {
    console.log("mass group dm");
    navigate("/massGroupDM");
  }

  function handleDlGroupsParticipants() {
    console.log("dl groups participants");
    navigate("/dlGroupsParticipants");
  }

  function handleMarkAsRead() {
    console.log("mark as read");
    navigate("/markAsRead");
  }

  return (
    <Flex flexDirection="column" justifyContent="center" alignItems="center">
      <Heading as="h1" size="l" marginBottom="20px">
        Menu
      </Heading>
      <Grid templateColumns="repeat(4, 1fr)" gap={10}>
        <ButtonWithText
          onClick={handleStart}
          colorScheme="green"
          marginTop="30px"
        >
          Export Chats
        </ButtonWithText>
        <ButtonWithText
          onClick={handleUpdate}
          colorScheme="blue"
          marginTop="30px"
        >
          Update boards
        </ButtonWithText>
        <ButtonWithText
          onClick={handleTexting}
          colorScheme="purple"
          marginTop="30px"
        >
          Text
        </ButtonWithText>
        <ButtonWithText
          onClick={handleMassDM}
          colorScheme="red"
          marginTop="30px"
        >
          Mass DM
        </ButtonWithText>
        <ButtonWithText
          onClick={handleExport}
          colorScheme="teal"
          marginTop="30px"
        >
          Export to CSV
        </ButtonWithText>
        <ButtonWithText
          onClick={handleFillFolders}
          colorScheme="yellow"
          marginTop="30px"
        >
          Autofill folders
        </ButtonWithText>
        <ButtonWithText
          onClick={handleMassGroupDM}
          colorScheme="cyan"
          marginTop="30px"
        >
          Mass group DM
        </ButtonWithText>
        <ButtonWithText
          onClick={handleDlGroupsParticipants}
          colorScheme="pink"
          marginTop="30px"
        >
          Download group members
        </ButtonWithText>
        <ButtonWithText
          onClick={handleMarkAsRead}
          colorScheme="orange"
          marginTop="30px"
        >
          Mark as read
        </ButtonWithText>
      </Grid>
    </Flex>
  );
};

function ButtonWithText({ children, onClick, colorScheme, marginTop }: any) {
  return (
    <Button
      width="125px"
      height="100px"
      borderRadius="30px"
      variant="solid"
      colorScheme={colorScheme}
      marginTop={marginTop}
      onClick={onClick}
      overflow="hidden"
      whiteSpace="normal"
      overflowWrap="break-word" // Adjusted property
    >
      <Text>{children}</Text>
    </Button>
  );
}

export default MainMenu;
