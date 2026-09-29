const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Import AI services (Gemini API)
const { analyzeResume, generateResume, analyzeATScore, reviewResume } = require("../utils/geminiServices");

const resumeApp = express.Router();

// ✅ Middleware to Parse JSON
resumeApp.use(express.json({ limit: "10mb" }));

// 📌 Multer Storage Configuration (For File Uploads)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

/* ---------------------------------------------
📌 Extract Text from File (PDF, DOCX, TXT)
--------------------------------------------- */
const extractTextFromFile = async (file) => {
  if (!file) throw new Error("No file uploaded. Please upload a valid resume file.");

  const fileType = file.originalname.split(".").pop().toLowerCase();

  try {
    if (fileType === "txt") {
      return file.buffer.toString("utf-8");
    } else if (fileType === "pdf") {
      const pdfData = await pdfParse(file.buffer);
      return pdfData.text;
    } else if (fileType === "docx") {
      const docxData = await mammoth.extractRawText({ buffer: file.buffer });
      return docxData.value;
    } else {
      throw new Error("Unsupported file format. Please upload a TXT, PDF, or DOCX file.");
    }
  } catch (error) {
    throw new Error("Error extracting text from file: " + error.message);
  }
};

/* ---------------------------------------------
📌 Extract Resume Text from Request (File or Text)
--------------------------------------------- */
const getResumeText = async (req) => {
  if (req.file) {
    return await extractTextFromFile(req.file);
  } else if (req.body.resumeText && req.body.resumeText.trim() !== "") {
    return req.body.resumeText.trim();
  } else {
    throw new Error("Resume text or a valid file is required.");
  }
};

/* ---------------------------------------------
📌 Analyze Resume with AI
--------------------------------------------- */
resumeApp.post(
  "/analyze",
  upload.single("resumeFile"),
  expressAsyncHandler(async (req, res) => {
    try {
      const resumeText = await getResumeText(req);
      console.log("🔍 Analyzing Resume...");

      const analysis = await analyzeResume(resumeText);
      if (!analysis) throw new Error("Failed to analyze resume.");

      res.status(200).json({ message: "Resume analysis complete", analysis });
    } catch (error) {
      console.error("❌ Error analyzing resume:", error);
      res.status(error.statusCode || 400).json({ message: error.message });
    }
  })
);

resumeApp.post(
  "/generate",
  expressAsyncHandler(async (req, res) => {
    try {
      console.log("🛠️ Generating Resume...");
      
      const aiGeneratedResume = await generateResume(req.body);

      if (!aiGeneratedResume || !aiGeneratedResume.text) {
        throw new Error("AI service failed to generate a resume. Please try again.");
      }

      res.status(200).json({ resume: { text: aiGeneratedResume.text } });
    } catch (error) {
      console.error("❌ Error generating resume:", error);
      res.status(error.statusCode || 400).json({ message: error.message });
    }
  })
);

/* ---------------------------------------------
📌 Analyze ATS Score with AI
--------------------------------------------- */
resumeApp.post(
  "/ats-score",
  upload.single("resumeFile"),
  expressAsyncHandler(async (req, res) => {
    try {
      const resumeText = await getResumeText(req);
      console.log("🔍 Analyzing ATS Score...");

      const atsAnalysis = await analyzeATScore(resumeText);
      if (!atsAnalysis) throw new Error("Failed to analyze ATS score.");

      res.status(200).json({ message: "ATS score analysis complete", atsAnalysis });
    } catch (error) {
      console.error("❌ Error analyzing ATS score:", error);
      res.status(error.statusCode || 400).json({ message: error.message });
    }
  })
);

/* ---------------------------------------------
📌 Review Resume with AI
--------------------------------------------- */
resumeApp.post(
  "/review",
  upload.single("resumeFile"),
  expressAsyncHandler(async (req, res) => {
    try {
      const resumeText = await getResumeText(req);
      console.log("🔍 Reviewing Resume...");

      const review = await reviewResume(resumeText);
      if (!review) throw new Error("Failed to review resume.");

      res.status(200).json({ message: "Resume review complete", review });
    } catch (error) {
      console.error("❌ Error reviewing resume:", error);
      res.status(error.statusCode || 400).json({ message: error.message });
    }
  })
);

module.exports = resumeApp;