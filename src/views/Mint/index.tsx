import React, { useState } from "react";
import { Zoom, Stepper, Step, StepLabel, Button, Modal, TextField, Backdrop, FormControlLabel, Checkbox, Fade, Grid } from "@material-ui/core";

import { FiUpload } from "react-icons/fi";
import { GoPrimitiveDot } from "react-icons/go";

import "./mint.scss";
import axios from "axios";
import { useWeb3Context } from "src/hooks";
import { useDispatch, useSelector } from "react-redux";
import { mintNFT } from "../../store/slices/nft-slice";
import anftLogo from "../../assets/image/card-logo.png";
import traderLogo from "../../assets/image/traderjoe-logo.png";
import { useHistory } from "react-router-dom";
import { IReduxState } from "src/store/slices/state.interface";
import { trim } from "src/helpers";

//const API_URL = "http://localhost:5000";
const API_URL = "http://135.148.233.78:5000";

const steps = ["Select File", "Set Properties", "Mint"];
const MintPage = () => {

    const anftBalance = useSelector<IReduxState, number>( state => {
        return state.account.balances.anft;
    });

    console.log("mint page", anftBalance)

    const marketPrice = useSelector<IReduxState, number>(state => {
        return state.app.marketPrice;
    });
    
    const dollarBalance = Number(anftBalance) * marketPrice;

    const history = useHistory();
    const { address, provider, chainID, checkWrongNetwork } = useWeb3Context();
    const dispatch = useDispatch();

    const [open, setOpen] = React.useState(false);
    const buyModalOpen = (dollarBalance > 20) ? false : true;

    const handleClose = () => setOpen(false);

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [state, setState] = useState({ name: "", description: "", image: "" });
    const [selectedNFT, setSelectedNFT] = useState("");
    const [fileType, setFileType] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [mintState, setMintState] = useState(false);

    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
    };
    const handleImageChange = async () => {
        if (await checkWrongNetwork()) return;

        const file: any = document.getElementById("contained-button-file");
        let src = URL.createObjectURL(file.files[0]);

        const typeData = ["image", "audio", "video"];

        if (typeData.filter(item => item === file.files[0].type.split("/")[0]).length > 0) {
            setFileType(file.files[0].type.split("/")[0]);
            setSelectedNFT(src);
            handleNext();
        } else {
            alert("The type of this file is not supported");
        }
    };

    const handleMintNft = async () => {
        if (agreed && state.name && state.description) {
            handleNext();
            setTimeout(handleMintFunction, 1000);
        }
    };

    const handleMintFunction = async () => {
        const progressBar: any = document.getElementById("mint-progress-bar");
        try {
            setLoading(true);
            var id = setInterval(() => progressFunc(40), 50);
            var width = 1;
            const progressFunc = (end: number) => {
                if (width >= end) {
                    clearInterval(id);
                } else {
                    width++;
                    progressBar.style.width = width + "%";
                }
            };

            const file: any = document.getElementById("contained-button-file");
            
            let formData = new FormData();
            formData.append("path", file.value);
            formData.append("content", file.files[0]);
            formData.append("name", state.name);
            formData.append("description", state.description);

            const { data } = await axios.post(`${API_URL}/image`, formData);
            if (data.type === "success") {
            
                setTimeout(async () => {
                    var id1 = setInterval(() => progressFunc1(100), 10);
                    const progressFunc1 = (end: number) => {
                        if (width >= end) {
                            clearInterval(id1);
                        } else {
                            width++;
                            progressBar.style.width = width + "%";
                        }
                    };
                    const token_uri = "https://ipfs.io/ipfs/" + data.data;
                    setTimeout(() => {
                        setLoading(false);
                    }, 1000);
                    dispatch(mintNFT({ address, provider, networkID: chainID, token_uri }));
                }, 2000);
            } else {
                progressBar.style.width = 0;
                alert("IPFS Server Error, Please Retry Again!");
                setActiveStep(1);
                setLoading(true);
                setMintState(false);
            }
        } catch (error) {
            progressBar.style.width = 0;
            alert("IPFS Server Error, Please Retry Again!");
            setActiveStep(1);
            setLoading(true);
            setMintState(false);
        }
    };

    const handleBuy = () => {
        setOpen(true);
    };

    const handlePrevious = () => {
        const file: any = document.getElementById("contained-button-file");
        file.value = "";
        setAgreed(false);
        setState({ name: "", description: "", image: "" });
        setActiveStep(0);
    };

    return (
        <div className="mint-page">
            <Zoom in={true}>
                <div className="mint-card">
                    <div className="mint-card-header">
                        <div>
                            <h1>Select Your Artwork</h1>
                            <div>
                                <p>
                                    <b>20$ of ANFT Must be Present in your wallet to Mint any NFT.</b>
                                </p>
                                <p>
                                    <b>Please acquire 20$ of ANFT via Trader Joe or Bonding APP</b>
                                </p>
                            </div>
                        </div>
                        <div className="header-balance-card">
                            <p>Balance</p>
                            <p>{trim(Number(anftBalance), 2)} ANFT</p>
                            <p>${trim(dollarBalance, 2)}</p>
                        </div>
                    </div>
                    <div className="stepper-wrapper">
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((label, index) => {
                                const stepProps: { completed?: boolean } = {};
                                const labelProps: {
                                    optional?: React.ReactNode;
                                } = {};

                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                        <div className="stepper-views">
                            <div className={`stepper-1 stepper-view ${activeStep === 0 && "show"}`}>
                                <label htmlFor="contained-button-file">
                                    <div className="file-dragger">
                                        <h1>Mint an NFT!</h1>
                                        <div className="upload-icon">
                                            <FiUpload />
                                        </div>
                                        <h4>Click to browse</h4>
                                        <p>{"JPG/PNG images, GIFs, WAV/MP3 or WebM/MP4/MOV videos accepted. 50MB limit."}</p>
                                    </div>
                                </label>
                                <label htmlFor="contained-button-file">
                                    {buyModalOpen ? (
                                        <input id="contained-button-file" onClick={handleBuy} style={{ display: "none" }} />
                                    ) : (
                                        <input accept="*" style={{ display: "none" }} id="contained-button-file" multiple type="file" onChange={handleImageChange} />
                                    )}
                                    <Button variant="contained" component="span">
                                        Browse file
                                    </Button>
                                </label>
                            </div>
                            <div className={`stepper-2 stepper-view ${activeStep === 1 && "show"}`}>
                                <div className="set-properties">
                                    <h1>Set the properties</h1>
                                    <p>Confirm the details of your work before moving on to sign your NFT. Once you mint your NFT, you won't be able to make any changes.</p>
                                    <h4>Properties</h4>
                                    <div>
                                        <TextField label="Name" value={state.name} variant="filled" onChange={(e: any) => setState({ ...state, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <TextField
                                            label="Description"
                                            value={state.description}
                                            multiline
                                            maxRows={7}
                                            minRows={5}
                                            variant="filled"
                                            onChange={(e: any) => setState({ ...state, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="agree-checkbox">
                                        <FormControlLabel
                                            control={<Checkbox value={agreed} checked={agreed} onChange={() => setAgreed(prev => !prev)} />}
                                            label="By minting this NFT you agree that these works belong to you and only you. Please respect the creativity of other artists in the space. We would love you for it."
                                        />
                                    </div>
                                    <div className="mint-btn-wrapper">
                                        <Button variant="contained" component="span" onClick={handlePrevious}>
                                            Previous
                                        </Button>
                                        <Button variant="contained" component="span" onClick={handleMintNft}>
                                            Mint NFT
                                        </Button>
                                    </div>
                                </div>
                                <div className="nft-preview">
                                    <div className="nft-preview-card">
                                        {fileType === "image" && <img src={selectedNFT} alt="selectedNFT" />}
                                        {fileType === "video" && (
                                            <video controls loop>
                                                <source src={selectedNFT} type="video/mp4" />
                                            </video>
                                        )}
                                        {fileType === "audio" && (
                                            <audio controls loop>
                                                <source src={selectedNFT} type="video/mp4" />
                                            </audio>
                                        )}
                                        <div className="nft-info">
                                            <span>Name</span>
                                            <p>{state.name ? state.name : "Enter your NFT name"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`stepper-3 stepper-view ${activeStep === 2 && "show"}`}>
                                <div className="set-properties">
                                    <h1>{loading ? "Uploading Your File..." : mintState ? "Congratulations!" : "Mint your NFT"}</h1>
                                    {!loading && <p>Confirm this transaction in your wallet</p>}
                                    {mintState && !loading && <p>Your NFT has been minted</p>}
                                    <p>
                                        {loading
                                            ? "We are now uploading your file and preparing for it to be minted into a beautiful NFT. This shouldn't take much longer. Hang in there."
                                            : !mintState && "When you have completed this transaction your NFT will forever be minted onto the blockchain."}
                                    </p>
                                    {!mintState && !loading && <p>Connected to</p>}
                                    {!mintState && !loading && (
                                        <div className="wallet-address">
                                            <GoPrimitiveDot size={20} color="green" />
                                            {address}
                                        </div>
                                    )}
                                    {!mintState && loading && (
                                        <div className="mint-progress-bar">
                                            <div id="mint-progress-bar" />
                                        </div>
                                    )}
                                </div>
                                <div className="nft-preview">
                                    <div className="nft-preview-card">
                                        {fileType === "image" && <img src={selectedNFT} alt="selectedNFT" />}
                                        {fileType === "video" && (
                                            <video controls loop>
                                                <source src={selectedNFT} type="video/mp4" />
                                            </video>
                                        )}
                                        {fileType === "audio" && (
                                            <audio controls loop>
                                                <source src={selectedNFT} type="video/mp4" />
                                            </audio>
                                        )}
                                        <div className="nft-info">
                                            <span>Name</span>
                                            <p>{state.name ? state.name : "Enter your NFT name"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Zoom>
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
                    <Grid container item xs={10} sm={7} md={5} justifyContent="center" className="buy-anft-modal">
                        <div>
                            <h2>BUY ANFT</h2>
                            <div className="buy-from" onClick={() => history.push("/bond")}>
                                <div className="modal-logo">
                                    <img src={anftLogo} alt="" />
                                </div>
                                <div>Buy ANFT in Bond Page.</div>
                            </div>
                            <div
                                className="buy-from"
                                onClick={() =>
                                    window.open(
                                        "https://traderjoexyz.com/trade?inputCurrency=0x158cdfa4131965e9d464ae32256b0e0dc9339743&outputCurrency=0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664#/",
                                    )
                                }
                            >
                                <div className="modal-logo">
                                    <img src={traderLogo} alt="" />
                                </div>
                                <div>Directly Swap USDC.e to ANFT</div>
                            </div>
                            <div className="modal-action">
                                <div className="modal-btn-wrapper">
                                    <div className="bond-table-btn" onClick={() => setOpen(false)}>
                                        <p>Cancel</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Grid>
                </Fade>
            </Modal>
        </div>
    );
};

export default MintPage;
