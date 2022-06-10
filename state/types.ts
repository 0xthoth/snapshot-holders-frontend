import {
  JsonRpcProvider,
  StaticJsonRpcProvider,
} from "@ethersproject/providers";
import { NetworkId } from "helpers/networkDetails";

export type SerializedBigNumber = string;

export interface IBaseAsyncThunk {
  readonly provider: StaticJsonRpcProvider | JsonRpcProvider;
  readonly networkID?: NetworkId;
}

export interface IBaseAddressAsyncThunk extends IBaseAsyncThunk {
  readonly address: string;
}

export interface IBaseMintNFTAsyncThunk extends IBaseAsyncThunk {
  readonly cid: string;
  readonly amount: string;
}

export interface WhitelistResponse {
  maxLength: SerializedBigNumber;
  length: SerializedBigNumber;
  owner: string;
}
