import { Pool } from 'pg';

const dbConfig = {
    user: 'chatuser', // replace with your database user
    host: '192.168.1.17',
    database: 'your_db_name', // replace with your database name
    password: 'your_db_password', // replace with your database password
    port: 5432,
    schema: 'chatuser'
};

const pool = new Pool(dbConfig);

export const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Database connected successfully');
    } catch (err) {
        if (err instanceof Error) {
            console.error('Database connection error:', err.message);
        } else {
            console.error('Database connection error:', err);
        }
        process.exit(1);
    }
};

export const query = (text: string, params?: any[]) => pool.query(text, params);