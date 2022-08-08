import { ethers } from "ethers";
import { getAddresses } from "../../constants";
import { ANFTContract } from "../../abi";
import { setAll } from "../../helpers";

import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { Bond } from "../../helpers/bond/bond";
import { Networks } from "../../constants/blockchain";
import { RootState } from "../store";
import Moralis from "moralis";

interface IGetBalances {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

export interface INFT {
    token_address: string;
    token_id: string;
    contract_type: string;
    owner_of: string;
    block_number: string;
    block_number_minted: string;
    token_uri?: string | undefined;
    metadata?: string | undefined;
    synced_at?: string | undefined;
    amount?: string | undefined;
    name: string;
    symbol: string;
}

interface IAccountBalances {
    balances: {
        anft: number;
        nfts?: Array<INFT>;
    };
}

export const getBalances = createAsyncThunk("account/getBalances", async ({ address, networkID, provider }: IGetBalances): Promise<IAccountBalances> => {
    const addresses = getAddresses(networkID);
    const anftContract = new ethers.Contract(addresses.ANFT_ADDRESS, ANFTContract, provider);
    const anftBalance = (await anftContract.balanceOf(address))/Math.pow(10,9);
    const nftBalance = await Moralis.Web3API.account.getNFTs({ chain: "avalanche", address });
    return {
        balances: {
            anft: anftBalance,
            nfts: nftBalance.result,
        },
    };
});

interface ILoadAccountDetails {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

interface IUserAccountDetails {
    balances: {
        anft: number;
        nfts?: Array<INFT>;
    };
}

export const loadAccountDetails = createAsyncThunk("account/loadAccountDetails", async ({ networkID, provider, address }: ILoadAccountDetails) => {
    
    let anftBalance = 0;
    const addresses = getAddresses(networkID);
    const anftContract = new ethers.Contract(addresses.ANFT_ADDRESS, ANFTContract, provider);
    anftBalance = (await anftContract.balanceOf(address))/ Math.pow(10,9);

    let nftBalance: any;
    try {
        nftBalance = await Moralis.Web3API.account.getNFTs({ chain: "avalanche", address });
    } catch(error) {
        console.log(error)        
    } 

    return {                                                                     
        balances: {
            anft: anftBalance,             
            nfts: nftBalance?.result,
        },
    };
});

interface ICalcUserBondDetails {
    address: string;
    bond: Bond;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
    networkID: Networks;
}

export interface IUserBondDetails {
    allowance: number;
    balance: number;
    avaxBalance: number;
    interestDue: number;
    bondMaturationBlock: number;
    pendingPayout: number; //Payout formatted in gwei.
}

export const calculateUserBondDetails = createAsyncThunk("account/calculateUserBondDetails", async ({ address, bond, networkID, provider }: ICalcUserBondDetails) => {
    if (!address) {
        return new Promise<any>(resevle => {
            resevle({
                bond: "",
                displayName: "",
                bondIconSvg: "",
                isLP: false,
                allowance: 0,
                balance: 0,
                interestDue: 0,
                bondMaturationBlock: 0,
                pendingPayout: "",
                avaxBalance: 0,
            });
        });
    }

    const bondContract = bond.getContractForBond(networkID, provider);
    const reserveContract = bond.getContractForReserve(networkID, provider);

    let interestDue, pendingPayout, bondMaturationBlock;

    const bondDetails = await bondContract.bondInfo(address);
    interestDue = bondDetails.payout / Math.pow(10, 9);
    bondMaturationBlock = Number(bondDetails.vesting) + Number(bondDetails.lastTime);
    pendingPayout = await bondContract.pendingPayoutFor(address);

    let allowance,
        balance = "0";

    allowance = await reserveContract.allowance(address, bond.getAddressForBond(networkID));
    balance = await reserveContract.balanceOf(address);
    const balanceVal = ethers.utils.formatUnits(balance, 6);

    const avaxBalance = await provider.getSigner().getBalance();
    const avaxVal = ethers.utils.formatEther(avaxBalance);

    const pendingPayoutVal = ethers.utils.formatUnits(pendingPayout, "gwei");

    return {
        bond: bond.name,
        displayName: bond.displayName,
        bondIconSvg: bond.bondIconSvg,
        isLP: bond.isLP,
        allowance: Number(allowance),
        balance: Number(balanceVal),
        avaxBalance: Number(avaxVal),
        interestDue,
        bondMaturationBlock,
        pendingPayout: Number(pendingPayoutVal),
    };
});

export interface IAccountSlice {
    bonds: { [key: string]: IUserBondDetails };
    balances: {
        anft: number;
        nfts?: Array<INFT>;
    };
    loading: boolean;
}

const initialState: IAccountSlice = {
    loading: true,
    bonds: {},
    balances: { anft: 0 },
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        fetchAccountSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAccountDetails.pending, state => {
                console.log("fending account")
                state.loading = true;
            })
            .addCase(loadAccountDetails.fulfilled, (state, action) => {     
                    console.log("account fulfilled")  
                    setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAccountDetails.rejected, (state, { error }) => {
                console.log("account rejected")
                state.loading = false;
                console.log(error);
            })
            .addCase(getBalances.pending, state => {
                state.loading = true;
            })
            .addCase(getBalances.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(getBalances.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            })
            .addCase(calculateUserBondDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(calculateUserBondDetails.fulfilled, (state, action) => {
                if (!action.payload) return;
                const bond = action.payload.bond;
                state.bonds[bond] = action.payload;
                state.loading = false;
                
            })
            .addCase(calculateUserBondDetails.rejected, (state, { error }) => {
                state.loading = false;
            });
    },
});

export default accountSlice.reducer;

export const { fetchAccountSuccess } = accountSlice.actions;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);

