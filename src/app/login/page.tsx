'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from 'react-toastify';
import Link from 'next/link';
import { api, setAccessToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/lib/slices/authSlice';
import { RootState } from '@/lib/store';

interface Data {
  accessToken: string;
  user:{
    id: string;
    username: string;
    email: string;
    bio: string;
    avatar: string;
    followers: Follower[];
    following: Following[];
  }
}

interface Follower {
  id: string;
  username: string;
  avatar: string;
}

interface Following {
  id: string;
}

const LoginPage = () => {
  const [user, setUser] = useState<Data | null>(null); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch(); 
  const router = useRouter();

  const onFinish = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true); 

    try {

      console.log("Logging in with email: ", email, " and password: ", password);
      
      const response = await api.post<Data>('/auth/login', {
        email,
        password,
      }, {
        withCredentials: true, 
      });
     
      setUser(response.data); 
      setLoading(false);

      // console.log("Login response: ", response.data.user);

      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.accessToken,
      })); 

      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      toast.success('Login successful!');
      
    } catch (error) {
      setLoading(false); 
      console.error("Login error: ", error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  const userId = useSelector((state: RootState) => state.auth.user?.id);

 useEffect(() => {
  if (userId) {
    console.log('User ID after login:', userId);
    // Đảm bảo router push sau khi userId được cập nhật.
    setTimeout(() => {
      router.push('/');
    }, 100);  // Delay 100ms để đảm bảo trạng thái đã được cập nhật
  }
}, [userId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={onFinish}
        className="bg-white p-8 rounded-lg shadow-lg space-y-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-700">Login</h2>

        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-600">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <Label htmlFor="password" className="block text-sm font-medium text-gray-600">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            className="mt-2 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
          disabled={loading} 
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <div className="flex justify-center mt-5">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
};

export default LoginPage;
