const axios = require('axios');
const { env } = require('../../../config/env');

const GEMMA_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-2.5-pro:generateContent';

const DEFAULT_SYSTEM_PROMPT = 
  "You are Swasthya, a warm and empathetic voice assistant for mental wellbeing support. " +
  "Respond like a caring friend — acknowledge feelings, ask thoughtful follow-up questions, and offer gentle suggestions. " +
  "Keep responses to 2-3 conversational sentences. Be genuine and human-like, not robotic. " +
  "Do NOT include bullet points, numbered lists, asterisks, or formatting. " +
  "Avoid clinical diagnosis. If the caller mentions self-harm or danger, " +
  "gently encourage them to contact emergency services or a trusted person. " +
  "Output ONLY your spoken reply, nothing else.";

const MAX_RETRIES = 0;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class GemmaService {
  getApiKey() {
    const apiKey = env.gemma?.key || env.gemini?.key || process.env.GEMMA_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMMA_API_KEY or GEMINI_API_KEY environment variable.");
    }
    return apiKey;
  }

  async requestCompletion(contents, options = {}) {
    const apiKey = this.getApiKey();

    const payload = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.5,
        maxOutputTokens: options.maxTokens ?? 250,
      }
    };

    if (options.systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: options.systemInstruction }]
      };
    }

    if (options.responseMimeType) {
      payload.generationConfig.responseMimeType = options.responseMimeType;
    }

    let lastError;
    const modelToUse = 'gemini-2.5-flash-lite';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Gemma retry attempt ${attempt}/${MAX_RETRIES} using model ${modelToUse}`);
          await sleep(RETRY_DELAY_MS * attempt);
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;
        const response = await axios.post(url, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error("Gemma returned an empty response.");
        }

        return rawText.trim();
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const errData = err.response?.data;
        const errMsg = errData?.error?.message || err.message || '';

        console.error(
          `Gemma request failed (attempt ${attempt + 1}): status=${status}, message=${errMsg.slice(0, 300)}`
        );

        // 429 Quota Self-Healing: Parse exact lock window remaining and sleep dynamically if short!
        if (status === 429) {
          const match = errMsg.match(/Please retry in (\d+\.?\d*)s/);
          if (match) {
            const waitSeconds = parseFloat(match[1]);
            const sleepMs = Math.ceil((waitSeconds * 1000) + 750); // wait exact time + 750ms safe buffer
            
            if (sleepMs <= 6500) {
              console.warn(`[RATE_LIMIT] ⚠️ Gemma rate limited. Sleep of ${sleepMs}ms is short enough. Sleeping to clear rate limit dynamically...`);
              await sleep(sleepMs);
              attempt = 0; // Reset attempts to try immediately after wait window
              continue;
            } else {
              console.warn(`[RATE_LIMIT] ⚠️ Gemma rate limit sleep of ${sleepMs}ms is too long for Twilio (max 6.5s). Throwing immediately to trigger polite retry prompt.`);
              throw err;
            }
          }
        }

        if (status && status !== 429 && status < 500) {
          throw err;
        }
      }
    }

    throw lastError;
  }

  async generateReply(userText, history = [], language = 'en') {
    // Map standard history array [{role, content}] to Gemma's format [{role, parts: [{text}]}]
    const contents = Array.isArray(history) ? history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || '' }]
    })) : [];

    contents.push({
      role: 'user',
      parts: [{ text: userText }]
    });

    let systemInstruction = DEFAULT_SYSTEM_PROMPT;
    if (language === 'kn') {
      systemInstruction += "\n\nCRITICAL: The user has selected KANNADA (ಕನ್ನಡ). You MUST reply STRICTLY in warm, comforting, natural Kannada spoken text. Use sweet conversational Kannada words.";
    } else if (language === 'hi') {
      systemInstruction += "\n\nCRITICAL: The user has selected HINDI (हिंदी). You MUST reply STRICTLY in warm, comforting, natural Hindi spoken text. Use sweet conversational Hindi words.";
    }

    return this.requestCompletion(contents, {
      systemInstruction,
      temperature: 0.5,
      maxTokens: 250,
    });
  }

  async analyzeBehavioralData(text) {
    const prompt = `
You are a clinical behavioral analyst. Analyze the following user transcript and extract behavioral intelligence.
Return ONLY a raw JSON object with the following exact structure, no markdown formatting:
{
  "sentimentScore": <Number between 0 and 1, where 0 is severe distress/negative and 1 is highly positive/stable>,
  "distressFlag": <Boolean, true ONLY if there are signs of self-harm, extreme burnout, or crisis>,
  "behavioralIndicators": [<Array of strings, e.g., "exhaustion", "isolation", "anxiety", "sleep deprivation", "overwhelm">],
  "crisisPhrases": [<Array of strings, containing EXACT concerning quotes from the transcript, if any>],
  "gpSummaryNote": "<A single concise, professional sentence summarizing the user's emotional state for a doctor>"
}

Transcript: "${text}"
`;

    const contents = [{
      role: 'user',
      parts: [{ text: prompt }]
    }];

    const content = await this.requestCompletion(contents, {
      temperature: 0,
      maxTokens: 750,
      responseMimeType: 'application/json'
    });

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse behavioral JSON:', content);
      return { 
        sentimentScore: 0.5, 
        distressFlag: false, 
        behavioralIndicators: [], 
        crisisPhrases: [], 
        gpSummaryNote: "Could not extract behavioral data." 
      };
    }
  }

  async summarizeHealthMetrics(metrics) {
    const prompt = `
You are a clinical behavioral and physiological analyst. Given the user's recent health metrics and behavioral signals, produce a concise JSON summary for a mobile dashboard. Return ONLY a raw JSON object with exactly these keys:
{
  "summaryText": "<one concise sentence summarizing the user's current state in non-technical language>",
  "severityScore": <Number between 0 and 1 where 0 is healthy and 1 indicates high concern>,
  "recommendedAction": "<one short practical recommendation or next step for the user or clinician>"
}

Input (JSON): ${JSON.stringify(metrics)}
Do not include any explanation or formatting. Keep values short and actionable.
`;

    const contents = [{ role: 'user', parts: [{ text: prompt }] }];

    const content = await this.requestCompletion(contents, {
      temperature: 0.0,
      maxTokens: 300,
      responseMimeType: 'application/json'
    });

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse health summary JSON:', content);
      return {
        summaryText: 'No summary available at this time.',
        severityScore: 0.5,
        recommendedAction: 'Continue monitoring and complete a micro-check-in.'
      };
    }
  }
}

// Keep the same export name as the routes expect `openaiService` variable
module.exports = new GemmaService();
