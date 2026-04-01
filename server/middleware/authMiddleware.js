import admin from 'firebase-admin';

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decodedToken = await admin.auth().verifyIdToken(token);

            req.user = decodedToken;

            next(); 
        } catch (error) {
            console.error("Token verification error:", error);
            res.status(401).json({ message: "Token không hợp lệ!" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Không tìm thấy Token." });
    }
};

export default protect;