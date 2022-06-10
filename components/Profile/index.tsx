import React from "react";
import { Box } from "@mui/material";
import { useWeb3Context } from "../../hooks";
import { useAppSelector } from "state/hooks";
import { appInfo } from "state/app/appSlice";

const Profile = () => {
  const { address, balance } = useWeb3Context();

  const { nostoBalance: NOSTOBalance } = useAppSelector(appInfo);

  return (
    <Box>
      <div>Profile: {address}</div>
      <div>ETH balance: {balance}</div>
      <div>NOSTO balance: {NOSTOBalance}</div>
    </Box>
  );
};

export default Profile;
