import { Request, Response } from "express";
import UserSchemas from "~/models/User.schemas";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "~/utils/generateToken";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        const user = await UserSchemas.findOne({ email });

        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(400).json({ message: "Invalid password" });
            return;
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, {
          httpOnly: false,
          secure: false,
          sameSite: "lax",
          path: "/",  
          maxAge: 7 * 24 * 60 * 60 * 1000  
      });

        res.status(200).json({
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar || null,
                bio: user.bio || "",
                followers: user.followers,
                following: user.following
            },
        });
        return;

    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
    });

    return;
}
}

export const register = async (req: Request, res: Response) => {
    try {
      const { username, email, password } = req.body;
  
      if (!username || !email || !password) {
         res.status(400).json({ message: "All fields are required" });
         return;
      }
  
      const userExists = await UserSchemas.findOne({ username });
      const emailExists = await UserSchemas.findOne({ email });
  
      if (userExists || emailExists) {
         res.status(400).json({ message: "User already exists" });
         return;
      }
  
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await UserSchemas.create({
        username,
        email,
        password: passwordHash, 
      });
  
      res.status(201).json({
        message: "User created successfully",
        accessToken: generateAccessToken(newUser._id),
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          avatar: newUser.avatar || null,
          bio: newUser.bio || "",
        },
      });
    } catch (error) {
      console.error('Register Error:', error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  };

  export const refreshToken = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token is required" });
        return;
      }

      const user = await UserSchemas.findOne({ refreshToken });

      if (!user) {
        res.status(403).json({ message: "Invalid refresh token" });
        return;
      }

      const newAccessToken = generateAccessToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
      });
    } catch (error) {
      console.error('Refresh Token Error:', error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  };