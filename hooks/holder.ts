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
      _meta {
        block {
          number
        }
      }
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
      const response = await apolloExt<{
        _meta: any; holders: Holder[]
      }>(
        stake66HoldersQuery,
        "https://api.thegraph.com/subgraphs/name/0xthoth/snapshot-holder-v1"
      );
      if (!response?.data.holders) return []
      console.log("BSC Last Block: ", response?.data?._meta?.block.number);
      return response?.data.holders;
    },
    options
  );
};

export const useStake66HoldersMovr = (options: QueryOptions): UseQueryResult<any> => {
  return useQuery(
    "stake66_holders_movr",
    async () => {
      const response = await apolloExt<{
        _meta: any; holders: Holder[]
      }>(
        stake66HoldersQuery,
        "https://api.thegraph.com/subgraphs/name/0xthoth/stake66-holders-movr"
      );
      if (!response?.data.holders) return []
      console.log("MOVR Last Block: ", response?.data?._meta?.block.number);
      return response?.data.holders;
    },
    options
  );
};

export const useStake66HoldersOne = (options: QueryOptions): UseQueryResult<any> => {
  return useQuery(
    "stake66_holders_one",
    async () => {
      const response = await apolloExt<{
        _meta: any; holders: Holder[]
      }>(
        stake66HoldersQuery,
        "https://one.subgraph.templar.finance/subgraphs/name/0xthoth/stake66-holders-one"
      );

      if (!response?.data.holders) return []
      console.log("ONE Last Block: ", response?.data?._meta?.block.number);
      return response?.data.holders;
    },
    options
  );
};

export const useStake66HoldersInfo = () => {
  const { data } = useStake66Holders({});
  const { data: movrData } = useStake66HoldersMovr({});
  const { data: oneData } = useStake66HoldersOne({});

  const [holders, setHolders] = useState<{
    [key: number]: Array<any>
  }>({
    56: [],
    1285: [],
    1666600000: []
  });


  useMemo(async () => {
    if (!data || !movrData || !oneData) return [];

    const holderList = await Promise.all([
      getHolderInfo({
        data,
        networkID: 56
      }),
      getHolderInfo({
        data: movrData,
        networkID: 1285
      }),
      getHolderInfo({
        data: oneData,
        networkID: 1666600000
      })
    ]);

    const bscHolders = holderList[0]
    const movrHolders = holderList[1]
    const oneHolders = holderList[2]

    setHolders({
      56: bscHolders,
      1285: movrHolders,
      1666600000: oneHolders
    });
  }, [data, movrData]);

  return holders;
};
