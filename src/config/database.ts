import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
    schema: process.env.DB_SCHEMA
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

export const query = async (text: string, params?: any[]) => {
    const pool = await singleInstance;
    return await pool.query(text, params);
};
