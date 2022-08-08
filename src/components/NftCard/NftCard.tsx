import React from "react";
import "./nftCard.scss";
import { IoArrowRedo } from "react-icons/io5";
import logoImg from "../../assets/image/card-logo.png";
import {  Button, Modal, TextField } from "@material-ui/core";
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';

import { useDispatch } from "react-redux";
import { useWeb3Context } from "../../hooks";
import { nftTransfer } from "../../store/slices/nft-slice";



const NftCard = ({ data }: any) => {

    const formatURL = (url: string) => {
        if (url.slice(0, 7) === "ipfs://") {
            return "https://ipfs.io/ipfs/" + url.slice(7, url.length);
        }
        return url;
    };

    const handleDetails = () => {
        setOpen(true);
    };

    const [open, setOpen] = React.useState(false);
    const handleClose = () => setOpen(false);

    const [receiver, setReceiver] = React.useState("");
    

    const dispatch = useDispatch();
    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();

    async function transferNFT(){
        const contractAddress = data.nftData.token_address;
        const token_ID = data.nftData.token_id;
        if (await checkWrongNetwork()) return;
        dispatch( nftTransfer({ address, receiver, token_ID, contractAddress, networkID :chainID, provider }) );
    }

    return (
        <div className="nft-card-wrapper">
            <div className="nft-card-container">
                <div className="nft-viewer">
                    <img src={formatURL(data.image)} alt="nftImg" className="nft-img" />
                </div>
                <div className="nft-info-viewer">
                    <div className="nft-name">
                        <div>
                            <img src={logoImg} alt="" width={20} height={20} />
                        </div>
                        <p>{data.name ? data.name : "No name"}</p>
                    </div>
                    <div className="detail-icon" onClick={handleDetails}>
                        <IoArrowRedo />
                    </div>
                </div>
            </div>
            <Modal
                className="nft-details-modal"         
                open={open} 
                onClose={handleClose}  
                aria-labelledby="modal-modal-title" 
                aria-describedby="modal-modal-description" 
                disableScrollLock={false}
                BackdropComponent={Backdrop}
                closeAfterTransition
                BackdropProps={{
                    timeout: 800,
                }}
            >
                <Fade in={open}>
                    <Grid container item xs={10} sm={7}  md={5} justifyContent="center" className="nft-modal-body">
                        <Grid container className="details-body">
                            <Grid container  item xs={12} md={6} className ="details-nftimage">
                                    <img src={formatURL(data.image)} alt="" width="100%" style={{objectFit: "cover"}} />
                            </Grid>
                            <Grid container  item xs={12} md={6} className="details-info">
                                <div style={{fontFamily:"cursive"}}>-Name:</div>
                                <p>{data.name}</p>
                                <div style={{fontFamily:"cursive", paddingTop: "10px"}}>-Description:</div>
                                <p style={{maxHeight: "400px", overflow: "hidden"}}>{data.description}</p>
                            </Grid>
                        </Grid>    
                        <Grid container  spacing={2} className="transfor-body">
                            <Grid container item xs={12} md={8}>
                                <div style={{ width: "100%"}}>
                                    <TextField 
                                        label="Wallet Address" 
                                        variant="outlined" 
                                        value={receiver} 
                                        onChange={e => setReceiver(e.target.value)}
                                        placeholder="Input recipient wallet address" 
                                        id="custom-css-outlined-input" 
                                        size="small" 
                                        color="secondary" 
                                        fullWidth 
                                        focused 
                                    />
                                </div>
                            </Grid>
                            <Grid container item xs={12} md={4}>
                                <Button variant="contained" color="primary" style={{ height: "40px", width: "100%"}} onClick= {transferNFT}>
                                    Send NFT
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Fade>
            </Modal>
        </div>

    );
};

export default NftCard;
