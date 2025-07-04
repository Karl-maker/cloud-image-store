"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wasMinutesAgo = void 0;
const wasMinutesAgo = (date, minutes) => {
    const now = Date.now();
    const targetTime = date.getTime() + minutes * 60 * 1000;
    return now >= targetTime;
};
exports.wasMinutesAgo = wasMinutesAgo;
