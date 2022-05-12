import {Button, FormControl, FormLabel, Input} from "@chakra-ui/react";

const Prompt = () => {

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      input: formData.get("promptInput"),
    };
    window.Main.promptPostData(data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel htmlFor='promptInput'></FormLabel>
        <Input id='promptInput' type='text' name={"promptInput"}/>
      </FormControl>
      <Button type={"submit"}>Submit</Button>
    </form>
  )
}

export default Prompt;