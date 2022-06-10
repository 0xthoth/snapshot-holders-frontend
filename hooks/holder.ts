import { useMemo, useState } from "react";
import { useQuery, QueryOptions, UseQueryResult } from "react-query";
import { apolloExt } from "../apollo-client";
import { getHolderInfo } from "helpers";

type Holder = {
  id: string;
  address: string;
  balance: string;
  stakedBlock: string;
  updatedAt: string;
};

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
        updatedAt
      }
    }
  `;

export const useStake66Holders = (options: QueryOptions): UseQueryResult<any> => {
  return useQuery(
    "stake66_holders",
    async () => {
      const response = await apolloExt<{ holders: Holder[] }>(
        stake66HoldersQuery,
        "https://api.thegraph.com/subgraphs/name/0xthoth/snapshot-holder-v1"
      );
      if (!response?.data.holders) return []
      return response?.data.holders;
    },
    options
  );
};

export const useStake66HoldersMovr = (options: QueryOptions): UseQueryResult<any> => {
  return useQuery(
    "stake66_holders_movr",
    async () => {
      const response = await apolloExt<{ holders: Holder[] }>(
        stake66HoldersQuery,
        "https://api.thegraph.com/subgraphs/name/0xthoth/stake66-holders-movr"
      );
      if (!response?.data.holders) return []
      return response?.data.holders;
    },
    options
  );
};

export const useStake66HoldersInfo = () => {
  const { data } = useStake66Holders({});
  const [holders, setHolders] = useState<{
    [key: number]: Array<any>
  }>({
    56: [],
    1285: []
  });
  const { data: movrData } = useStake66HoldersMovr({});

  useMemo(async () => {
    if (!data || !data?.length || !movrData || !movrData?.length) return [];

    const holderList = await Promise.all([
      getHolderInfo({
        data,
        networkID: 56
      }),
      getHolderInfo({
        data: movrData,
        networkID: 1285
      })
    ]);

    setHolders({
      56: holderList[0],
      1285: holderList[1]
    });
  }, [data, movrData]);

  return holders;
};
