import React, { useEffect, useState } from "react";
import { shorten, shouldTriggerSafetyCheck } from "../../helpers";
import { trackGAEvent } from "../../helpers/gaAnalytic";
import { useWeb3Context } from "../../hooks";
import SwitchNetwork from "../SwitchNetwork";

const CoonnectWallet = () => {
  const [walletChecked, setWalletChecked] = useState<boolean>(false);
  const {
    address,
    connect,
    connectionError,
    hasCachedProvider,
    provider,
    connected,
    networkId,
    providerInitialized,
    disconnect,
  } = useWeb3Context();

  useEffect(() => {
    if (hasCachedProvider()) {
      connect().then(() => {
        setWalletChecked(true);
        trackGAEvent({
          category: "App",
          action: "connect",
        });
      });
    } else {
      setWalletChecked(true);
    }

    if (shouldTriggerSafetyCheck()) {
      console.log(
        "Safety Check: Always verify you're on app.olympusdao.finance!"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      Connect Wallet ({networkId})
      <div>
        {connected ? (
          <button onClick={disconnect}>{shorten(address)}</button>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}
      </div>
      <div>
        <SwitchNetwork />
      </div>
    </div>
  );
};

export default CoonnectWallet;
