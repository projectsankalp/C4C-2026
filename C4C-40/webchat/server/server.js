// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { filterSchemes, synthesizeResponse } from "./engine.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { messages, profile } = req.body;
    
    const recentMessages = messages.slice(-6); 

    const history = recentMessages.slice(0, -1).map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    }));
    const latestMessage = recentMessages[recentMessages.length - 1].content;

    const matchedSchemes = filterSchemes(profile);
    
    const llmJsonString = await synthesizeResponse(matchedSchemes, profile, latestMessage, history);
    
    const llmData = JSON.parse(llmJsonString);

    res.json({ 
        reply: llmData.reply, 
        matched_schemes: matchedSchemes.map(s => s.scheme_id),
        requires_upload: llmData.isDataComplete 
    });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Fast API running on port ${PORT}`));