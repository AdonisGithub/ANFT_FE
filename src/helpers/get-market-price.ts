import { ethers } from "ethers";
import { LpReserveContract } from "../abi";
import { Networks } from "../constants/blockchain";
import { getAddresses } from "src/constants";
export async function getMarketPrice(networkID: Networks, provider: ethers.Signer | ethers.providers.Provider): Promise<number> {
    const addresses = getAddresses(networkID);
    const poolAddress = addresses.POOL_ADDRESS; // usdc.e, anft
    const pairContract = new ethers.Contract(poolAddress, LpReserveContract, provider);
    const reserves = await pairContract.getReserves();
    const marketPrice = Math.round( reserves[1] / reserves[0] * Math.pow(10,5) ) / Math.pow(10,2);  // reserve[0] : ANFT, reserve[1] : USDC.e
    return marketPrice;
}
