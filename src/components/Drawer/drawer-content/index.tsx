import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import { BsGiftFill } from "react-icons/bs";
import { RiAdminLine } from "react-icons/ri"
import Social from "./social";
import { ReactComponent as BondIcon } from "../../../assets/icons/bond.svg";
import ArsenalNFTLogo from "../../../assets/image/logo.png";
import { ReactComponent as DashboardIcon } from "../../../assets/icons/dashboard.svg";
import { trim, shorten } from "../../../helpers";
import { useAddress, useWeb3Context } from "../../../hooks";
import useBonds from "../../../hooks/bonds";
import { Link, SvgIcon } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import "./drawer-content.scss";
import { ReactComponent as DocsIcon } from "../../../assets/icons/docs.svg";
import { ReactComponent as MintIcon } from "../../../assets/icons/mint.svg";
import { ReactComponent as GovernanceIcon } from "../../../assets/icons/governance.svg";
import classnames from "classnames";
import { getAddresses } from "src/constants";

function NavContent() {
    const [isActive] = useState();
    const { bonds } = useBonds();

    const {address, chainID} = useWeb3Context();
    const addresses = getAddresses(chainID);

    const checkPage = useCallback((location: any, page: string): boolean => {
        const currentPath = location.pathname.replace("/", "");
        if (currentPath.indexOf("admin") >= 0 && page === "admin") {
            return true;
        }
        if (currentPath.indexOf("nfts") >= 0 && page === "nfts") {
            return true;
        }
        if (currentPath.indexOf("mint") >= 0 && page === "mint") {
            return true;
        }
        if (currentPath.indexOf("bond") >= 0 && page === "bond") {
            return true;
        }
        if (currentPath.indexOf("spoils") >= 0 && page === "spoils") {
            return true;
        }
        return false;
    }, []);

    return (
        <div className="dapp-sidebar">
            <div className="branding-header">
                <Link href="https://arsenalnft.org/" target="_blank">
                    <img alt="Logo" src={ArsenalNFTLogo} className="logo" />
                </Link>

                {address && (
                    <div className="wallet-link">
                        <Link href={`https://cchain.explorer.avax.network/address/${address}`} target="_blank">
                            <p>{shorten(address)}</p>
                        </Link>
                    </div>
                )}
            </div>

            <div className="dapp-menu-links">
                <div className="dapp-nav">
                    { address == addresses.ADMIN_ADDRESS ? 
                        <Link
                            component={NavLink}
                            to="/admin"
                            isActive={(match: any, location: any) => {
                                return checkPage(location, "admin");
                            }}
                            className={classnames("button-dapp-menu", { active: isActive })}
                        >
                            <div className="dapp-menu-item">
                                <RiAdminLine />
                                <p>Admin</p>
                            </div>
                        </Link> :
                        <></>
                    }
                    <Link
                        component={NavLink}
                        to="/nfts"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "nfts");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <SvgIcon viewBox="0 0 18 18" component={DashboardIcon} />
                            <p>MY NFTs</p>
                        </div>
                    </Link>
                    <Link
                        component={NavLink}
                        to="/spoils"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "spoils");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <BsGiftFill />
                            <p>Spoils</p>
                        </div>
                    </Link>
                    <Link
                        component={NavLink}
                        id="bond-nav"
                        to="/mint"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "mint");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <SvgIcon viewBox="0 0 18 18" component={MintIcon} />
                            <p>Mint</p>
                        </div>
                    </Link>
                    <Link
                        component={NavLink}
                        id="bond-nav"
                        to="/bond"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "bond");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <SvgIcon viewBox="0 0 18 18" component={BondIcon} />
                            <p>Bond</p>
                        </div>
                    </Link>

                    <div className="bond-discounts">
                        <p>Bond discounts</p>
                        {bonds.map((bond, i) => (
                            <Link component={NavLink} to={bond.name !== "wavax" ? `/bond/${bond.name}` : "/bond"} key={i} className={"bond"}>
                                {!bond.bondDiscount ? (
                                    <Skeleton variant="text" width={"150px"} />
                                ) : (
                                    <p>
                                        {bond.displayName}
                                        <span className="bond-pair-roi">{bond.bondDiscount && trim(bond.bondDiscount * 100, 2)}%</span>
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                    <Link href="https://snapshot.org/#/arsenalnft.eth/" target="_blank" className={classnames("button-dapp-menu", { active: isActive })}>
                        <div className="dapp-menu-item">
                            <SvgIcon viewBox="0 0 18 18" component={GovernanceIcon} />
                            <p>Governance</p>
                        </div>
                    </Link>
                    <Link href="https://doc.arsenalnft.org/" target="_blank" className={classnames("button-dapp-menu", { active: isActive })}>
                        <div className="dapp-menu-item">
                            <SvgIcon viewBox="0 0 18 18" component={DocsIcon} />
                            <p>Docs</p>
                        </div>
                    </Link>
                </div>
            </div>
            <Social />
        </div>
    );
}

export default NavContent;
