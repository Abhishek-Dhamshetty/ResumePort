import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ContactUs = () => {
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email || "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    
    try {
      await emailjs.send(
        "service_z91jh6k",
        "template_wr9v235",
        {
          user_name: formData.name,
          user_email: formData.email,
          message: formData.message,
        },
        "oZhA3P1T4lUTc9Uv0"
      );

      setSuccess("✅ Message sent successfully!");
      setFormData({ ...formData, message: "" });
    } catch (error) {
      console.error("Email sending failed:", error);
      setSuccess("❌ Failed to send message. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-gray-900 text-white shadow-2xl rounded-lg animate-fade-in">
      <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-green-300 text-transparent bg-clip-text">
        Contact Us
      </h1>

      {!isAuthenticated ? (
        <div className="text-center mt-6">
          <p className="text-lg text-gray-300">Please log in to send us a message.</p>
          <Link
            to="/signin"
            className="mt-4 inline-block bg-blue-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-transform hover:scale-105"
          >
            Login with Google
          </Link>
        </div>
      ) : (
        <>
          {/* ✅ Display User Profile Info */}
          {user && (
            <div className="flex items-center justify-center mt-6 mb-4">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full border-2 border-blue-400 mr-3"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0d8abc&color=fff`;
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl mr-3">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-300">{user.email}</p>
              </div>
            </div>
          )}

          {success && (
            <p className={`mt-4 text-center font-semibold text-lg ${success.includes("✅") ? "text-green-400" : "text-red-400"} animate-fade-in`}>
              {success}
            </p>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="relative">
              <label className="block text-gray-300">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-gray-300">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-gray-300">Message:</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400 transition"
                rows="4"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-green-400 text-white font-semibold p-3 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ContactUs;
