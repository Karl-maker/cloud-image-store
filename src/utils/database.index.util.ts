import { Database } from "../application/configuration/mongodb";

export class DatabaseIndexManager {
    /**
     * Create all indexes for the application
     * Call this after database connection is established
     */
    static async createAllIndexes(): Promise<void> {
        try {
            const connection = Database.getConnection();
            
            console.log("🔧 Creating database indexes...");
            
            // Create indexes for all collections
            await Promise.all([
                this.createUserIndexes(connection),
                this.createContentIndexes(connection),
                this.createSpaceIndexes(connection)
            ]);
            
            console.log("✅ All database indexes created successfully");
        } catch (error) {
            console.error("❌ Error creating database indexes:", error);
            throw error;
        }
    }

    private static async createUserIndexes(connection: any): Promise<void> {
        const userCollection = connection.collection('users');
        
        await Promise.all([
            userCollection.createIndex({ email: 1 }, { unique: true }),
            userCollection.createIndex({ clientId: 1 }, { unique: true }),
            userCollection.createIndex({ stripeId: 1 }),
            userCollection.createIndex({ confirmed: 1 }),
            userCollection.createIndex({ deactivatedAt: 1 }),
            userCollection.createIndex({ subscriptionStripeId: 1 }),
            userCollection.createIndex({ subscriptionPlanStripeId: 1 }),
            userCollection.createIndex({ subscriptionPlanExpiresAt: 1 }),
            userCollection.createIndex({ createdAt: -1 }),
            userCollection.createIndex({ updatedAt: -1 }),
            userCollection.createIndex({ confirmed: 1, deactivatedAt: 1 }),
            userCollection.createIndex({ stripeId: 1, confirmed: 1 }),
            userCollection.createIndex({ subscriptionPlanExpiresAt: 1, deactivatedAt: 1 })
        ]);
        
        console.log("✅ User indexes created");
    }

    private static async createContentIndexes(connection: any): Promise<void> {
        const contentCollection = connection.collection('contents');
        
        await Promise.all([
            contentCollection.createIndex({ clientId: 1 }, { unique: true }),
            contentCollection.createIndex({ spaceId: 1 }),
            contentCollection.createIndex({ deactivatedAt: 1 }),
            contentCollection.createIndex({ mimeType: 1 }),
            contentCollection.createIndex({ ai: 1 }),
            contentCollection.createIndex({ favorite: 1 }),
            contentCollection.createIndex({ size: 1 }),
            contentCollection.createIndex({ createdAt: -1 }),
            contentCollection.createIndex({ updatedAt: -1 }),
            contentCollection.createIndex({ uploadCompletion: 1 }),
            contentCollection.createIndex({ uploadError: 1 }),
            contentCollection.createIndex({ spaceId: 1, deactivatedAt: 1 }),
            contentCollection.createIndex({ spaceId: 1, mimeType: 1 }),
            contentCollection.createIndex({ spaceId: 1, ai: 1 }),
            contentCollection.createIndex({ spaceId: 1, favorite: 1 }),
            contentCollection.createIndex({ spaceId: 1, createdAt: -1 }),
            contentCollection.createIndex({ deactivatedAt: 1, mimeType: 1 }),
            contentCollection.createIndex({ ai: 1, createdAt: -1 }),
            contentCollection.createIndex({ uploadCompletion: 1, uploadError: 1 }),
            contentCollection.createIndex(
                { name: 'text', description: 'text' },
                { 
                    weights: { name: 10, description: 5 },
                    name: 'content_text_search'
                }
            )
        ]);
        
        console.log("✅ Content indexes created");
    }

    private static async createSpaceIndexes(connection: any): Promise<void> {
        const spaceCollection = connection.collection('spaces');
        
        await Promise.all([
            spaceCollection.createIndex({ clientId: 1 }, { unique: true }),
            spaceCollection.createIndex({ createdByUserId: 1 }),
            spaceCollection.createIndex({ deactivatedAt: 1 }),
            spaceCollection.createIndex({ shareType: 1 }),
            spaceCollection.createIndex({ usedMegabytes: 1 }),
            spaceCollection.createIndex({ createdAt: -1 }),
            spaceCollection.createIndex({ updatedAt: -1 }),
            spaceCollection.createIndex({ userIds: 1 }),
            spaceCollection.createIndex({ createdByUserId: 1, deactivatedAt: 1 }),
            spaceCollection.createIndex({ createdByUserId: 1, shareType: 1 }),
            spaceCollection.createIndex({ createdByUserId: 1, createdAt: -1 }),
            spaceCollection.createIndex({ deactivatedAt: 1, shareType: 1 }),
            spaceCollection.createIndex({ usedMegabytes: 1, deactivatedAt: 1 }),
            spaceCollection.createIndex(
                { name: 'text', description: 'text' },
                { 
                    weights: { name: 10, description: 5 },
                    name: 'space_text_search'
                }
            )
        ]);
        
        console.log("✅ Space indexes created");
    }

    /**
     * Get index information for monitoring
     */
    static async getIndexStats(): Promise<any> {
        try {
            const connection = Database.getConnection();
            const collections = ['users', 'contents', 'spaces'];
            const stats: any = {};

            for (const collectionName of collections) {
                const collection = connection.collection(collectionName);
                const indexes = await collection.indexes();
                stats[collectionName] = {
                    count: indexes.length,
                    indexes: indexes.map((idx: any) => ({
                        name: idx.name,
                        key: idx.key,
                        unique: idx.unique || false
                    }))
                };
            }

            return stats;
        } catch (error) {
            console.error("❌ Error getting index stats:", error);
            throw error;
        }
    }
} 