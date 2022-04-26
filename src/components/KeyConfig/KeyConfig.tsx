import {Box, Button, Flex, FormControl, FormHelperText, FormLabel, Input} from "@chakra-ui/react";
import {useStateConfig} from "../../hooks/useConfig";

const KeyConfig = () => {

  const {setKeyConfig} = useStateConfig();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      API_ID: formData.get("tg-api"),
      API_HASH: formData.get("tg-hash"),
      MONDAY_API_KEY: formData.get("monday-key")
    }

    window.Main.sendSyncRequest(JSON.stringify({
      method: 'setKeyConfig',
      params: [data]
    }));
    setKeyConfig(data);

  }

  return (
    <>
      <h1> Api Keys Config </h1>
      <Flex>
        <form onSubmit={handleSubmit}>
          <FormControl>
            <FormLabel htmlFor='tg-api'></FormLabel>
            <Input id='tg-api' type='text' name={"tg-api"}/>
            <FormHelperText>Your Telegram API ID</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='tg-hash'>Telegram API Hash</FormLabel>
            <Input id="tg-hash" type='text' name={"tg-hash"}/>
            <FormHelperText>Your Telegram API Hash</FormHelperText>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor='monday-key'>Monday API Key</FormLabel>
            <Input id="monday-key" type='text' name={"monday-key"}/>
            <FormHelperText>Your Monday API Key</FormHelperText>
          </FormControl>
          <Button type={"submit"}>Submit</Button>
        </form>
      </Flex>
    </>
  )
}

export default KeyConfig;