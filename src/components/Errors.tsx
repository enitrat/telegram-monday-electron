import {useEffect, useState} from "react";
import {Box, Flex, Menu, MenuButton, MenuDivider, MenuItem, MenuList, useColorModeValue} from "@chakra-ui/react";
import {InfoOutlineIcon} from "@chakra-ui/icons";
import {NotificationManager} from "react-notifications";

const ErrorsDisplay = () => {

  const [errors, setErrors] = useState([]);
  const [newError, setNewError] = useState<string>("");
  const [isDisplayed, setIsDisplayed] = useState(false);

  useEffect(() => {
    window.Main.on('error', (newError) => {
      setNewError(newError);
      NotificationManager.error(newError)
    })

    // return (() => {
    //   window.Main.off('error', undefined)
    // })
  }, [])

  useEffect(() => {
    if (newError === "") return;
    setErrors([...errors, newError]);
  }, [newError])

  return (
    <Flex>
      {errors.length > 0 &&
      <Menu>
          <MenuButton
            as={Box}
            rounded={'full'}
            variant={'link'}
            cursor={'pointer'}
            minW={0}
            outline={'none'}
            onClick={()=>setIsDisplayed(!isDisplayed)}
          >
            <InfoOutlineIcon color={!isDisplayed ? 'red.500' : 'grey.500'}/>
          </MenuButton>
        <Flex flexDir={'column'} bg={useColorModeValue('white', 'gray.700')}
        >
          <MenuList
            bg="brand.navbar"
            padding={0}
          >
            {errors.map((error, index) => {
                return (
                  <Box key={error.toString+index.toString()}>
                    <MenuItem
                      _active={{bg: "brand.navbar"}}
                      _focus={{bg: "brand.body"}}
                    >
                      {error.toString()}
                    </MenuItem>
                    <MenuDivider margin={0}/>
                  </Box>
                );
              }
            )}
          </MenuList>
        </Flex>
      </Menu>
      }
    </Flex>
  )
}

export default ErrorsDisplay