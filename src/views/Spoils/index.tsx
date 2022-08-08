
import { Zoom, Grid, Box } from "@material-ui/core";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Moralis from "moralis";
import { useMoralisQuery } from "react-moralis";
import "./spoils.scss";
import { useWeb3Context } from "src/hooks";
import { useEffect, useState } from "react";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSelector } from "react-redux";
import { IReduxState } from "src/store/slices/state.interface";
import { useCountdown } from "src/helpers/get-reward-time";
import { trim } from "src/helpers";
import { useMoralisCloudFunction } from "react-moralis";


let graphData: any = [];

type TxHistory = {
    id: string;
    txHash: string;
    block_number: number;
    date: number;
    amount: number;
    from: string;
    to: string;
    type: string;
}



function Spoils() {

    const { address, chainID } = useWeb3Context();
    const rewardTime = useCountdown();


    const walletBalance = useSelector<IReduxState, number>(state => state.account.balances.anft);
    const totalSupply = useSelector<IReduxState, number>(state => state.app.totalSupply);
    const lastAirdropTime = useSelector<IReduxState, number>(state => state.app.lastAirdropTime);

    const spoilsRewards = useSelector<IReduxState, number>(state => state.app.spoilsofwar);

    const totalRewardsToDate = useSelector<IReduxState, number>(state => state.app.airdropToDate);

    const cycle = useSelector<IReduxState, number>(state => state.app.cycle);
    const [myRewards, setMyRewards] = useState(0);

    const { fetch } = useMoralisCloudFunction("getTokenHolderNum", { autoFetch: false });

    const fetchBuyTx = new Moralis.Query("TransferEventLogs");

    fetchBuyTx.equalTo("to", address.toLocaleLowerCase());

    const fetchSellTx = new Moralis.Query("TransferEventLogs");
    fetchSellTx.equalTo("from", address.toLocaleLowerCase());

    const filterTx = new Moralis.Query("TransferEventLogs");

    filterTx.notEqualTo("value", "0");

    const fetchTradeTx = Moralis.Query.or(fetchBuyTx, fetchSellTx);

    const fetchTx = Moralis.Query.and(fetchTradeTx, filterTx);

    const [txHistory, setTxHistory] = useState<Array<TxHistory> | null>(null);

    const [holders, setHolders] = useState(0);

    const { data, isLoading, error } = useMoralisQuery("TransferEventLogs", query => fetchTx);

    const cloudCall = () => {
        fetch({
            onSuccess: (data) => {
                setHolders(Number(data));
            }
        });
    }

    const createGraphData = () => {

        graphData = [];

        let txsToLastAirdop: Array<TxHistory> | undefined = txHistory?.filter(tx => tx.date <= lastAirdropTime);
        let balanceInLastAirdop = 0;

        if (txsToLastAirdop !== undefined) {
            for (let i = 0; i < txsToLastAirdop.length; i++) {
                if (txsToLastAirdop[i].to == address.toLocaleLowerCase())
                    balanceInLastAirdop += txsToLastAirdop[i].amount;
                else balanceInLastAirdop -= txsToLastAirdop[i].amount;
            }
        }

        let txsFromLastAirdrop: Array<TxHistory> | undefined = txHistory?.filter(tx => tx.date > lastAirdropTime);

        txsFromLastAirdrop?.sort((a, b) => {
            return a.date - b.date;
        });

        const xDate: Array<number> = [];
        const xLabel: Array<string> = [];

        for (let i = 0; ; i++) {
            let timestamp = lastAirdropTime - lastAirdropTime % 86400000 + 86400000 * i;
            if (timestamp >= Date.now()) {
                xDate.push(Date.now());
            } else {
                xDate.push(timestamp);
            }
            xLabel.push(`${(new Date(timestamp)).getMonth() + 1}/${(new Date(timestamp)).getDate()}`);
            if (timestamp >= Date.now())
                break;
        }

        let amount: number = 0;
        let lastTime = lastAirdropTime;
        let lastBalance = balanceInLastAirdop;
        let totalAmount: number = 0;

        graphData.push({ amount: lastBalance, name: xLabel[0] });

        for (let i = 1; i < xLabel.length; i++) {

            amount = 0;

            if (txsFromLastAirdrop !== undefined) {
                for (const tx of txsFromLastAirdrop) {
                    if (tx.date >= xDate[i]) {
                        break;
                    }
                    if (xDate[i] > tx.date && tx.date >= xDate[i - 1]) {
                        if (tx.from === address.toLocaleLowerCase()) {
                            amount += lastBalance * (tx.date - lastTime) / 86400000;
                            lastBalance -= tx.amount;
                            lastTime = tx.date;
                        } else {
                            amount += lastBalance * (tx.date - lastTime) / 86400000;
                            lastBalance += tx.amount;
                            lastTime = tx.date;
                        }
                    }
                }
            }
            amount += lastBalance * (xDate[i] - lastTime) / 86400000;
            totalAmount += amount;
            lastTime = xDate[i];
            graphData.push({ amount: trim(amount, 2), name: xLabel[i] });
        }

        setMyRewards(spoilsRewards * totalAmount / (30 * totalSupply))
    }

    useEffect(() => {

        cloudCall();
        let txHistory: TxHistory[] = [];
        if (!isLoading) {
            for (let i = 0; i <= data.length; i++) {
                if (data[i] !== undefined) {
                    txHistory.push({
                        id: data[i].get("objectId"),
                        txHash: (data[i].get("transaction_hash")),
                        block_number: data[i].get("block_number"),
                        date: Date.parse(data[i].get("block_timestamp")),
                        amount: Number(data[i].get("value")) / Math.pow(10, 9),
                        from: data[i].get("from"),
                        to: data[i].get("to"),
                        type: (data[i].get("to") === address.toLocaleLowerCase()) ? "BUY" : "SELL"
                    });
                }
            }
            setTxHistory(txHistory);
        }
    }, [data]);

    useEffect(() => {
        createGraphData();
    }, [txHistory]);

    return (

        <div className="spoils-view">
            <Zoom in={true}>
                <Grid container spacing={3}>
                    <Grid container item>
                        <div className="reward-dashboard">
                            <Grid container item>
                                <Grid item xs={12} sm={12} md={4} className="bignum-view">

                                    <Box >
                                        <h4 className="dashboard-title">Spoils of War</h4>
                                        <div className="dashboard-value">
                                            <h4 className="smaller">$</h4>
                                            {spoilsRewards >= 1000 ?
                                                <>
                                                    <h4 className="bigger">{Math.floor(spoilsRewards / 1000)}</h4>
                                                    <h4 className="smaller">.{Math.floor(spoilsRewards % 1000) == 0 ? "00" : Math.floor(spoilsRewards % 1000 / 10) < 10 ? `0${Math.floor(spoilsRewards % 1000 / 10)}` : Math.floor(spoilsRewards % 1000 / 10)}K</h4>
                                                </> :
                                                <>
                                                    <h4 className="bigger">{Math.floor(spoilsRewards)}</h4>
                                                    <h4 className="smaller">.{Math.floor(spoilsRewards * 100 % 100) == 0 ? "00" : Math.floor(spoilsRewards * 100 % 100) < 10 ? `0${Math.floor(spoilsRewards * 100 % 100)}` : Math.floor(spoilsRewards * 100 % 100)}</h4>
                                                </>
                                            }
                                        </div>
                                        <img src="" />
                                    </Box>
                                    <Box>
                                        <h4 className="dashboard-title">Total Rewards to Date</h4>
                                        <div className="dashboard-value">
                                            <h4 className="smaller">$</h4>
                                            {totalRewardsToDate >= 1000 ?
                                                <>
                                                    <h4 className="bigger">{Math.floor(totalRewardsToDate / 1000)}</h4>
                                                    <h4 className="smaller">.{Math.floor(totalRewardsToDate % 1000) == 0 ? "00" : Math.floor(totalRewardsToDate % 1000 / 10) < 10 ? `0${Math.floor(totalRewardsToDate % 1000 / 10)}` : Math.floor(totalRewardsToDate % 1000 / 10)}K</h4>
                                                </> :
                                                <>
                                                    <h4 className="bigger">{Math.floor(totalRewardsToDate)}</h4>
                                                    <h4 className="smaller">.{Math.floor(totalRewardsToDate * 100 % 100) == 0 ? "00" : Math.floor(totalRewardsToDate * 100 % 100) < 10 ? `0${Math.floor(totalRewardsToDate * 100 % 100)}` : Math.floor(totalRewardsToDate * 100 % 100)}</h4>
                                                </>
                                            }
                                        </div>
                                    </Box>

                                </Grid>
                                <Grid item xs={12} sm={12} md={4} style={{ marginTop: "auto", marginBottom: "auto" }}>
                                    <Box>
                                        <h4 className="dashboard-title">Wallet Balance</h4>
                                        <div className="dashboard-value">
                                            <h4 className="normal">{trim(walletBalance, 2)}</h4>
                                        </div>
                                    </Box>
                                    <Box>
                                        <h4 className="dashboard-title">Token Holders</h4>
                                        <div className="dashboard-value">
                                            <h4 className="normal">{holders}</h4>
                                        </div>
                                    </Box>
                                    <Box>
                                        <h4 className="dashboard-title">Average Holdings</h4>
                                        <div className="dashboard-value">
                                            <h4 className="normal">
                                                {(holders !== 0) ? trim(totalSupply / holders, 3) : 0}
                                            </h4>
                                        </div>
                                    </Box>
                                </Grid>
                                <Grid container item xs={12} sm={12} md={4} direction="column">
                                    <Box className="circular-progress-bar">
                                        <div style={{ position: "relative" }}>
                                            <CircularProgressbar value={100 * ((Date.now() - lastAirdropTime) / (2592 * Math.pow(10, 6)))} strokeWidth={11} background={true}
                                                styles={buildStyles({
                                                    backgroundColor: "transparent",
                                                    trailColor: "#252640",
                                                    textColor: "#FFF",

                                                })}
                                            />
                                            <div className="rebase-timer">
                                                <span className="rebase-timer-day">{rewardTime[0]} DAYS</span><br />
                                                <span className="rebase-timer-seconds">{rewardTime[1]}:{rewardTime[2]}:{rewardTime[3]}</span><br />
                                            </div>
                                        </div>
                                    </Box>
                                    <Box sx={{ display: "flex", alignItems: "center", flexDirection: "column" }} className="rebase-circle-text">
                                        <h4 className="dashboard-title">
                                            Spoils of War Airdrop
                                        </h4>
                                        <h4 className="dashboard-title">
                                            Every 30 Days
                                        </h4>
                                    </Box>
                                </Grid>
                            </Grid>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={8} md={7} >
                        <div className="chart-view">
                            <Box paddingTop={2}>
                                <h4>Token Holding History</h4>
                            </Box>
                            <Box className='holding-chart' >
                                <ResponsiveContainer>
                                    <AreaChart
                                        data={graphData}
                                        margin={{
                                            top: 10,
                                            right: 0,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <XAxis dataKey="name" />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="amount" stroke="#270c4f" fill="#270c4f" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={4} md={5} className="calculator-view">
                        <Box className="myreward-box">
                            <h4 >
                                MY REWARD
                            </h4>
                            <>
                                <div className="dashboard-value">
                                    <h4 className="smaller">$</h4>
                                    {myRewards >= 1000 ?
                                        <>
                                            <h4 className="bigger">{Math.floor(myRewards / 1000)}</h4>
                                            <h4 className="smaller">.{Math.floor(myRewards % 1000) == 0 ? "00" : Math.floor(myRewards % 1000 / 10) < 10 ? `0${Math.floor(myRewards % 1000 / 10)}` : Math.floor(myRewards % 1000 / 10)}K</h4>
                                        </> :
                                        <>
                                            <h4 className="bigger">{Math.floor(myRewards)}</h4>
                                            <h4 className="smaller">.{Math.floor(myRewards * 100 % 100) == 0 ? "00" : Math.floor(myRewards * 100 % 100) < 10 ? `0${Math.floor(myRewards * 100 % 100)}` : Math.floor(myRewards * 100 % 100)}</h4>
                                        </>
                                    }
                                </div>
                            </>
                        </Box>
                        <Box className="formula-box">
                            <h3>
                                WAR CYCLES
                            </h3>
                            <h4>
                                ERA:<span>{cycle}</span>
                            </h4>
                        </Box>
                    </Grid>
                </Grid>
            </Zoom>
        </div>
    )
}

export default Spoils;


