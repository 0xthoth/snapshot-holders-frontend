import { createAsyncThunk } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { IBaseMintNFTAsyncThunk } from "../types";
import { addresses } from "constant";

import NostoNftABI from "abis/NostoNFT.json";
import { updateOnListed } from "state/app/appSlice";

// export const fetchOnWhitelisted = createAsyncThunk<
//   boolean,
//   IBaseAddressAsyncThunk
// >(
//   "whitelist/fetchOnWhitelisted",
//   async ({ provider, address }, { dispatch }) => {
//     const WhitelistContract = new ethers.Contract(
//       addresses.WHITELIST_ADDRESS,
//       WhitelistABI,
//       provider
//     );

//     if (address) {
//       const maxWhitelist = await WhitelistContract.whitelistedAddresses(
//         address
//       );
//       dispatch(updateOnListed(Boolean(maxWhitelist)));
//     }
//   }
// );

export const onMintNft = createAsyncThunk<
  boolean,
  IBaseMintNFTAsyncThunk
>(
  "nft/mintNFT",
  async ({ provider, cid, amount }, { dispatch }) => {
    const signer = provider.getSigner();
    const NftContract = new ethers.Contract(
      addresses.NOSTO_NFT_ADDRESS,
      NostoNftABI,
      signer
    );

    if (signer && cid && +amount) {
      try {
        const tx = await NftContract.mint(cid, {
          value: ethers.utils.parseEther(amount),
        });
        tx.wait();
        console.log(tx);
        return;
      } catch (e: unknown) {
        console.log("Error: Mint NFT;", e);
      }
    }
    dispatch(updateOnListed(false));
  }
);
