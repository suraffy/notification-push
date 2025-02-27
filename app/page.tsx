"use client";

import Navbar from "@/components/Navbar";
import Main from "@/components/Main";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  notification: Notification[];
}

// const userId = "06e9ebad-2625-40f6-9ac6-4e39f9b4318b";

export default function Home() {
  const [isLoading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async (userId: string) => {
    setLoading(true);
    setUser(null);
    setError("");
    setSuccess("");

    setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data: User = await res.json();

        if (!res.ok) {
          console.log("Failed to Login");
          setError("Failed to Login");
          return;
        }

        setUser(data);
        setSuccess(`Welcome, ${data?.name}`);
      } catch (error) {
        console.error("Error while login:", error);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleLogout = () => {
    setUser(null);
    setSuccess("");
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Main
        onLogin={handleLogin}
        success={success}
        error={error}
        isLoading={isLoading}
      />
    </>
  );
}
