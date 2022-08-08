import React, { useEffect, useMemo, useState } from "react";
import App from "./App";
import { HashRouter } from "react-router-dom";
import { loadTokenPrices } from "../helpers";
import Loading from "../components/Loader";
import { MoralisProvider } from "react-moralis";
import NftContext from "src/context/NftContext";

function Root() {
    const [nftContext, setNftContext] = useState<any>([]);
    const nftValue = useMemo(() => ({ nftContext, setNftContext }), [nftContext]);
    const isApp = (): boolean => {
        return true;//window.location.host.includes("app");
    };

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTokenPrices().then(() => setLoading(false));
    }, []);

    if (loading) return <Loading />;

    const app = () => (
        <NftContext.Provider value={nftValue}>
            <MoralisProvider serverUrl="https://1ic6ypo8crii.usemoralis.com:2053/server" appId="P51fwBPs7YeuZ9s4Wn4diab2qungIbzATBRtpVSy">
                <HashRouter>
                    <App />
                </HashRouter>
            </MoralisProvider>
        </NftContext.Provider>
    );

    return isApp() ? app() : <></>;
}

export default Root;
