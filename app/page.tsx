"use client";

import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

type Assessment = {
  "Assessment Name": string;
  "Duration": string;
  "Test Type": string;
  "Adaptive/IRT": string;
  "Remote Testing": string;
  "URL": string;
};

const LOADING_STEPS = [
  "🔹 Loading embedding model...",
  "🔹 Reading CSV...",
  "🔹 Loaded 138 assessments",
  "🔹 Generating embeddings (one-time)...",
  "✅ Assessment store ready",
  "Finding best-matched assessments…"
];

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Assessment[]>([]);
  const [error, setError] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (loading && isFirstLoad) {
      // Simulate progress through loading steps
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < LOADING_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 2000); // Change step every 2 seconds
    } else if (loading && !isFirstLoad) {
      // On subsequent loads, show final step immediately
      setLoadingStep(LOADING_STEPS.length - 1);
    }

    return () => clearInterval(interval);
  }, [loading, isFirstLoad]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: input }),
      });
      if (!res.ok){
        const text = await res.text();
        throw new Error(text || "Something went wrong")
      }

      const data = await res.json();
      setResults(data.recommendations || []);
      if (data.wasFirstLoad) {
        setIsFirstLoad(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <Snowfall color="#82C3D9" />
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900">
          Assessment Recommendation Engine
        </h1>
        <p className="mt-2 text-gray-600">
          Paste a job description or LinkedIn job URL to get the most relevant
          SHL assessments.
        </p>

        {/* Input Card */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste job description or LinkedIn job URL here..."
            className="h-32 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 inline-flex items-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Recommend Assessments"}
          </button>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* Loading Status with Progressive Steps */}
        {loading && (
          <div className="mt-6 rounded-xl bg-blue-50 border border-blue-200 p-5">
            <div className="space-y-2">
              {LOADING_STEPS.slice(0, loadingStep + 1).map((step, idx) => (
                <div 
                  key={idx}
                  className={`text-sm transition-opacity duration-300 ${
                    idx === loadingStep 
                      ? 'text-blue-700 font-medium' 
                      : 'text-blue-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mt-10 space-y-4">
          {!loading && results.length === 0 && !error && (
            <p className="text-sm text-gray-500">
              No recommendations yet.
            </p>
          )}

          {results.map((a, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {a["Assessment Name"]}
              </h3>

              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                <span>⏱ Duration: {a.Duration}</span>
                <span>🧪 Test Type: {a["Test Type"]}</span>
                <span>📊 Adaptive/IRT: {a["Adaptive/IRT"]}</span>
                <span>🌍 Remote: {a["Remote Testing"]}</span>
              </div>

              <a
                href={a.URL}
                target="_blank"
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View on SHL →
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
