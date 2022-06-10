import { NetworkId } from "helpers/networkDetails";

export const addresses = {
  WHITELIST_ADDRESS: "0x3ac226a1a9ddcbEE9169B1B381a103BB38dDbe40",
  NOSTO_TOKEN_ADDRESS: "0xe5b16a6E1DeF11c74c4F379F4D3c390f1571EcE4",
  NOSTO_NFT_ADDRESS: "0x58a478C7c9B3b00746736e331C76a2D468cC9B72",
  WHITELIST_OWNER_ADDRESS: "0xD417E6728ce6EFBF01BA5D52229ffD565d2E8aD0",
};

export const THE_GRAPH_URL =
  "https://api.thegraph.com/subgraphs/id/QmadjM1KUyfor66dM3jjeam1529iSFNfoMu8mwiHQoGRro";

interface IAddresses {
  [key: number]: { [key: string]: string };
}

export const iAddresses: IAddresses = {
  [NetworkId.BSC]: {
    WSWORD_MASTERCHEF: "0x4832b9911114aF706d529251979894405FD88b20",
    MULLTICALL_ADDRESS: "0xfDa464F3cb91305316027574DAD4AF4375017Ce1",
    TEM_PAIR: "0x1ede821daade714edade648f525ada0c5fe4ee3a",
    WSWORD_ADDRESS: "0x66972b14e525374DCE713ce14c8D080f3036dAbb",
  },
};
