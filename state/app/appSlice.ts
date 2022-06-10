import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { AppState } from "../index";
import {
  IBaseAddressAsyncThunk,
  IBaseAsyncThunk,
  WhitelistResponse,
} from "../types";
import { addresses } from "constant";

import WhitelistABI from "abis/Whitelist.json";
import NostoTokenABI from "abis/NostoToken.json";

export type AppInfoState = {
  nostoBalance: string;
  whitelist: {
    maxLength: string;
    length: string;
    owner: string;
    onListed: boolean | undefined;
  };
};

const initialState: AppInfoState = {
  nostoBalance: "0",
  whitelist: {
    maxLength: "0",
    length: "0",
    owner: "",
    onListed: undefined,
  },
};

export const fetchWhitelistInfo = createAsyncThunk<
  WhitelistResponse,
  IBaseAsyncThunk
>("whitelist/fetchWhitelistInfo", async ({ provider }) => {
  const WhitelistContract = new ethers.Contract(
    addresses.WHITELIST_ADDRESS,
    WhitelistABI,
    provider
  );

  const maxWhitelist = await WhitelistContract.maxWhiteList();
  const whitelistLength = await WhitelistContract.whitelistLength();
  const owner = await WhitelistContract.owner();

  return {
    maxLength: `${Number(maxWhitelist)}`,
    length: `${Number(whitelistLength)}`,
    owner,
  };
});

export const fetchNostoBalance = createAsyncThunk<
  string,
  IBaseAddressAsyncThunk
>("app/fetchNostoBalance", async ({ provider, address }) => {
  const NostoTokenContract = new ethers.Contract(
    addresses.NOSTO_TOKEN_ADDRESS,
    NostoTokenABI,
    provider
  );

  const balance = await NostoTokenContract.balanceOf(address);
  return ethers.utils.formatUnits(balance, "ether");
});

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateOnListed: (state, action: PayloadAction<boolean>) => {
      state.whitelist.onListed = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWhitelistInfo.fulfilled, (state, { payload }) => {
        state.whitelist = {
          ...state.whitelist,
          ...payload,
        };
      })
      .addCase(fetchNostoBalance.fulfilled, (state, { payload }) => {
        state.nostoBalance = payload;
      });
  },
});
export const { updateOnListed } = appSlice.actions;
export const appInfo = (state: AppState) => state.app;
export default appSlice.reducer;
