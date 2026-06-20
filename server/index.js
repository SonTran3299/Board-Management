import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import admin from 'firebase-admin';
import { createRequire } from 'module';

import http from 'http';
import https from 'https';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

const require = createRequire(import.meta.url);

// axios.defaults.httpAgent = new http.Agent({ keepAlive: false });
// axios.defaults.httpsAgent = new https.Agent({ keepAlive: false });

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  serviceAccount = require("./serviceAccountKey.json");
}

const app = express();

//app.use(cors());
const allowedOrigins = [
  'http://localhost:5173',
  process.env.VITE_CLIENT_URL,
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bị chặn bởi CORS: Origin này không được phép!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use(express.json());


if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://board-management-database-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
}

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import boardsRoutes from './routes/boardsRoutes.js';
import githubRoutes from './routes/githubRoute.js';

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/boards', boardsRoutes);
app.use('/repositories', githubRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});