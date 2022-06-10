import React from "react";
import { NetworkId } from "../../helpers/networkDetails";
import { useSwitchNetwork } from "../../hooks/useSwitchNetwork";

const SwitchNetwork = () => {
  const { mutate } = useSwitchNetwork();

  return (
    <div>
      <button onClick={() => mutate(NetworkId.MAINNET)}>MAINNET</button>
      <button onClick={() => mutate(NetworkId.AVALANCHE)}>AVALANCHE</button>
      <button onClick={() => mutate(NetworkId.ARBITRUM)}>ARBITRUM</button>
    </div>
  );
};

export default SwitchNetwork;
