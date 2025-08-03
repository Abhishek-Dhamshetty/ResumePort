// filepath: /Users/abhishekdhamshetty/Desktop/ResumePort/frontend/src/components/common/Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [text, setText] = useState("");
  const fullText = "ResumePort";
  const speed = 100;

  // Typewriter Effect
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index++;
      if (index > fullText.length) {
        setTimeout(() => {
          index = 0;
          setText("");
        }, 1000);
      }
    }, speed);

    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      logout();
    }
  };

  return (
    <div className="bg-blue-200 text-white p-4 flex justify-between items-center shadow-lg transition-all duration-300">
      <a
        href={"/"}
        className="text-3xl font-extrabold bg-gradient-to-r from-red-500 via-green-500 to-blue-500 text-transparent bg-clip-text animate-pulse"
      >
        {text}
      </a>

      <div className="flex space-x-4">
        {isAuthenticated ? (
          <>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-md text-white hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>

            <div className="flex items-center space-x-2">
              {/* ✅ Fixed Profile Image Display */}
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0d8abc&color=fff`;
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              )}
              <span className="text-white font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
          </>
        ) : (
          <Link
            to="/signin"
            className="bg-green-500 px-4 py-2 rounded-md text-white hover:bg-green-700 transition duration-300"
          >
            Login
          </Link>
        )}

        <Link
          to="/"
          className={`px-4 py-2 rounded-md transition duration-300 ${
            isActive("/") ? "bg-white text-black" : "text-white hover:bg-white hover:text-black"
          }`}
        >
          Home
        </Link>
      </div>
    </div>
  );
};

export default Header;