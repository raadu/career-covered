# Career Covered - AI-Powered Cover Letter Generator

Career Covered is a high-performance, privacy-centric automated cover letter generator. Built with React, Vite, and Tailwind CSS, it leverages the Groq Cloud API to deliver tailored professional documents in seconds.

The application intelligently adapts your existing cover letter templates to specific job descriptions, maintaining your unique professional voice while optimizing for role-specific keywords and requirements.

## Features

- **High-Performance AI:** Powered by Groq's high-throughput LLM APIs, supporting Llama 3.3 70B, Llama 3.1 8B, and Mixtral 8x7B.
- **Privacy First:** Client-side architecture ensures your data never touches a backend. API keys and templates are stored locally in your browser.
- **Intelligent Tailoring:** Preserves original tone and structure while dynamically updating skills, company values, and role details.
- **Advanced Customization:**
    - **Word Count Management:** Precise control over output length (50-1000 words).
    - **Tone Control:** Toggle between "Strictly template-based" and "Creative professional" modes.
    - **Custom Prompting:** Direct instruction injection for specific generation requirements.
- **Professional Export:** Instant downloads available in professionally formatted PDF and Word (.docx) formats.
- **Guided Onboarding:** Streamlined setup flow for API keys, including a detailed technical guide for all users.
- **Social Integration:** Fully optimized for professional sharing with Open Graph and Twitter metadata.

## Technology Stack

- **Frontend:** React 19, TypeScript
- **State Management:** Redux Toolkit
- **Routing:** HashRouter for robust environment-agnostic navigation
- **Styling:** Tailwind CSS
- **Performance:** Vite
- **AI Integration:** Groq Cloud API

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- Docker (optional, for containerized deployment)

### Local Development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/raadu/career-covered.git
   cd career-covered
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```

### Docker Deployment
1. **Build and start containers:**
   ```bash
   docker compose up --build
   ```
2. **Access the application:** Navigate to `http://localhost:8080`.

## Testing and Quality Assurance

We utilize a comprehensive testing suite to ensure application stability:

- **Unit & Component Testing:** Vitest and React Testing Library
  ```bash
  npm run test
  ```
- **End-to-End Testing:** Playwright
  ```bash
  npm run test:e2e
  ```
- **Static Analysis:** ESLint and TypeScript build checks
  ```bash
  npm run lint
  npm run build
  ```

## Security and Privacy

- **No Backend:** This is a purely static frontend application.
- **Local Storage:** Sensitive information (API keys) remains in your browser's local storage.
- **Zero Data Retention:** Input data (job descriptions) is processed in-memory and never persisted.

---
Built for professionals seeking an edge in their career journey.
