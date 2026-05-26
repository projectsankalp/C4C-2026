import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/errorHandler";

const BUSINESS_IDEAS: Record<string, any[]> = {
  tailoring: [
    {
      idea: "Blouse & Alterations Service",
      investment: "₹500–₹2,000",
      profit: "₹200–₹800/day",
      steps: [
        "Buy basic stitching supplies",
        "Offer alterations to neighbours",
        "Post on local WhatsApp groups",
        "Expand to custom blouses",
        "Partner with saree shops",
      ],
    },
  ],
  cooking: [
    {
      idea: "Home Tiffin Service",
      investment: "₹1,000–₹3,000",
      profit: "₹300–₹1,200/day",
      steps: [
        "Start with 5 tiffin boxes for nearby offices",
        "Use fresh local ingredients",
        "Set fixed weekly menu",
        "Collect payment weekly via UPI",
        "Expand to 20+ customers",
      ],
    },
    {
      idea: "Festival Sweets & Snacks",
      investment: "₹500–₹1,500",
      profit: "₹500–₹2,000/event",
      steps: [
        "Start with ladoo and chakli",
        "Take pre-orders 1 week before festivals",
        "Pack hygienically in sealed boxes",
        "Sell via WhatsApp catalog",
        "Expand to gifting boxes",
      ],
    },
  ],
  craft: [
    {
      idea: "Handmade Craft Products",
      investment: "₹500–₹2,000",
      profit: "₹300–₹1,500/week",
      steps: [
        "List 5 products on HastKala Haat",
        "Take product photos in natural light",
        'Add "How it\'s made" story',
        "Share on WhatsApp groups",
        "Accept custom orders",
      ],
    },
  ],
  beauty: [
    {
      idea: "Home Beauty Service",
      investment: "₹1,000–₹3,000",
      profit: "₹400–₹1,500/day",
      steps: [
        "Get basic beauty kit",
        "Offer threading and facial to neighbours",
        "Build WhatsApp client list",
        "Add bridal packages",
        "Partner with event planners",
      ],
    },
  ],
  mehendi: [
    {
      idea: "Mehendi Artist",
      investment: "₹200–₹500",
      profit: "₹500–₹3,000/event",
      steps: [
        "Practice 10 designs daily",
        "Offer free mehendi to friends for photos",
        "Build portfolio on phone",
        "Charge ₹200 for simple designs",
        "Target wedding season bookings",
      ],
    },
  ],
  default: [
    {
      idea: "Local Reselling Business",
      investment: "₹1,000–₹5,000",
      profit: "₹200–₹800/day",
      steps: [
        "Identify products in demand locally",
        "Source from wholesale market",
        "Sell via WhatsApp catalog",
        "Build regular customer list",
        "Expand product range",
      ],
    },
  ],
};

function detectSkillKey(skills: string): string {
  const s = skills.toLowerCase();
  if (s.includes("tailor") || s.includes("stitch") || s.includes("sew")) return "tailoring";
  if (s.includes("cook") || s.includes("food") || s.includes("tiffin") || s.includes("sweet"))
    return "cooking";
  if (s.includes("craft") || s.includes("handmade") || s.includes("art")) return "craft";
  if (s.includes("beauty") || s.includes("makeup") || s.includes("hair")) return "beauty";
  if (s.includes("mehendi") || s.includes("henna")) return "mehendi";
  return "default";
}

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: { greeting: "Hello", submit: "Submit", loading: "Loading...", error: "Something went wrong" },
  kn: {
    greeting: "ನಮಸ್ಕಾರ",
    submit: "ಸಲ್ಲಿಸಿ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    error: "ಏನೋ ತಪ್ಪಾಗಿದೆ",
  },
  hi: { greeting: "नमस्ते", submit: "जमा करें", loading: "लोड हो रहा है...", error: "कुछ गलत हुआ" },
};

export class AIController {
  static async match(req: Request, res: Response, next: NextFunction) {
    try {
      const { skills, budget, location, language = "en" } = req.body;
      if (!skills) throw new AppError("skills is required", 400);

      const key = detectSkillKey(skills);
      const ideas = BUSINESS_IDEAS[key] || BUSINESS_IDEAS.default;
      const idea = ideas[0];

      const budgetNum = parseInt(String(budget).replace(/[^\d]/g, "")) || 1000;
      const affordable = budgetNum >= 500;

      res.json({
        success: true,
        data: {
          idea: idea.idea,
          investment: idea.investment,
          estimatedProfit: idea.profit,
          location: location || "your area",
          affordable,
          roadmap: idea.steps,
          language,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async price(req: Request, res: Response, next: NextFunction) {
    try {
      const { materialCost, labourHours, packagingCost, deliveryCost } = req.body;
      if (materialCost === undefined) throw new AppError("materialCost is required", 400);

      const material = Number(materialCost) || 0;
      const labour = (Number(labourHours) || 1) * 50; // ₹50/hr default
      const packaging = Number(packagingCost) || 20;
      const delivery = Number(deliveryCost) || 0;

      const cost = material + labour + packaging + delivery;
      const minimum = Math.ceil(cost * 1.1);
      const recommended = Math.ceil(cost * 1.3);
      const premium = Math.ceil(cost * 1.6);

      res.json({
        success: true,
        data: {
          costBreakdown: { material, labour, packaging, delivery, total: cost },
          minimum,
          recommended,
          premium,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async translate(req: Request, res: Response, next: NextFunction) {
    try {
      const { text, targetLanguage = "en" } = req.body;
      if (!text) throw new AppError("text is required", 400);
      // In production this would call OpenAI/Gemini. For demo, return as-is with language tag.
      res.json({
        success: true,
        data: { original: text, translated: text, language: targetLanguage },
      });
    } catch (error) {
      next(error);
    }
  }
}
