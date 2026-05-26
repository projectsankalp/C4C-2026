const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { findMatchingScheme } = require('./rag'); // Import our new RAG engine
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const schema = {
    type: SchemaType.OBJECT,
    properties: {
        businessName: { type: SchemaType.STRING },
        nicCode: { type: SchemaType.STRING },
        recommendedScheme: { 
            type: SchemaType.STRING, 
            description: "The name of the best matching government scheme." 
        },
        eligibilityReason: { 
            type: SchemaType.STRING, 
            description: "A one-sentence explanation of why they qualify for this scheme." 
        }
    },
    required: ["businessName", "nicCode", "recommendedScheme", "eligibilityReason"]
};

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
    }
});

async function extractBusinessDetails(userMessage) {
    // 1. Query our Vector Store for relevant schemes
    const relevantSchemesContext = await findMatchingScheme(userMessage);

    // 2. Inject the context into the prompt
    const prompt = `
    You are an expert Indian business formalization assistant. 
    Analyze the user's message, extract their business details, determine the 4-digit NIC code, 
    and recommend the best government scheme based ONLY on the provided context.

    User Message: "${userMessage}"
    
    Available Government Schemes Context:
    """
    ${relevantSchemesContext}
    """
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}

module.exports = { extractBusinessDetails };