const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require("pdfkit");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const MAX_INPUT_CHARS = 12000;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Directory to save generated PDFs
const OUTPUT_DIR = path.join(__dirname, "../generated_pdfs");
fs.ensureDirSync(OUTPUT_DIR);

const compactText = (value, maxLength = MAX_INPUT_CHARS) => {
    if (!value) return "Not provided";

    const compacted = String(value).replace(/\s+/g, " ").trim();
    return compacted.length > maxLength
        ? `${compacted.slice(0, maxLength)} [content truncated]`
        : compacted;
};

const formatList = (items, formatter) => {
    if (!Array.isArray(items)) return "Not provided";
    const validItems = items.filter((item) => {
        if (!item) return false;
        if (typeof item !== "object") return String(item).trim().length > 0;
        return Object.values(item).some((value) => String(value || "").trim().length > 0);
    });
    return validItems.length ? validItems.map((item) => formatter(item)).join("\n") : "Not provided";
};

/**
 * Send a request to Gemini without converting failures into fake AI content.
 * @param {string} prompt - The prompt to send to Gemini.
 * @param {number} maxOutputTokens - Maximum response tokens for this task.
 * @returns {Promise<string>}
 */
const sendToAI = async (prompt, maxOutputTokens = 900) => {
    if (!GEMINI_API_KEY) {
        const error = new Error("GEMINI_API_KEY is not configured on the backend.");
        error.statusCode = 503;
        throw error;
    }

    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent({ 
            contents: [{ 
                role: "user", 
                parts: [{ text: compactText(prompt) }]
            }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens,
            },
        });

        const text = result.response?.text?.();
        if (!text?.trim()) {
            const error = new Error("Gemini returned an empty response.");
            error.statusCode = 502;
            throw error;
        }
        return text.trim();
    } catch (error) {
        console.error("❌ Error communicating with AI:", error?.message || error);

        if (!error.statusCode) {
            error.statusCode = /429|quota/i.test(error.message || "") ? 429 : 502;
        }
        throw error;
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
    const prompt = `You are an expert resume reviewer. Analyze the resume below and return concise, actionable findings under these headings: Strengths, Critical Issues, ATS Improvements, Recommended Rewrite Actions. Do not invent facts.\n\nRESUME:\n${compactText(resumeText)}`;
    return sendToAI(prompt, 800);
};

/**
 * Generate a professional resume, save as PDF, and return the link.
 * @param {object} userData - User data containing name, email, phone, summary, skills, education, experience.
 * @returns {Promise<string>}
 */
const generateResume = async (userData) => {
    const prompt = `Create a polished, ATS-friendly resume using only the supplied facts. Use clear section headings, strong action-oriented bullets, and do not invent employers, dates, metrics, or skills. Return only the resume text.\n\nCONTACT\nName: ${compactText(userData.fullName || userData.name, 200)}\nEmail: ${compactText(userData.email, 200)}\nPhone: ${compactText(userData.phone, 100)}\nLinkedIn: ${compactText(userData.linkedin, 300)}\nGitHub: ${compactText(userData.github, 300)}\nWebsite: ${compactText(userData.website, 300)}\nOther Profiles:\n${formatList(userData.codingProfiles, (profile) => `- ${compactText(profile.label, 100)}: ${compactText(profile.url, 300)}`)}\n\nSUMMARY\n${compactText(userData.summary, 2000)}\n\nSKILLS\n${compactText(Array.isArray(userData.skills) ? userData.skills.join(", ") : userData.skills, 1000)}\n\nPROJECTS\n${formatList(userData.projects, (project) => `- ${compactText(project.title, 200)}: ${compactText(project.description, 1000)}${project.projectLink ? ` (Link: ${compactText(project.projectLink, 300)})` : ""}`)}\n\nEXPERIENCE\n${formatList(userData.experience, (item) => `- ${compactText(item.role || item.jobTitle, 200)} at ${compactText(item.company, 200)} (${compactText(item.startDate || item.years, 100)}-${compactText(item.endDate, 100)})\n  ${compactText(item.description, 1000)}`)}\n\nEDUCATION\n${formatList(userData.education, (item) => `- ${compactText(item.degree, 200)} | ${compactText(item.institution, 200)} (${compactText(item.startDate, 100)}-${compactText(item.endDate || item.year, 100)})`)}\n\nACHIEVEMENTS\n${compactText(Array.isArray(userData.achievements) ? userData.achievements.join("; ") : userData.achievements, 1200)}\nHOBBIES\n${compactText(Array.isArray(userData.hobbies) ? userData.hobbies.join(", ") : userData.hobbies, 500)}\nINTERESTS\n${compactText(Array.isArray(userData.interests) ? userData.interests.join(", ") : userData.interests, 500)}`;
    const resumeText = await sendToAI(prompt, 1200);
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
    const prompt = `Evaluate this resume for ATS compatibility. Return exactly: ATS Score: <integer 1-100> followed by Feedback: with concise evidence-based recommendations. Consider parsing, headings, keywords, chronology, measurable impact, and readability. Do not invent a score rationale unrelated to the supplied resume.\n\nRESUME:\n${compactText(resumeText)}`;
    return sendToAI(prompt, 500);
};

/**
 * Review the resume by providing an in-depth critique.
 * @param {string} resumeText - The resume content to review.
 * @returns {Promise<string>}
 */
const reviewResume = async (resumeText) => {
    const prompt = `Review this resume in depth. Return concise sections: Overall Assessment, Content Gaps, Clarity and Impact, ATS Risks, and Prioritized Edits. Base every observation on the supplied text and do not invent facts.\n\nRESUME:\n${compactText(resumeText)}`;
    return sendToAI(prompt, 900);
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