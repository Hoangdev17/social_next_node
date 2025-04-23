import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
         res.status(401).json({ message: 'Access denied. No token provided.' });
         return;
    }

    try {
        const secretKey = process.env.ACCESS_TOKEN_SECRET || '';
        const decoded = jwt.verify(token, secretKey) as JwtPayload;

        // Kiểm tra nếu decoded chứa userId
        if (decoded && decoded.userId) {
            req.userId = decoded.userId;  
            next();
        } else {
            res.status(400).json({ message: 'Invalid token.' });
        }
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

export default authenticateUser;