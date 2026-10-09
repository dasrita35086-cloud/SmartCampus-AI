import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Middleware
app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'SmartCampus AI',
    hasApiKey: !!ai,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Supported fallback model candidates in priority order
// gemini-3.1-flash-lite is high-speed and accessible; gemini-3.8-flash provides depth; gemini-flash-latest is secondary alias
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

interface GeminiCallPayload {
  contents: any;
  config?: any;
}

/**
 * Checks if the error represents permanent or daily quota exhaustion for this specific model,
 * where immediate failover to another candidate model is required rather than waiting.
 */
function isDailyQuotaError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || error || '').toLowerCase();
  const details = JSON.stringify(error.details || error.response?.data || '').toLowerCase();
  return (
    msg.includes('free_tier_requests') ||
    msg.includes('generaterequestsperday') ||
    msg.includes('retry in') ||
    msg.includes('resource_exhausted') ||
    details.includes('generaterequestsperday') ||
    details.includes('quota exceeded') ||
    (error.status === 429 && msg.includes('quota'))
  );
}

/**
 * Checks if the error is temporary/transient (e.g., 503 UNAVAILABLE, high demand, temporary 429 RPM, 5xx server errors).
 */
function isTransientError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.statusCode || error.response?.status;
  if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) {
    return true;
  }
  const msg = String(error.message || error).toLowerCase();
  return (
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('high demand') ||
    msg.includes('temporarily') ||
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('overloaded') ||
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('socket hang up')
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiWithRetryAndFallback(payload: GeminiCallPayload) {
  if (!ai) {
    const error: any = new Error(
      'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in the environment secrets.'
    );
    error.status = 503;
    error.retryable = false;
    throw error;
  }

  const maxRetriesPerModel = 3;
  const attemptedModels: string[] = [];
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    attemptedModels.push(model);
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        const startTime = Date.now();
        console.log(`[AI Diagnostics ${new Date().toISOString()}] Attempting model "${model}" (Attempt ${attempt}/${maxRetriesPerModel})...`);

        const response = await ai.models.generateContent({
          model,
          contents: payload.contents,
          config: payload.config,
        });

        const elapsed = Date.now() - startTime;
        console.log(`[AI Diagnostics] Model "${model}" completed successfully in ${elapsed}ms.`);

        return {
          response,
          modelUsed: model,
          wasFallback: model !== CANDIDATE_MODELS[0],
          attempt,
        };
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.statusCode || 500;
        const rawMsg = err instanceof Error ? err.message : String(err);
        // Log diagnostic without exposing sensitive tokens or internal keys
        const safeSnippet = rawMsg.slice(0, 200).replace(/key=[^&\s]+/gi, 'key=REDACTED');
        console.warn(`[AI Diagnostics Warning] Model "${model}" attempt ${attempt} failed (Status: ${status}): ${safeSnippet}`);

        // If this model has exhausted daily quota or is permanently unavailable to this key,
        // do not waste retries with sleep on the same dead model; failover immediately to the next candidate model
        if (isDailyQuotaError(err)) {
          console.log(`[AI Diagnostics] Model "${model}" has exceeded quota limit. Immediate failover to next model in cluster...`);
          break;
        }

        // If transient (503 high demand, temporary rate limit, network blip), retry with exponential backoff + jitter up to 3 times
        if (isTransientError(err) && attempt < maxRetriesPerModel) {
          const baseDelay = 1000 * Math.pow(2, attempt - 1); // 1000ms, 2000ms
          const jitter = Math.random() * 300;
          const delay = Math.min(baseDelay + jitter, 4000);
          console.log(`[AI Diagnostics] Transient 503/429/timeout encountered on "${model}". Retrying in ${Math.round(delay)}ms...`);
          await sleep(delay);
          continue;
        }

        // If retries for this model are exhausted, move to the next model
        if (model !== CANDIDATE_MODELS[CANDIDATE_MODELS.length - 1]) {
          console.log(`[AI Diagnostics] Model "${model}" exhausted attempts. Failing over to alternative model in cluster...`);
        }
        break;
      }
    }
  }

  // If all models failed
  const failError: any = new Error(
    `AI Service is temporarily unavailable due to high demand across all model clusters (${attemptedModels.join(', ')}). Please retry shortly or use the local academic engine.`
  );
  failError.status = lastError?.status === 429 ? 429 : 503;
  failError.retryable = true;
  failError.attemptedModels = attemptedModels;
  throw failError;
}

// Centralized error responder
function handleAiError(error: any, res: Response) {
  const status = error.status || error.statusCode || 500;
  const errorMessage = error instanceof Error ? error.message : 'Unknown AI service error';
  return res.status(status).json({
    success: false,
    error: errorMessage,
    status,
    retryable: error.retryable !== false,
    modelsAttempted: error.attemptedModels || CANDIDATE_MODELS,
    fallbackAvailable: true,
  });
}

// 1. AI Study Assistant Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { question, subject, mode = 'balanced', history = [] } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ success: false, error: 'Question is required.' });
    }

    const systemInstruction = `You are SmartCampus AI, an empathetic, highly knowledgeable university study assistant for engineering and college students.
Subject context: ${subject || 'General Academic Studies'}.
Style instruction:
1. Provide a "simpleExplanation": an intuitive 2-4 sentence high-level explanation that breaks down the concept simply with analogies.
2. Provide a "detailedExplanation": an in-depth, rigorous academic breakdown with key steps or formulas.
3. Provide 2-3 concrete "examples" or applications.
4. Provide 2-3 "practiceQuestions" with short hints to help the student test their understanding.
Format your entire output strictly as valid JSON matching this structure:
{
  "simpleExplanation": "...",
  "detailedExplanation": "...",
  "examples": ["...", "..."],
  "practiceQuestions": ["...", "..."]
}`;

    const contents = [
      ...history.slice(-4).map((h: any) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text || '' }],
      })),
      {
        role: 'user',
        parts: [{ text: `Subject: ${subject || 'General'}\nMode: ${mode}\nQuestion: ${question}` }],
      },
    ];

    const result = await callGeminiWithRetryAndFallback({
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        simpleExplanation: responseText,
        detailedExplanation: '',
        examples: [],
        practiceQuestions: [],
      };
    }

    return res.json({
      success: true,
      data: parsedData,
      model: result.modelUsed,
      wasFallback: result.wasFallback,
    });
  } catch (error) {
    return handleAiError(error, res);
  }
});

// 2. Notes Summarizer Endpoint
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  try {
    const { text, title, subject } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least 20 characters of study notes to summarize.',
      });
    }

    const systemInstruction = `You are SmartCampus AI Lecture & Notes Analyzer.
Analyze the provided lecture notes/study material for the subject: ${subject || 'Engineering Course'}.
Produce:
1. "summary": A concise executive summary (3-5 sentences).
2. "detailedNotes": Structured study notes with bullet points and clear sections.
3. "keyConcepts": List of 4 to 8 primary concepts/terms defined.
4. "keyPoints": List of 5 to 10 crucial exam takeaways or principles.
5. "practiceQuestions": 3-5 exam-style questions with comprehensive solutions.
6. "flashcards": 4-8 question/answer pairs for spaced repetition.
Format your response strictly as valid JSON matching:
{
  "summary": "...",
  "detailedNotes": "...",
  "keyConcepts": ["...", "..."],
  "keyPoints": ["...", "..."],
  "practiceQuestions": [{"question": "...", "answer": "..."}],
  "flashcards": [{"front": "...", "back": "..."}]
}`;

    const result = await callGeminiWithRetryAndFallback({
      contents: `Title: ${title || 'Lecture Material'}\nText Content:\n${text.slice(0, 30000)}`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text || '{}';
    const parsedData = JSON.parse(responseText);

    return res.json({
      success: true,
      data: parsedData,
      model: result.modelUsed,
      wasFallback: result.wasFallback,
    });
  } catch (error) {
    return handleAiError(error, res);
  }
});

// 3. AI Study Planner Optimization Endpoint
app.post('/api/ai/planner', async (req: Request, res: Response) => {
  try {
    const { tasks, availableDailyHours, studentTarget } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one study task is required.' });
    }

    const systemInstruction = `You are an expert academic time-management optimizer.
A student has provided a list of study tasks/assignments/exams with deadlines, priorities, and estimated hours.
The student has ${availableDailyHours || 4} available study hours per day.
Goal: ${studentTarget || 'Master all subjects before exam deadlines with balanced daily cognitive load'}.

Optimize the schedule by distributing tasks across the upcoming 7 to 14 days.
Rules:
- Never exceed daily available hours unless absolutely unavoidable.
- Higher priority and earlier deadline tasks should be scheduled earlier.
- Break large tasks into realistic sub-blocks if needed.
- Return an array of daily schedules.

Response strictly as JSON:
{
  "recommendations": "2-3 sentences of overall strategic advice",
  "schedule": [
    {
      "dayOffset": 0,
      "dateLabel": "Day 1 (Today)",
      "totalHours": 3.5,
      "tasks": [
        {
          "taskId": "...",
          "subject": "...",
          "topic": "...",
          "allocatedHours": 2,
          "focusGoal": "..."
        }
      ]
    }
  ]
}`;

    const result = await callGeminiWithRetryAndFallback({
      contents: JSON.stringify({ tasks, availableDailyHours, studentTarget }),
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text || '{}';
    const parsedData = JSON.parse(responseText);

    return res.json({
      success: true,
      data: parsedData,
      model: result.modelUsed,
      wasFallback: result.wasFallback,
    });
  } catch (error) {
    return handleAiError(error, res);
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SmartCampus AI Server] Running on http://localhost:${PORT}`);
    console.log(`[AI Status] Gemini Client: ${ai ? 'Connected' : 'Missing/Pending API Key'}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Start Failure]', err);
  process.exit(1);
});
