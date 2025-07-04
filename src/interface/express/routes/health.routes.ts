import express from 'express';
import { Database } from "../../../application/configuration/mongodb";
import { DatabaseIndexManager } from "../../../utils/database.index.util";

const router = express.Router();

router.get('/health', async (req, res) => {
    try {
        const connection = Database.getConnection();
        const stats = Database.getConnectionStats();
        const indexStats = await DatabaseIndexManager.getIndexStats();
        
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: {
                connected: !!connection,
                poolStats: stats,
                indexes: indexStats
            }
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export { router as healthRoutes }; 