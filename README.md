# AI-Powered Assessment Recommendation Engine

An intelligent system that analyzes job descriptions and recommends the most relevant SHL skill assessments using advanced NLP and semantic similarity matching.

## Features

- **Smart Job Analysis**: Processes job descriptions and LinkedIn URLs to extract key requirements
- **AI-Powered Matching**: Uses sentence transformers and vector similarity to find relevant assessments
- **Real-time Recommendations**: Fast processing with immediate results and progress feedback
- **Clean Interface**: Intuitive web UI with assessment details and direct SHL links
- **Comprehensive Catalog**: Access to 138+ SHL assessments across various skill categories

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with serverless functions
- **AI/ML**: Xenova Transformers, OpenAI/Groq SDK for embeddings and reranking
- **Data**: CSV-based assessment catalog with vector storage

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create `.env.local` with your API keys:
   ```
   OPENAI_API_KEY=your_openai_key
   GROQ_API_KEY=your_groq_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Paste a job description or LinkedIn job URL into the text area
2. Click "Recommend Assessments" to analyze the content
3. View AI-generated recommendations with relevance scores
4. Click through to SHL for detailed assessment information

## Project Structure

```
├── app/
│   ├── api/recommend/     # Main recommendation API endpoint
│   ├── page.tsx          # Main UI component
│   └── layout.tsx        # App layout and styling
├── data/
│   └── shl.csv          # SHL assessment catalog
├── lib/
│   └── assessmentStore.ts # Data processing and ML logic
└── requirements.md       # Detailed project requirements
```

## API Endpoints

- `POST /api/recommend` - Generate assessment recommendations from job descriptions

## Development

The app uses a progressive loading system that initializes the ML model and processes the assessment catalog on first use. Subsequent requests are much faster due to caching.

For detailed technical specifications, see `design.md` and `requirements.md`.
