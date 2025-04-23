import { Request, Response, NextFunction } from 'express';
import UserSchemas from '~/models/User.schemas';

export const roleAuthenticate = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.userId;
            const user = await UserSchemas.findById(userId).select('-password -refreshToken');
            const userRole = user?.role; 

            console.log('User Role:', userRole);

            if (!userRole) {
                 res.status(401).json({ message: 'Unauthorized: No role found' });
                 return;
            }

            if (!allowedRoles.includes(userRole)) {
                 res.status(403).json({ message: 'Forbidden: Access denied' });
                 return;
            }

            next();
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};

// Example usage:
// app.use('/admin', roleAuthenticate(['admin']));
// app.use('/staff', roleAuthenticate(['admin', 'staff']));