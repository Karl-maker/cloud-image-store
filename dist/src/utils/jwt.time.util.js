"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateToJwtExp = void 0;
const dateToJwtExp = (time) => {
    return Math.floor(time.getTime() / 1000) + 3600;
};
exports.dateToJwtExp = dateToJwtExp;
