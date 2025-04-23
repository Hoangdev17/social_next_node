import { Request, Response } from "express";
import mongoose from "mongoose";
import PostSchemas from "~/models/Post.schemas";
import { uploadImageToCloudinary } from "~/utils/upload";

export const createPost = async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;
         const imageBuffer = req.file?.buffer;

        const userId = req.userId; 

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Kiểm tra dữ liệu đầu vào
        if (!title || !content || !imageBuffer) {
             res.status(400).json({ message: "Title, content, and image are required" });
             return;
        }

        const imageUrl = await uploadImageToCloudinary(imageBuffer);

        const Post = await PostSchemas.create({
            title,
            content,
            image: imageUrl,
            likes: [],
            comments: [],
            createdBy: userId,
        });

        res.status(201).json({
            message: "Post created successfully",
            post: Post,
        });
        return;

    } catch (error) {
        res.status(500).json({ message: "Error creating post" });
        console.error(error);
        return;
    }
}

export const updatePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const { title, content } = req.body;
        const imageBuffer = req.file?.buffer;

        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const post = await PostSchemas.findById(postId);

        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        if (post.createdBy.toString() !== userId) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        if (imageBuffer) {
            const imageUrl = await uploadImageToCloudinary(imageBuffer);
            post.image = imageUrl;
        }

        if (title) post.title = title;
        if (content) post.content = content;

        await post.save();

        res.status(200).json({
            message: "Post updated successfully",
            post,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating post" });
        console.error(error);
    }
};

export const deletePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;

        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const post = await PostSchemas.findById(postId);

        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        if (post.createdBy.toString() !== userId) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        await post.deleteOne();

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting post" });
        console.error(error);
    }
};

export const likePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const post = await PostSchemas.findById(postId);

        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        const userIdObjectId = new mongoose.Types.ObjectId(userId);

        if (post.likes.includes(userIdObjectId)) {
            res.status(400).json({ message: "Post already liked" });
            return;
        }

        post.likes.push(userIdObjectId);
        await post.save();

        res.status(200).json({ message: "Post liked successfully", post });
    } catch (error) {
        res.status(500).json({ message: "Error liking post" });
        console.error(error);
    }
};

export const unlikePost = async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const userId = req.userId;
  
      if (!userId) {
         res.status(401).json({ message: "Unauthorized" });
         return;
      }
  
      const post = await PostSchemas.findById(postId);
  
      if (!post) {
         res.status(404).json({ message: "Post not found" });
         return;
      }
  
      const userIdObjectId = new mongoose.Types.ObjectId(userId);
  
      if (!post.likes.some((id) => id.equals(userIdObjectId))) {
         res.status(400).json({ message: "Post not liked yet" });
         return;
      }
  
      post.likes = post.likes.filter((id) => !id.equals(userIdObjectId));
      await post.save();
  
      res.status(200).json({ message: "Post unliked successfully", post });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error unliking post" });
      return;
    }
  };
  