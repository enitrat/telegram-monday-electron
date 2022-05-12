import {useStateConfig} from "../hooks/useConfig";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";


const Config = (props: any) => {
  const {setKeyConfig, setMondayConfig} = useStateConfig()
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search)
  const destination = params.get('destination');

  useEffect(() => {
    const keyConfig = window.Main.sendSyncRequest({
      method: 'getKeyConfig'
    })

    const mondayConfig = window.Main.sendSyncRequest({
      method: 'getMondayConfig'
    });

    if (keyConfig) setKeyConfig(keyConfig);
    if (mondayConfig) setMondayConfig(mondayConfig);
    console.log(keyConfig,mondayConfig)
    if (!keyConfig) navigate('/key-config')
    if (keyConfig && !mondayConfig) navigate('/monday-config')
    if (keyConfig && mondayConfig && destination==='fill') navigate('/fill-board');
    if (keyConfig && mondayConfig && destination==='update') navigate('/update-board');


  }, [])

  return (<></>)
}

export default Config;