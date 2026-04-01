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

export default router;