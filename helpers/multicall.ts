import Web3 from "web3";
import { Interface } from "@ethersproject/abi";
import { AbiItem } from "web3-utils";
import MulticallAbi from "abis/Multicall.json";

import { NetworkId, NETWORKS } from "../helpers/networkDetails";
import { iAddresses } from "constant";

interface Call {
  address: string; // Address of the contract
  name: string; // Function name on the contract (exemple: balanceOf)
  params?: any[]; // Function params
}
export const multicall = async (
  abi: any[],
  calls: Call[],
  networkID: NetworkId
) => {
  try {
    const web3 = new Web3(NETWORKS[networkID].uri());
    const multi = new web3.eth.Contract(
      MulticallAbi as unknown as AbiItem,
      iAddresses[networkID].MULLTICALL_ADDRESS
    );
    const itf = new Interface(abi);

    const calldata = calls.map((call) => [
      call.address.toLowerCase(),
      itf.encodeFunctionData(call.name, call.params),
    ]);
    const { returnData } = await multi.methods.aggregate(calldata).call();
    const res = returnData.map((call: any, i: any) =>
      itf.decodeFunctionResult(calls[i].name, call)
    );

    return res;
  } catch (e) {
    // console.log(NodeHelper.getMainnetURI(networkID), networkID, calls);
    // console.log("Multicall: ", e?.message);
  }
};
