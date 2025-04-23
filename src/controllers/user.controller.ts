import { Request, Response } from "express";
import mongoose from "mongoose";
import UserSchemas from "~/models/User.schemas";

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const user = await UserSchemas.findById(userId).select("-password -refreshToken");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user = await UserSchemas.findById(userId).select("-password -refreshToken");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}


export const followUser = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const targetUserId = req.params.id;

        const userIdObjectId = new mongoose.Types.ObjectId(userId);
        const targetUserIdObjectId = new mongoose.Types.ObjectId(targetUserId);

        if (userId === targetUserId) {
            res.status(400).json({ message: "You cannot follow yourself" });
            return;
        }

        const user = await UserSchemas.findById(userId);
        const targetUser = await UserSchemas.findById(targetUserId);

        if (!user || !targetUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (user.following.includes(targetUserIdObjectId)) {
            res.status(400).json({ message: "You are already following this user" });
            return;
        }

        user.following.push(targetUserIdObjectId);
        targetUser.followers.push(userIdObjectId);

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "User followed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const targetUserId = req.params.id;

        const userIdObjectId = new mongoose.Types.ObjectId(userId);
        const targetUserIdObjectId = new mongoose.Types.ObjectId(targetUserId);

        if (userId === targetUserId) {
            res.status(400).json({ message: "You cannot unfollow yourself" });
            return;
        }

        const user = await UserSchemas.findById(userId);
        const targetUser = await UserSchemas.findById(targetUserId);

        if (!user || !targetUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (!user.following.includes(targetUserIdObjectId)) {
            res.status(400).json({ message: "You are not following this user" });
            return;
        }

        user.following = user.following.filter(id => id !== targetUserIdObjectId);
        targetUser.followers = targetUser.followers.filter(id => id !== userIdObjectId);

        await user.save();
        await targetUser.save();

        res.status(200).json({ message: "User unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};