import Groq from "groq-sdk";
import dotenv from "dotenv";
import { schemesDB } from "./schemesDB.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 1. DETERMINISTIC FILTERING
export function filterSchemes(userProfile) {
  const userRevenue = parseInt((userProfile.annualRevenue || "").toString().replace(/\D/g, '')) || 0;
  const userState = userProfile.state || "Unknown";
  const userStage = userProfile.businessStage || "Unknown";
  const userIndustry = userProfile.businessCategory || "Unknown";

  return schemesDB.filter(scheme => {
    const rules = scheme.eligibility_rules;
    if (rules.allowed_states && !rules.allowed_states.includes("ALL") && !rules.allowed_states.includes(userState)) return false;
    if (rules.max_revenue_inr && userRevenue > rules.max_revenue_inr) return false;
    if (rules.business_stages && !rules.business_stages.includes(userStage)) return false;
    if (rules.specific_industries && !rules.specific_industries.includes(userIndustry)) return false;
    return true; 
  });
}

// 2. DYNAMIC LLM SYNTHESIS
// Update the parameters to accept chatHistory
export async function synthesizeResponse(matchedSchemes, userProfile, latestMessage, chatHistory = []) {
  
  const isBlankSlate = Array.isArray(userProfile.existingRegistrations) && userProfile.existingRegistrations.includes('none');

  const cleanSchemesForLLM = matchedSchemes.map(s => ({
    name: s.name,
    description: s.description,
    required_docs: s.required_docs
  }));

  let systemPrompt = "";

  if (isBlankSlate) {
    systemPrompt = `
      You are the 'Scheme Finder AI', an expert business consultant and government compliance officer. 
      User Context: Name: ${userProfile.fullName}, State: ${userProfile.state}, Industry: ${userProfile.businessCategory}.
      
      The user is a blank slate with NO formal business registrations.
      They mathematically qualify for these foundational schemes: ${JSON.stringify(cleanSchemesForLLM.slice(0, 4))} 

      YOUR DIRECTIVE:
      You must conduct a "Deep Discovery Interview" to fully understand their business model before recommending any schemes. 
      You have an internal checklist of data points you need to collect. 
      
      YOUR INTERNAL CHECKLIST:
      1. Exact product or service.
      2. Target audience (B2B, B2C, Government?).
      3. Supply chain (Where do they get raw materials? Do they manufacture or resell?).
      4. Demographics (Are there women co-founders? SC/ST? - This unlocks major subsidies).
      5. Infrastructure needs (Do they need heavy machinery, land, or just a laptop?).
      6. Employment scale (Solo founder or hiring a team?).
      7. Sales channels (E-commerce, physical retail, export?).

      HOW TO EXECUTE:
      - Read the chat history. Check off what you already know from the checklist.
      - IF YOU NEED MORE INFO: Ask 2 related questions from your missing checklist items in a warm, conversational tone. Do NOT sound like a robot reading a form. Set "isDataComplete" to false.
      - IF YOU HAVE THE WHOLE PICTURE (You understand their model, scale, and demographics): Stop asking questions. Recommend Udyam and FSSAI (plus any other highly specific scheme based on their answers), list the exact documents needed, and ask them to upload the files below. Set "isDataComplete" to true.
      
      FORMATTING RULES: 
      - Use markdown formatting (**bold**, bullet points). 
      - Use explicit newline characters (\\n\\n) between paragraphs.
      
      CRITICAL: You MUST respond strictly in valid JSON format matching this structure:
      {
        "reply": "Your text response here",
        "isDataComplete": boolean
      }
    `;
  } else {
    systemPrompt = `
      You are the 'Scheme Finder AI'. The user has existing registrations.
      They qualify for these advanced schemes: ${JSON.stringify(cleanSchemesForLLM)}
      
      YOUR DIRECTIVE:
      Explain why they qualify for the top 2 schemes and list the required documents.
      
      CRITICAL: You MUST respond strictly in valid JSON format matching this structure:
      {
        "reply": "Your structured text response here",
        "isDataComplete": true
      }
    `;
  }

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: latestMessage }
    ],
    model: "openai/gpt-oss-120b", 
    response_format: { type: "json_object" }
  });

  return completion.choices[0]?.message?.content || '{"reply": "Error generating synthesis.", "isDataComplete": false}';
}