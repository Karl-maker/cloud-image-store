import mongoose, { Connection, ConnectOptions } from "mongoose";

export class Database {
    private static connection: Connection | null = null;

    static async connect(uri: string): Promise<Connection> {
        if (!this.connection) {
            try {
                const options: ConnectOptions = {
                    maxPoolSize: 30,           // Maximum number of connections in the pool
                    minPoolSize: 5,            // Minimum number of connections in the pool
                    maxIdleTimeMS: 30000,      // Close connections after 30 seconds of inactivity
                    serverSelectionTimeoutMS: 10000,  // Timeout for server selection
                    socketTimeoutMS: 45000,    // Socket timeout
                    bufferCommands: false,     // Disable mongoose buffering
                    retryWrites: true,         // Enable retryable writes
                    retryReads: true,          // Enable retryable reads
                    w: 'majority',             // Write concern
                    readPreference: 'primary', // Read preference
                    //tls: true,
                };

                const conn = await mongoose.createConnection(uri, options).asPromise();
                console.log(`✅ MongoDB connected: ${conn.host}`);
                console.log(`📊 Connection pool configured: max=${options.maxPoolSize}, min=${options.minPoolSize}`);
                this.connection = conn;
            } catch (error) {
                console.error("❌ MongoDB connection error:", error);
                throw error;
            }
        }
        return this.connection;
    }

    static getConnection(): Connection {
        if (!this.connection) {
            throw new Error("Database connection not established. Call `Database.connect()` first.");
        }
        return this.connection;
    }

    static async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
            console.log("🔌 MongoDB disconnected");
        }
    }

    // Add method to get connection stats
    static getConnectionStats(): { poolSize: number; available: number } | null {
        if (!this.connection) return null;
        
        const pool = (this.connection as any).db?.topology?.s?.pool;
        if (pool) {
            return {
                poolSize: pool.totalConnectionCount,
                available: pool.availableConnectionCount
            };
        }
        return null;
    }
}
