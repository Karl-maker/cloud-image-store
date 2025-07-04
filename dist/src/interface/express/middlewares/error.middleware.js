"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_exception_1 = require("../../../application/exceptions/http.exception");
/**
 * @author Karl-Johan Bailey
 * Express error handling middleware.
 * Uses a switch to determine error type and respond accordingly.
 */
const errorHandler = (err, req, res, next) => {
    console.log(err);
    switch (true) {
        case err instanceof http_exception_1.HttpException:
            res.status(err.code).json({ error: err.name, message: err.message });
            break;
        case err.name === "MongoError" && err.code === 11000:
            res.status(409).json({ error: "Duplicate Entry", message: "Resource already exists." });
            break;
        default:
            res.status(500).json({ error: "Internal Server Error", message: "An unexpected error occurred." });
            break;
    }
};
exports.default = errorHandler;
