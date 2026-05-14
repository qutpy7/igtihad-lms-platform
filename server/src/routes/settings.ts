import { Router } from 'express';
import { getDb } from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// GET /api/settings (Public)
router.get('/', async (req, res) => {
    try {
        const db = await getDb();
        const rows = await db.all('SELECT * FROM settings');
        const settings = rows.reduce((acc, row) => {
            try { acc[row.key] = JSON.parse(row.value); } catch(e) {}
            return acc;
        }, {});
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// PUT /api/settings (Admin Only)
router.put('/', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const db = await getDb();
        const settingsToUpdate = req.body;
        const entryList = Object.entries(settingsToUpdate);

        if (entryList.length > 0) {
            const batchSize = 100;
            for (let i = 0; i < entryList.length; i += batchSize) {
                const batch = entryList.slice(i, i + batchSize);
                const placeholders = batch.map(() => '(?, ?)').join(', ');
                const values = batch.flatMap(([k, v]) => [k, JSON.stringify(v)]);

                await db.run(
                    `INSERT INTO settings (key, value) VALUES ${placeholders} ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
                    values
                );
            }
        }
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

export default router;
