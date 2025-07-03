"use client";
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";
import axios from "axios";
import Navbar from "../component/navbar";
import { useRouter } from "next/navigation";
import { useStatus } from "../context/useStatus";
const schema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอกอีเมล")
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .refine((val) => val.endsWith(".com"), {
      message: "อีเมลต้องลงท้ายด้วย .com",
    }),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน")
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { user, loading, refresh } = useStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email, password });

    if (!result.success) {
      const msg = result.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง";
      toast.error(msg);
      return;
    }
    // ...call login API here...
    if (result.success) {
      try {
        const response = await axios.post(
          "http://localhost:3500/login",
          { email, password },
          { withCredentials: true }
        );
        if (response.data.success) {
          toast.success("เข้าสู่ระบบสำเร็จ!");
          refresh(); 
          setTimeout(() => {
            router.push("/");
          }, 500);
        } else {
          toast.error(
            response.data.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ"
          );
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
      // Redirect or perform other actions
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-1 items-center justify-center bg-gray-900">
        <Toaster position="bottom-right" />
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-white">
            เข้าสู่ระบบ
          </h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-200">อีเมล</label>
            <input
              type="email"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium text-gray-200">
              รหัสผ่าน
            </label>
            <input
              type="password"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
