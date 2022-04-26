import {Box} from "@chakra-ui/react";
import {MessageBox} from "../MessageBox/MessageBox";
import ScrollableFeed from "react-scrollable-feed";


const MessageFeed = ({messages}) => {
  console.log(messages)
  return (
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
  );
};

export default MessageFeed;