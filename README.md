# ResumePort
A full-stack **AI-powered Resume Builder** that allows users to create, review, and optimize resumes with ease. The platform includes **AI-based ATS (Applicant Tracking System) score analysis**, user authentication, and a sleek, modern UI for a seamless experience.

## Features

### Frontend
#### User Authentication
- Users can sign up and log in securely.
- Admin authentication with restricted access to manage user profiles and resume data.

#### Resume Builder
- Intuitive UI for resume creation with customizable sections.
- Users can dynamically add or remove fields such as **Experience, Education, and Skills**.

#### AI-Based ATS Score
- AI evaluates resumes and provides an **ATS compatibility score**.
- Suggestions to improve formatting, keywords, and content.

#### Resume Review
- Users can preview their resume before finalizing it.
- **View Resume Format** feature for easy access and sharing.

#### Responsive Design
- Optimized for desktops, tablets, and mobile devices.

### Backend
#### Authentication API
- Secure user authentication and session management.

#### Resume Management API
- CRUD operations for resume data storage and retrieval.
- AI-powered analysis for ATS compatibility.

#### AI Integration
- AI-driven resume analysis using **NLP-based ATS algorithms**.

### Database
- **MongoDB Atlas** for scalable and secure data storage.

## Deployment

### Frontend Hosting
- Deployed on **Vercel** for high-speed performance.

### Backend Hosting
- Deployed on **Render** for backend services.

### Database
- **MongoDB Atlas** (Free Plan) for cloud database hosting.

## Setup Instructions

### Prerequisites
- Node.js installed on your machine.
- MongoDB Atlas account for database setup.

### Steps to Run Locally
1. Clone the repository:
   ```sh
   git clone https://github.com/Abhishek-Dhamshetty/ResumePort.git
   cd ResumePort
   ```
2. Install dependencies for both frontend and backend:
   ```sh
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file and configure database and authentication settings.

4. Start the development server:
   ```sh
   npm start
   ```

5. Open your browser and visit `https://resume-port-ten.vercel.app/` to access the application.

