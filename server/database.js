import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL Connection Pool
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

const poolConfig = connectionString
    ? {
        connectionString,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'lumina_fresh_market',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

console.log('🔌 Attempting to connect to database...');
if (connectionString) {
    console.log('Using DATABASE_URL:', connectionString.replace(/:[^:@]*@/, ':****@')); // Mask password
} else {
    console.log('Using Connection Params:');
    console.log('  Host:', poolConfig.host);
    console.log('  User:', poolConfig.user);
    console.log('  Port:', poolConfig.port);
    console.log('  Database:', poolConfig.database);
    console.log('  SSL:', poolConfig.ssl ? 'Enabled' : 'Disabled');
}

const pool = new Pool(poolConfig);

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('Error executing query', err.stack);
        }
        console.log('✅ Connected to PostgreSQL database:', result.rows[0].now);
    });
});

// Helper function to query the database
export const query = (text, params) => pool.query(text, params);

// Export the pool for direct access if needed
export default pool;
