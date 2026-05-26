import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy-loaded Google GenAI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function generateMockPlan(productName: string, productDescription: string) {
  const name = productName || "Handmade Product";
  const desc = productDescription || "Handcrafted item made with care";
  const isSoap = name.toLowerCase().includes("soap") || desc.toLowerCase().includes("soap");
  const isFood = name.toLowerCase().includes("cookie") || name.toLowerCase().includes("bake") || desc.toLowerCase().includes("food") || desc.toLowerCase().includes("cookie");

  let minP = 150, maxP = 350;
  if (isSoap) { minP = 120; maxP = 250; }
  if (isFood) { minP = 100; maxP = 300; }

  return {
    productName: name,
    pricingInsight: {
      minPrice: minP,
      maxPrice: maxP,
      profitability: "Good Margin",
      reasoning: `Based on local ingredient costs and market demand in Indian communities, ${name} can be priced competitively between ₹${minP} and ₹${maxP}. Materials are affordable and the handcrafted nature adds premium value.`
    },
    marketingKit: {
      instagramCaption: `✨ Introducing our newest creation: ${name}! ✨\n\nHandcrafted with love and the finest ingredients, each piece tells a story of tradition and quality. Perfect for gifting or treating yourself!\n\n🌟 What makes it special:\n• Made with premium ingredients\n• Handcrafted in small batches\n• Eco-friendly packaging\n\n📦 DM to place your order today!\n\n#HandmadeInIndia #VocalForLocal #WomenEntrepreneurs #SmallBusinessIndia #CraftedWithLove #SupportLocal`,
      productDescription: desc,
      hashtags: ["#HandmadeInIndia", "#VocalForLocal", "#WomenEntrepreneurs", "#SmallBusinessIndia", "#CraftedWithLove", "#SupportLocal", "#MadeWithLove"]
    },
    firstCustomersPlan: {
      day1: `Share a photo of your ${name} on WhatsApp status and personally message 5 close friends/family members asking for feedback and pre-orders.`,
      day2: `Post in 2-3 local community WhatsApp or Facebook groups with a warm introduction and special launch price of ₹${minP} for first 5 customers.`,
      day3: `Follow up personally with everyone who showed interest. Offer a "refer a friend" discount of ₹20 off for both parties on their first order.`,
      messageToSend: `Hey [Friend's Name]! 🌸\n\nI just started my small business making ${name} and would love your support! It's completely handmade with premium ingredients.\n\nSpecial launch price: just ₹${minP}!\n\nLet me know if you'd like to try one. Would mean the world to me! 💕\n\n- [Your Name]`
    },
    improvements: [
      `Use butter paper or eco-friendly wrapping with a jute string for a premium look without extra cost`,
      `Create a simple handwritten tag or sticker with your brand name for a professional feel`,
      `Photograph your product in natural window light with a clean background for better social media appeal`,
      `Offer sample/promo packs at ₹${minP - 30} for first-time buyers to build word-of-mouth`
    ],
    sellingGrowthStrategy: {
      level1Start: [
        `Sell through WhatsApp contacts and Instagram stories with personal outreach`,
        `Offer delivery to neighbors and within 2km radius yourself for zero shipping cost`,
        `Take orders via phone/DM and collect payments via UPI or cash on delivery`
      ],
      level2Expand: [
        `Post consistent Reels showing behind-the-scenes creation process`,
        `List on Meesho or Amazon for wider Indian audience reach`,
        `Partner with 2-3 local boutique or gift shops for shelf placement`
      ],
      level3Scale: [
        `Design custom brand stickers, thank-you cards, and premium packaging`,
        `Launch a dedicated Instagram business catalog page`,
        `Create festival gift hampers and combo offers for bulk orders`
      ],
      deliveryGuidance: [
        `Start with hand-delivery within your neighborhood for zero logistics cost`,
        `Use local courier services like Porter or Dunzo for nearby deliveries`,
        `For outstation orders, use India Post or Shiprocket for affordable shipping`
      ]
    },
    createdAt: new Date().toISOString()
  };
}

// REST Endpoint to generate a highly actionable Navyora business plan
app.post("/api/generate-strategy", async (req, res) => {
  const { productName, productDescription } = req.body;

  if (!productName && !productDescription) {
    res.status(400).json({ error: "Please provide either a product name or physical description." });
    return;
  }

  try {
    const ai = getAiClient();
    const prompt = `
Generate a complete, practical, highly actionable business plan using the details below:
Product Name: ${productName || "Not specified"}
Product Description: ${productDescription || "Not specified"}

Follow Navyora's rigorous voice:
- Empowering, extremely practical, highly actionable, simple language.
- Zero theoretical jargon (no "digital marketing channels" - instead, say "Share your launch photo with 5 friends on WhatsApp").
- Specific pricing, marketing assets, Day 1-3 customer blueprints, product refinements, and simplified delivery procedures.
- Target currency is Indian Rupees (₹) because our core audience comprises small-scale women micro-entrepreneurs in India setting up their brand.

Return exactly the requested JSON layout. Ensure the pricing range is highly realistic based on the product.
    `;

    const systemInstruction = `
You are Navyora — an AI-powered business expert assistant dedicated to empowering aspiring women micro-entrepreneurs in turning simple products (e.g. handmade crafts, baked goods, home decor, local services, stitched clothing) into solid, profitable businesses.
Your core operating principle is to replace general, high-level business theory with hyper-specific, direct actions that a complete beginner can execute immediately.

Rules:
1. Always price in Indian Rupees (₹) and ensure suggested prices are highly appropriate for beginner craftspeople/home bakers selling to friends, neighbors, and local communities (e.g., typically ₹100 to ₹1500).
2. The profitability field must be strictly either "Good Margin" or "Low Margin" based on estimated ingredient/material cost vs. the suggested selling price.
3. Keep the pricing reasoning brief (exactly 1 to 2 lines of clear rationale).
4. Provide a small-business-oriented, premium yet warm Instagram caption (with emotional touch), elegant product overview, and 5-8 relevant hashtags.
5. Supply an exact, warm copy-pasteable direct message for first customers containing placeholders like [Friend's Name] and [Your Name].
6. Day 1, Day 2, and Day 3 plans must feature single, direct, physical, or personal actions that do not require any paid ad accounts or tech setup.
7. Suggestions must offer 3 to 4 hyper-specific physical tweaks (like using butter paper wrappers, custom tags, beautiful ribbon, or clean window-lit smartphone photography).
8. Selling and growth strategies must lay out a 3-tier roadmap (Level 1 Start, Level 2 Expand, Level 3 Scale) plus realistic growing delivery advice.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            pricingInsight: {
              type: Type.OBJECT,
              properties: {
                minPrice: { type: Type.INTEGER, description: "Suggested low price in INR (e.g., 200)" },
                maxPrice: { type: Type.INTEGER, description: "Suggested high price in INR (e.g., 350)" },
                profitability: { type: Type.STRING, description: "Must be 'Good Margin' or 'Low Margin'" },
                reasoning: { type: Type.STRING, description: "1-2 lines detailing local ingredients, materials, demand, or setup costs" }
              },
              required: ["minPrice", "maxPrice", "profitability", "reasoning"]
            },
            marketingKit: {
              type: Type.OBJECT,
              properties: {
                instagramCaption: { type: Type.STRING, description: "Warm, emotional, and authentic caption showcasing home-cooked or hand-crafted value." },
                productDescription: { type: Type.STRING, description: "A slightly premium, simple product overview." },
                hashtags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "5 to 8 trending hand-picked hashtags"
                }
              },
              required: ["instagramCaption", "productDescription", "hashtags"]
            },
            firstCustomersPlan: {
              type: Type.OBJECT,
              properties: {
                day1: { type: Type.STRING, description: "Day 1 physical action (e.g. Message 5 close family/friends with a picture)" },
                day2: { type: Type.STRING, description: "Day 2 active local showcase action (e.g. Share status on WhatsApp, tag neighbors)" },
                day3: { type: Type.STRING, description: "Day 3 confirmation action (e.g. Lock in first 3 orders with customized adjustments)" },
                messageToSend: { type: Type.STRING, description: "Ready to copy message with placeholders like [Friend's Name] and [Your Name]" }
              },
              required: ["day1", "day2", "day3", "messageToSend"]
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 4 simple, high-impact improvements (packaging upgrade, branding tags, clean photography tricks)"
            },
            sellingGrowthStrategy: {
              type: Type.OBJECT,
              properties: {
                level1Start: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Level 1: Start (Immediate Sales) element array, e.g. ['Sell through WhatsApp contacts and Instagram stories', 'Warm outreach to direct relatives, neighbors, and close network', 'Take manual customized orders']"
                },
                level2Expand: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Level 2: Expand (Wider Reach) element array, e.g. ['Post product process consistently on Reels', 'List creations on accessible Indian small-biz platforms like Meesho, Amazon, or Flipkart', 'Participate actively in local flea markets or ladies association meetups']"
                },
                level3Scale: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Level 3: Scale (Business Growth) element array, e.g. ['Build simple customized brand stickers and taglines', 'Launch dedicated professional Instagram catalog page', 'Sponsor sample giveaways for local influencers', 'Offer festival themed bulk bundles']"
                },
                deliveryGuidance: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Hand-made product shipping best practices, e.g. ['Start with hand-delivering nearby or using direct neighborhood self-pickup', 'Use standard cost-effective hyper-local delivery apps once order book builds']"
                }
              },
              required: ["level1Start", "level2Expand", "level3Scale", "deliveryGuidance"]
            }
          },
          required: ["productName", "pricingInsight", "marketingKit", "firstCustomersPlan", "improvements", "sellingGrowthStrategy"]
        }
      }
    });

    const outputText = response.text || "{}";
    const data = JSON.parse(outputText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    const errMsg = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
    console.warn("⚠️ Gemini API unavailable. Returning mock plan instead.");
    const mock = generateMockPlan(productName, productDescription);
    res.json(mock);
  }
});

// REST Endpoint to generate a system plan based on product image
app.post("/api/generate-strategy-from-image", async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64 || !mimeType) {
    res.status(400).json({ error: "Missing product image attachment or improper image format. Please upload again." });
    return;
  }

  try {
    const ai = getAiClient();

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    };

    const promptText = `
You are Navyora Image Analysis Expert and Indian Micro-entrepreneurship Mentor.
Examine this product photo closely and extract its features to build a thorough product feedback analysis and complete business playbook.

You must:
1. IDENTIFY THE PRODUCT
- What the product is
- Exact Category
- Detailed Use-case

2. PRODUCT FEEDBACK
Provide clear, structured, practical, and mentor-like review feedback on current:
- Packaging (what looks premium, and what needs immediate professional upgrading)
- Design & Styling (colors, texture, visual appeal, uniqueness)
- Market Positioning (suitability, premium vs budget positioning, and when it can sell best like festivals, family events, or daily life)

3. STRATEGIC IMPROVEMENTS
Give 3 to 5 hyper-specific, direct, actionable tweaks:
- Professional yet cheap packaging hacks (like butter paper wrappers, custom tags, beautiful jute string, beautiful ribbon, clean window-lit boxes)
- Branding ideas
- Pricing perception cues
- Smartphone home-photography tips (using neutral daylight, clean plain backgrounds)

4. MARKETING COPY
Construct copy-pasteable launch assets:
- An emotional Instagram/social media caption emphasizing handcrafted passion
- A premium, simple, and detailed product description
- A direct call-to-action (CTA) to convert lookers into buyers (e.g. "DM to pre-order premium customizable boxes!")

Also, generate the complete Navyora business playbook matching this identified product:
- Suggested pricing in Indian Rupees (₹)
- Instagram caption and simple hashtags
- Day 1, Day 2, and Day 3 customer message template
- Standard level-by-level (Start, Expand, Scale) business growth blueprints
    `;

    const textPart = { text: promptText };

    const systemInstruction = `
You are Navyora — an AI-powered business expert and product feedback mentor.
You strictly give practical, honest, zero-fluff mentor-like guidance in Indian currency (₹).
Do NOT offer generic advice (like "you can try market research" or "do social media").
Instead, give real decisions (e.g. "Use a piece of brown butter paper, tie it with standard jute string, and print a simple sticker from your local vendor for ₹2 to create a premium feel").
Always ensure suggested prices are highly appropriate for beginner craftspeople/home bakers selling locally in India (e.g., typically scale between ₹100 to ₹1500).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING, description: "Clear identified product name" },
            pricingInsight: {
              type: Type.OBJECT,
              properties: {
                minPrice: { type: Type.INTEGER, description: "Suggested low price in INR" },
                maxPrice: { type: Type.INTEGER, description: "Suggested high price in INR" },
                profitability: { type: Type.STRING, description: "Must be 'Good Margin' or 'Low Margin'" },
                reasoning: { type: Type.STRING, description: "1-2 lines detailing demand, materials, or local pricing context" }
              },
              required: ["minPrice", "maxPrice", "profitability", "reasoning"]
            },
            marketingKit: {
              type: Type.OBJECT,
              properties: {
                instagramCaption: { type: Type.STRING },
                productDescription: { type: Type.STRING },
                hashtags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["instagramCaption", "productDescription", "hashtags"]
            },
            firstCustomersPlan: {
              type: Type.OBJECT,
              properties: {
                day1: { type: Type.STRING },
                day2: { type: Type.STRING },
                day3: { type: Type.STRING },
                messageToSend: { type: Type.STRING }
              },
              required: ["day1", "day2", "day3", "messageToSend"]
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sellingGrowthStrategy: {
              type: Type.OBJECT,
              properties: {
                level1Start: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                level2Expand: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                level3Scale: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                deliveryGuidance: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["level1Start", "level2Expand", "level3Scale", "deliveryGuidance"]
            },
            imageAnalysis: {
              type: Type.OBJECT,
              properties: {
                productIdentified: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    useCase: { type: Type.STRING }
                  },
                  required: ["name", "category", "useCase"]
                },
                feedback: {
                  type: Type.OBJECT,
                  properties: {
                    packaging: {
                      type: Type.OBJECT,
                      properties: {
                        looksGood: { type: Type.STRING },
                        needsImprovement: { type: Type.STRING }
                      },
                      required: ["looksGood", "needsImprovement"]
                    },
                    design: {
                      type: Type.OBJECT,
                      properties: {
                        visualAppeal: { type: Type.STRING },
                        uniqueness: { type: Type.STRING },
                        improvements: { type: Type.STRING }
                      },
                      required: ["visualAppeal", "uniqueness", "improvements"]
                    },
                    marketPositioning: {
                      type: Type.OBJECT,
                      properties: {
                        suitableFor: { type: Type.STRING },
                        tier: { type: Type.STRING },
                        bestSalesOccasions: { type: Type.STRING }
                      },
                      required: ["suitableFor", "tier", "bestSalesOccasions"]
                    }
                  },
                  required: ["packaging", "design", "marketPositioning"]
                },
                improvements: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                marketing: {
                  type: Type.OBJECT,
                  properties: {
                    instagramCaption: { type: Type.STRING },
                    productDescription: { type: Type.STRING },
                    cta: { type: Type.STRING }
                  },
                  required: ["instagramCaption", "productDescription", "cta"]
                }
              },
              required: ["productIdentified", "feedback", "improvements", "marketing"]
            }
          },
          required: [
            "productName", "pricingInsight", "marketingKit", "firstCustomersPlan", 
            "improvements", "sellingGrowthStrategy", "imageAnalysis"
          ]
        }
      }
    });

    const outputText = response.text || "{}";
    const data = JSON.parse(outputText);
    res.json(data);
  } catch (error: any) {
    console.error("Gemini Vision Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze product image. Check if your API secret is set correctly." });
  }
});

// AI Companion Chat Endpoint
app.post("/api/companion-chat", async (req, res) => {
  const { 
    productName, 
    productDescription, 
    pricingInsight, 
    marketingKit, 
    firstCustomersPlan, 
    improvements, 
    sellingGrowthStrategy, 
    imageAnalysis, 
    chatHistory = [], 
    userMessage 
  } = req.body;

  if (!userMessage) {
    res.status(400).json({ error: "User message is empty." });
    return;
  }

  try {
    const ai = getAiClient();
    
    // Construct rich context about the active product strategy
    const contextPrompt = `
You are Navyora AI Companion — a direct, practical, and highly skilled business mentor for home-creators and women micro-entrepreneurs in India. Your goal is to guide the student step-by-step to start, expand, and scale their product.

Active Product Context:
- Product Name: "${productName || (imageAnalysis ? imageAnalysis.identifiedProduct : "Not specified")}"
- Product Description: "${productDescription || (imageAnalysis ? imageAnalysis.marketingUse?.productDescription : "Handcrafted creation")}"

${pricingInsight ? `Active Pricing Draft:
- Price Range: ₹${pricingInsight.minPrice} to ₹${pricingInsight.maxPrice}
- Rationale: ${pricingInsight.reasoning}
- Margin status: ${pricingInsight.profitability}` : ""}

${marketingKit ? `Active Marketing Copy:
- Description Pitch: "${marketingKit.productDescription}"
- Target Hashtags: ${marketingKit.hashtags?.join(", ")}` : ""}

${sellingGrowthStrategy ? `Active Growth Plan:
- Level 1 (Start) tactics: ${sellingGrowthStrategy.level1Start?.join(". ")}
- Level 2 (Expand) tactics: ${sellingGrowthStrategy.level2Expand?.join(". ")}
- Level 3 (Scale) tactics: ${sellingGrowthStrategy.level3Scale?.join(". ")}
- Delivery tactics: ${sellingGrowthStrategy.deliveryGuidance?.join(". ")}` : ""}

${imageAnalysis ? `Active Image analysis reviews (Image Analysis Mode):
- Identified Product: ${imageAnalysis.identifiedProduct}
- Category: ${imageAnalysis.category}
- Use-case: ${imageAnalysis.useCase}
- Packaging Feedback looks good: ${imageAnalysis.packagingFeedback?.whatLooksGood}
- Packaging Feedback needs improvement: ${imageAnalysis.packagingFeedback?.whatNeedsImprovement}
- Design Visual Appeal: ${imageAnalysis.designFeedback?.visualAppeal}
- Design Uniqueness: ${imageAnalysis.designFeedback?.uniqueness}
- Design Recommended Improvements: ${imageAnalysis.designFeedback?.improvements}
- Market positioning suitable for: ${imageAnalysis.marketPositioning?.suitableFor}
- Premium vs budget: ${imageAnalysis.marketPositioning?.premiumVsBudgetPositioning}
- Best sales occasions: ${imageAnalysis.marketPositioning?.whenItSellsBest}
- Key Actionable Upgrades Suggestions:
  * Packaging: ${imageAnalysis.improvementSuggestions?.packagingUpgrades}
  * Branding: ${imageAnalysis.improvementSuggestions?.brandingIdeas}
  * Price perception: ${imageAnalysis.improvementSuggestions?.pricingPerceptionImprovements}
  * Photography: ${imageAnalysis.improvementSuggestions?.photographyTips}
- Match instagram copy: ${imageAnalysis.marketingUse?.caption}` : ""}

Conversation History so far:
${chatHistory.map((msg: any) => `${msg.sender === "user" ? "Student" : "Navyora Mentor"}: ${msg.text}`).join("\n")}

Student's New Question:
"${userMessage}"
    `;

    const systemInstruction = `
You are the Navyora AI Companion. You must strictly follow these rules:

1. CONTEXT-AWARE
- Always assume the question is about the student's product and their active plan.
- Do NOT start from scratch or rewrite the entire plan. Do NOT repeat full plan outputs again.

2. SHORT + ACTIONABLE
- Keep answers extremely concise and formatted with bold points or simple short lines.
- Give clear next steps immediately. Avoid wordy introductions.

3. USE GROWTH LEVELS
When discussing selling, scaling, or reaching customers, refer strictly to the 3 levels of growth:
- Level 1 (Start): Selling through immediate WhatsApp contacts, status, and direct personal/family networks. Manual ordered pickup/delivery.
- Level 2 (Expand): Instagram Reels, consistent stories, listing on digital marketplaces like Meesho, Amazon, or Flipkart, local associations.
- Level 3 (Scale): Professional branding (stickers, custom tags), dedicated Instagram business handle, micro-influencer gifting, festival bulk campaigns.

4. GIVE REAL DECISIONS (NO VAGUE ADVICE)
- Bad advice: "You can try social media to build awareness."
- Good advice: "Post 1 short reel daily showing the behind-the-scenes of you crafting, and add 'DM to order with free delivery' in the caption."

5. HANDLE QUESTIONS LIKE A MENTOR
- Q: "Can I increase my price?" -> Say: "Yes, you can confidently charge up to ₹[calculated level] but first offer free packaging for the customer's first order to make it sweet." (or similar direct yes/no with actionable reason).
- Q: "How do I sell outside my city?" -> Recommend marketplace listings (Meesho/Amazon) paired with easy-to-use local post offices or Shiprocket, and Level 2 Instagram content.
- Q: "My product is not selling" -> State 2-3 specific real fixes (e.g., lower entry price for neighbors, better window-side daylight photography, direct direct-message pitch).

6. STRICT SCOPE
- You can ONLY help with pricing, marketing, selling, product improvement, delivery, or growth strategy.
- If the question is unrelated (e.g., coding, general science, cooking recipes not related to their baking product), reject it politely, clearly, and guide them back to their business idea.

7. TONE
- Confident, warm, hands-on, mentor-like, practical, and direct. Zero fluff.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contextPrompt,
      config: {
        systemInstruction,
      }
    });

    const reply = response.text || "I am here to guide your micro-enterprise. Let me know how I can help!";
    res.json({ reply });
  } catch (error: any) {
    console.error("Companion Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed to contact Navyora Companion. Check your server API key configuration." });
  }
});

// Setup development or production server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for smooth dev experience
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Navyora server running on http://localhost:${PORT}`);
  });
}

startServer();
