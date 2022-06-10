import { ethers } from "ethers";
import { iAddresses } from "constant";
import { IBaseAsyncThunk } from "state/types";
import { abi as PairContractAbi } from "abis/PairContract.json";
import WrapSwordAbi from "abis/WrapSword.json";

export function shouldTriggerSafetyCheck() {
  const _storage = window.sessionStorage;
  const _safetyCheckKey = "-oly-safety";
  // check if sessionStorage item exists for SafetyCheck
  if (!_storage.getItem(_safetyCheckKey)) {
    _storage.setItem(_safetyCheckKey, "true");
    return true;
  }
  return false;
}

export function shorten(str: string) {
  if (str.length < 10) return str;
  return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
}

export function setAll(state: any, properties: any) {
  if (properties) {
    const props = Object.keys(properties);
    props.forEach((key) => {
      state[key] = properties[key];
    });
  }
}

export async function getMarketPrice({ networkID, provider }: IBaseAsyncThunk) {
  const pairContract = new ethers.Contract(
    iAddresses[networkID].TEM_PAIR,
    PairContractAbi,
    provider
  );

  const reserves = await pairContract.getReserves();

  const marketPrice = reserves[1] / reserves[0];

  // if ([43114, 1287, 1285, 1285, 97, 1666700000].includes(networkID)) {
  //   marketPrice = reserves[0] / reserves[1];
  // }

  return marketPrice / Math.pow(10, 9);
}

export async function getWSWORDIndex({ networkID, provider }: IBaseAsyncThunk) {
  const wswordContract = new ethers.Contract(
    iAddresses[networkID].WSWORD_ADDRESS,
    WrapSwordAbi,
    provider
  );

  const wrappingIndex = await wswordContract.swordIndex();
  return Number(ethers.utils.formatUnits(wrappingIndex, "gwei"));
}
