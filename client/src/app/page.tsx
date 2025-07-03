"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useStatus } from "./context/useStatus";
import Navbar from "./component/navbar";

type Quote = {
  id: string;
  text: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  vote_count: number;
};

export default function Home() {
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const { user, loading } = useStatus();

  // เพิ่ม state สำหรับเก็บ quote id ที่ user โหวต
  const [userVotes, setUserVotes] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await axios.get("http://localhost:3500/quote");
        setQuotes(response.data);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    };

    fetchQuotes();
  }, []);

  // โหลด userVotes เมื่อ quotes เปลี่ยน
  useEffect(() => {
    const fetchUserVotes = async () => {
      if (!user?.user?.id) return;
      try {
        const res = await axios.get(
          `http://localhost:3500/quote/votes/${user.user.id}`
        );
        setUserVotes(res.data.map((v: any) => v.quote_id));
      } catch (e) {
        setUserVotes([]);
      }
    };
    fetchUserVotes();
  }, [user, quotes]);

  const handleVote = async () => {
    if (!user?.user?.id) {
      alert("กรุณาเข้าสู่ระบบก่อนโหวต");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:3500/quote/${quotes[selected].id}/vote`,
        { user_id: user?.user?.id }
      );
      console.log(response.data);
      if (response.data.voted === true) {
        /* alert("โหวตสำเร็จ!"); */
      } else if (response.data.voted === false) {
        /* alert("ยกเลิกโหวตแล้ว"); */
      } else {
        alert("เกิดข้อผิดพลาดในการโหวต");
      }

      // รีเฟรช quotes
      const prevId = quotes[selected].id;
      const res = await axios.get("http://localhost:3500/quote");
      setQuotes(res.data);
      const newIndex = res.data.findIndex((q: Quote) => q.id === prevId);
      if (newIndex !== -1) setSelected(newIndex);
    } catch (error) {
      console.error("Error voting:", error);
      alert("เกิดข้อผิดพลาดในการโหวต");
    }
  };

  const nextQuote = () => {
    setSelected((prev) => (prev + 1) % quotes.length);
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-900">
        <div className="bg-gray-800 rounded shadow p-8 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">คำคมกวนๆ</h1>
          {quotes.length > 0 ? (
            <>
              <p className="text-lg mb-6 text-gray-200">
                {quotes[selected].text}
              </p>
              <div className="mb-4">
                <button
                  className={`px-4 py-2 rounded mr-2 ${
                    userVotes.includes(quotes[selected].id)
                      ? "bg-blue-400 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  onClick={handleVote}
                >
                  {userVotes.includes(quotes[selected].id) ? "โหวตแล้ว" : "โหวต"}
                </button>
                <button
                  className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded mr-2"
                  onClick={nextQuote}
                >
                  คำคมถัดไป
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  onClick={() => router.push("/showlist")}
                >
                  ดูรายการทั้งหมด
                </button>
              </div>
              <div className="text-gray-400">
                ผลโหวต:{" "}
                <span className="font-bold text-white">
                  {quotes[selected].vote_count}
                </span>{" "}
                คะแนน
              </div>
            </>
          ) : (
            <p className="text-gray-400">กำลังโหลด...</p>
          )}
        </div>
      </main>
    </>
  );
}
