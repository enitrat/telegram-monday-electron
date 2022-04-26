import KeyConfig from "../components/KeyConfig/KeyConfig";
import {MondayConfig} from "../components/MondayConfig/MondayConfig";
import {useStateConfig} from "../hooks/useConfig";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";

const Config = (props: any) => {
  const {keyConfig, mondayConfig} = useStateConfig()
  const navigate = useNavigate();

  useEffect(() => {
    if (keyConfig && mondayConfig) navigate('/ready');
  }, [keyConfig, mondayConfig])

  return (
    <>
      <h1>
        Configure the application
      </h1>
      {!keyConfig && <KeyConfig/>}
      {keyConfig && !mondayConfig && <MondayConfig/>}
    </>
  )
}

export default Config;