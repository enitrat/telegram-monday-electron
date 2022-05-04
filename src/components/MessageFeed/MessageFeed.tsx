import {Box, Flex} from "@chakra-ui/react";
import {MessageBox} from "../MessageBox/MessageBox";
import ScrollableFeed from "react-scrollable-feed";


const MessageFeed = ({messages}) => {
  return (
    <Flex
      w="100%"
      maxW={1200}
      height={800}
      maxHeight="calc(100vh - 3rem)"
      flexDirection="column"
      px={8}
      py={8}
      justifyContent={'center'}
    >
      <Box
        maxHeight="100%"
        height="90%"
        bg="gray.200"
        pb={20}
        borderRadius={12}
        overflow="hidden"
        boxShadow="0 2px 2px #0f0f0f04">

        <ScrollableFeed>
          <Box p={6}>
            {messages?.map((message: any, key) => (
              <MessageBox
                message={message}
                key={key}
              />
            ))}
          </Box>
        </ScrollableFeed>
      </Box>
    </Flex>
  );
};

export default MessageFeed;