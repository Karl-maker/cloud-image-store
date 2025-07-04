"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUuid = void 0;
const crypto_1 = require("crypto");
const generateUuid = () => {
    return (0, crypto_1.randomUUID)();
};
exports.generateUuid = generateUuid;
