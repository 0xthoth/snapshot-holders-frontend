import React from "react";
import { Box } from "@mui/material";
import Layout from "@/components/Layout";

import MintForm from "./form";
import { useAppDispatch } from "state/hooks";
import { useWeb3Context } from "hooks";
import { onMintNft } from "state/nft/nftThunk";

const NFT = () => {
  const dispatch = useAppDispatch();
  const { provider } = useWeb3Context();
  const onSubmit = (cid: string, amount: string) => {
    dispatch(
      onMintNft({
        provider,
        cid,
        amount,
      })
    );
  };

  return (
    <Layout>
      <Box>NFT</Box>
      <MintForm onSubmit={onSubmit} />
    </Layout>
  );
};

export default NFT;
