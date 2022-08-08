export const prettifySeconds = (seconds?: number, resolution?: string) => {
    if (seconds !== 0 && !seconds) {
        return "";
    }

    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (resolution === "day") {
        return d + (d == 1 ? " day" : " days");
    }

    const dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    const hDisplay = h > 0 ? h + (h == 1 ? " Hour, " : " Hours, ") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " Min" : " Mins") : "";

    return dDisplay + hDisplay + mDisplay;
};


export const getDays = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    return days;
}

export const getHours = (seconds: number) => {
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    return hours;
}

export const getMinutes = (seconds: number) => {
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes;
}

export const getSeconds = (seconds: number) => {
    const secs = Math.floor((seconds % 60));
    return secs
}