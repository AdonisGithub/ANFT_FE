import { BigNumber, ethers } from "ethers";

import { getAddresses } from "../../constants";
import { ANFTContract, SpoilsContract, StableReserveContract } from "../../abi";
import { setAll } from "../../helpers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider } from "@ethersproject/providers";
import { getMarketPrice } from "../../helpers";
import { RootState } from "../store";
import allBonds from "../../helpers/bond";

interface ILoadAppDetails {
    networkID: number;
    provider: JsonRpcProvider;
}

export const loadAppDetails = createAsyncThunk(
    "app/loadAppDetails",
    //@ts-ignore
    async ({ networkID, provider }: ILoadAppDetails) => {

        const addresses = getAddresses(networkID);

        const currentBlock = await provider.getBlockNumber();
        const currentBlockTime = (await provider.getBlock(currentBlock)).timestamp;

        const marketPrice = await getMarketPrice(networkID, provider);

        const anftContract = new ethers.Contract(addresses.ANFT_ADDRESS, ANFTContract, provider);
        const totalSupply = (await anftContract.totalSupply()) / Math.pow(10, 9);

        const anftToBond = (await anftContract.balanceOf(addresses.BOND_DEPOSITORY_ADDRESS)) / Math.pow(10, 9);

        const marketCap = totalSupply * marketPrice;

        const usdcContract = new ethers.Contract(addresses.USDC_ADDRESS, StableReserveContract, provider);
        const treasuryBalance = (await usdcContract.balanceOf(addresses.WARCHEST_ADDRESS)) / Math.pow(10, 6);

        const poolValue = (await usdcContract.balanceOf(addresses.POOL_ADDRESS)) / Math.pow(10, 6) * 2;

        const spoilsContract = new ethers.Contract(addresses.SPOILS_ADDRESS, SpoilsContract, provider);

        const lastAirdropTime = (await spoilsContract.lastAirdropTime()) * Math.pow(10, 3);

        const lastAirdopInBlockNumber = 15389716;

        const spoilsofwar = (await usdcContract.balanceOf(addresses.SPOILS_ADDRESS)) / Math.pow(10, 6);
        const airdropToDate = (await spoilsContract.totalRewardsToDate()) / Math.pow(10, 6);

        const cycle = (await spoilsContract.warCycle()).toNumber();

        return {
            totalSupply,
            marketCap,
            poolValue,
            currentBlock,
            treasuryBalance,
            marketPrice,
            currentBlockTime,
            lastAirdropTime,
            lastAirdopInBlockNumber,
            anftToBond,
            spoilsofwar,
            cycle,
            airdropToDate
        };
    },
);

export interface IAppSlice {
    totalSupply: number;
    marketCap: number;
    poolValue: number;
    currentBlock: number;
    treasuryBalance: number;
    currentBlockTime: number;
    marketPrice: number;
    anftToBond: number;
    lastAirdropTime: number;
    lastAirdopInBlockNumber: number;
    airdropToDate: number;
    spoilsofwar: number;
    cycle: number;
    loading: boolean;
}

const initialState: IAppSlice = {
    totalSupply: 0,
    marketCap: 0,
    poolValue: 0,
    currentBlock: 0,
    treasuryBalance: 0,
    currentBlockTime: 0,
    marketPrice: 0,
    anftToBond: 0,
    spoilsofwar: 0,
    airdropToDate: 0,
    cycle: 1,
    lastAirdropTime: 1654041600000,
    lastAirdopInBlockNumber: 15389716,
    loading: true
};

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        fetchAppSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAppDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(loadAppDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAppDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
