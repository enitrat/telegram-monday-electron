import {Box, FormControl, FormHelperText, FormLabel, Input} from "@chakra-ui/react";

const FormItem = ({additionalConfig,param,disabled}) => {
  return (
    <Box key={param.name} cursor={disabled ? 'not-allowed':null}
    >
      <Box pointerEvents={disabled ? 'none':null}
      >
        <FormControl id={param.name} isRequired={param.required}>
          <FormLabel htmlFor={param.name}>{param.label}</FormLabel>

          <Input id={param.name} name={param.name} type="text"
                 defaultValue={additionalConfig[param.name] || undefined} placeholder={disabled ? null : param.placeholder}

                 background={disabled ? "gray.100" : null}

          />
          {!disabled && <FormHelperText>{param.helper}</FormHelperText>}
        </FormControl>
      </Box>
    </Box>
  )
}
export default FormItem