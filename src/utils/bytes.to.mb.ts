export function bytesToMB(bytes: number): number {
    if (bytes <= 0) return 0;
    return parseFloat((bytes / (1024 * 1024)).toFixed(2));
}

export function mBToBytes(megabytes: number): number {
    return Math.round(megabytes * 1024 * 1024);
}