export interface PricingInsight {
  minPrice: number;
  maxPrice: number;
  profitability: "Good Margin" | "Low Margin";
  reasoning: string;
}

export interface MarketingKit {
  instagramCaption: string;
  productDescription: string;
  hashtags: string[];
}

export interface FirstCustomersPlan {
  day1: string;
  day2: string;
  day3: string;
  messageToSend: string;
}

export interface SellingGrowthStrategy {
  level1Start: string[];
  level2Expand: string[];
  level3Scale: string[];
  deliveryGuidance: string[];
}

export interface BusinessPlan {
  productName: string;
  productDescription: string;
  pricingInsight: PricingInsight;
  marketingKit: MarketingKit;
  firstCustomersPlan: FirstCustomersPlan;
  improvements: string[];
  sellingGrowthStrategy: SellingGrowthStrategy; // Restructured from sellingDeliveryGuidance
  imageAnalysis?: ImageAnalysisResult; // Added for Image Analysis Mode
  createdAt: string;
}

export interface ImageAnalysisResult {
  productIdentified: {
    name: string;
    category: string;
    useCase: string;
  };
  feedback: {
    packaging: {
      looksGood: string;
      needsImprovement: string;
    };
    design: {
      visualAppeal: string;
      uniqueness: string;
      improvements: string;
    };
    marketPositioning: {
      suitableFor: string;
      tier: string;
      bestSalesOccasions: string;
    };
  };
  improvements: string[];
  marketing: {
    instagramCaption: string;
    productDescription: string;
    cta: string;
  };
  imageUrl?: string;
}

export interface ChatMessage {
  sender: "user" | "companion";
  text: string;
  createdAt: string;
}

export interface UserSession {
  emailOrPhone: string;
  name: string;
  isGuest: boolean;
}

