import {Button, Flex, FormControl, FormHelperText, FormLabel, Input} from "@chakra-ui/react";
import {useStateConfig} from "../../hooks/useConfig";
import {mondayConfigParams} from "./constants";

export const MondayConfig = () => {

  const {setMondayConfig} = useStateConfig();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let index = 0;
    //can be improves
    const data = {
      board_id: formData.get(mondayConfigParams[index++].name),
      group_name: formData.get(mondayConfigParams[index++].name),
      link_column: formData.get(mondayConfigParams[index++].name),
      last_date_column: formData.get(mondayConfigParams[index++].name),
      participants_column: formData.get(mondayConfigParams[index++].name),
      include_pattern: formData.get(mondayConfigParams[index++].name),
      exclude_pattern: formData.get(mondayConfigParams[index++].name),
      exclude_members: formData.get(mondayConfigParams[index++].name),
    }
    console.log(data);
    window.Main.sendSyncRequest(JSON.stringify({
      method: 'setMondayConfig',
      params: [data]
    }));
    setMondayConfig(data);

  }

  return (
    <>
      <h1> Monday Config </h1>
      <Flex>
        <form onSubmit={handleSubmit}>
          {mondayConfigParams.map((param) => {
            return (
              <FormControl>
                <FormLabel htmlFor={param.name}></FormLabel>
                <Input id={param.name} type='text' name={param.name} placeholder={param.placeholder}/>
                <FormHelperText>{param.helper}</FormHelperText>
              </FormControl>
            )
          })}
          {/*<FormControl>*/}
          {/*  <FormLabel htmlFor='board-id'></FormLabel>*/}
          {/*  <Input id='board-id' type='text' name={"board-id"}/>*/}
          {/*  <FormHelperText>Your Monday board ID</FormHelperText>*/}
          {/*</FormControl>*/}
          {/*<FormControl>*/}
          {/*  <FormLabel htmlFor='group-name'>session code</FormLabel>*/}
          {/*  <Input id="group-name" type='text' name={"group-name"}/>*/}
          {/*  <FormHelperText>The group name inside your monday dashboard</FormHelperText>*/}
          {/*</FormControl>*/}
          {/*<FormControl>*/}
          {/*  <FormLabel htmlFor='link-column'>session code</FormLabel>*/}
          {/*  <Input id="link-column" type='text' name={"link-column"}/>*/}
          {/*  <FormHelperText>Your Monday API Key</FormHelperText>*/}
          {/*</FormControl>*/}
          <Button type={"submit"}>Submit</Button>
        </form>
      </Flex>
    </>
  )
}