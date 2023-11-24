import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useStateConfig } from "../hooks/useConfig";

const ResetConfig = () => {
  const navigate = useNavigate();

  const { setKeyConfig, setMondayConfig } = useStateConfig();

  const resetKeyConfig = () => {
    setKeyConfig(undefined);
    window.Main.sendSyncRequest({
      method: "setKeyConfig",
      params: [undefined],
    });
    navigate("/key-config");
  };

  const resetMondayConfig = () => {
    setMondayConfig(undefined);
    window.Main.sendSyncRequest({
      method: "setMondayConfig",
      params: [undefined],
    });
    navigate("/monday-config");
  };

  const resetEverything = () => {
    setMondayConfig(undefined);
    setKeyConfig(undefined);
    window.Main.sendSyncRequest({
      method: "setMondayConfig",
      params: [undefined],
    });

    window.Main.sendSyncRequest({
      method: "setKeyConfig",
      params: [undefined],
    });

    window.Main.sendSyncRequest({
      method: "setOptionalConfig",
      params: [undefined],
    });
    navigate("/config");
  };

  return (
    <>
      <Button variant={"ghost"} colorScheme={"blue"} onClick={resetKeyConfig}>
        API Keys
      </Button>
      <Button
        variant={"ghost"}
        colorScheme={"yellow"}
        onClick={resetMondayConfig}
      >
        Monday Board
      </Button>
      <Button variant={"ghost"} colorScheme={"red"} onClick={resetEverything}>
        Reset
      </Button>
    </>
  );
};

export default ResetConfig;
