"use client";

import Link from "next/link";
import { useStatus } from "../context/useStatus";
import axios from "axios";

export default function Navbar() {
  const { user, loading, refresh } = useStatus();

  const handleLogout = async () => {
    await axios.post("http://localhost:3500/logout", {}, { withCredentials: true });
    refresh();
  };

  return (
    <nav className="flex items-center justify-between bg-gray-800 px-6 py-3 shadow">
      <div className="text-white font-bold text-xl">
        <Link href="/">Home</Link>
      </div>
      <div className="flex items-center space-x-4">
        {!loading && !user?.user && (
          <>
            <Link href="/login" className="text-gray-200 hover:text-white">Login</Link>
            <Link href="/register" className="text-gray-200 hover:text-white">Register</Link>
          </>
        )}
        {!loading && user?.user && (
          <>
            <span className="text-green-400">สวัสดี, {user?.user?.user_metadata?.name}</span>
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
