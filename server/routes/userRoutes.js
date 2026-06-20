import express from 'express';
import { getDatabase } from 'firebase-admin/database';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = getDatabase();
        const snapShot = await db.ref('users').once('value');
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
        const db = getDatabase();
        const snapShot = await db.ref(`users/${uid}`).once('value');
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