require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── Gemini AI Setup ─────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// ─── POST /api/generate-quiz ─────────────────────────────────────────────────
// Generates 5 trade-specific quiz questions using Gemini AI
// Returns JSON array with bilingual question & options
app.post('/api/generate-quiz', async (req, res) => {
  const { trade } = req.body;

  if (!trade) {
    return res.status(400).json({ error: 'Trade name is required' });
  }

  const prompt = `
You are an expert vocational trainer in India.
Generate exactly 10 practical skill assessment questions for a worker in the "${trade}" trade.

STRICT RULES:
- Randomize the topics and scenarios to ensure the questions are completely different each time.
- Questions must be practical and situational (real-world scenarios).
- Write each question in both English AND Hindi.
- Provide exactly 4 answer options in both English AND Hindi.
- Ensure exactly ONE correct answer per question (correctIndex: 0, 1, 2 or 3).
- Vary the difficulty from easy to medium.
- Output ONLY a valid JSON array. No markdown, no explanation, no extra text.

JSON FORMAT (output exactly this structure):
[
  {
    "questionEn": "Question in English?",
    "questionHi": "प्रश्न हिंदी में?",
    "optionsEn": ["Option A", "Option B", "Option C", "Option D"],
    "optionsHi": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
    "correctIndex": 0
  }
]
`;

  // If no API key, return realistic mock questions so the app works in demo mode
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[Quiz] No GEMINI_API_KEY found – returning demo questions for trade:', trade);
    return res.json(getMockQuestions(trade));
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const raw = response.text.trim();

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const questions = JSON.parse(cleaned);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI returned an unexpected format');
    }

    console.log(`[Quiz] Generated ${questions.length} questions for trade: ${trade}`);
    res.json(questions);

  } catch (err) {
    console.error('[Quiz] AI error, falling back to mock:', err.message);
    res.json(getMockQuestions(trade));
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: !!process.env.GEMINI_API_KEY,
    time: new Date().toISOString()
  });
});

// ─── Demo-mode Mock Questions ─────────────────────────────────────────────────
function getMockQuestions(trade) {
  const pool = [
    {
      questionEn: `In ${trade}, what is the FIRST step before starting work?`,
      questionHi: `${trade} में काम शुरू करने से पहले पहला कदम क्या है?`,
      optionsEn: ['Check your tools and materials', 'Start immediately', 'Ask the client to wait', 'Take a break'],
      optionsHi: ['अपने औजार और सामग्री जाँचें', 'तुरंत शुरू करें', 'ग्राहक को प्रतीक्षा करने के लिए कहें', 'आराम करें'],
      correctIndex: 0
    },
    {
      questionEn: `A client complains the ${trade} work quality is poor. What should you do?`,
      questionHi: `ग्राहक शिकायत करता है कि ${trade} काम की गुणवत्ता खराब है। आपको क्या करना चाहिए?`,
      optionsEn: ['Listen and offer to redo the work', 'Ignore the complaint', 'Argue with the client', 'Charge extra for corrections'],
      optionsHi: ['सुनें और काम दोबारा करने की पेशकश करें', 'शिकायत को नजरअंदाज करें', 'ग्राहक से बहस करें', 'सुधार के लिए अतिरिक्त शुल्क लें'],
      correctIndex: 0
    },
    {
      questionEn: `Which of these is most important for safety while doing ${trade} work?`,
      questionHi: `${trade} काम करते समय सुरक्षा के लिए इनमें से कौन सबसे महत्वपूर्ण है?`,
      optionsEn: ['Using proper protective equipment', 'Working as fast as possible', 'Using the cheapest materials', 'Skipping breaks to save time'],
      optionsHi: ['उचित सुरक्षा उपकरण का उपयोग करना', 'जितनी जल्दी हो सके काम करना', 'सबसे सस्ती सामग्री का उपयोग करना', 'समय बचाने के लिए ब्रेक छोड़ना'],
      correctIndex: 0
    },
    {
      questionEn: `How do you price your ${trade} services fairly?`,
      questionHi: `आप अपनी ${trade} सेवाओं की उचित कीमत कैसे तय करते हैं?`,
      optionsEn: ['Calculate material cost + time + skill', 'Charge whatever the client offers', 'Always charge the lowest price', 'Copy a competitors price without checking'],
      optionsHi: ['सामग्री लागत + समय + कौशल की गणना करें', 'ग्राहक जो भी दे वह लें', 'हमेशा सबसे कम कीमत लें', 'बिना जाँचे प्रतिस्पर्धी की कीमत कॉपी करें'],
      correctIndex: 0
    },
    {
      questionEn: `What helps you improve your ${trade} skills the most?`,
      questionHi: `आपके ${trade} कौशल को सबसे ज्यादा सुधारने में क्या मदद करता है?`,
      optionsEn: ['Practicing regularly and seeking feedback', 'Watching others work without doing it yourself', 'Avoiding difficult projects', 'Only doing the same type of work repeatedly'],
      optionsHi: ['नियमित अभ्यास करना और प्रतिक्रिया लेना', 'दूसरों को काम करते देखना खुद किए बिना', 'कठिन परियोजनाओं से बचना', 'केवल बार-बार एक ही प्रकार का काम करना'],
      correctIndex: 0
    },
    {
      questionEn: `What is the best way to handle a delay in your ${trade} work?`,
      questionHi: `${trade} काम में देरी होने पर उसे संभालने का सबसे अच्छा तरीका क्या है?`,
      optionsEn: ['Inform the client immediately', 'Hide it', 'Blame others', 'Rush and make mistakes'],
      optionsHi: ['ग्राहक को तुरंत सूचित करें', 'इसे छिपाएं', 'दूसरों को दोष दें', 'जल्दी करें और गलतियाँ करें'],
      correctIndex: 0
    },
    {
      questionEn: `Why is organizing your workspace important for ${trade}?`,
      questionHi: `${trade} के लिए अपने कार्यक्षेत्र को व्यवस्थित करना क्यों महत्वपूर्ण है?`,
      optionsEn: ['Saves time and prevents accidents', 'It looks good for photos only', 'It is not important', 'Only the boss cares'],
      optionsHi: ['समय बचाता है और दुर्घटनाओं को रोकता है', 'यह केवल तस्वीरों के लिए अच्छा लगता है', 'यह महत्वपूर्ण नहीं है', 'केवल बॉस को परवाह है'],
      correctIndex: 0
    },
    {
      questionEn: `How should you dispose of waste materials in ${trade}?`,
      questionHi: `${trade} में आपको अपशिष्ट पदार्थों का निपटान कैसे करना चाहिए?`,
      optionsEn: ['Follow local disposal guidelines', 'Burn them', 'Throw them on the street', 'Hide them'],
      optionsHi: ['स्थानीय निपटान दिशानिर्देशों का पालन करें', 'उन्हें जला दें', 'उन्हें सड़क पर फेंक दें', 'उन्हें छिपा दें'],
      correctIndex: 0
    },
    {
      questionEn: `What is a sign of good professionalism in ${trade}?`,
      questionHi: `${trade} में अच्छे व्यावसायिकता का संकेत क्या है?`,
      optionsEn: ['Punctuality and honesty', 'Always arriving late', 'Overcharging clients', 'Ignoring phone calls'],
      optionsHi: ['समय की पाबंदी और ईमानदारी', 'हमेशा देर से पहुँचना', 'ग्राहकों से ज्यादा पैसे लेना', 'फोन कॉल की अनदेखी करना'],
      correctIndex: 0
    },
    {
      questionEn: `When finishing a ${trade} job, what is the final step?`,
      questionHi: `${trade} का काम खत्म करते समय, अंतिम चरण क्या है?`,
      optionsEn: ['Clean up and ensure client satisfaction', 'Leave immediately', 'Ask for a tip', 'Leave the mess behind'],
      optionsHi: ['सफाई करें और ग्राहक की संतुष्टि सुनिश्चित करें', 'तुरंत चले जाएँ', 'टिप मांगें', 'गंदगी पीछे छोड़ दें'],
      correctIndex: 0
    }
  ];
  return pool.sort(() => 0.5 - Math.random()).slice(0, 10);
}

app.listen(PORT, () => {
  console.log(`✓ VocUpSkill Backend running at http://localhost:${PORT}`);
  console.log(`  AI Quiz Generation: ${process.env.GEMINI_API_KEY ? '✓ ENABLED (Gemini)' : '⚠ DEMO MODE (add GEMINI_API_KEY to .env)'}`);
});
