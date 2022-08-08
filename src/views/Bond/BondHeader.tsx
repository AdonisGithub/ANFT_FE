import { useState } from "react";
import { NavLink, useHistory } from "react-router-dom";
import BondLogo from "../../components/BondLogo";
import { IconButton, SvgIcon, Link } from "@material-ui/core";
import { ReactComponent as XIcon } from "../../assets/icons/x.svg";
import { useEscape } from "../../hooks";
import { IAllBondData } from "../../hooks/bonds";

interface IBondHeaderProps {
    bond: IAllBondData;
}

function BondHeader({ bond }: IBondHeaderProps) {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    let history = useHistory();
    useEscape(() => {
        if (open) handleClose;
        else history.push("/bond");
    });

    return (
        <div className="bond-header">
            <Link component={NavLink} to="/bond" className="cancel-bond">
                <SvgIcon color="primary" component={XIcon} />
            </Link>

            <div className="bond-header-logo">
                <BondLogo bond={bond} />
                <div className="bond-header-name">
                    <p>{bond.displayName}</p>
                </div>
            </div>
        </div>
    );
}

export default BondHeader;
