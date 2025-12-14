import React, { useState } from "react";
import { User } from "./types";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import FacultyDashboard from "./components/FacultyDashboard";

const STORAGE_KEY = "academy_user_session";

const App: React.FC = () => {
  // Initialize state from localStorage if available
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to recover session", e);
      return null;
    }
  });

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    try {
      // Logic to optimize storage:
      // If admin or faculty, we persist the user object.
      // If student, we strip the feeScreenshot to save space in the session key.
      const userForStorage: User = { ...loggedInUser };

      if (userForStorage.role === "student" && userForStorage.feeScreenshot) {
        userForStorage.feeScreenshot = null;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(userForStorage));
    } catch (e) {
      console.error("Failed to save session", e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Route based on Role
  if (user.role === "admin" || user.isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  } else if (user.role === "faculty") {
    return <FacultyDashboard user={user} onLogout={handleLogout} />;
  } else {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }
};

export default App;
