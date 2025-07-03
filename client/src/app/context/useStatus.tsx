"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  [key: string]: any;
}

interface StatusContextType {
  user: User | null;
  loading: boolean;
  refresh: () => void;
}

const StatusContext = createContext<StatusContextType>({
  user: null,
  loading: true,
  refresh: () => {},
});

export const StatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3500/profile/me", { withCredentials: true });
      setUser(res.data|| null);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <StatusContext.Provider value={{ user, loading, refresh: fetchUser }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatus = () => useContext(StatusContext);
