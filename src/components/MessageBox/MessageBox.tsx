import { Flex, Text } from "@chakra-ui/react";
import { MessageModel } from "../../../shared/types";

export const MessageBox = ({ message }: { message: MessageModel }) => {
  const authorMe = message.author === "me";
  let messageColor;
  // if(message.type==="error"){
  //   messageColor="red.100";
  if (message.author === "me") {
    messageColor = "blue.100";
  } else {
    messageColor = "green.100";
  }
  return (
    <Flex my={2} p={2} width={"100%"}>
      <Flex flexDirection="column" width="90%">
        {/*{error && <Tag*/}
        {/*  variant="subtle"*/}
        {/*  mb={2}*/}
        {/*  colorScheme={error ? "red" : "green"}*/}
        {/*  color="white"*/}
        {/*  ml={error ? "auto" : undefined}*/}
        {/*  mr={error ? undefined : "auto"}*/}
        {/*>*/}
        {/*  <Text color={'red.300'} fontSize={15} maxWidth={400}>*/}
        {/*    {message?.type}*/}
        {/*  </Text>*/}
        {/*</Tag>}*/}
        <Flex
          bg={messageColor}
          pr={2}
          py={2}
          pl={4}
          borderRadius={12}
          boxShadow="0 2px 2px #0f0f0f0f"
          ml={authorMe ? "auto" : undefined}
          mr={authorMe ? undefined : "auto"}
          flexWrap={"wrap"}
          maxWidth={"100%"}
        >
          <Text fontSize={15} wordBreak={"break-word"}>
            {message?.text}
          </Text>
          <Flex
            ml="auto"
            mt="auto"
            pl={4}
            alignItems="center"
            justifyContent="flex-end"
          ></Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
