"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";
import axios from "axios";
import Navbar from "../component/navbar";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ"),
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

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const msg = result.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง";
      toast.error(msg);
      return;
    }
    if (result.success) {
      try {
        const response = await axios.post("http://localhost:3500/register", form);
        console.log(response.data);
        if (!response.data.success) {
          toast.error(response.data.message);
          return;
        }
        toast.success("สมัครสมาชิกสำเร็จ!");
        setTimeout(() => {
          router.push("/login");
        }, 500);
        setForm({ name: "", email: "", password: "" });
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "สมัครสมาชิกไม่สำเร็จ");
      }
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
            สมัครสมาชิก
          </h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-200">ชื่อ</label>
            <input
              type="text"
              name="name"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              value={form.name}
              onChange={handleChange}
              placeholder="ชื่อของคุณ"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-200">อีเมล</label>
            <input
              type="email"
              name="email"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium text-gray-200">รหัสผ่าน</label>
            <input
              type="password"
              name="password"
              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
          >
            สมัครสมาชิก
          </button>
        </form>
      </div>
    </>
  );
}
