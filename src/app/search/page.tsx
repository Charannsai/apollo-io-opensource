"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/common/page-header";
import {
  Search,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  key: string;
  question: string;
}

interface Answer {
  question: string;
  answer: string;
}

interface AnalyzedQuery {
  role: string | null;
  experience: string | null;
  location: string | null;
  industry: string | null;
  companyType: string | null;
  contactPerson: string | null;
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [step, setStep] = useState<"input" | "questions" | "complete" | "scraping">("input");
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  
  const [analyzedQuery, setAnalyzedQuery] = useState<AnalyzedQuery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const examples = [
    "I want to apply for remote Software Engineer jobs with 2 years experience (I am from India)",
    "Find early-stage AI startups hiring full-stack engineer contractors",
    "Find founders building SaaS products in Europe to pitch my React Native dev services",
  ];

  const handleStartSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/search/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      
      if (!res.ok) throw new Error("Failed to analyze query");
      
      const data = await res.json();
      setAnalyzedQuery(data.analyzedQuery);
      
      if (data.isComplete || data.followUpQuestions.length === 0) {
        setStep("complete");
      } else {
        setQuestions(data.followUpQuestions);
        setCurrentQIndex(0);
        setStep("questions");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Failed to connect to the analysis engine. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim()) return;

    const newAnswers = [
      ...answers,
      { question: questions[currentQIndex].question, answer: currentAnswer }
    ];
    setAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      // Re-evaluate with all answers
      setIsLoading(true);
      try {
        const res = await fetch("/api/search/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, answers: newAnswers }),
        });
        
        if (!res.ok) throw new Error("Failed to re-analyze query");
        
        const data = await res.json();
        setAnalyzedQuery(data.analyzedQuery);
        
        if (data.isComplete || data.followUpQuestions.length === 0) {
          setStep("complete");
        } else {
          setQuestions(data.followUpQuestions);
          setCurrentQIndex(0);
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Failed to update query analysis. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTriggerScraping = async () => {
    setStep("scraping");
    setScrapeProgress("Initializing Apify scrapers...");
    
    try {
      // 1. Create Session
      const sessionRes = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: analyzedQuery?.role 
            ? `${analyzedQuery.role} Outreach (${analyzedQuery.location || "Remote"})`
            : "Conversational Search Outreach",
          searchQuery: query + (answers.length > 0 ? "\n\nFollow-up Details:\n" + answers.map(a => `- ${a.question}: ${a.answer}`).join("\n") : ""),
          description: `Discovered leads for ${analyzedQuery?.role} matching location: ${analyzedQuery?.location || "Remote"}.`
        }),
      });
      
      if (!sessionRes.ok) throw new Error("Failed to create session");
      const session = await sessionRes.json();
      
      // 2. Trigger scraping route which generates qualified leads
      setScrapeProgress("Connecting with Apify to discover candidates...");
      const scrapeRes = await fetch("/api/search/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          analyzedQuery
        })
      });
      
      if (!scrapeRes.ok) throw new Error("Failed to fetch leads");
      const scrapeData = await scrapeRes.json();
      
      setScrapeProgress(`AI qualifying ${scrapeData.count} leads...`);
      // 3. Qualify leads
      await fetch("/api/search/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          analyzedQuery
        })
      });
      
      router.push(`/sessions/${session.id}`);
    } catch (e) {
      console.error(e);
      setErrorMsg("An error occurred during discovery. Moving to session page.");
      // Redirect anyway so the user can inspect the session
      setTimeout(() => router.push("/sessions"), 2000);
    }
  };

  const handleReset = () => {
    setQuery("");
    setAnswers([]);
    setQuestions([]);
    setCurrentQIndex(0);
    setStep("input");
    setErrorMsg("");
    setAnalyzedQuery(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="AI Search Workspace"
        description="Launch tailored campaigns with natural language searches"
      />

      <AnimatePresence mode="wait">
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 mt-8"
          >
            <form onSubmit={handleStartSearch} className="space-y-3">
              <div className="relative">
                <Sparkles className="absolute left-4 top-4 w-5 h-5 text-accent-500" />
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tell OutReach AI who or what opportunities you want to search..."
                  rows={4}
                  className={cn(
                    "w-full pl-12 pr-4 py-3 rounded-2xl text-sm border-2 transition-all duration-200 resize-none",
                    "bg-surface border-border text-text-primary placeholder:text-text-tertiary",
                    "focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10",
                    "shadow-sm"
                  )}
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-text-tertiary">
                  Press Enter to submit
                </p>
                <button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                    "bg-accent-500 text-white hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-50 text-danger-600 dark:bg-danger-900/10 dark:text-danger-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Examples */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Example Searches
              </h3>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(ex)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-xl border text-xs text-text-secondary transition-all",
                      "bg-surface border-border hover:bg-surface-hover hover:border-accent-500/30"
                    )}
                  >
                    &ldquo;{ex}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 mt-8"
          >
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span>Clarification Questions</span>
              <span>
                {currentQIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-accent-500/20 bg-accent-50/5 dark:bg-accent-900/5">
              <div className="flex gap-2 text-sm text-text-primary font-medium">
                <HelpCircle className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                <span>{questions[currentQIndex]?.question}</span>
              </div>
            </div>

            <form onSubmit={handleAnswerSubmit} className="space-y-3">
              <input
                type="text"
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className={cn(
                  "w-full px-4 py-3 rounded-xl text-sm border-2 transition-all duration-200",
                  "bg-surface border-border text-text-primary placeholder:text-text-tertiary",
                  "focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10"
                )}
                autoFocus
              />

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
                >
                  Restart Search
                </button>
                <button
                  type="submit"
                  disabled={!currentAnswer.trim() || isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors"
                >
                  {isLoading ? "Updating..." : "Next Question"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 mt-8"
          >
            <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-2xl bg-surface-secondary">
              <CheckCircle className="w-10 h-10 text-success-500 mb-3" />
              <h3 className="text-base font-semibold text-text-primary mb-1">
                Target Profile Complete
              </h3>
              <p className="text-xs text-text-secondary text-center max-w-sm">
                We gathered enough variables to configure our Apify target query
                and Gemini qualification profile.
              </p>
            </div>

            {/* Analyzed details */}
            <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Configured search parameters
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-text-tertiary">Target Role</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {analyzedQuery?.role || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Experience required</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {analyzedQuery?.experience || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Location preference</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {analyzedQuery?.location || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Industry</span>
                  <p className="font-semibold text-text-primary mt-0.5">
                    {analyzedQuery?.industry || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
              >
                Reset Search
              </button>
              <button
                onClick={handleTriggerScraping}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-accent-500 text-white hover:bg-accent-600 transition-colors"
              >
                Start Lead Generation
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "scraping" && (
          <motion.div
            key="scraping"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 mt-8 space-y-4"
          >
            <RefreshCw className="w-10 h-10 text-accent-500 animate-spin" />
            <h3 className="text-base font-semibold text-text-primary">
              Discovering Opportunities
            </h3>
            <p className="text-sm text-text-secondary animate-pulse-subtle">
              {scrapeProgress}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
