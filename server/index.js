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

const CLIENT_URL = process.env.VITE_CLIENT_URL;

const database = admin.database();

app.post('/auth/login', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('No Token');
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodeToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodeToken.uid;

        res.status(200).json({
            message: "Xac thuc thanh cong",
            user: decodeToken
        });
    } catch (error) {
        res.status(403).send('Token khong hop le');
    }
})

app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(401).send('No Code');
    }
    try {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.VITE_CLIENT_ID,
            client_secret: process.env.VITE_CLIENT_SECRETS,
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

            let firebaseUser;
            try {
                firebaseUser = await admin.auth().getUser(userId).catch(() => null);
                if (firebaseUser) {
                    await admin.auth().updateUser(userId, {
                        name: name,
                    })
                } else {
                    firebaseUser = await admin.auth().createUser({
                        uid: userId,
                        email: email
                    })
                }
            } catch (error) {
                return res.status(500).json({ error: error.message });
            }

            const fbCustomToken = await admin.auth().createCustomToken(userId);
            const userRef = database.ref(`users/${userId}`);
            await userRef.update({
                //id: userId,
                name: name,
                userName: login,
                email: email || `${login}@github.com`,
                github_access_token: accessToken,
            })

            res.redirect(`${CLIENT_URL}/login-success?fb_token=${fbCustomToken}`);
        } else {
            res.status(404).send('Token khong thay');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/auth/sign-up', async (req, res) => {
    const { uid, email, name } = req.body;
    try {
        const userRef = database.ref(`users/${uid}`);
        await userRef.set({
            name: name,
            email: email
        });
        res.status(200).json({ message: 'Luu Db thanh cong' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

app.get('/users', async (req, res) => {
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

app.get('/boards', async (req, res) => {
    try {
        const snapShot = await admin.database().ref('boards').once('value');
        const data = snapShot.val();

        if (!data) {
            return res.status(200).json([]);
        }

        const boardArray = Object.keys(data).map(key => {
            const boardData = data[key];

            let cards = [];
            if (boardData.cards) {
                cards = Object.keys(boardData.cards).map(key => ({
                    id: key,
                    ...boardData.cards[key]
                }));
            }
            return {
                id: key,
                name: boardData.name || '',
                description: boardData.description || '',
                cards: cards,
                cardOrder: boardData.cardOrder || [],
            }
        })
        res.status(200).json(boardArray);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/boards', async (req, res) => {
    const boardData = req.body;
    try {
        const newBoard = admin.database().ref('boards').push();

        await newBoard.set({
            ...boardData,
            cards: {},
            cardOrder: []
        });
        res.status(201).json({ message: "Đã thêm bảng", id: newBoard.key });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.put('/boards/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const board = admin.database().ref(`boards/${id}`);

        await board.update({
            name: name
        });
        res.status(200).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/boards/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await admin.database().ref(`boards/${id}`).remove();

        res.status(204).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/boards/:id/cards', async (req, res) => {
    const { id } = req.params;

    try {
        const snapShot = await admin.database().ref(`boards/${id}/cards`).once('value');
        const data = snapShot.val();

        if (!data) {
            return res.status(200).json([]);
        }

        const cardArray = Object.keys(data).map(key => {
            const cardData = data[key];

            let tasks = [];
            if (cardData.tasks) {
                tasks = Object.keys(cardData.tasks).map(key => ({
                    id: key,
                    ...cardData.tasks[key]
                }));
            }
            return {
                id: key,
                name: cardData.name || '',
                description: cardData.description || '',
                owner: cardData.owner || '',
                tasks: tasks,
                list_member: cardData.list_member || []
            }
        })

        res.status(200).json(cardArray);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/boards/:id/cards', async (req, res) => {
    const { id } = req.params;
    const cardData = req.body;

    try {
        const card = admin.database().ref(`boards/${id}/cards`).push();
        //const newCardId = card.key;
        await card.set({
            ...cardData,
            list_member: [],
            tasks: {}
        });

        // const boardData = admin.database().ref(`boards/${id}`);
        // const snapshot = await boardData.child('cardOrder').once('value');
        // let currentOrder = snapshot.val();
        // if (!Array.isArray(currentOrder)) {
        //     currentOrder = [];
        // }
        // currentOrder.push(newCardId);

        // await boardData.child('cardOrder').set(currentOrder);

        res.status(201).json({ message: 'Created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.put('/boards/:boardId/cards/:cardId', async (req, res) => {
    const { boardId, cardId } = req.params;
    const { name } = req.body;

    try {
        const card = admin.database().ref(`boards/${boardId}/cards/${cardId}`);

        await card.update({
            name: name
        });
        res.status(200).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/boards/:boardId/cards/:cardId/list_member', async (req, res) => {
    const { boardId, cardId } = req.params;
    const { memberId } = req.body;

    try {
        const cardRef = admin.database().ref(`boards/${boardId}/cards/${cardId}`);
        const snapShot = await cardRef.once('value');
        const cardData = snapShot.val();
        let members = cardData.list_member || [];
        if (!members.includes(memberId)) {
            members.push(memberId);
            await cardRef.update({ list_member: members });
        }
        res.status(200).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.delete('/boards/:boardId/cards/:cardId/list_member/:memberId', async (req, res) => {
    const { boardId, cardId, memberId } = req.params;

    try {
        const cardRef = admin.database().ref(`boards/${boardId}/cards/${cardId}`);
        const snapShot = await cardRef.once('value')
        const cardData = snapShot.val();

        if (!cardData || !cardData.list_member) {
            return res.status(404).json({ message: "Not found" });
        }
        const selectedMember = Array.isArray(cardData.list_member) ? cardData.list_member : [];
        const currentMember = selectedMember.filter(id => id !== memberId);

        const currentTask = { ...cardData.tasks };

        if (cardData.tasks) {
            Object.keys(currentTask).forEach(taskId => {
                const task = currentTask[taskId];

                if (task.assign && Array.isArray(task.assign)) {
                    currentTask[taskId].assign = task.assign.filter(id => id !== memberId);
                }
            })
        }

        await cardRef.update({
            list_member: currentMember,
            tasks: currentTask
        });
        res.status(204).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.delete('/boards/:boardId/cards/:cardId', async (req, res) => {
    const { boardId, cardId } = req.params;

    try {
        await admin.database().ref(`boards/${boardId}/cards/${cardId}`).remove();

        res.status(204).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/boards/:boardId/cards/:cardId/tasks', async (req, res) => {
    const { cardId, boardId } = req.params;

    try {
        const snapShot = await admin.database().ref(`boards/${boardId}/cards/${cardId}/tasks`).once('value');
        const data = snapShot.val();

        if (!data) {
            return res.status(200).json([]);
        }

        const taskArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }))

        res.status(200).json(taskArray);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.post('/boards/:boardId/cards/:cardId/tasks', async (req, res) => {
    const { cardId, boardId } = req.params;
    const taskData = req.body;

    try {
        const task = admin.database().ref(`boards/${boardId}/cards/${cardId}/tasks`).push();
        await task.set({
            ...taskData
        });

        res.status(201).json({ message: 'Created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.put('/boards/:boardId/cards/:cardId/tasks/:taskId', async (req, res) => {
    const { boardId, cardId, taskId } = req.params;
    const updateTask = req.body;

    try {
        const task = admin.database().ref(`boards/${boardId}/cards/${cardId}/tasks/${taskId}`);

        await task.update(updateTask);

        res.status(200).json({ message: "Updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.delete('/boards/:boardId/cards/:cardId/tasks/:taskId', async (req, res) => {
    const { boardId, cardId, taskId } = req.params;

    try {
        await admin.database().ref(`boards/${boardId}/cards/${cardId}/tasks/${taskId}`).remove();

        res.status(204).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/boards/:boardId/cards/:cardId/tasks/:taskId/assign', async (req, res) => {
    const { boardId, cardId, taskId } = req.params;
    const { memberId } = req.body;

    try {
        const db = admin.database();
        const cardRef = db.ref(`boards/${boardId}/cards/${cardId}`);
        const taskRef = cardRef.child(`/tasks/${taskId}`);

        const taskSnap = await taskRef.once('value');
        let taskAssign = taskSnap.val()?.assign || [];
        if (!taskAssign.includes(memberId)) {
            taskAssign.push(memberId);
            await taskRef.update({ assign: taskAssign });
        }

        const cardSnap = await cardRef.once('value');
        let cardMembers = cardSnap.val()?.list_member || [];
        if (!cardMembers.includes(memberId)) {
            cardMembers.push(memberId);
            await cardRef.update({ list_member: cardMembers });
        }
        res.status(201).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

app.delete('/boards/:boardId/cards/:cardId/tasks/:taskId/assign/:memberId', async (req, res) => {
    const { boardId, cardId, taskId, memberId } = req.params;

    try {
        const taskRef = admin.database().ref(`boards/${boardId}/cards/${cardId}/tasks/${taskId}`);
        const snapShot = await taskRef.once('value');
        const taskData = snapShot.val();

        if (taskData && taskData.assign) {
            let newAssign;
            if (Array.isArray(taskData.assign)) {
                newAssign = taskData.assign.filter(id => id !== memberId);
            } else {
                newAssign = { ...taskData.assign };
                delete newAssign[memberId];
            }
            await taskRef.update({ assign: newAssign });
            delete newAssign[memberId];
            res.status(204).json({ message: "OK" });
        } else {
            res.status(404).json({ message: "Not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/repositories/:owner/:repo/github-info', async (req, res) => {
    const { owner, repo } = req.params;
    const userId = req.query.uid;
    
    try {
        let headers = {
            Accept: 'application/vnd.github.v3 + json'
        };
        if (userId) {
            const snapShot = await admin.database().ref(`users/${userId}`).once('value');
            const userData = snapShot.val();

            if (userData?.github_access_token) {
                headers.Authorization = `token ${userData.github_access_token}`;
            }
        }

        const [branches, pulls, issues, commits] = await Promise.all([
            axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, { headers }).catch(() => ({ data: [] })),
            axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`, { headers }).catch(() => ({ data: [] })),
            axios.get(`https://api.github.com/repos/${owner}/${repo}/issues?state=all`, { headers }).catch(() => ({ data: [] })),
            axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`, { headers }).catch(() => ({ data: [] })),
        ]);

        const responseData = {
            repositoryId: `${owner}/${repo}`,
            branches: branches.data.map(b => ({
                name: b.name,
                lastCommitSha: b.commit.sha
            })),
            pulls: pulls.data.map(p => ({
                title: p.title,
                pullNumber: p.number
            })),
            issues: issues.data.filter(i => !i.pull_request)
                .map(i => ({
                    title: i.title,
                    issueNumber: i.number
                })),
            commits: commits.data.map(c => ({
                sha: c.sha,
                message: c.commit.message
            }))
        };

        res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
});