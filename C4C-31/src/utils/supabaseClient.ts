// MOCK SUPABASE CLIENT
// Simulating the Backend-as-a-Service behavior using browser localStorage

export interface UserProfile {
  id: string;
  phone: string;
  name: string;
  trade: string;
  experience: string;
  assessmentStatus: 'unverified' | 'pending' | 'verified';
  skillLevel: 'Beginner' | 'Intermediate' | 'Expert' | null;
  quizScore: number;
  certifiedAt: string | null;
  photoUrl: string | null;
  portfolioUrls: string[];
}

export interface AiQuizQuestion {
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
}

const BACKEND_URL = 'http://localhost:5000/api';

// Simulates a network delay
const delay = (ms: number = 800) => new Promise(res => setTimeout(res, ms));

export const BackendClient = {

  async getProfile(): Promise<UserProfile | null> {
    await delay();
    const data = localStorage.getItem('vocupskill_user');
    return data ? JSON.parse(data) : null;
  },

  async verifyOtp(phone: string, code: string): Promise<UserProfile> {
    await delay();
    if (code !== '1234') {
      throw new Error("Invalid code");
    }

    let user = await this.getProfile();
    if (!user || user.phone !== phone) {
      user = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        phone,
        name: '',
        trade: '',
        experience: '',
        assessmentStatus: 'unverified',
        skillLevel: null,
        quizScore: 0,
        certifiedAt: null,
        photoUrl: null,
        portfolioUrls: []
      };
      localStorage.setItem('vocupskill_user', JSON.stringify(user));
    }
    return user;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    await delay();
    const current = await this.getProfile();
    if (!current) throw new Error("Not logged in");

    const updated = { ...current, ...updates };
    localStorage.setItem('vocupskill_user', JSON.stringify(updated));
    return updated;
  },

  async uploadFile(file: File): Promise<string> {
    await delay(1200);
    return URL.createObjectURL(file);
  },

  // ─── AI Quiz Generation ──────────────────────────────────────────────────────
  // Calls the Node.js backend which uses Gemini to generate 5 trade-specific questions.
  // If the backend is offline, falls back to a generic set of questions.
  async generateQuiz(trade: string): Promise<AiQuizQuestion[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade }),
      });
      if (!res.ok) throw new Error(`Backend error: ${res.status}`);
      const questions: AiQuizQuestion[] = await res.json();
      return questions;
    } catch (err) {
      console.warn('[generateQuiz] Backend unreachable, using inline fallback:', err);
      return getFallbackQuestions(trade);
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem('vocupskill_user');
  }
};

// ─── Fallback Questions (used when backend is offline) ───────────────────────
function getFallbackQuestions(trade: string): AiQuizQuestion[] {
  const pool = [
    {
      questionEn: `In ${trade}, what should you do before starting a new project?`,
      questionHi: `${trade} में नया काम शुरू करने से पहले आपको क्या करना चाहिए?`,
      optionsEn: ['Check tools and materials', 'Start immediately', 'Ask for advance payment', 'Skip planning'],
      optionsHi: ['औजार और सामग्री जाँचें', 'तुरंत शुरू करें', 'अग्रिम भुगतान मांगें', 'योजना छोड़ें'],
      correctIndex: 0
    },
    {
      questionEn: `A customer is unhappy with your ${trade} work. What is the best response?`,
      questionHi: `एक ग्राहक आपके ${trade} काम से नाखुश है। सबसे अच्छा जवाब क्या है?`,
      optionsEn: ['Listen and offer to fix it', 'Ignore the complaint', 'Argue back', 'Charge more for repairs'],
      optionsHi: ['सुनें और ठीक करने की पेशकश करें', 'शिकायत अनदेखा करें', 'बहस करें', 'मरम्मत के लिए ज्यादा लें'],
      correctIndex: 0
    },
    {
      questionEn: `Which is most important when doing ${trade} work?`,
      questionHi: `${trade} काम करते समय सबसे महत्वपूर्ण क्या है?`,
      optionsEn: ['Quality and safety', 'Speed only', 'Low cost materials', 'Copying others'],
      optionsHi: ['गुणवत्ता और सुरक्षा', 'केवल गति', 'सस्ती सामग्री', 'दूसरों की नकल'],
      correctIndex: 0
    },
    {
      questionEn: `How do you improve your ${trade} skills?`,
      questionHi: `आप अपने ${trade} कौशल कैसे सुधारते हैं?`,
      optionsEn: ['Practice and seek feedback', 'Only watch others', 'Avoid hard projects', 'Never change your method'],
      optionsHi: ['अभ्यास और प्रतिक्रिया लें', 'केवल दूसरों को देखें', 'कठिन काम से बचें', 'कभी तरीका न बदलें'],
      correctIndex: 0
    },
    {
      questionEn: `What helps you price your ${trade} services correctly?`,
      questionHi: `आप अपनी ${trade} सेवाओं की सही कीमत कैसे तय करते हैं?`,
      optionsEn: ['Cost + time + skill', 'Whatever client says', 'Always cheapest', 'Copy competitor blindly'],
      optionsHi: ['लागत + समय + कौशल', 'जो ग्राहक कहे', 'हमेशा सबसे सस्ता', 'बिना सोचे प्रतिस्पर्धी कॉपी करें'],
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
