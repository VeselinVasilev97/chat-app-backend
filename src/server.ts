import express from 'express';
import { connectDB } from './config/database';

const app = express();

// Connect to the database
connectDB();

// Middleware and routes setup
// ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});