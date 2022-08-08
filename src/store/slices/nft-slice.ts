import { ethers } from "ethers";
import { NFTContract,UANFTContract } from "../../abi";
import { messages } from "../../constants/messages";
import { success, warning, info} from "../slices/messages-slice";
import { getGasPrice } from "../../helpers/get-gas-price";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { clearPendingTxn, fetchPendingTxns } from "./pending-txns-slice";
import { sleep } from "../../helpers";
import { loadAccountDetails } from "./account-slice";
import { getAddresses, Networks } from "src/constants";
import { metamaskErrorWrap } from "src/helpers/metamask-error-wrap";


interface INftTransfer {
    address: string;
    receiver: string;
    token_ID: string;
    contractAddress: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

export const nftTransfer = createAsyncThunk("nft_transfer", async ({ address, receiver, token_ID, contractAddress,networkID, provider }: INftTransfer, {dispatch}) => {

    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }

    const signer = provider.getSigner();
    const nftContract = new ethers.Contract(contractAddress, NFTContract, signer);
  
    let transferTx; 
    try {
        const gasPrice = await getGasPrice(provider);
        transferTx = await nftContract.safeTransferFrom(address, receiver, Number(token_ID), {gasPrice});
        dispatch(
            fetchPendingTxns({
                txnHash : transferTx.hash,
                text: "Transfer NFT",
                type: "Transfer"
            }),
        );
        await transferTx.wait();
        dispatch(success({text: messages.tx_successfully_send}));
        dispatch(info({ text: messages.your_balance_update_soon}));
        await sleep(10);
        await dispatch(loadAccountDetails({networkID, provider, address}));
    } catch(err : any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if(transferTx) {
            dispatch(clearPendingTxn(transferTx.hash));
        }
    }
});

interface IMintNFT {
    address : string;
    provider : StaticJsonRpcProvider | JsonRpcProvider;
    networkID : Networks;
    token_uri : string;
}

export const mintNFT = createAsyncThunk("mint nft", async ({address, provider, networkID, token_uri} : IMintNFT,{dispatch}) => {

    if(!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    const signer = provider.getSigner();
    const addresses = getAddresses(networkID);
    const unftContract = new ethers.Contract(addresses.UANFT_ADDRESS, UANFTContract, signer);

    let mintTx;
    try {
        const gasPrice = await getGasPrice(provider);
        mintTx = await unftContract.mintUserNFT(token_uri,{gasPrice});
        dispatch(
            fetchPendingTxns({
                txnHash : mintTx.hash,
                text: "Mint NFT",
                type: "Mint"
            }),
        );
        await mintTx.wait();
        dispatch(success({text: messages.tx_successfully_send}));
        dispatch(info({ text: messages.your_balance_update_soon}));
        await sleep(3);
        await dispatch(loadAccountDetails({networkID, provider, address}));

    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if(mintTx) {
            dispatch(clearPendingTxn(mintTx.hash));
        }
    }

});
