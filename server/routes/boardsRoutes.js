import express from 'express';
import admin from 'firebase-admin';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.uid;

        const snapShot = await admin.database().ref('boards')
            .orderByChild('owner')
            .equalTo(userId)
            .once('value');
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

router.post('/', async (req, res) => {
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

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await admin.database().ref(`boards/${id}`).remove();

        res.status(204).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.patch('/:id/reorder', protect, async (req, res) => {
    const { id } = req.params;
    const { cardOrder } = req.body;
    const userId = req.user.uid;

    try {
        const boardRef = admin.database().ref(`boards/${id}`);

        const snapshot = await boardRef.once('value');
        if (!snapshot.exists() || snapshot.val().owner !== userId) {
            return res.status(403).json({ error: "You're not the owner." });
        }

        await boardRef.update({ cardOrder: cardOrder });

        res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.get('/:id/cards', async (req, res) => {
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
                list_member: cardData.list_member || [],
                taskOrder: cardData.taskOrder || []
            }
        })

        res.status(200).json(cardArray);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/:id/cards', async (req, res) => {
    const { id } = req.params;
    const cardData = req.body;

    try {
        const boardRef = admin.database().ref(`boards/${id}`);

        const newCardRef = boardRef.child('cards').push();
        const newCardId = newCardRef.key;

        await newCardRef.set({
            ...cardData,
            list_member: [],
            tasks: {},
            taskOrder: []
        });

        const snapshot = await boardRef.child('cardOrder').once('value');
        let currentOrder = snapshot.val() || [];

        currentOrder.push(newCardId);
        await boardRef.update({
            cardOrder: currentOrder
        });

        res.status(201).json({ message: 'Created', cardId: newCardId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.put('/:boardId/cards/:cardId', async (req, res) => {
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

router.delete('/:boardId/cards/:cardId', async (req, res) => {
    const { boardId, cardId } = req.params;

    try {
        const boardRef = admin.database().ref(`boards/${boardId}`);
        await boardRef.child(`cards/${cardId}`).remove();

        const snapshot = await boardRef.child('cardOrder').once('value');
        const currentOrder = snapshot.val();

        if (Array.isArray(currentOrder)) {
            const newOrder = currentOrder.filter(id => id !== cardId);
            await boardRef.update({ cardOrder: newOrder });
        }

        res.status(204).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.patch('/:boardId/cards/:cardId/reorder', async (req, res) => {
    const { boardId, cardId } = req.params;
    const { taskOrder } = req.body;

    try {
        const cardRef = admin.database().ref(`boards/${boardId}/cards/${cardId}`);

        await cardRef.update({ taskOrder: taskOrder });

        res.status(200).json({ message: "Updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.post('/:boardId/cards/:cardId/list_member', async (req, res) => {
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

router.delete('/:boardId/cards/:cardId/list_member/:memberId', async (req, res) => {
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

router.get('/:boardId/cards/:cardId/tasks', async (req, res) => {
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

router.post('/:boardId/cards/:cardId/tasks', async (req, res) => {
    const { cardId, boardId } = req.params;
    const taskData = req.body;

    try {
        const cardRef = admin.database().ref(`boards/${boardId}/cards/${cardId}`);
        const newTaskRef = cardRef.child('tasks').push();
        const newTaskId = newTaskRef.key;

        //const task = admin.database().ref(`boards/${boardId}/cards/${cardId}/tasks`).push();
        await newTaskRef.set({
            ...taskData
        });

        const snapShot = await cardRef.child('taskOrder').once('value');
        let currentOrder = snapShot.val() || [];

        currentOrder.push(newTaskId);
        await cardRef.update({
            taskOrder: currentOrder
        })

        res.status(201).json({ message: 'Created', taskId: newTaskId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

router.put('/:boardId/cards/:cardId/tasks/:taskId', async (req, res) => {
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

router.delete('/:boardId/cards/:cardId/tasks/:taskId', async (req, res) => {
    const { boardId, cardId, taskId } = req.params;

    try {
        await admin.database().ref(`boards/${boardId}/cards/${cardId}/tasks/${taskId}`).remove();

        res.status(204).json({ message: "OK" });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.post('/:boardId/cards/:cardId/tasks/:taskId/assign', async (req, res) => {
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

router.delete('/:boardId/cards/:cardId/tasks/:taskId/assign/:memberId', async (req, res) => {
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

export default router;