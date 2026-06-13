# Resumind (AI Resume Analyzer)

Resumind is an AI-powered resume analysis tool that helps job seekers improve their resumes, prepare for interviews, and track their job applications. Upload your resume along with a job description, and get instant AI-driven feedback on ATS compatibility, tone, content, structure, and skills — plus tailored interview questions and a downloadable PDF report.

## Features

- **Resume Upload & Analysis** — Upload a PDF resume along with company name, job title, and job description to receive a detailed AI-generated review.
- **ATS Score & Feedback** — Get a score out of 100 on how well your resume is likely to perform in Applicant Tracking Systems, with specific improvement tips.
- **Category Breakdown** — Detailed scoring and tips across Tone & Style, Content, Structure, and Skills.
- **Resume Q&A** — Chat with an AI assistant about your resume — ask about your strongest sections, how to phrase experience, listed projects, and more.
- **Interview Question Generator** — Generate likely technical, behavioral, and role-specific interview questions based on your resume and the job description, complete with explanations of why each question might be asked.
- **PDF Report Export** — Download a clean, formatted PDF report summarizing your resume score, category feedback, and generated interview questions.
- **Application Tracking** — All analyzed resumes are saved to your dashboard so you can revisit feedback anytime.

## Tech Stack

- **React 19** + **React Router v7** (framework mode)
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand** for state management
- **Puter.js** — handles authentication, file storage, AI chat/feedback, and key-value persistence
- **jsPDF** for PDF report generation
- **react-dropzone** for file uploads
- **pdfjs-dist** for converting uploaded PDFs to preview images

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/<your-username>/ai-resume-analyzer.git
cd ai-resume-analyzer
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in your terminal).


## How It Works

1. **Sign in** via Puter authentication.
2. **Upload your resume** (PDF) along with the company name, job title, and job description.
3. The app converts your resume to an image preview and sends it to the AI for analysis using a structured prompt.
4. The AI returns a JSON feedback object covering ATS compatibility, tone & style, content, structure, and skills — each with a score and actionable tips.
5. On the **Resume Review** page, you can:
    - View your overall score and category breakdowns
    - Ask follow-up questions about your resume via **Resume Q&A**
    - Generate **Interview Questions** tailored to your resume and the job description
    - **Export a PDF report** of your full review

## Project Structure

```
app/
├── components/        # UI components (Summary, ATS, Details, ResumeCard, InterviewQuestions, ResumeQA, etc.)
├── constants/          # AI prompt templates and response format definitions
├── lib/                # Puter store, PDF/image conversion utilities, PDF export
├── routes/             # App routes (home, upload, resume review, auth, wipe)
types/                  # Shared TypeScript interfaces (Resume, Feedback, InterviewQuestions, Puter types)
public/                 # Static assets, icons, images
```

## Data & Storage

All data is stored via **Puter**:
- **File Storage (`fs`)** — uploaded resumes (PDF) and generated preview images
- **Key-Value Store (`kv`)** — resume metadata, AI feedback, cached interview questions, and Q&A chat history
- **AI (`ai`)** — resume analysis, interview question generation, and resume Q&A chat, powered by Puter's AI chat API
