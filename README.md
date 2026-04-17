# Career Covered - Cover Letter Creator

Career Covered is a smart, fast, and automated cover letter generator built with React, Vite, Tailwind CSS, and powered by Groq's high-performance LLM APIs. 

It takes your existing cover letter template and a job description, then intelligently tailors the cover letter specifically for that role. It strictly preserves your tone, style, and structure while updating the targeted skills, company values, and position details.

## Features
- 🚀 **Lightning Fast:** Generates tailored cover letters in seconds.
- 🎨 **Sleek UI:** Modern, responsive design that fits comfortably on one screen.
- 🤖 **Multiple AI Models:** Choose between LLama 3.3 70B, Llama 3.1 8B, and Mixtral 8x7B.
- 🛠️ **Deep Customization:** 
    - **Limit Words**: Set strict word counts (50-1000 words).
    - **Minimal Changes**: Toggle between "Strictly template-based" or "Creative professional" tone.
    - **Custom Prompt**: Add your own specific instructions for each generation.
- 📂 **Export Options**: Download as professionally formatted PDF or Word (.docx) files.

## Data Privacy & Security
- 🔒 **Client-Side Only**: Your data never touches our servers. There is no backend or database.
- 🔑 **API Keys**: Stored securely in your browser's local storage and sent directly to Groq.
- 📝 **Input Data**: Job descriptions and custom prompts are in-memory only and lost on page refresh.

## How to Use
1. Obtain an API Key from [Groq](https://console.groq.com/keys).
2. Click the `Update API Key` (key icon) button at the bottom left.
3. Select your preferred AI Model. 
4. Paste your **Cover Letter Template** and the **Job Description**.
5. (Optional) Click **"Customize More"** to set word limits or add custom instructions.
6. Click **"Generate Cover Letter"**.
7. Review and Download as PDF/Word or copy to clipboard!

## Development
This project follows a modular, scalable architecture:
- **Modals**: Centralized components in `src/components/Modals/`.
- **Hooks**: Shared logic located in top-level `src/hooks/`.
- **Utils**: Helper functions grouped by responsibility (API, Prompts, Models).

### How to Run Locally
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

## How to Test It
1. **Manual User Testing:** Verify core logic by providing dummy inputs and observing the AI's adherence to rules.
2. **Type Checking:** Run `npm run build` to verify TypeScript integrity and production bundle readiness.
