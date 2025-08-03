import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", 
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    github: {
      type: String,
    },
    website: {
      type: String,
    },
    summary: {
      type: String, 
    },
    skills: [{ type: String }], 
    experience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        description: { type: String },
      },
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
      },
    ],
    certifications: [
      {
        title: { type: String, required: true },
        issuingOrganization: { type: String },
        dateIssued: { type: Date },
        credentialId: { type: String },
        credentialUrl: { type: String },
      },
    ],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        projectLink: { type: String },
        repoLink: { type: String },
        technologies: [{ type: String }],
      },
    ],
    languages: [{ type: String }], 
    achievements: [{ type: String }], 
    references: [
      {
        name: { type: String },
        contact: { type: String },
        relation: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", ResumeSchema);
export default Resume;