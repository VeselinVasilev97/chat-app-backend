import express from 'express';
import { Database } from './config/database';

const app = express();
Database.getInstance();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});