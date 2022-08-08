import { ethers } from "ethers";
import { SpoilsContract } from "../../abi";
import { messages } from "../../constants/messages";
import { success, warning, info} from "../slices/messages-slice";
import { getGasPrice } from "../../helpers/get-gas-price";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { clearPendingTxn, fetchPendingTxns } from "./pending-txns-slice";
import { sleep, trim } from "../../helpers";
import { loadAccountDetails } from "./account-slice";
import { getAddresses, Networks } from "src/constants";
import { metamaskErrorWrap } from "src/helpers/metamask-error-wrap";


interface IDistributeRewards {
    arrAddress: Array<string>;
    arrAmount: Array<number>;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}

export const distributeRewards = createAsyncThunk("distribute rewards to anft holders", async ({arrAddress, arrAmount , networkID, provider}: IDistributeRewards, {dispatch}) => {
   

    if (!provider) {
        dispatch(warning({ text: messages.please_connect_wallet }));
        return;
    }
    console.log(arrAmount)
    let arrAmountInWei = [];
    arrAmountInWei = arrAmount.map(amount => ethers.utils.parseUnits(trim(amount,6),6).toNumber());

    console.log(arrAmountInWei)
    const signer = provider.getSigner();
    const addresses = getAddresses(networkID);
    const spoilsofWarContract = new ethers.Contract(addresses.SPOILS_ADDRESS, SpoilsContract, signer);
   
    let airdropTx;
    try {
        const gasPrice = await getGasPrice(provider);
        airdropTx = await spoilsofWarContract.distributeRewards(arrAddress, arrAmountInWei, {gasPrice});
        dispatch(
            fetchPendingTxns({
                txnHash : airdropTx.hash,
                text: "distribute rewards",
                type: "distribute"
            }),
        );
        await airdropTx.wait();
        dispatch(success({text: messages.tx_successfully_send}));
        dispatch(info({ text: messages.your_balance_update_soon}));
        await sleep(10);
    } catch(err : any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if(airdropTx) {
            dispatch(clearPendingTxn(airdropTx.hash));
        }
    }
});
