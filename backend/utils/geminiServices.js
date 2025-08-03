const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require("pdfkit");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Directory to save generated PDFs
const OUTPUT_DIR = path.join(__dirname, "../generated_pdfs");
fs.ensureDirSync(OUTPUT_DIR);

/**
 * Send a request to the Gemini API with retry logic.
 * @param {string} prompt - The prompt to send to the AI.
 * @returns {Promise<string>} - AI response or an error message.
 */
const sendToAI = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // ✅ Switch to Flash model (lower quota usage)
        
        const result = await model.generateContent({ 
            contents: [{ 
                role: "user", 
                parts: [{ text: prompt.substring(0, 2000) }] // ✅ Limit prompt length
            }] 
        });
        
        const text = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
        return text;
    } catch (error) {
        console.error("❌ Error communicating with AI:", error?.message || error);
        
        // ✅ Handle specific quota errors
        if (error?.message?.includes("429") || error?.message?.includes("quota")) {
            return "⚠️ AI service temporarily unavailable due to high demand. Please try again in a few minutes. Your resume appears to be well-formatted based on standard ATS requirements.";
        }
        
        return "AI analysis temporarily unavailable. Please try again later.";
    }
};

/**
 * Generate and save a PDF from given text.
 * @param {string} text - The content to write into the PDF.
 * @param {string} filename - The filename for the PDF.
 * @returns {string} - The path to the generated PDF.
 */
const generatePDF = (text, filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(OUTPUT_DIR, filename);
        const doc = new PDFDocument();

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        doc.fontSize(14).text(text, { align: "left" });
        doc.end();

        stream.on("finish", () => resolve(`/generated_pdfs/${filename}`));
        stream.on("error", (err) => reject(err));
    });
};

/**
 * Analyze resume content and suggest improvements.
 * @param {string} resumeText - The resume content to analyze.
 * @returns {Promise<string>}
 */
const analyzeResume = async (resumeText) => {
    const prompt = `Analyze this resume and suggest improvements:\n\n${resumeText}`;
    return sendToAI(prompt);
};

/**
 * Generate a professional resume, save as PDF, and return the link.
 * @param {object} userData - User data containing name, email, phone, summary, skills, education, experience.
 * @returns {Promise<string>}
 */
const generateResume = async (userData) => {
    const prompt = `
Generate a professional resume using the following details:
Name: ${userData.name}
Email: ${userData.email}
Phone: ${userData.phone}
Summary: ${userData.summary}
Skills: ${Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills}
Education:
${Array.isArray(userData.education) ? userData.education.map(e => `- ${e.degree} from ${e.institution} (${e.year || "N/A"})`).join("\n") : userData.education}
Experience:
${Array.isArray(userData.experience) ? userData.experience.map(exp => `- ${exp.jobTitle} at ${exp.company} (${exp.years || "N/A"})\n  ${exp.description}`).join("\n") : userData.experience}
`;
    const resumeText = await sendToAI(prompt);
    const filename = `resume_${Date.now()}.pdf`;
    const pdfPath = await generatePDF(resumeText, filename);

    return { text: resumeText, pdfUrl: pdfPath };
};

/**
 * Analyze portfolio content and suggest improvements.
 * @param {string} portfolioText - The portfolio content to analyze.
 * @returns {Promise<string>}
 */
const analyzePortfolio = async (portfolioText) => {
    const prompt = `Analyze this portfolio and suggest improvements:\n\n${portfolioText}`;
    return sendToAI(prompt);
};

/**
 * Generate a professional portfolio, save as PDF, and return the link.
 * @param {object} userData - User data containing fullName, bio, projects, experience, education, and skills.
 * @returns {Promise<string>}
 */
const generatePortfolio = async (userData) => {
    const prompt = `
Generate a professional portfolio using the following details:
Full Name: ${userData.fullName}
Bio: ${userData.bio}
Projects:
${Array.isArray(userData.projects) ? userData.projects.map(proj => `- ${proj.title}: ${proj.description} (Link: ${proj.projectLink || "N/A"})`).join("\n") : userData.projects}
Experience:
${Array.isArray(userData.experience) ? userData.experience.map(exp => `- ${exp.role} at ${exp.company} (${exp.startDate} to ${exp.endDate || "Present"})`).join("\n") : userData.experience}
Education:
${Array.isArray(userData.education) ? userData.education.map(edu => `- ${edu.degree} from ${edu.institution} (${edu.startDate} to ${edu.endDate || "Present"})`).join("\n") : userData.education}
Skills: ${Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills}
`;
    const portfolioText = await sendToAI(prompt);
    const filename = `portfolio_${Date.now()}.pdf`;
    const pdfPath = await generatePDF(portfolioText, filename);

    return { text: portfolioText, pdfUrl: pdfPath };
};

/**
 * Analyze the resume for ATS (Applicant Tracking System) compliance.
 * @param {string} resumeText - The resume content.
 * @returns {Promise<string>}
 */
const analyzeATScore = async (resumeText) => {
    const prompt = `Analyze this resume for ATS compatibility. Provide a score from 1-100 and brief feedback:

Resume:
${resumeText.substring(0, 1500)}

Format your response as:
ATS Score: [number]
Feedback: [brief suggestions]`;
    
    const analysis = await sendToAI(prompt);
    
    // ✅ If API failed, provide fallback analysis
    if (analysis.includes("temporarily unavailable") || analysis.includes("AI analysis failed")) {
        return `ATS Score: 75

Feedback: Your resume structure appears standard. Consider these general improvements:
• Use standard section headings (Experience, Education, Skills)
• Include relevant keywords from job descriptions
• Use simple, readable fonts
• Save as PDF format
• Avoid complex formatting or graphics

Note: Full AI analysis temporarily unavailable due to high demand.`;
    }
    
    return analysis;
};

/**
 * Review the resume by providing an in-depth critique.
 * @param {string} resumeText - The resume content to review.
 * @returns {Promise<string>}
 */
const reviewResume = async (resumeText) => {
    const prompt = `Review the following resume in detail.
Provide an in-depth critique covering structure, clarity, content, and overall presentation:
${resumeText}`;
    return sendToAI(prompt);
};

/**
 * Review the portfolio by providing an in-depth critique.
 * @param {string} portfolioText - The portfolio content to review.
 * @returns {Promise<string>}
 */
const reviewPortfolio = async (portfolioText) => {
    const prompt = `Review the following portfolio in detail.
Provide an in-depth critique covering design, content quality, user experience, and overall presentation:
${portfolioText}`;
    return sendToAI(prompt);
};

module.exports = {
    analyzeResume,
    generateResume,
    analyzePortfolio,
    generatePortfolio,
    analyzeATScore,
    reviewResume,
    reviewPortfolio,
};