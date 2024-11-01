import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'Token required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token invalid' });
    }

    try {
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verifiedToken;
        req.user_id = verifiedToken.id;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: 'Token invalid or expired' });
    }
}