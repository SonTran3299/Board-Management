import express from 'express';
import cors from 'cors';
import axios from 'axios';
import admin from 'firebase-admin';
import { createRequire } from 'module';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
//const serviceAccount = require("./serviceAccountKey.json");
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
  'https://sontran3299.github.io',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bị chặn bởi CORS: Origin này không được phép!'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use(express.json());
dotenv.config({ path: '../.env' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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