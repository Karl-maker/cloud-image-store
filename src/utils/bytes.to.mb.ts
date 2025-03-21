export function bytesToMB(bytes: number): number {
    if (bytes <= 0) return 0;
    return parseFloat((bytes / (1024 * 1024)).toFixed(3));
}