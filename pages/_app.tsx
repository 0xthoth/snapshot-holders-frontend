import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Web3ContextProvider } from "../hooks/web3Context";
import { ReactQueryProvider } from "../hooks/reactQueryContext";
import { wrapper } from "../state";


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3ContextProvider>
      <ReactQueryProvider>
        <Component {...pageProps} />
      </ReactQueryProvider>
    </Web3ContextProvider>
  );
}

export default wrapper.withRedux(MyApp);
