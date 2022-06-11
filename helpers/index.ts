import { ethers } from "ethers";
import { iAddresses } from "constant";
import { IBaseAsyncThunk } from "state/types";

import { multicall } from "helpers/multicall";
import { abi as PairContractAbi } from "abis/PairContract.json";
import WrapSwordAbi from "abis/WrapSword.json";
import MasterChefABI from "abis/MasterChef.json";
import { NetworkId, NETWORKS } from "./networkDetails";

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const numberFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 5 })

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
  if (!networkID) return 0;

  const pairContract = new ethers.Contract(
    iAddresses[networkID].TEM_PAIR,
    PairContractAbi,
    provider
  );

  const reserves = await pairContract.getReserves();

  let marketPrice = reserves[1] / reserves[0];

  if ([43114, 1287, 1285, 1285, 97, 1666700000].includes(networkID)) {
    marketPrice = reserves[0] / reserves[1];
  }

  return marketPrice / Math.pow(10, 9);
}

export async function getWSWORDIndex({ networkID, provider }: IBaseAsyncThunk) {
  if (!networkID) return 0;
  const wswordContract = new ethers.Contract(
    iAddresses[networkID].WSWORD_ADDRESS,
    WrapSwordAbi,
    provider
  );

  const wrappingIndex = await wswordContract.swordIndex();
  return Number(ethers.utils.formatUnits(wrappingIndex, "gwei"));
}


export const getHolderInfo = async ({ networkID, data }: {
  networkID: NetworkId;
  data: Array<any>
}) => {
  if (!networkID || !data) return [];
  const provider = new ethers.providers.JsonRpcProvider(NETWORKS[networkID].uri());
  const userBoostQueries: any[] = [];
  const userStakedBlockQueries: any[] = [];
  const userStakingBalanceQueries: any[] = [];
  const userPendingRewardQueries: any[] = [];


  data.forEach((holder) => {
    userBoostQueries.push({
      address: iAddresses[networkID].WSWORD_MASTERCHEF,
      name: "getUserBoostMultipiler",
      params: [0, holder.address],
    });
    userStakedBlockQueries.push({
      address: iAddresses[networkID].WSWORD_MASTERCHEF,
      name: "getUserStakeBlock",
      params: [0, holder.address],
    });
    userStakingBalanceQueries.push({
      address: iAddresses[networkID].WSWORD_MASTERCHEF,
      name: "userInfo",
      params: [0, holder.address],
    });
    userPendingRewardQueries.push({
      address: iAddresses[networkID].WSWORD_MASTERCHEF,
      name: "pendingReward",
      params: [0, holder.address, true],
    });
  });

  const dataBoostQueries = await multicall(
    MasterChefABI,
    userBoostQueries,
    networkID
  );

  const dataStakedBlockQueries = await multicall(
    MasterChefABI,
    userStakedBlockQueries,
    networkID
  );
  const dataStakingBlanceQueries = await multicall(
    MasterChefABI,
    userStakingBalanceQueries,
    networkID
  );
  const dataPendingRewardQueries = await multicall(
    MasterChefABI,
    userPendingRewardQueries,
    networkID
  );
  const currentBlock = await provider.getBlockNumber();
  const mkPrice = await getMarketPrice({
    provider,
    networkID,
  });
  const wIndex = await getWSWORDIndex({
    provider,
    networkID,
  });

  if (
    !dataBoostQueries ||
    !dataStakedBlockQueries ||
    !dataStakingBlanceQueries ||
    !dataPendingRewardQueries
  )
    return [];

  const hds = data.map((d, i) => {
    const balance = ethers.utils.formatUnits(
      dataStakingBlanceQueries[i][0],
      "ether"
    );
    const balanceToTEM = Number(balance) * wIndex;
    const balanceTEMValue = balanceToTEM * Number(mkPrice);

    return {
      ...d,
      boost: `${Number(dataBoostQueries[i][0]) / 1000}x`,
      stakedBlock: `${currentBlock - Number(dataStakedBlockQueries[i][0])}`,
      staking: balance,
      balanceToTEM,
      balanceTEMValue,
      reward: ethers.utils.formatUnits(
        dataPendingRewardQueries[i][0],
        "ether"
      ),
      networkId: networkID,
    };
  });

  return hds;
}
