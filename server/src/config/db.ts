import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

// Helper to convert SQLite syntax to PostgreSQL syntax
const convertSql = (sql: string) => {
    let index = 1;
    // 1. Convert ? to $1, $2, etc.
    let converted = sql.replace(/\?/g, () => `$${index++}`);
    
    // 2. Convert common SQLite-specific keywords to Postgres equivalents
    converted = converted.replace(/INSERT OR IGNORE/gi, 'INSERT');
    converted = converted.replace(/ON CONFLICT DO NOTHING/gi, ''); // Clean up if already exists
    if (sql.toLowerCase().includes('insert or ignore')) {
        // Simple heuristic for ON CONFLICT DO NOTHING
        // This assumes the first column is the conflict target (like 'key' in settings)
        if (converted.toLowerCase().includes('into settings')) {
            converted += ' ON CONFLICT (key) DO NOTHING';
        }
    }

    return converted;
};

export const getDb = async () => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Required for Supabase/Render
            }
        });
    }

    // Return a wrapper that matches the sqlite interface
    return {
        get: async (sql: string, params: any[] = []) => {
            const res = await pool!.query(convertSql(sql), params);
            return res.rows[0];
        },
        all: async (sql: string, params: any[] = []) => {
            const res = await pool!.query(convertSql(sql), params);
            return res.rows;
        },
        run: async (sql: string, params: any[] = []) => {
            const res = await pool!.query(convertSql(sql), params);
            return { lastID: null, changes: res.rowCount };
        },
        exec: async (sql: string) => {
            // Ignore SQLite-specific PRAGMA commands
            if (sql.toUpperCase().includes('PRAGMA')) return;
            await pool!.query(sql);
        }
    };
};
