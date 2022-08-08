import React, { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { IReduxState } from "src/store/slices/state.interface";
import axios from "axios";
import { INFT } from "src/store/slices/account-slice";
import NftCard from "src/components/NftCard/NftCard";
import { Grid, TablePagination } from "@material-ui/core";

import loadingImg from "../../assets/image/skeleton.gif";

import "./nfts.scss";
import NftContext from "src/context/NftContext";

function NFTCards() {
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(12);
    const [loading, setLoading] = useState(false);

    const { nftContext, setNftContext } = useContext<any>(NftContext);

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const nfts: any = useSelector<IReduxState, INFT[] | undefined>(state => {
        return state.account.balances.nfts;
    });

    const getNFT = async () => {
        const metaData: any = [];
        setLoading(true);
        for (let i = 0; i < nfts.length; i++) {
            await axios
                .get(nfts[i].token_uri)
                .then(res => {
                    if (res.data.image) {
                        const tempdata = { ...res.data, nftData: nfts[i] };
                        metaData.push(tempdata);
                    }
                })
                .catch(err => {});
        }
        if (metaData.length > 0) {
            setNftContext(metaData);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (nftContext.length === 0) {
            if (nfts?.length > 0) {
                getNFT();
            } else {
                console.log("no nfts");
            }
        } else {
            console.log("no nfts");
        }
    }, [nftContext]);

    useEffect(() => {
        if (nfts?.length > 0) {
            getNFT();
        } else {
            console.log("no nfts");
        }
    }, [nfts])

    return loading ? (
        <div className="loading-wrapper">
            <img src={loadingImg} alt="loading" />
        </div>
    ) : (
        <div className="nft-card-group">
            <TablePagination
                component="div"
                count={nftContext.length}
                style={{ color: "white", marginBottom: "20px" }}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[
                    { value: 12, label: "12" },
                    { value: 24, label: "24" },
                    { value: 48, label: "48" },
                ]}
                labelRowsPerPage="NFTs / Page : "
            />
            {nftContext.length > 0 ? (
                <Grid container item xs={12} spacing={2} className="nft-card-view">
                    {nftContext.slice(rowsPerPage * page, rowsPerPage * page + rowsPerPage).map((item: number, key: number) => (
                        <Grid item xs={12} sm={4} lg={3} key={key}>
                            <NftCard data={item} />
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <div className="no-nfts-text">
                    <p>You have no NFTs.</p>
                </div>
            )}
        </div>
    );
}

export default NFTCards;
