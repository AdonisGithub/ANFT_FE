import { Networks } from "../../constants/blockchain";
import { StableBond, CustomBond } from "./stable-bond";

import UsdcIcon from "../../assets/tokens/USDC.e.png";
import AvaxIcon from "../../assets/tokens/AVAX.svg";

import { StableBondContract, StableReserveContract } from "../../abi";

export const usdc = new StableBond({
    name: "usdc",
    displayName: "USDC.e",
    bondToken: "USDC.e",
    bondIconSvg: UsdcIcon,
    bondContractABI: StableBondContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0x9986E9C39Dfd93ddbbA773BBEB35444B6F514905",
            reserveAddress: "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664",
        },
    },
});

export const wavax = new CustomBond({
    name: "wavax",
    displayName: "wAVAX",
    bondToken: "AVAX",
    bondIconSvg: AvaxIcon,
    bondContractABI: StableReserveContract,
    reserveContractAbi: StableReserveContract,
    networkAddrs: {
        [Networks.AVAX]: {
            bondAddress: "0xE02B1AA2c4BE73093BE79d763fdFFC0E3cf67318",
            reserveAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
        },
    },
});



export default [usdc, wavax];
