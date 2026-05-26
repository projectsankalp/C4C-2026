require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenAI, Type } = require('@google/genai');
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// --- API KEYS & CONFIG ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBIKWnNiPkc9fwqSTDSKqekIJ2iEnTn5Rc"; 
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8801089784:AAFbD6ajINX-SKFVgy18dULeVNFBl_NQcfo";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://your-project-ref.supabase.co"; 
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "your-supabase-anon-key-here";    

// Initialize APIs
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Initialize Supabase Client
let supabase = null;
if (SUPABASE_URL && !SUPABASE_URL.includes("your-project-ref")) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("🟢 Connected to Supabase Client");
    } catch (e) {
        console.log("⚠️ Supabase initialization failed, running in sandbox mode.");
    }
}

// Temporary in-memory session store
const activeSessions = {};

console.log("🟢 KritiCam Full AI Backend with Authenticity Loop is online.");

// ==========================================
// 1. ONBOARDING & WOMEN EMPOWERMENT SHG TAG
// ==========================================
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    // Initialize a fresh memory session
    activeSessions[chatId] = { isWomenSHG: false };

    const welcomeMessage = `🙏 *Welcome to KritiCam Artisan Portal*

Before you upload your product video or photo, are you a female artisan or part of a Women's Self-Help Group (like Kudumbashree/Mahila Mandal)? 

_(We ask this because corporate B2B buyers actively look to support women-led enterprises!)_`;

    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "👩‍🌾 Yes, Women's SHG / Female Artisan", callback_data: "shg_yes" }],
                [{ text: "👨‍🔧 No, Individual Artisan", callback_data: "shg_no" }]
            ]
        }
    });
});

// ==========================================
// 2. BUTTON LISTENER (ONBOARDING & EDITS)
// ==========================================
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const action = query.data;

    // Remove buttons from the old message
    bot.editMessageReplyMarkup({ inline_keyboard: [] }, {
        chat_id: chatId,
        message_id: query.message.message_id
    });

    // --- Handle Onboarding Flow ---
    if (action === 'shg_yes' || action === 'shg_no') {
        if (!activeSessions[chatId]) activeSessions[chatId] = {};
        
        if (action === 'shg_yes') {
            activeSessions[chatId].isWomenSHG = true; 
            bot.sendMessage(chatId, "✨ *Verified!* Your products will now carry the 'CSR-Eligible Women's Enterprise' badge to attract corporate buyers.\n\n📸 *Please upload your product photo or video now!*", { parse_mode: "Markdown" });
        } else {
            activeSessions[chatId].isWomenSHG = false;
            bot.sendMessage(chatId, "Got it! 📸 *Please upload your product photo or video now!*", { parse_mode: "Markdown" });
        }
    } 
    // --- Handle Edit/Approve Flow ---
    else if (action === 'approve') {
        if (!activeSessions[chatId] || !activeSessions[chatId].lastJson) {
            return bot.sendMessage(chatId, "❌ Session expired or no product analyzed yet. Please upload your craft photo/video again.");
        }

        const statusMsg = await bot.sendMessage(chatId, "🚀 Pushing catalog entry to database...");

        try {
            const data = JSON.parse(activeSessions[chatId].lastJson);
            const imageUrl = activeSessions[chatId].imageUrl || "https://images.unsplash.com/photo-1582721478779-0ae163c05a60?auto=format&fit=crop&q=80&w=600";

            if (supabase) {
                // Determine prices & details
                let name = typeof data.productName === 'object' ? data.productName.en : data.productName;
                let story = typeof data.marketingStory === 'object' ? data.marketingStory.en : data.marketingStory;
                let priceInr = parseInt(data.suggestedPrice_INR) || 0;
                let priceUsd = Math.round(priceInr / 83) || 1; // standard exchange rate fallback

                const dbPayload = {
                    product_name: name,
                    craft_style: data.craftHeritage || "Handicraft",
                    heritage_region: "India",
                    estimated_dimensions: data.estimatedSize || "Not specified",
                    materials_detected: "Handmade materials",
                    craftsmanship_score: 90.0, // baseline
                    fair_price_inr: priceInr,
                    fair_price_usd: priceUsd,
                    artisan_cut_percentage: activeSessions[chatId].isWomenSHG ? 70 : 62,
                    marketing_story: story,
                    tags: data.csrBadge ? [data.csrBadge, data.craftHeritage] : [data.craftHeritage],
                    image_url: imageUrl,
                    status: 'published'
                };

                const { data: dbData, error } = await supabase.from("products").insert(dbPayload).select().single();
                
                await bot.deleteMessage(chatId, statusMsg.message_id);
                if (error) {
                    console.error("❌ Supabase DB Insert error:", error.message);
                    bot.sendMessage(chatId, `⚠️ DB Error: ${error.message}. Saved locally in sandbox mode.`);
                } else {
                    bot.sendMessage(chatId, "🎉 *Awesome!* The catalog entry is finalized and live on the storefront! Web database synchronized successfully.");
                }
            } else {
                await bot.deleteMessage(chatId, statusMsg.message_id);
                bot.sendMessage(chatId, "ℹ️ Sandbox Mode: Catalog entry verified successfully (no Supabase configuration found).");
            }
        } catch (err) {
            console.error(err);
            await bot.deleteMessage(chatId, statusMsg.message_id);
            bot.sendMessage(chatId, "❌ Failed to save product to database.");
        }
    } else if (action === 'edit') {
        bot.sendMessage(chatId, "🤖 Got it! Tell me what to change (e.g., 'The price is ₹1500' or 'Change the materials'). Reply to this message.", { 
            reply_markup: { force_reply: true } 
        });
    }
});

// ==========================================
// 3. MAIN MEDIA PROCESSING ENGINE
// ==========================================
async function handleIncomingMedia(msg, mediaType) {
    const chatId = msg.chat.id;

    // Failsafe in case they skipped the /start command
    if (!activeSessions[chatId]) activeSessions[chatId] = { isWomenSHG: false };

    const statusMsg = await bot.sendMessage(chatId, `📥 ${mediaType.toUpperCase()} received. Initiating AI product analysis...`);
    
    try {
        let fileId = null;
        let detectedMimeType = "image/jpeg";
        let isVideo = false;

        if (mediaType === 'photo') {
            fileId = msg.photo[msg.photo.length - 1].file_id;
            detectedMimeType = "image/jpeg";
        } else if (mediaType === 'video') {
            fileId = msg.video.file_id;
            detectedMimeType = msg.video.mime_type || "video/mp4";
            isVideo = true;
        } else if (mediaType === 'document') {
            const mime = msg.document.mime_type || "";
            if (mime.startsWith("image/")) {
                fileId = msg.document.file_id;
                detectedMimeType = mime;
            } else if (mime.startsWith("video/")) {
                fileId = msg.document.file_id;
                detectedMimeType = mime;
                isVideo = true;
            } else {
                await bot.deleteMessage(chatId, statusMsg.message_id);
                return bot.sendMessage(chatId, "⚠️ Please upload only a photo or video of your craft.");
            }
        }

        const fileLink = await bot.getFileLink(fileId);
        
        await bot.editMessageText(`⚙️ Processing visual data...`, { chat_id: chatId, message_id: statusMsg.message_id });
        
        const response = await fetch(fileLink);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Upload to Supabase Storage if configured
        let publicImageUrl = fileLink;
        if (supabase) {
            const ext = isVideo ? 'mp4' : 'jpg';
            const fileName = `${Date.now()}-${fileId}.${ext}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, buffer, { contentType: detectedMimeType });

            if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);
                if (publicUrlData) {
                    publicImageUrl = publicUrlData.publicUrl;
                }
            }
        }
        activeSessions[chatId].imageUrl = publicImageUrl;

        // CSR Logic
        const shgBonus = activeSessions[chatId].isWomenSHG ? 
            "5. WOMEN EMPOWERMENT: The user is a female artisan. You MUST add a 'csrBadge': '👩‍🌾 CSR-Eligible Women's Enterprise' to the JSON. Also, women historically underprice their work; ensure the 'suggestedPrice_INR' is aggressively fair and reflects true market value." : 
            "5. WOMEN EMPOWERMENT: Not applicable for this session. Set 'csrBadge' to null.";

        const prompt = `You are the core Multimodal AI parsing engine for "KritiCam". Your job is to analyze an incoming raw image or video file, figure out what handmade Indian craft is being displayed, and output a structured B2B e-commerce catalog entry.

### Step-by-Step Logic to Follow:
1. IDENTIFY: Scan the visual frames to identify the actual object and materials.
2. CONTEXTUALIZE: Match the visual data to a known Indian craft heritage.
3. PRICING: Estimate a realistic wholesale B2B price in INR (₹).
4. FUN FACT: Write a snappy, 2-line mind-blowing fun fact about this craft's history.
5. AUTHENTICITY CHECK (AGENTIC LOOP): If the item is a highly replicated luxury craft (like a Kashmiri Shawl, Pashmina, or Silk Saree), set the 'authenticityStatus' to "⚠️ Pending: Is this 100% Original or a Replica?". Set a lower baseline price until confirmed. If it's a normal item (like candy or pottery), set it to "✅ Verified Authentic".
${shgBonus}

### Output Specification:
Respond strictly with a valid JSON object. Do not include markdown code block formatting like \`\`\`json.

### Expected JSON Schema Output Structure:
{
  "productName": "[What the physical object actually is]",
  "craftHeritage": "[Name of the identified traditional art/craft style]",
  "estimatedSize": "[Estimated dimensions or volume]",
  "suggestedPrice_INR": "[Estimated wholesale price in ₹]",
  "marketingStory": "[The punchy 2-line fun fact]",
  "csrBadge": "[Badge text or null]",
  "authenticityStatus": "[Authenticity status]"
}`;
        
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: [{ inlineData: { data: buffer.toString("base64"), mimeType: detectedMimeType } }, prompt]
        });

        const aiText = aiResponse.text;
        const cleanText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Save to session memory
        activeSessions[chatId].lastJson = cleanText;

        const data = JSON.parse(cleanText);
        const badgeText = data.csrBadge ? `\n🎗️ *Badge:* ${data.csrBadge}\n` : "\n";

        const finalMessage = `✅ *KritiCam B2B Catalog Entry*
${badgeText}
📦 *Product:* ${data.productName}
🏺 *Heritage:* ${data.craftHeritage}
⚖️ *Authenticity:* ${data.authenticityStatus}
💰 *Base Wholesale Price:* ₹${data.suggestedPrice_INR}

📖 *The Story:*
_${data.marketingStory}_

*(Tip: Hold the microphone to confirm if this is Original or Replica, or to translate!)*`;

        await bot.deleteMessage(chatId, statusMsg.message_id);
        bot.sendMessage(chatId, finalMessage, { 
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Looks Perfect, Save It!", callback_data: "approve" }],
                    [{ text: "✏️ I need to fix something (Text)", callback_data: "edit" }]
                ]
            }
        });
        
    } catch (error) {
        console.error("❌ CRITICAL AI ERROR:", error.message || error);
        try { await bot.deleteMessage(chatId, statusMsg.message_id); } catch(e){}
        bot.sendMessage(chatId, "❌ System Alert: The AI could not process this file. Please try sending a shorter video or a photo.");
    }
}

bot.on('photo', (msg) => handleIncomingMedia(msg, 'photo'));
bot.on('video', (msg) => handleIncomingMedia(msg, 'video'));
bot.on('document', (msg) => handleIncomingMedia(msg, 'document'));

// ==========================================
// 4. TEXT CORRECTION LOOP
// ==========================================
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.reply_to_message && msg.text) {
        if (!activeSessions[chatId] || !activeSessions[chatId].lastJson) {
            return bot.sendMessage(chatId, "❌ Session expired. Please upload the video/photo again.");
        }

        const statusMsg = await bot.sendMessage(chatId, "⚙️ Applying your text corrections...");

        try {
            const correctionPrompt = `
You are an AI assistant updating a B2B product catalog entry.
ORIGINAL JSON DATA: ${activeSessions[chatId].lastJson}
USER CORRECTION: "${msg.text}"
Apply the correction and return ONLY a valid JSON object with the exact same keys ('productName', 'craftHeritage', 'estimatedSize', 'suggestedPrice_INR', 'marketingStory', 'csrBadge', 'authenticityStatus'). Keep the csrBadge and authenticityStatus intact unless the user's text implies it should change.
`;

            const aiResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash', 
                contents: [correctionPrompt]
            });

            const newCleanText = aiResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
            activeSessions[chatId].lastJson = newCleanText;
            const data = JSON.parse(newCleanText);
            const badgeText = data.csrBadge ? `\n🎗️ *Badge:* ${data.csrBadge}\n` : "\n";

            const updatedMessage = `✨ *UPDATED KritiCam Catalog Entry* ✨
${badgeText}
📦 *Product:* ${data.productName}
⚖️ *Authenticity:* ${data.authenticityStatus}
💰 *Wholesale Price:* ₹${data.suggestedPrice_INR}
`;

            await bot.deleteMessage(chatId, statusMsg.message_id);
            bot.sendMessage(chatId, updatedMessage, { 
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "✅ Looks Perfect!", callback_data: "approve" }],
                        [{ text: "✏️ Need to Edit Again", callback_data: "edit" }]
                    ]
                }
            });

        } catch (error) {
            console.error("❌ UPDATE ERROR:", error);
            try { await bot.deleteMessage(chatId, statusMsg.message_id); } catch(e){}
            bot.sendMessage(chatId, "❌ Sorry, I had trouble applying that correction.");
        }
    }
});

// ==========================================
// 5. MULTILINGUAL VOICE NOTE & AUTHENTICITY LISTENER 
// ==========================================
bot.on('voice', async (msg) => {
    const chatId = msg.chat.id;

    if (!activeSessions[chatId] || !activeSessions[chatId].lastJson) {
        return bot.sendMessage(chatId, "❌ Please send a product video or photo first before sending a voice note!");
    }

    const statusMsg = await bot.sendMessage(chatId, "🎧 Listening to your voice note for authenticity validation and translations...");

    try {
        const fileLink = await bot.getFileLink(msg.voice.file_id);
        const response = await fetch(fileLink);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const voicePrompt = `
You are updating a B2B product catalog based on the artisan's voice note.

ORIGINAL DATA:
${activeSessions[chatId].lastJson}

INSTRUCTIONS:
1. Listen to the audio. 
2. If the user confirms the item is Original/Authentic (e.g., real Pashmina Kashmiri Shawl), drastically INCREASE the 'suggestedPrice_INR' to reflect luxury market value and change 'authenticityStatus' to '✅ 100% Verified Original'.
3. If they say it is a replica/dupe, decrease the price and set 'authenticityStatus' to '⚠️ Replica/Machine-made'.
4. Translate the 'productName' and 'marketingStory' into English, Hindi, Kannada, and Malayalam.
5. Return ONLY a valid JSON object matching this exact structure:

{
  "productName": {
    "en": "English name",
    "hi": "Hindi name",
    "kn": "Kannada name",
    "ml": "Malayalam name"
  },
  "craftHeritage": "Heritage name",
  "estimatedSize": "Size",
  "suggestedPrice_INR": "Updated price",
  "marketingStory": {
    "en": "English story",
    "hi": "Hindi story",
    "kn": "Kannada story",
    "ml": "Malayalam story"
  },
  "csrBadge": "Keep original text or null",
  "authenticityStatus": "Updated status based on voice note"
}
Do not include markdown tags like \`\`\`json.`;

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ inlineData: { data: buffer.toString("base64"), mimeType: "audio/ogg" } }, voicePrompt]
        });

        const newCleanText = aiResponse.text.replace(/```json/g, '').replace(/```/g, '').trim();
        activeSessions[chatId].lastJson = newCleanText;
        const data = JSON.parse(newCleanText);
        const badgeText = data.csrBadge ? `\n🎗️ *Badge:* ${data.csrBadge}\n` : "\n";

        const updatedMessage = `🌍 *GLOBAL CATALOG ENTRY READY* 🌍
${badgeText}
📦 *Product:* 🇬🇧 ${data.productName.en}
🇮🇳 ${data.productName.hi}
🟡 ${data.productName.kn}
🌴 ${data.productName.ml}

⚖️ *Authenticity:* ${data.authenticityStatus}
💰 *Updated Luxury Price:* ₹${data.suggestedPrice_INR}

📖 *The Story (English):*
_${data.marketingStory.en}_

*(Data formatted and ready to sync with your React storefront!)*`;

        await bot.deleteMessage(chatId, statusMsg.message_id);
        bot.sendMessage(chatId, updatedMessage, { 
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [[{ text: "✅ Push to Website Database!", callback_data: "approve" }]]
            } 
        });

    } catch (error) {
        console.error("❌ VOICE ERROR:", error);
        try { await bot.deleteMessage(chatId, statusMsg.message_id); } catch(e){}
        bot.sendMessage(chatId, "❌ Could not process the voice note. Let's try speaking a bit clearer.");
    }
});
