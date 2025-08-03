import React, { useState } from "react";

const TestPortfolioAPI = () => {
  const [responseMessage, setResponseMessage] = useState(null);

  const testPortfolioData = {
    fullName: "Test User",
    bio: "A passionate developer.",
    profileImage: "https://via.placeholder.com/150",
    projects: [
      {
        title: "Test Project",
        description: "This is a sample project.",
        projectLink: "https://example.com",
        repoLink: "https://github.com/example",
        technologies: ["React", "Node.js"]
      }
    ],
    experience: [
      {
        company: "Tech Company",
        role: "Software Engineer",
        startDate: "2023-01-01",
        endDate: "2024-01-01",
        description: "Worked on full-stack development."
      }
    ],
    education: [
      {
        institution: "XYZ University",
        degree: "B.Tech in Computer Science",
        startDate: "2019-08-01",
        endDate: "2023-05-31"
      }
    ],
    skills: ["JavaScript", "React", "MongoDB"],
    contact: {
      email: "testuser@example.com",
      phone: "1234567890",
      linkedin: "https://linkedin.com/in/testuser",
      github: "https://github.com/testuser",
      website: "https://testuser.dev"
    }
  };

  const handleTestAPI = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/portfolio-api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testPortfolioData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      setResponseMessage(`✅ Success: ${data.message}, Portfolio ID: ${data.portfolio._id}`);
    } catch (error) {
      setResponseMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Test Portfolio API</h1>
      <button 
        onClick={handleTestAPI} 
        className="bg-blue-500 text-white px-4 py-2 rounded shadow-md hover:bg-blue-600 transition">
        Test API
      </button>
      {responseMessage && (
        <div className="mt-4 p-4 bg-white shadow rounded text-center">
          <p>{responseMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TestPortfolioAPI;
