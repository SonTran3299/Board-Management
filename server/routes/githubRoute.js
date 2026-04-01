import express from 'express';
import admin from 'firebase-admin';
import axios from 'axios';

const router = express.Router();

router.get('/:owner/:repo/github-info', async (req, res) => {
    const { owner, repo } = req.params;
    const userId = req.query.uid;
    
    try {
        let headers = {
            Accept: 'application/vnd.github.v3+json'
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

export default router;