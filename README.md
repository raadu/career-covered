# Career Covered - Cover Letter Creator

Career Covered is a smart, fast, and automated cover letter generator built with React, Vite, Tailwind CSS, and powered by Groq's high-performance LLM APIs. 

It takes your existing cover letter template and a job description, then intelligently tailors the cover letter specifically for that role. It strictly preserves your tone, style, and structure while updating the targeted skills, company values, and position details.

## 🌟 Features
- 🚀 **Lightning Fast:** Generates tailored cover letters in seconds.
- 🎨 **Sleek UI:** Modern, responsive design with glassmorphism and subtle animations.
- 🤖 **Multiple AI Models:** Choose between LLama 3.3 70B, Llama 3.1 8B, and Mixtral 8x7B.
- 🛠️ **Deep Customization:** 
    - **Limit Words**: Set strict word counts (50-1000 words).
    - **Minimal Changes**: Toggle between "Strictly template-based" or "Creative professional" tone.
    - **Custom Prompt**: Add your own specific instructions for each generation.
- 🎓 **Smart Onboarding**: A dual-view onboarding flow that guides new users through setting up their API keys, with a "Detailed Guide" for those who need extra help.
- 📂 **Export Options**: Download as professionally formatted PDF or Word (.docx) files.

## 🔒 Data Privacy & Security
- **Client-Side Only**: Your data never touches our servers. There is no backend or database.
- **API Keys**: Stored securely in your browser's local storage and sent directly to Groq.
- **Input Data**: Job descriptions and custom prompts are in-memory only and lost on page refresh.

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) (Recommended)
- OR [Node.js](https://nodejs.org/) (v20 or higher)

### Run with Docker (Fastest)
The project is fully dockerized for easy setup.
1. **Clone the repository:**
   ```bash
   git clone https://github.com/raadu/career-covered.git
   cd career-covered
   ```
2. **Start the app:**
   ```bash
   docker compose up --build
   ```
3. **Open your browser:** Navigate to `http://localhost:8080`.

### Run Locally
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start development server:**
   ```bash
   npm run dev
   ```

## 🧪 Testing & Quality
We maintain high standards through comprehensive testing:

- **Unit & Component Tests**: Powered by **Vitest** and **React Testing Library**.
  ```bash
  npm run test
  ```
- **End-to-End (E2E) Tests**: Powered by **Playwright**.
  ```bash
  npx playwright install # First time only
  npm run test:e2e
  ```
- **Linting & Type Checking**:
  ```bash
  npm run lint
  npm run build # Performs full TypeScript check
  ```

## 🛠️ Project Structure
This project follows a modular, scalable architecture:
- **`src/components/Modals`**: Centralized, view-based modal components.
- **`src/store`**: Redux Toolkit for state management (API keys, generator settings).
- **`src/hooks`**: Custom React hooks for business logic and clipboard actions.
- **`src/utils`**: Specialized utilities for AI prompting, file generation, and model configurations.

---
Built with ❤️ for career seekers.
