import React, { useState } from "react";

const ResumeCreate = () => {
  const [resume, setResume] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    website: "",
    codingProfiles: [],
    summary: "",
    skills: [""],
    projects: [{ title: "", description: "", projectLink: "" }],
    experience: [],
    education: [{ institution: "", degree: "", startDate: "", endDate: "" }],
    achievements: [],
    hobbies: [],
    interests: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null);

  const handleChange = (e) => {
    setResume({ ...resume, [e.target.name]: e.target.value });
  };

  const handleListChange = (section, index, value) => {
    const updatedList = [...resume[section]];
    updatedList[index] = value;
    setResume({ ...resume, [section]: updatedList });
  };

  const handleSectionChange = (section, index, field, value) => {
    const updatedSection = resume[section].map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    ));
    setResume({ ...resume, [section]: updatedSection });
  };

  const addListItem = (section, value = "") => {
    setResume({ ...resume, [section]: [...resume[section], value] });
  };

  const removeListItem = (section, index) => {
    setResume({
      ...resume,
      [section]: resume[section].filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const addSectionItem = (section, value) => {
    setResume({ ...resume, [section]: [...resume[section], value] });
  };

  const removeSectionItem = (section, index) => {
    setResume({
      ...resume,
      [section]: resume[section].filter((_, itemIndex) => itemIndex !== index),
    });
  };

  const cleanResume = () => ({
    ...resume,
    skills: resume.skills.map((skill) => skill.trim()).filter(Boolean),
    codingProfiles: resume.codingProfiles.filter((profile) => profile.label.trim() && profile.url.trim()),
    achievements: resume.achievements.map((item) => item.trim()).filter(Boolean),
    hobbies: resume.hobbies.map((item) => item.trim()).filter(Boolean),
    interests: resume.interests.map((item) => item.trim()).filter(Boolean),
    projects: resume.projects.filter((project) => project.title.trim() && project.description.trim()),
    experience: resume.experience.filter((item) => item.company.trim() && item.role.trim()),
    education: resume.education.filter((item) => item.institution.trim() && item.degree.trim()),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanedResume = cleanResume();
    if (!cleanedResume.skills.length || !cleanedResume.projects.length || !cleanedResume.education.length) {
      setLoading(false);
      setError("Please add at least one skill, project, and education entry.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/resume-api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedResume),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.resume?.text) {
        setGeneratedResume(data.resume.text);
      } else {
        throw new Error(data.message || "Failed to generate resume. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      setError(error.message);
      console.error("❌ Error generating resume:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 p-6">
      <div className="p-8 bg-gray-100 rounded-xl shadow-2xl w-full max-w-3xl">
        {!generatedResume ? (
          <>
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
               Create Your Professional Resume
            </h2>

            {error && <p className="text-red-600 text-center font-semibold">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Contact Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="fullName" placeholder="Full Name" onChange={handleChange} required className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input name="email" placeholder="Email Address" type="email" onChange={handleChange} required className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input name="phone" placeholder="Mobile Number" type="tel" onChange={handleChange} required className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input name="linkedin" placeholder="LinkedIn URL" type="url" onChange={handleChange} required className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input name="github" placeholder="GitHub URL" type="url" onChange={handleChange} required className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <input name="website" placeholder="Portfolio / Website URL (optional)" type="url" onChange={handleChange} className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700">Other Coding Profiles</h4>
                    <button type="button" onClick={() => addSectionItem("codingProfiles", { label: "", url: "" })} className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md">+ Add Profile</button>
                  </div>
                  {resume.codingProfiles.map((profile, index) => (
                    <div key={`profile-${index}`} className="flex gap-2">
                      <input value={profile.label} onChange={(e) => handleSectionChange("codingProfiles", index, "label", e.target.value)} placeholder="Profile name" className="border p-3 rounded-lg w-1/3" />
                      <input value={profile.url} onChange={(e) => handleSectionChange("codingProfiles", index, "url", e.target.value)} placeholder="Profile URL" type="url" className="border p-3 rounded-lg flex-1" />
                      <button type="button" onClick={() => removeSectionItem("codingProfiles", index)} className="px-3 text-red-600" aria-label="Remove profile">Remove</button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Professional Summary</h3>
                <textarea name="summary" placeholder="Write a concise professional summary" onChange={handleChange} required rows="5" className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500" />
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Skills</h3>
                  <button type="button" onClick={() => addListItem("skills")} className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md">+ Add Skill</button>
                </div>
                <p className="text-sm text-gray-600">Start typing to see common suggestions.</p>
                <datalist id="skill-suggestions">
                  {['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'Git', 'AWS', 'Docker', 'Figma', 'Communication'].map((skill) => <option key={skill} value={skill} />)}
                </datalist>
                <div className="grid gap-3 md:grid-cols-2">
                  {resume.skills.map((skill, index) => (
                    <div key={`skill-${index}`} className="flex gap-2">
                      <input value={skill} onChange={(e) => handleListChange("skills", index, e.target.value)} list="skill-suggestions" placeholder="Skill" required className="border p-3 rounded-lg flex-1" />
                      {resume.skills.length > 1 && <button type="button" onClick={() => removeListItem("skills", index)} className="px-2 text-red-600" aria-label="Remove skill">Remove</button>}
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Projects</h3>
                  <button type="button" onClick={() => addSectionItem("projects", { title: "", description: "", projectLink: "" })} className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md">+ Add Project</button>
                </div>
                {resume.projects.map((project, index) => (
                  <div key={`project-${index}`} className="border p-4 rounded-lg space-y-3">
                    <input value={project.title} onChange={(e) => handleSectionChange("projects", index, "title", e.target.value)} placeholder="Project title" required className="border p-3 w-full rounded-lg" />
                    <textarea value={project.description} onChange={(e) => handleSectionChange("projects", index, "description", e.target.value)} placeholder="What did you build and what was the impact?" required rows="3" className="border p-3 w-full rounded-lg" />
                    <div className="flex gap-3">
                      <input value={project.projectLink} onChange={(e) => handleSectionChange("projects", index, "projectLink", e.target.value)} placeholder="Project URL (optional)" type="url" className="border p-3 rounded-lg flex-1" />
                      {resume.projects.length > 1 && <button type="button" onClick={() => removeSectionItem("projects", index)} className="text-red-600">Remove</button>}
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">Experience <span className="text-sm font-normal text-gray-500">(optional)</span></h3>
                  <button type="button" onClick={() => addSectionItem("experience", { company: "", role: "", startDate: "", endDate: "", description: "" })} className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md">+ Add Experience</button>
                </div>
                {resume.experience.map((item, index) => (
                  <div key={`experience-${index}`} className="border p-4 rounded-lg space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input value={item.role} onChange={(e) => handleSectionChange("experience", index, "role", e.target.value)} placeholder="Role / Job Title" className="border p-3 rounded-lg" />
                      <input value={item.company} onChange={(e) => handleSectionChange("experience", index, "company", e.target.value)} placeholder="Company" className="border p-3 rounded-lg" />
                      <input value={item.startDate} onChange={(e) => handleSectionChange("experience", index, "startDate", e.target.value)} placeholder="Start date" className="border p-3 rounded-lg" />
                      <input value={item.endDate} onChange={(e) => handleSectionChange("experience", index, "endDate", e.target.value)} placeholder="End date or Present" className="border p-3 rounded-lg" />
                    </div>
                    <textarea value={item.description} onChange={(e) => handleSectionChange("experience", index, "description", e.target.value)} placeholder="Responsibilities and achievements" rows="3" className="border p-3 w-full rounded-lg" />
                    <button type="button" onClick={() => removeSectionItem("experience", index)} className="text-red-600">Remove Experience</button>
                  </div>
                ))}
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Education</h3>
                {resume.education.map((item, index) => (
                  <div key={`education-${index}`} className="border p-4 rounded-lg space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input value={item.degree} onChange={(e) => handleSectionChange("education", index, "degree", e.target.value)} placeholder="Degree / Qualification" required className="border p-3 rounded-lg" />
                      <input value={item.institution} onChange={(e) => handleSectionChange("education", index, "institution", e.target.value)} placeholder="Institution" required className="border p-3 rounded-lg" />
                      <input value={item.startDate} onChange={(e) => handleSectionChange("education", index, "startDate", e.target.value)} placeholder="Start date" required className="border p-3 rounded-lg" />
                      <input value={item.endDate} onChange={(e) => handleSectionChange("education", index, "endDate", e.target.value)} placeholder="End date or Present" required className="border p-3 rounded-lg" />
                    </div>
                    {resume.education.length > 1 && <button type="button" onClick={() => removeSectionItem("education", index)} className="text-red-600">Remove Education</button>}
                  </div>
                ))}
                <button type="button" onClick={() => addSectionItem("education", { institution: "", degree: "", startDate: "", endDate: "" })} className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md">+ Add Education</button>
              </section>

              {[
                ["achievements", "Achievements"],
                ["hobbies", "Hobbies"],
                ["interests", "Interests"],
              ].map(([section, label]) => (
                <section key={section} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800">{label} <span className="text-sm font-normal text-gray-500">(optional)</span></h3>
                    <button type="button" onClick={() => addListItem(section)} className="text-sm bg-blue-600 text-white px-3 py-2 rounded-md">+ Add</button>
                  </div>
                  {resume[section].map((item, index) => (
                    <div key={`${section}-${index}`} className="flex gap-2">
                      <input value={item} onChange={(e) => handleListChange(section, index, e.target.value)} placeholder={`${label} detail`} className="border p-3 rounded-lg flex-1" />
                      <button type="button" onClick={() => removeListItem(section, index)} className="px-2 text-red-600" aria-label={`Remove ${label}`}>Remove</button>
                    </div>
                  ))}
                </section>
              ))}

              <button type="submit" className="bg-green-600 text-white p-3 rounded-lg w-full font-semibold shadow-lg hover:bg-green-700 transition" disabled={loading}>
                {loading ? "Generating..." : "Generate Resume"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-left bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-3xl font-extrabold text-green-600 mb-4">✅ Resume Generated Successfully!</h2>
            <pre className="whitespace-pre-wrap text-gray-800 text-lg border p-4 rounded-lg bg-gray-100">
              {generatedResume}
            </pre>
            <button
              onClick={() => navigator.clipboard.writeText(generatedResume)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition mx-4"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => setGeneratedResume(null)}
              className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-900 transition mx-5"
            >
              Generate Another Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeCreate;
