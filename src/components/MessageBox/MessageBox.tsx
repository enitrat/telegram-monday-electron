import {Flex, Tag, Text} from "@chakra-ui/react";

export const MessageBox = ({message}) => {
  const error = message.type==="error";
  return (
    <Flex my={2} p={2}>
      <Flex flexDirection="column" width="100%">
        {error && <Tag
          variant="subtle"
          mb={2}
          colorScheme={error ? "red" : "green"}
          color="white"
          ml={error ? "auto" : undefined}
          mr={error ? undefined : "auto"}
        >
          <Text color={'red.300'} fontSize={15} maxWidth={400}>
            {message?.type}
          </Text>
        </Tag>}
        <Flex
          bg={error ? "red.100" : "green.100"}
          pr={2}
          py={2}
          pl={4}
          borderRadius={12}
          boxShadow="0 2px 2px #0f0f0f0f"
          ml={error ? "auto" : undefined}
          mr={error ? undefined : "auto"}
        >
          <Text fontSize={15} maxWidth={400}>
            {message?.text}
          </Text>
          <Flex
            ml="auto"
            mt="auto"
            pl={4}
            alignItems="center"
            justifyContent="flex-end"
          >
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};