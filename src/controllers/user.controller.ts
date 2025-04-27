import { Request, Response } from "express";
import mongoose from "mongoose";
import UserSchemas from "~/models/User.schemas";

export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const user = await UserSchemas.findById(userId).select("-password -refreshToken").populate("followers", "username avatar").populate("following", "username avatar");
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

        // Chuyển đổi ID thành ObjectId
        const userIdObjectId = new mongoose.Types.ObjectId(userId);
        const targetUserIdObjectId = new mongoose.Types.ObjectId(targetUserId);

        // Kiểm tra nếu người dùng cố gắng unfollow chính mình
        if (userId === targetUserId) {
            res.status(400).json({ message: "You cannot unfollow yourself" });
            return;
        }

        // Tìm kiếm người dùng trong cơ sở dữ liệu
        const user = await UserSchemas.findById(userId);
        const targetUser = await UserSchemas.findById(targetUserId);

        // Kiểm tra xem người dùng và người dùng mục tiêu có tồn tại hay không
        if (!user || !targetUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Kiểm tra xem người dùng có đang follow người dùng mục tiêu không
        if (!user.following.includes(targetUserIdObjectId)) {
            res.status(400).json({ message: "You are not following this user" });
            return;
        }

        // Xóa người dùng mục tiêu khỏi danh sách following của người dùng hiện tại
        user.following = user.following.filter(id => !id.equals(targetUserIdObjectId));
        
        // Xóa người dùng hiện tại khỏi danh sách followers của người dùng mục tiêu
        targetUser.followers = targetUser.followers.filter(id => !id.equals(userIdObjectId));

        // Lưu các thay đổi
        await user.save();
        await targetUser.save();

        // Trả về phản hồi thành công
        res.status(200).json({ message: "User unfollowed successfully", user });
    } catch (error) {
        // Xử lý lỗi và trả về thông báo lỗi
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await UserSchemas.find().select("-password -refreshToken");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};