import axios from "axios";

const cache: { [key: string]: number } = {};

export const loadTokenPrices = async () => {
    // const url = "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2,olympus,magic-internet-money&vs_currencies=usd";
    // const { data } = await axios.get(url);
    cache["AVAX"] = 57;
    cache["USDC.e"] = 0.9998;
};

export const getTokenPrice = (symbol: string): number => {
    return Number(cache[symbol]);
};
