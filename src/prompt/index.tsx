import ReactDOM from "react-dom";
import {ChakraProvider, FormControl, FormHelperText, FormLabel, Heading, Input} from '@chakra-ui/react'
import Prompt from "./Prompt";


ReactDOM.render(
  <ChakraProvider>
    <Prompt/>
  </ChakraProvider>
  , document.getElementById("root"));
