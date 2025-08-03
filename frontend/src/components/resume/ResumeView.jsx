import React, { useState } from "react";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const ResumeView = () => {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle File Selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setFeedback(null);
    setAtsScore(null);
    setError(null);
  };

  // Handle Resume Upload & AI Feedback
  const handleUpload = async () => {
    if (!file) {
      setError("❌ Please select a resume file first!");
      return;
    }
  
    const formData = new FormData();
    formData.append("resumeFile", file);
  
    try {
      setLoading(true);
      setFeedback(null);
      setAtsScore(null);
      setError(null);
  
      // Send file to backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/resume-api/ats-score`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
  
      console.log("🛠 Backend Response:", response.data);
  
      if (!response.data || !response.data.atsAnalysis) {
        throw new Error("❌ ATS analysis data is missing.");
      }
  
      const { atsAnalysis } = response.data;
  
      // ✅ Check if API quota exceeded or analysis failed
      if (atsAnalysis.includes("AI analysis failed") || atsAnalysis.includes("quota")) {
        setError("⚠️ AI service temporarily unavailable due to quota limits. Please try again later or upgrade your plan.");
        setFeedback("The AI analysis service is currently experiencing high demand. Please try again in a few minutes.");
        return;
      }
  
      // ✅ Updated regex to match both formats of "ATS Score:"
      const scoreMatch = atsAnalysis.match(/ATS Score:\**\s*(\d+)/i);
      const extractedScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
  
      if (extractedScore === null) {
        // ✅ Provide fallback message instead of error
        setError("⚠️ Could not extract ATS score from analysis. Showing general feedback instead.");
        setFeedback(formatFeedback(atsAnalysis));
        setAtsScore(75); // Fallback score
      } else {
        setAtsScore(extractedScore);
        setFeedback(formatFeedback(atsAnalysis));
      }
    } catch (error) {
      console.error("❌ Upload Error:", error);
      if (error.message.includes("quota") || error.message.includes("429")) {
        setError("⚠️ AI service quota exceeded. Please try again later or contact support for an upgraded plan.");
      } else {
        setError(error.response?.data?.message || error.message || "⚠️ Unexpected error occurred. Please try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Format AI Feedback Properly
  const formatFeedback = (text) => {
    return text
      .replace(/\*\*/g, "") // Remove unwanted bold formatting
      .split("\n\n")
      .map((section, index) => {
        return <p key={index} className="text-gray-700 mb-2">{section}</p>;
      });
  };

  // Function to determine color based on ATS score
  const getAtsColor = (score) => {
    if (score >= 75) return "#4CAF50"; // Green
    if (score >= 50) return "#FFC107"; // Yellow
    return "#F44336"; // Red
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-10 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">📂 Upload Resume for ATS Analysis</h2>

      {/* File Input */}
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        className="w-full border p-3 rounded-md focus:ring focus:ring-blue-300"
      />

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`mt-5 w-full p-4 rounded-md text-white transition ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "⏳ Analyzing..." : "📊 Upload & Analyze ATS Score"}
      </button>

      {/* ATS Score Display - Circular Progress Bar */}
      {atsScore !== null && (
        <div className="mt-6 flex justify-center items-center">
          <div style={{ width: 120, height: 120 }}>
            <CircularProgressbar
              value={atsScore}
              text={`${atsScore}/100`}
              styles={buildStyles({
                textSize: "16px",
                pathColor: getAtsColor(atsScore),
                textColor: "#333",
                trailColor: "#ddd",
                strokeLinecap: "round",
                transition: "stroke-dashoffset 0.6s ease-in-out",
              })}
            />
          </div>
          <div className="ml-6">
            <h3 className="text-xl font-bold text-gray-800">ATS Compatibility</h3>
            <p className="text-gray-600">
              {atsScore >= 75 ? "✅ Excellent" : atsScore >= 50 ? "⚠️ Good" : "❌ Needs Improvement"}
            </p>
          </div>
        </div>
      )}

      {/* Display Feedback */}
      {feedback && (
        <div className="mt-6 p-5 border rounded-md bg-blue-50">
          <h3 className="font-semibold text-lg text-blue-600 mb-3">📊 AI Analysis:</h3>
          <div className="text-gray-700">
            {feedback}
          </div>
        </div>
      )}

      {/* Display Error Messages */}
      {error && (
        <div className="mt-6 p-5 border rounded-md bg-yellow-100 border-yellow-300">
          <h3 className="font-semibold text-lg text-yellow-700">⚠️ Notice:</h3>
          <p className="text-yellow-800">{error}</p>
          
          {error.includes("quota") && (
            <div className="mt-4">
              <h4 className="font-semibold text-yellow-700">💡 What you can do:</h4>
              <ul className="list-disc ml-5 text-yellow-800">
                <li>Wait 15-30 minutes before trying again</li>
                <li>Try uploading a shorter resume</li>
                <li>Contact support for API quota upgrade</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gray-100 rounded-md">
        <h4 className="font-semibold text-gray-700 mb-2">📋 About ATS Analysis:</h4>
        <p className="text-sm text-gray-600">
          ATS (Applicant Tracking System) analysis helps ensure your resume is readable by automated screening software used by employers. 
          A higher score means better compatibility with these systems.
        </p>
      </div>
    </div>
  );
};

export default ResumeView;
