import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const Home = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      {/* Heading with Animation */}
      <h1 className="text-5xl font-extrabold text-blue-600 mb-8 animate-fade-in">
        Welcome to <span className="bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">ResumePort</span>
      </h1>

      {/* Conditional Links (Only if User is Signed In) */}
      {isSignedIn ? (
        <div className="flex justify-center w-[100%]">
        <div className="w-[75%] p-10 bg-white shadow-2xl rounded-2xl transform transition-all duration-500 hover:scale-105 hover:ring-4 hover:ring-blue-300 text-center">
          <h2 className="text-4xl font-bold text-blue-600 mb-6"> Build a Powerful Resume</h2>
          
          <div className="mt-6 flex flex-col space-y-4">
            <Link
              to="/resume/resumecreate"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-600 transition transform hover:scale-110 active:scale-95 focus:ring-2 focus:ring-blue-400 animate-pulse"
              style={{width:"300px",margin:'auto',marginBottom:"30px"}}
            >
              Create Resume
            </Link>
            <Link
              to="/resume/resumeview"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-600 transition transform hover:scale-110 active:scale-95 focus:ring-2 focus:ring-blue-400 animate-pulse"
              style={{width:"300px",margin:'auto',marginBottom:"30px"}}
            >
              ATS SCORE
            </Link>
            <Link
              to="/resume/resumeupload"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-600 transition transform hover:scale-110 active:scale-95 focus:ring-2 focus:ring-blue-400 animate-pulse"
              style={{width:"300px",margin:'auto',marginBottom:"30px"}}
            >
              Review Resume
            </Link>
          </div>
        </div>
      </div>
      
      ) : (
        <>
          {/* Existing Content (For Non-Signed-In Users) */}
          {/* Resume Section */}
      <div className="max-w-3xl p-8 bg-white shadow-xl rounded-lg mb-8 transform transition-all duration-500 hover:scale-105 ">
        <h2 className="text-3xl font-bold text-blue-600 mb-4"> Build a Powerful Resume</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          A resume is your first impression to employers. A well-crafted resume can make you stand out, showcase your skills, experience, and achievements, and land you your dream job.
        </p>
        <ul className="list-disc text-gray-700 mt-4 pl-6">
          <li>Highlight your strengths with clear formatting.</li>
          <li>Use ATS-friendly templates to boost visibility.</li>
          <li>Showcase your achievements and work experience effectively.</li>
        </ul>
        <Link to="/signin" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-700 transition">
          Get Started 
        </Link>
      </div>
      {/* Portfolio Section */}
      {/* <div className="max-w-3xl p-8 bg-white shadow-xl rounded-lg transform transition-all duration-500 hover:scale-105">
        <h2 className="text-3xl font-bold text-green-600 mb-4">🎨 Create an Impressive Portfolio</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          A portfolio is your visual showcase. Whether you're a developer, designer, writer, or artist, a great portfolio demonstrates your work and skills.
        </p>
        <ul className="list-disc text-gray-700 mt-4 pl-6">
          <li>Present your best projects with stunning visuals.</li>
          <li>Enhance credibility by showcasing real-world experience.</li>
          <li>Attract clients, recruiters, or employers with a professional portfolio.</li>
        </ul>
        <Link to="/signin" className="mt-6 inline-block bg-green-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-700 transition">
          Get Started 🎯
        </Link>
      </div> */}
        </>
      )}
    </div>
  );
};

export default Home;
