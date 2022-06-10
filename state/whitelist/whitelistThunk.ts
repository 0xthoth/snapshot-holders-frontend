import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { IBaseAddressAsyncThunk } from "../types";
import { addresses } from "constant";

import WhitelistABI from "abis/Whitelist.json";
import { updateOnListed } from "state/app/appSlice";

export const fetchOnWhitelisted = createAsyncThunk<
  boolean,
  IBaseAddressAsyncThunk
>(
  "whitelist/fetchOnWhitelisted",
  async ({ provider, address }, { dispatch }) => {
    const WhitelistContract = new ethers.Contract(
      addresses.WHITELIST_ADDRESS,
      WhitelistABI,
      provider
    );

    if (address) {
      const maxWhitelist = await WhitelistContract.whitelistedAddresses(
        address
      );
      dispatch(updateOnListed(Boolean(maxWhitelist)));
    }
  }
);

export const onAddWhitelist = createAsyncThunk<
  boolean,
  IBaseAddressAsyncThunk
>(
  "whitelist/onAddWhitelist",
  async ({ provider, address }, { dispatch }) => {
    const signer = provider.getSigner();
    const WhitelistContract = new ethers.Contract(
      addresses.WHITELIST_ADDRESS,
      WhitelistABI,
      signer
    );

    if (signer && address) {
      try {
        const tx = await WhitelistContract.spacialAdd(address);
        tx.wait();
        const maxWhitelist = await WhitelistContract.whitelistedAddresses(
          address
        );
        dispatch(updateOnListed(Boolean(maxWhitelist)));
        return;
      } catch (e: unknown) {
        console.log("Error: Add Whitelist;", e);
      }
    }
    dispatch(updateOnListed(false));
  }
);
