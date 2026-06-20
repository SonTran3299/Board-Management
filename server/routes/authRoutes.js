import express from 'express';
import axios from 'axios';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

const router = express.Router();

router.post('/login', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('No Token');
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const auth = getAuth();
        const decodeToken = await auth.verifyIdToken(idToken);

        res.status(200).json({
            message: "Xác thực thành công",
            user: decodeToken
        });
    } catch (error) {
        res.status(401).send('Token không hợp lệ');
    }
});

router.get('/github/callback', async (req, res) => {
    const { code } = req.query;
    const CLIENT_URL = process.env.VITE_CLIENT_URL;
    if (!code) {
        return res.status(401).send('No Code');
    }
    try {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.VITE_GITHUB_CLIENT_ID,
            client_secret: process.env.VITE_GITHUB_CLIENT_SECRETS,
            code: code
        }, {
            headers: {
                Accept: 'application/json'
            }
        });

        const accessToken = response.data.access_token;
        if (accessToken) {
            const userRes = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `token ${accessToken}`
                }
            });
            const { id, email, name, login } = userRes.data;
            const userId = String(id);
            
            const safeEmail = email || `${login}@github.com`;

            const auth = getAuth();
            let firebaseUser;
            
            try {
                firebaseUser = await auth.getUser(userId).catch(() => null);
                if (firebaseUser) {
                    await auth.updateUser(userId, {
                        displayName: name || login,
                    });
                } else {
                    await auth.createUser({
                        uid: userId,
                        email: safeEmail, 
                        displayName: name || login
                    });
                }
            } catch (error) {
                return res.status(500).json({ error: "Lỗi đồng bộ Firebase Auth: " + error.message });
            }

            const fbCustomToken = await auth.createCustomToken(userId);
            
            const db = getDatabase();
            const userRef = db.ref(`users/${userId}`);
            
            await userRef.update({
                name: name || login,
                userName: login,
                email: safeEmail,
                github_access_token: accessToken,
            });

            res.redirect(`${CLIENT_URL}/login-success?fb_token=${fbCustomToken}`);
        } else {
            res.status(404).send('Token khong thay');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/sign-up', async (req, res) => {
    const { uid, email, name } = req.body;
    try {
        const db = getDatabase();
        const userRef = db.ref(`users/${uid}`);
        await userRef.set({
            name: name,
            email: email
        });
        res.status(200).json({ message: 'Luu Db thanh cong' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;