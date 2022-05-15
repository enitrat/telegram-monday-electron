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

    //Always need API keys, but not
    if (!keyConfig) navigate('/key-config')

    //Don't need monday config to go to menu or texting
    if (keyConfig && destination === 'menu') {
      navigate('/menu');
      return;
    }

    if (keyConfig && destination === 'texting') {
      navigate('/texting');
      return
    }

    //We need monday config to update and fill boards
    if (keyConfig && !mondayConfig) {
      navigate('/monday-config')
      return;
    }
    if (keyConfig && mondayConfig && destination === 'fill') {
      navigate('/fill-board');
      return;
    }
    if (keyConfig && mondayConfig && destination === 'update') {
      navigate('/update-board');
      return;
    }


  }, [])

  return (<></>)
}

export default Config;