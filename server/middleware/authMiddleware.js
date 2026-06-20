import { getAuth } from 'firebase-admin/auth';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decodedToken = await getAuth().verifyIdToken(token);

            req.user = decodedToken;

            return next();
        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({ message: "Token không hợp lệ!" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Không tìm thấy Token." });
    }
};

export default protect;