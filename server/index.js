import express from 'express';
import cors from 'cors';
import axios from 'axios';
import admin from 'firebase-admin';
import { createRequire } from 'module';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

const app = express();

app.use(cors());
app.use(express.json());
dotenv.config({ path: '../.env' });

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://board-management-database-default-rtdb.asia-southeast1.firebasedatabase.app"
    });
}

const PORT = 5000;

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import boardsRoutes from './routes/boardsRoutes.js';
import githubRoutes from './routes/githubRoute.js';

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/boards', boardsRoutes);
app.use('/repositories', githubRoutes);

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});