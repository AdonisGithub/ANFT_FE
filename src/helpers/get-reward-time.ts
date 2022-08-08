import { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import { IReduxState } from "../store/slices/state.interface";


const useCountdown = () => {

    const lastAirdropTime = useSelector<IReduxState, number>(state => {
        return state.app.lastAirdropTime;
    });

    console.log(lastAirdropTime)
    const [countDown, setCountDown] = useState<number>(2592 * Math.pow(10, 6));

    useEffect(() => {
        const interval = setInterval(() => {
            setCountDown(2592 * Math.pow(10, 6) - (Date.now() - lastAirdropTime));
            if (countDown <= 1000) {
                setCountDown(0);
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, [countDown]);
    return getReturnValues(countDown);
};

const getReturnValues = (countDown: number) => {
    // calculate time left
    const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
    let hours = String(Math.floor(
        (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ));
    if (Number(hours) < 10) {
        hours = `0${hours}`;
    }
    let minutes = String(Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60)));
    if (Number(minutes) < 10) {
        minutes = `0${minutes}`;
    }
    let seconds = String(Math.floor((countDown % (1000 * 60)) / 1000));
    if (Number(seconds) < 10) {
        seconds = `0${seconds}`;
    }

    return [days, hours, minutes, seconds];
};

export { useCountdown };