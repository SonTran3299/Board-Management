import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const snapShot = await admin.database().ref('users').once('value');
        const data = snapShot.val();

        if (!data) {
            return res.status(200).json([]);
        }

        const userArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }))

        res.status(200).json(userArray);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.get('/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const snapShot = await admin.database().ref(`users/${uid}`).once('value');
        const userData = snapShot.val();

        if (userData) {
            return res.status(200).json(userData);
        } else {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Lỗi Server" });
    }
})

export default router;