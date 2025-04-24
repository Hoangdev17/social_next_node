import { Request, Response } from "express";
import mongoose from "mongoose";
import { text } from "stream/consumers";
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

        const post = await PostSchemas.findOne({_id: postId });

        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        const userIdObjectId = new mongoose.Types.ObjectId(userId);

        if (post.likes.some((id) => id.equals(userIdObjectId))) {
            post.likes = post.likes.filter((id) => !id.equals(userIdObjectId));
            await post.save();
            res.status(200).json({ message: "Post unliked successfully", post });
        } else {
            post.likes.push(userIdObjectId);
            await post.save();
            res.status(200).json({ message: "Post liked successfully", post });
        }
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

export const commentPost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!comment) {
            res.status(400).json({ message: "Comment is required" });
            return;
        }

        const post = await PostSchemas.findById(postId);

        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        const newComment = {
            userId: new mongoose.Types.ObjectId(userId),
            comment,
            createdAt: new Date(),
            _id: new mongoose.Types.ObjectId(),
        };

        post.comments.push(newComment);
        await post.save();

        res.status(200).json({ message: "Comment added successfully", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding comment" });
    }
};
  
export const editComment = async (req: Request, res: Response) => {
    try {
        const { postId, commentId } = req.params;
        const { comment } = req.body;
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        if (!comment) {
            res.status(400).json({ message: "Comment is required" });
            return;
        }

        const post = await PostSchemas.findById(postId);

        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return;
        }

        const existingComment = post.comments.find(
            (c) => c._id.toString() === commentId
        );

        if (!existingComment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }

        if (existingComment.userId.toString() !== userId) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        existingComment.comment = comment;
        await post.save();

        res.status(200).json({ message: "Comment updated successfully", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating comment" });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { postId, commentId } = req.params;
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

        const commentIndex = post.comments.findIndex(
            (c) => c._id.toString() === commentId
        );

        if (commentIndex === -1) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }

        if (post.comments[commentIndex].userId.toString() !== userId) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }

        post.comments.splice(commentIndex, 1);
        await post.save();

        res.status(200).json({ message: "Comment deleted successfully", post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting comment" });
    }
};

export const getAllPosts = async (req: Request, res: Response) => {
    try {
        const posts = await PostSchemas.find().sort({ createdAt: -1 }).populate("createdBy", "username avatar");
        res.status(200).json({ message: "Posts retrieved successfully", posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving posts" });
    }
};