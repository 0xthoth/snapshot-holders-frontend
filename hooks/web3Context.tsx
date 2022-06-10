import React, {
  ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { IFrameEthereumProvider } from "@ledgerhq/iframe-provider";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { idFromHexString, initNetworkFunc } from "../helpers/networkHelper";
import { Providers } from "../helpers/providers";
import { NetworkId, NETWORKS } from "../helpers/networkDetails";

/**
 * determine if in IFrame for Ledger Live
 */
function isIframe() {
  return window.location !== window.parent.location;
}

/*
  Types
*/
interface IConnectionError {
  text: string;
  created: number;
}

type onChainProvider = {
  connect: () => Promise<Web3Provider | undefined>;
  disconnect: () => void;
  hasCachedProvider: () => boolean;
  address: string;
  connected: boolean;
  connectionError: IConnectionError | null;
  provider: JsonRpcProvider;
  web3Modal: Web3Modal;
  networkId: number;
  networkName: string;
  providerUri: string;
  providerInitialized: boolean;
  balance: number;
};

export type Web3ContextData = {
  onChainProvider: onChainProvider;
} | null;

const Web3Context = React.createContext<Web3ContextData>(null);

export const useWeb3Context = () => {
  const web3Context = useContext(Web3Context);
  if (!web3Context) {
    throw new Error(
      "useWeb3Context() can only be used inside of <Web3ContextProvider />, " +
      "please declare it at a higher level."
    );
  }
  const { onChainProvider } = web3Context;
  return useMemo<onChainProvider>(() => {
    return { ...onChainProvider };
  }, [web3Context]);
};

export const useAddress = () => {
  const { address } = useWeb3Context();
  return address;
};

let initModal: Web3Modal | (() => Web3Modal);
if (typeof window !== "undefined") {
  initModal = new Web3Modal({
    network: "rinkeby",
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            1: NETWORKS[1].uri(),
            4: NETWORKS[4].uri(),
            42161: NETWORKS[42161].uri(),
            421611: NETWORKS[421611].uri(),
            43113: NETWORKS[43113].uri(),
            43114: NETWORKS[43114].uri(),
            56: NETWORKS[56].uri(),
          },
        },
      },
    },
  });
}

export function checkCachedProvider(web3Modal: Web3Modal): boolean {
  if (!web3Modal) return false;
  const cachedProvider = web3Modal.cachedProvider;
  if (!cachedProvider) return false;
  return true;
}

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({
  children,
}) => {
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] =
    useState<IConnectionError | null>(null);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(0);
  // NOTE (appleseed): loading eth mainnet as default rpc provider for a non-connected wallet
  const [provider, setProvider] = useState<JsonRpcProvider>(
    Providers.getStaticProvider(NetworkId.MAINNET)
  );
  const [networkId, setNetworkId] = useState(1);
  const [networkName, setNetworkName] = useState("");
  const [providerUri, setProviderUri] = useState("");
  const [providerInitialized, setProviderInitialized] = useState(false);

  const [web3Modal] = useState<Web3Modal>(initModal);

  function hasCachedProvider(): boolean {
    return checkCachedProvider(web3Modal);
  }

  // NOTE (appleseed): none of these listeners are needed for Backend API Providers
  // ... so I changed these listeners so that they only apply to walletProviders, eliminating
  // ... polling to the backend providers for network changes
  const _initListeners = useCallback(
    (rawProvider: any) => {
      if (!rawProvider.on) {
        return;
      }

      rawProvider.on("close", () => disconnect());

      rawProvider.on("accountsChanged", async () => {
        setTimeout(() => window.location.reload(), 1);
      });

      rawProvider.on("chainChanged", async (_chainId: string) => {
        const newChainId = idFromHexString(_chainId);
        const networkHash = await initNetworkFunc({ provider });
        if (newChainId !== networkHash.networkId) {
          setTimeout(() => window.location.reload(), 1);
        } else {
          setNetworkId(networkHash.networkId);
        }
      });

      rawProvider.on("networkChanged", async (_chainId: string) => {
        // const chainId = await provider.eth.chainId();
      });
    },
    [provider]
  );

  // connect - only runs for WalletProviders
  const connect = useCallback(async () => {
    // handling Ledger Live;
    let rawProvider;
    if (isIframe()) {
      rawProvider = new IFrameEthereumProvider();
    } else {
      try {
        rawProvider = await web3Modal.connect();
      } catch (e) {
        console.log("wallet connection status:", e);
        if (e !== "Modal closed by user") {
          setConnectionError({
            created: Date.now(),
            text: "Please check your Wallet UI for connection errors",
          });
        }
        setConnected(false);
        return;
      }
    }

    _initListeners(rawProvider);

    const connectedProvider = new Web3Provider(rawProvider, "any");
    setProvider(connectedProvider);

    const connectedAddress = await connectedProvider.getSigner().getAddress();
    const nativeBalance = await connectedProvider.getBalance(connectedAddress);
    setBalance(+ethers.utils.formatEther(nativeBalance));
    setAddress(connectedAddress);

    const networkHash = await initNetworkFunc({ provider: connectedProvider });
    setNetworkId(networkHash.networkId);
    setNetworkName(networkHash.networkName);
    setProviderUri(networkHash.uri);
    setProviderInitialized(networkHash.initialized);
    // Keep this at the bottom of the method, to ensure any repaints have the data we need
    setConnected(true);

    return connectedProvider;
  }, [provider, web3Modal, connected]);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setConnectionError(null);
    setConnected(false);

    setTimeout(() => {
      window.location.reload();
    }, 1);
  }, [provider, web3Modal, connected]);

  const onChainProvider = useMemo(
    () => ({
      connect,
      disconnect,
      hasCachedProvider,
      provider,
      connected,
      connectionError,
      address,
      web3Modal,
      networkId,
      networkName,
      providerUri,
      providerInitialized,
      balance,
    }),
    [
      connect,
      disconnect,
      hasCachedProvider,
      provider,
      connected,
      connectionError,
      address,
      web3Modal,
      networkId,
      networkName,
      providerUri,
      providerInitialized,
      balance,
    ]
  );

  return (
    <Web3Context.Provider value={{ onChainProvider }}>
      {children}
    </Web3Context.Provider>
  );
};
