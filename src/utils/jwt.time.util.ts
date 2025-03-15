export const dateToJwtExp = (time: Date): number => {
    return Math.floor(time.getTime() / 1000) + 3600
}