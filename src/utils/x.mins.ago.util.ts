export const wasMinutesAgo = (date: Date, minutes: number): boolean => {
    const now = Date.now();
    const targetTime = date.getTime() + minutes * 60 * 1000;
    return now >= targetTime;
};
