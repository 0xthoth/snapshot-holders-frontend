import React, { useMemo } from "react";
import Layout from "@/components/Layout";
import { Box, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "state/hooks";
import { appInfo } from "state/app/appSlice";
import { fetchOnWhitelisted, onAddWhitelist } from "state/whitelist/whitelistThunk";
import { useWeb3Context } from "hooks";
import { addresses } from "../../constant";

import WhitelistForm from "./form";


const Whitelist = () => {
  const { address, provider } = useWeb3Context();

  const { whitelist } = useAppSelector(appInfo);
  const dispatch = useAppDispatch();

  const onCheck = () => {
    dispatch(fetchOnWhitelisted({ provider, address }));
  };

  const onOwnerAddWhitelist = (address: string) => {
    dispatch(onAddWhitelist({ provider, address }));
  };

  const OwnerBox = useMemo(() => {
    if (addresses.WHITELIST_OWNER_ADDRESS !== address) return null;
    return (
      <Box mt={3}>
        <Typography>Whitelist for owner.</Typography>
        <WhitelistForm
          defaultAddress={address}
          onSubmit={onOwnerAddWhitelist}
        />
      </Box>
    );
  }, [address]);

  return (
    <Layout>
      <Box mt={5}>Whitelist</Box>
      <Box>
        Max: {whitelist.maxLength} , Length: {whitelist.length}
      </Box>
      <Box>
        Am I on the whitelist?{" "}
        {whitelist?.onListed !== undefined ? (
          `${whitelist?.onListed}`
        ) : (
          <button onClick={onCheck}>Check</button>
        )}
      </Box>
      {OwnerBox}
    </Layout>
  );
};

export default Whitelist;
