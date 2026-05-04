/* ═══════════════════════════════════════════════════
   Database Migration Runner
   ═══════════════════════════════════════════════════
   
   Automatically tracks and applies numbered SQL migration files.
   Each migration runs exactly once and is recorded in a
   `_migrations` table with a timestamp.
   
   Usage:
     npm run migrate                  — apply all pending migrations
     ts-node src/scripts/migrate.ts   — same thing
   
   Migration file naming convention:
     migrations/001_initial_schema.sql
     migrations/002_add_indexes.sql
     migrations/003_add_feature_x.sql
   ═══════════════════════════════════════════════════ */

import fs from 'fs';
import path from 'path';
import { getDb } from '../config/db';

const MIGRATIONS_DIR = path.join(__dirname, '../../../database/migrations');

async function runMigrations() {
    const db = await getDb();

    // 1. Create the migrations tracking table (if not exists)
    // PostgreSQL uses SERIAL PRIMARY KEY instead of INTEGER PRIMARY KEY AUTOINCREMENT
    await db.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Get list of already-applied migrations
    const applied = await db.all('SELECT name FROM _migrations ORDER BY name');
    const appliedSet = new Set(applied.map(m => m.name));

    // 3. Read all .sql files from migrations/ directory
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        console.log('📁 Creating migrations/ directory...');
        fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Alphabetical = numeric order with 001_ prefix

    // 4. Apply pending migrations
    let appliedCount = 0;
    for (const file of files) {
        if (appliedSet.has(file)) {
            console.log(`  ✔ ${file} (already applied)`);
            continue;
        }

        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        console.log(`  ▶ Applying: ${file}...`);
        try {
            await db.exec('BEGIN');
            await db.exec(sql);
            await db.run('INSERT INTO _migrations (name) VALUES ($1)', [file]);
            await db.exec('COMMIT');
            console.log(`  ✅ ${file} applied successfully`);
            appliedCount++;
        } catch (error: any) {
            await db.exec('ROLLBACK').catch(() => {});
            console.error(`  ❌ ${file} FAILED:`, error.message);
            process.exit(1);
        }
    }

    // 5. Summary
    if (appliedCount === 0) {
        console.log('\n✅ Database is up to date. No pending migrations.');
    } else {
        console.log(`\n✅ Applied ${appliedCount} migration(s) successfully.`);
    }

    process.exit(0);
}

console.log('🔄 Running database migrations...\n');
runMigrations().catch(err => {
    console.error('Migration runner failed:', err);
    process.exit(1);
});
