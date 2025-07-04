"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class Database {
    static connect(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                try {
                    const conn = yield mongoose_1.default.createConnection(uri).asPromise();
                    console.log(`✅ MongoDB connected: ${conn.host}`);
                    this.connection = conn;
                }
                catch (error) {
                    console.error("❌ MongoDB connection error:", error);
                    throw error;
                }
            }
            return this.connection;
        });
    }
    static getConnection() {
        if (!this.connection) {
            throw new Error("Database connection not established. Call `Database.connect()` first.");
        }
        return this.connection;
    }
    static disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection) {
                yield this.connection.close();
                this.connection = null;
                console.log("🔌 MongoDB disconnected");
            }
        });
    }
}
exports.Database = Database;
Database.connection = null;
