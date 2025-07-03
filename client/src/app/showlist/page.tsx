"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Navbar from "../component/navbar";
import { useStatus } from "../context/useStatus";
import { create } from "domain";

type Quote = {
  id: string;
  text: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  vote_count: number;
};

export default function ShowList() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMyQuotes, setShowMyQuotes] = useState(false);
  const [newQuote, setNewQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useStatus();
  const [page, setPage] = useState(1);
  const [myPage, setMyPage] = useState(1);
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const pageSize = 7;

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await axios.get("http://localhost:3500/quote");
        setQuotes(response.data);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      }
    };
    if (!showCreateForm && !showMyQuotes) fetchQuotes();
  }, [showCreateForm, showMyQuotes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuote.trim()) return;
    setLoading(true);
    try {
      const userId = user?.user?.id;
      await axios.post("http://localhost:3500/quote", { text: newQuote, created_by: userId, created_by_name: user?.user?.user_metadata.name });
      setNewQuote("");
      setShowCreateForm(false);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการสร้างคำคม");
      console.log("Error creating quote:", error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแก้ไขคำคม
  const handleEdit = async (id: string) => {
    if (!editText.trim()) return;
    setLoading(true);
    try {
      await axios.patch(`http://localhost:3500/quote/${id}`, {
        text: editText,
        created_by: user?.user?.id,
        created_by_name: user?.user?.user_metadata.name
      });
      setEditId(null);
      setEditText("");
      // refresh list
      const response = await axios.get("http://localhost:3500/quote");
      setQuotes(response.data);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการแก้ไขคำคม");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันลบคำคม
  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณต้องการลบคำคมนี้หรือไม่?")) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3500/quote/${id}`);
      // refresh list
      const response = await axios.get("http://localhost:3500/quote");
      setQuotes(response.data);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบคำคม");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับ sort quotes
  const sortedQuotes = [...quotes].sort((a, b) =>
    sortOrder === 'desc' ? b.vote_count - a.vote_count : a.vote_count - b.vote_count
  );

  const sortOptions = [
    { value: 'desc', label: 'โหวตมาก → น้อย' },
    { value: 'asc', label: 'โหวตน้อย → มาก' },
  ];

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center p-8 bg-gray-900">
        {!showCreateForm && !showMyQuotes && user?.user && (
          <div className="flex justify-between w-full max-w-xl ">
            <button
              className="mb-6 bg-yellow-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              onClick={() => { setShowMyQuotes(true); setMyPage(1); }}
            >
              จัดการคำคมของคุณ
            </button>
            <button
              className="mb-6 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              onClick={() => setShowCreateForm(true)}
            >
              สร้างคำคมของคุณ
            </button>
          </div>
        )}
        <div className="bg-gray-800 rounded shadow p-8 max-w-xl w-full">
          <h1 className="text-2xl font-bold mb-6 text-white text-center">
            รายการคำคมกวนๆ
          </h1>
          {!showCreateForm && !showMyQuotes ? (
            <>
              {/* Sorting dropdown */}
              <div className="flex justify-end mb-4">
                <select
                  className="px-4 py-2 rounded bg-gray-700 text-white"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as 'desc' | 'asc')}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <ul>
                {sortedQuotes.slice((page - 1) * pageSize, page * pageSize).map((quote) => (
                  <li
                    key={quote.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-700 last:border-b-0"
                  >
                    <div>
                      <span className="text-gray-200">{quote.text}</span>
                      <div className="text-xs text-gray-400 mt-1">สร้างโดย: {quote.created_by_name}</div>
                    </div>
                    <span className="bg-blue-700 text-white px-3 py-1 rounded text-sm ml-0 sm:ml-4 mt-2 sm:mt-0">
                      {quote.vote_count} คะแนน
                    </span>
                  </li>
                ))}
              </ul>
              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <div className="flex space-x-4">
                  <button
                    className="w-28 px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50 text-center"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ก่อนหน้า
                  </button>
                  <span className="text-gray-300 flex items-center justify-center w-10 text-center">{page}</span>
                  <button
                    className="w-28 px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50 text-center"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * pageSize >= quotes.length}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
              <div className="flex justify-center mt-8">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                  onClick={() => router.push("/")}
                >
                  กลับหน้าแรก
                </button>
              </div>
            </>
          ) : showMyQuotes ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-white text-center">คำคมของคุณ</h2>
              <ul>
                {(() => {
                  const myQuotes = quotes.filter(q => q.created_by === user?.user?.id);
                  if (myQuotes.length === 0) {
                    return <li className="text-gray-400 text-center py-4">คุณยังไม่มีคำคม</li>;
                  }
                  return myQuotes.slice((myPage - 1) * pageSize, myPage * pageSize).map((quote) => (
                    <li
                      key={quote.id}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-gray-700 last:border-b-0"
                    >
                      <div className="flex-1">
                        {editId === quote.id ? (
                          <>
                            <input
                              className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-2 py-1 mb-1"
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              disabled={loading}
                            />
                            <div className="flex space-x-2 mt-1">
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                                onClick={() => handleEdit(quote.id)}
                                disabled={loading}
                              >
                                บันทึก
                              </button>
                              <button
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                                onClick={() => { setEditId(null); setEditText(""); }}
                                disabled={loading}
                              >
                                ยกเลิก
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-gray-200">{quote.text}</span>
                            <div className="text-xs text-gray-400 mt-1">สร้างโดย: {quote.created_by_name}</div>
                          </>
                        )}
                      </div>
                      <span className="bg-blue-700 text-white px-3 py-1 rounded text-sm ml-0 sm:ml-4 mt-2 sm:mt-0">
                        {quote.vote_count} คะแนน
                      </span>
                      <div className="flex space-x-2 mt-2 sm:mt-0 ml-0 sm:ml-4">
                        <button
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                          onClick={() => { setEditId(quote.id); setEditText(quote.text); }}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          onClick={() => handleDelete(quote.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ));
                })()}
              </ul>
              {/* Pagination for my quotes */}
              <div className="flex justify-center mt-6">
                <div className="flex space-x-4">
                  <button
                    className="w-28 px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50 text-center"
                    onClick={() => setMyPage((p) => Math.max(1, p - 1))}
                    disabled={myPage === 1}
                  >
                    ก่อนหน้า
                  </button>
                  <span className="text-gray-300 flex items-center justify-center w-10 text-center">{myPage}</span>
                  <button
                    className="w-28 px-4 py-2 rounded bg-gray-700 text-white disabled:opacity-50 text-center"
                    onClick={() => setMyPage((p) => p + 1)}
                    disabled={(() => {
                      const myQuotes = quotes.filter(q => q.created_by === user?.user?.id);
                      return myPage * pageSize >= myQuotes.length;
                    })()}
                  >
                    ถัดไป
                  </button>
                </div>
              </div>
              <div className="flex justify-center mt-8">
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
                  onClick={() => setShowMyQuotes(false)}
                >
                  ย้อนกลับ
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <label className="block text-gray-200 font-medium">
                ใส่คำคมของคุณ
              </label>
              <input
                type="text"
                className="w-full border border-gray-700 bg-gray-900 text-gray-100 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                placeholder="พิมพ์คำคมของคุณที่นี่"
                disabled={loading}
              />
              <div className="flex space-x-4 mt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? "กำลังบันทึก..." : "บันทึกคำคม"}
                </button>
                <button
                  type="button"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                >
                  ย้อนกลับ 
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}
