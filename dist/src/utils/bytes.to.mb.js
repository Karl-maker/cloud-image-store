"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytesToMB = bytesToMB;
exports.mBToBytes = mBToBytes;
function bytesToMB(bytes) {
    if (bytes <= 0)
        return 0;
    return parseFloat((bytes / (1024 * 1024)).toFixed(2));
}
function mBToBytes(megabytes) {
    return Math.round(megabytes * 1024 * 1024);
}
