import { useMemo, useState } from "react";
import { useQuery, QueryOptions } from "react-query";
import { apolloExt } from "../apollo-client";
import { ethers } from "ethers";
import { NetworkId } from "helpers/networkDetails";
import MasterChefABI from "abis/MasterChef.json";
import { multicall } from "helpers/multicall";
import {
  JsonRpcProvider,
  StaticJsonRpcProvider,
} from "@ethersproject/providers";
import { iAddresses } from "constant";
import { getMarketPrice, getWSWORDIndex } from "helpers";

type Holder = {
  id: string;
  address: string;
  balance: string;
  stakedBlock: string;
  updatedAt: string;
};

export const useStake66Holders = (options: QueryOptions) => {
  const stake66HoldersQuery = `
    query {
      holders(
        first: 1000, 
        orderBy: balance, 
        orderDirection: desc,
        where: { balance_gt: 0 } 
      ) {
        id
        address
        balance
        stakedBlock
        updatedAt
      }
    }
  `;

  return useQuery(
    "stake66_holders",
    async () => {
      const response = await apolloExt<{ holders: Holder[] }>(
        stake66HoldersQuery,
        "https://api.thegraph.com/subgraphs/name/0xthoth/snapshot-holder-v1"
      );
      return response?.data.holders;
    },
    options
  );
};

export const useStake66HoldersInfo = (
  provider: JsonRpcProvider | StaticJsonRpcProvider,
  networkID: NetworkId
) => {
  const { data } = useStake66Holders({});
  const [holders, setHolders] = useState([]);

  useMemo(async () => {
    if (!data || !networkID) return [];

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
      };
    });
    setHolders(hds);
  }, [data]);

  return holders;
};
