# Career Covered - Cover Letter Creator

Career Covered is a smart, fast, and automated cover letter generator built with React, Vite, Tailwind CSS, and powered by Groq's high-performance LLM APIs. 

It takes your existing cover letter template and a job description, then intelligently tailors the cover letter specifically for that role. It strictly preserves your tone, style, and structure while updating the targeted skills, company values, and position details.

## Features
- 🚀 **Lightning Fast:** Generates tailored cover letters in seconds.
- 🎨 **Sleek UI:** Modern, responsive design that fits comfortably on one screen.
- 🤖 **Multiple AI Models:** Choose between LLama 3.3 70B, Llama 3.1 8B, and Mixtral 8x7B.

## How to Use
1. Obtain an API Key from [Groq](https://console.groq.com/keys).
2. Click the `Update API Key` (key icon) button at the bottom left of the app, paste your key, and click "Done".
3. Select your preferred AI Model from the dropdown. 
4. Expand the **"Your Cover Letter Template"** section and paste your standard cover letter.
5. Expand the **"Job Description"** section and paste the details of the job you're applying for.
6. Click **"Generate Cover Letter"**.
7. Review your tailored cover letter on the right panel and click the Copy icon to copy it to your clipboard!

## How to Run the System Locally
To run this application on your own machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/raadu/career-covered.git
   cd career-covered
   ```

2. **Install dependencies:**
   Make sure you have [Node.js](https://nodejs.org/) installed, then run:
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Open your browser:**
   Navigate to the URL provided in your terminal (typically `http://localhost:5173/`).

## How to Test It
Since the application relies primarily on manual visual testing and third-party API integration, the best way to test the core logic is:
1. **Manual User Testing:** Follow the "How to Use" steps above using the local development server. Provide a dummy job description and template to observe how the AI processes the rules and generates the output.
2. **Linting and Type Checking:** You can run the built-in linters and TypeScript compiler checks to ensure code quality and catch type errors:
   ```bash
   npm run lint
   npm run build
   ```
There is currently no automated unit testing suite (like Jest or Vitest) configured. Future test additions would include unit tests for `src/utils/promptUtils.ts` and integration tests for component rendering.
