import { Database } from "../application/configuration/mongodb";
import { DatabaseIndexManager } from "../utils/database.index.util";
import { MONGO_URI } from "../application/configuration";

async function testDatabase() {
    try {
        console.log("🧪 Testing database connection and indexes...");
        
        // Test connection
        await Database.connect(MONGO_URI!);
        console.log("✅ Database connection successful");
        
        // Test connection stats
        const stats = Database.getConnectionStats();
        console.log("📊 Connection pool stats:", stats);
        
        // Test index creation
        await DatabaseIndexManager.createAllIndexes();
        console.log("✅ Index creation successful");
        
        // Test index stats
        const indexStats = await DatabaseIndexManager.getIndexStats();
        console.log("📊 Index statistics:", JSON.stringify(indexStats, null, 2));
        
        // Test disconnect
        await Database.disconnect();
        console.log("✅ Database disconnect successful");
        
        console.log("🎉 All database tests passed!");
    } catch (error) {
        console.error("❌ Database test failed:", error);
        process.exit(1);
    }
}

// Run the test
testDatabase(); 