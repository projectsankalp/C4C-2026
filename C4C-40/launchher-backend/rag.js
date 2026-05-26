const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { MemoryVectorStore } = require("@langchain/classic/vectorstores/memory"); // Updated Import!
const { Document } = require("@langchain/core/documents");
require('dotenv').config();

// Initialize Google's embedding model using the exact name from the docs
const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-embedding-001", 
});

let vectorStore;

/**
 * 1. Load the Government Schemes into Memory
 */
async function initializeKnowledgeBase() {
    console.log("📚 Ingesting Government Schemes into Vector Store...");
    
    const schemes = [
        new Document({
            pageContent: "PM Mudra Yojana (Shishu Category): Offers loans up to ₹50,000 for starting a micro-enterprise. Ideal for home-based businesses, street vendors, and small retail shops. No collateral required. Requires Udyam Registration.",
            metadata: { scheme: "Mudra Shishu", max_loan: 50000 }
        }),
        new Document({
            pageContent: "Stand-Up India Scheme: Specifically for women entrepreneurs and SC/ST communities. Provides bank loans between ₹10 lakh and ₹1 Crore for setting up a greenfield enterprise in manufacturing, services, or trading.",
            metadata: { scheme: "Stand-Up India", min_loan: 1000000 }
        }),
        new Document({
            pageContent: "PM Vishwakarma Scheme: Targeted at traditional artisans and craftspeople (like tailors, weavers, potters). Provides a toolkit incentive of ₹15,000 and collateral-free credit support up to ₹1 lakh.",
            metadata: { scheme: "PM Vishwakarma", toolkit_grant: 15000 }
        })
    ];

    // Build the in-memory database
    vectorStore = await MemoryVectorStore.fromDocuments(schemes, embeddings);
    console.log("✅ Knowledge Base Ready!");
}

/**
 * 2. Search the Knowledge Base
 * Takes the user's chat and finds the most relevant scheme.
 */
async function findMatchingScheme(userQuery) {
    if (!vectorStore) await initializeKnowledgeBase();
    
    // Retrieve the top 2 most relevant schemes based on the user's description
    const results = await vectorStore.similaritySearch(userQuery, 2);
    
    return results.map(res => res.pageContent).join("\n\n");
}

module.exports = { initializeKnowledgeBase, findMatchingScheme };