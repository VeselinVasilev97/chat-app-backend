import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    // schema is not a native option for Pool config; set it in your queries or use `SET search_path`
};

class Database {
    private static instance: Pool;

    private constructor() {}

    public static async getInstance(): Promise<Pool> {
        if (!Database.instance) {
            Database.instance = new Pool(dbConfig);
            try {
                await Database.instance.connect();
                console.log('Database connected successfully');
            } catch (err) {
                if (err instanceof Error) {
                    console.error('Database connection error:', err.message);
                } else {
                    console.error('Database connection error:', err);
                }
                process.exit(1);
            }
        }
        return Database.instance;
    }
}

const singleInstance = Database.getInstance();

// Simple query wrapper
export const query = async (text: string, params?: any[]) => {
    const pool = await singleInstance;
    return await pool.query(text, params);
};

// Transaction support
export const withTransaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T | null> => {
    const pool = await singleInstance;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        return null;
    } finally {
        client.release();
    }
};
