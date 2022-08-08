import { useEffect, useState, useCallback } from "react";
import { Route, Switch } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAddress, useWeb3Context } from "../hooks";
import { calcBondDetails } from "../store/slices/bond-slice";
import { loadAppDetails } from "../store/slices/app-slice";
import { loadAccountDetails, calculateUserBondDetails } from "../store/slices/account-slice";
import { IReduxState } from "../store/slices/state.interface";
import Loading from "../components/Loader";
import useBonds from "../hooks/bonds";
import ViewBase from "../components/ViewBase";
import { ChooseBond, Bond, NFTCards, MintPage, Spoils, Admin } from "../views";
import "./style.scss";
import { getAddresses } from "src/constants";

function App() {
    const dispatch = useDispatch();

    const { connect, provider, hasCachedProvider, chainID, connected } = useWeb3Context();
    const address = useAddress();
    const addresses = getAddresses(chainID);

    const [walletChecked, setWalletChecked] = useState(false);

    const isAppLoading = useSelector<IReduxState, boolean>(state => state.app.loading);
    const isAccountLoading = useSelector<IReduxState, boolean>(state => state.account.loading);
    const isAppLoaded = useSelector<IReduxState, boolean>(state => !Boolean(state.app.marketPrice));

    const { bonds } = useBonds();

    async function loadDetails(whichDetails: string) {
        let loadProvider = provider;

        if (whichDetails === "app") {
            loadApp(loadProvider);
        }

        if (whichDetails === "account" && address && connected) {
            loadAccount(loadProvider);
            if (isAppLoaded) return;

            loadApp(loadProvider);
        }

        if (whichDetails === "userBonds" && address && connected) {
            bonds.map(bond => {
                dispatch(calculateUserBondDetails({ address, bond, provider, networkID: chainID }));
            });
        }
    }

    const loadApp = useCallback(
        loadProvider => {
            dispatch(loadAppDetails({ networkID: chainID, provider: loadProvider }));
            bonds.map(bond => {
                dispatch(calcBondDetails({ bond, value: null, provider: loadProvider, networkID: chainID }));
            });
        },
        [connected],
    );

    const loadAccount = useCallback(
        loadProvider => {
            dispatch(loadAccountDetails({ networkID: chainID, address, provider: loadProvider }));
        },
        [connected],
    );

    useEffect(() => {
        if (hasCachedProvider()) {
            connect().then(() => {
                setWalletChecked(true);
            });
        } else {
            setWalletChecked(true);
        }
    }, []);

    useEffect(() => {
        if (walletChecked) {
            loadDetails("app");
            loadDetails("account");
            loadDetails("userBonds");
        }
    }, [walletChecked]);

    useEffect(() => {
        if (connected) {
            loadDetails("app");
            loadDetails("account");
            loadDetails("userBonds");
        }
    }, [connected]);

    if (isAppLoading) return <Loading />;

    return (
        <ViewBase>
            <Switch>
                <Route path="/bond">
                    {bonds.map(bond => {
                        return (
                            <Route exact key={bond.name} path={`/bond/${bond.name}`}>
                                <Bond bond={bond} />
                            </Route>
                        );
                    })}
                    <ChooseBond />
                </Route>
                <Route path="/admin">
                    {address == addresses.ADMIN_ADDRESS ?
                        <Admin /> : <></>
                    }
                </Route>
                <Route path="/nfts">
                    <NFTCards />
                </Route>
                <Route path="/mint">
                    <MintPage />
                </Route>
                <Route path="/spoils">
                    <Spoils />
                </Route>
            </Switch>
        </ViewBase>
    );
}

export default App;
