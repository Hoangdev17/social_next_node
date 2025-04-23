'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios'; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from 'react-toastify';
import Link from 'next/link';
import { setAccessToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  accessToken: string;
}

const LoginPage = () => {
  const [user, setUser] = useState<User | null>(null); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const onFinish = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true); 

    try {
      
      const response = await axios.post<User>('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      setUser(response.data); 
      setLoading(false);

      setAccessToken(response.data.accessToken);
      localStorage.setItem('accessToken', response.data.accessToken);

      router.push('/');

      toast.success('Login successful!');
      
    } catch (error) {
      setLoading(false); 
      console.error("Login error: ", error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

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
