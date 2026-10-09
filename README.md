# SmartCampus AI — Your Intelligent Campus Companion

**Hackathon Demonstration Project • Second-Year Engineering Edition**

SmartCampus AI is an all-in-one, full-stack academic copilot engineered for university and engineering students. It eliminates attendance anxiety with exact mathematical formulas, optimizes study schedules against cognitive hour caps, summarizes dense lecture slides and digital PDFs into flashcards and practice exams, and provides a dual-layer AI study tutor powered by Google Gemini 3.8 Flash.

---

## 1. Problem Statement

College students face persistent cognitive overload balancing:
1. **Attendance Anxiety & Academic Penalties:** Strict university attendance criteria (e.g., 75% or 80%) with confusing calculations regarding how many consecutive classes must be attended to escape a shortage, or how many classes can be safely missed.
2. **Scattered Course Material:** Technical lecture notes, slides, and code examples are scattered across disconnected drives and portals.
3. **Ineffective Exam Preparation:** Cramming through dense slides without active recall (flashcards) or exam-style self-assessment questions.
4. **Disorganized Deadlines:** Unaligned assignments, lab practicals, and mid-term exam dates leading to deadline panic.

SmartCampus AI solves these problems through an integrated, privacy-focused dashboard with client-side sandbox isolation and server-side AI security.

---

## 2. Key Features

### 🎓 1. Smart Attendance Calculator & What-If Simulator
* **Mathematical Precision:** Implements strict academic formula:
  $$\text{Classes Required} = \max\left(0, \left\lceil \frac{P \cdot T - A}{1 - P} \right\rceil\right)$$
  where $A$ = classes attended, $T$ = total classes conducted, and $P$ = target decimal (e.g. $0.75$).
* **Safe Bunk Calculator:** Accurately computes how many consecutive classes can be safely skipped while staying at or above the threshold.
* **Interactive What-If Simulator:** Sliders allow students to model hypothetical attendance or leave scenarios before making plans.
* **Quick Log:** Fast `+ Attended` and `+ Missed` buttons for rapid daily updates.

### 🤖 2. Dual-Layer AI Study Assistant
* **Two-Stage Pedagogical Explanations:**
  * **Simple Intuitive Explanation:** High-level analogical summary breaking down the core intuition.
  * **In-Depth Academic Analysis:** Rigorous step-by-step technical breakdown, formulas, and time/space complexity.
* **Concrete Examples:** Real-world software engineering applications.
* **Self-Check Practice Questions:** Exam-style questions with hints.
* **Configurable Subjects & Prompt Templates:** Pre-built triggers for quick notes, checklists, and analogies.
* **Offline Resilient:** If `GEMINI_API_KEY` is not present, the local academic engine provides guidance without fake AI output.

### 📅 3. Automated Study Planner & Workload Allocator
* **Deterministic Allocation Algorithm:** Distributes study blocks across a 7-day calendar without exceeding daily study capacity (e.g., 4 hrs/day).
* **Urgency & Priority Weighting:** Prioritizes tasks with imminent deadlines and high difficulty.
* **Gemini AI Schedule Optimization:** Optional live AI schedule rebalancing tailored to student examination goals.
* **Honest Completion Tracking:** Tasks are only marked complete when the student checks them off.

### 📄 4. Lecture Notes & Digital PDF Summarizer
* **Text & Digital PDF Parsing:** In-browser text extraction up to 10 MB with scanned document detection.
* **Executive Summary & Structured Notes:** Clean bulleted revision summaries.
* **Interactive Spaced Repetition Flashcards:** Flip-to-reveal question/answer cards.
* **Practice Exam Generator:** Exam questions with model solutions.
* **One-Click Export:** Download synthesized revision notes as `.txt` files or copy to clipboard.

### ⏰ 5. Timetable & Room Locator
* **Weekly Schedule Matrix:** Monday through Sunday slot allocations.
* **Room & Professor Directory:** Quick access to lecture halls and faculty info.
* **Time Conflict & Overlap Protection:** Detects conflicting time slots with intentional confirmation overrides.

### 📢 6. Campus Deadlines & Noticeboard
* **Deadline Tracking:** Tracks assignment submissions, lab practicals, and hackathons.
* **Urgency & Overdue Highlights:** Visual color-coded indicators for upcoming or missed deadlines.
* **Transparent Labeling:** Distinguishes simulated demo alerts from personal student entries.

### ⚙️ 7. Settings, Theme & Data Portability
* **Dark / Light Mode:** High-contrast Tailwind styling.
* **JSON Export & Import:** Full snapshot export and validated import.
* **One-Click Demo Reset:** Easily restores the initial 2nd-year engineering sample dataset.

---

## 3. Technology Stack

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts.
* **Backend:** Node.js, Express, TypeScript (`tsx`).
* **AI Engine:** `@google/genai` TypeScript SDK (Server-Side with `gemini-3.8-flash`).
* **PDF Extraction:** `pdfjs-dist`.
* **Persistence:** Versioned LocalStorage with defensive JSON validation.

---

## 4. Project Structure

```
smartcampus-ai/
├── server.ts                    # Express server with Gemini API proxy & Vite middleware
├── index.html                   # HTML entry point with synchronized SEO meta tags
├── metadata.json                # Project capabilities & permissions
├── package.json                 # Dependencies and scripts (dev, build, test, lint)
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS v4
├── .env.example                 # Example environment variables
├── src/
│   ├── main.tsx                 # React DOM root entry
│   ├── App.tsx                  # Main app container & router
│   ├── index.css                # Global stylesheet & Tailwind CSS import
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces and domain models
│   ├── utils/
│   │   ├── attendance.ts        # Pure attendance mathematical formulas & validation
│   │   ├── scheduler.ts         # Deterministic workload allocation algorithm
│   │   ├── storage.ts           # LocalStorage helpers, seed data, & JSON import/export
│   │   └── pdfExtractor.ts      # Digital PDF text parsing utility
│   ├── services/
│   │   └── api.ts               # Client-to-server API client with offline fallbacks
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky top navigation with theme toggle & API status
│   │   ├── Sidebar.tsx          # Responsive navigation sidebar
│   │   ├── Modal.tsx            # Accessible modal container
│   │   ├── Toast.tsx            # Context-based notification toast system
│   │   ├── AuthModal.tsx        # Session selector (Demo Student vs Custom Profile)
│   │   └── DemoGuideModal.tsx   # Hackathon 7-step walkthrough modal for judges
│   ├── pages/
│   │   ├── WelcomeLanding.tsx   # Project introduction & feature breakdown
│   │   ├── Dashboard.tsx        # Semester analytics, Recharts graph, today's schedule
│   │   ├── StudyAssistant.tsx   # Dual-layer AI Study Chat with Gemini
│   │   ├── AttendanceCalculator.tsx # Attendance manager & What-If Simulator
│   │   ├── StudyPlanner.tsx     # Calendar workload planner & AI optimization
│   │   ├── NotesSummarizer.tsx  # Lecture notes analyzer & flashcards
│   │   ├── TimetableManager.tsx # Weekly timetable with conflict detection
│   │   ├── AnnouncementsDeadlines.tsx # Deadlines & notices hub
│   │   └── Settings.tsx         # User preferences & JSON import/export
│   └── test/
│       └── runner.ts            # Automated unit tests for business logic
```

---

## 5. Prerequisites

* **Node.js:** v18.0.0 or higher.
* **npm:** v9.0.0 or higher.

---

## 6. Installation & Setup

1. **Clone or Download the Project:**
   ```bash
   cd smartcampus-ai
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```
   *(Note: SmartCampus AI will function in Demo/Offline mode even without an API key).*

---

## 7. Running the Application

### Development Mode (Full-Stack)
Runs the Express backend proxy and Vite dev server concurrently:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Automated Unit Tests
Executes the comprehensive automated test suite testing attendance math, scheduling logic, and JSON validation:
```bash
npm test
```

### Production Build
Builds the client bundle for production deployment:
```bash
npm run build
npm start
```

---

## 8. Security & Privacy Notes

* **Zero Plaintext Passwords:** Honest authentication mode avoids fake security mocks.
* **Server-Side API Proxy:** The browser never touches `process.env.GEMINI_API_KEY`. All Gemini requests pass through `server.ts` with input validation and rate protection.
* **Client-Side Sandbox:** Student academic records are stored strictly within the user's browser via LocalStorage.

---

## 9. Hackathon Demonstration Walkthrough (For Judges)

1. **Launch App:** Open the dashboard to see preloaded 2nd-year engineering student sample data (Alex Chen, 4th Sem CSE).
2. **Click "Demo Guide":** Click the `?` icon in the top right navbar to open the interactive walkthrough.
3. **Attendance Math:** Navigate to **Attendance Calculator**. Observe that *Operating Systems* is at 67.86% and indicates 8 consecutive classes are required. Use the **What-If Simulator** sliders to see numbers adjust in real time.
4. **Study Planner:** Navigate to **Study Planner**. View the 7-day workload distribution that respects the 4-hour daily limit.
5. **Notes & Flashcards:** Open **Notes Summarizer** and review the synthesized B-Trees lecture note. Click the flashcards to flip and test active recall.
6. **Dual-Layer Assistant:** Open **AI Study Assistant** and ask a question (e.g., *"Explain LRU page replacement algorithm"*).
7. **Offline Persistence Test:** Add a class or task, refresh your browser, and verify that your changes persist.
