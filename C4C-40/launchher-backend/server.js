const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { runAutomation } = require('./automator');
const { extractBusinessDetails } = require('./ai');
const { initializeKnowledgeBase } = require('./rag');

const WHATSAPP_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

const app = express();
app.use(cors());
app.use(express.json());

let connectedClients = [];

app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    connectedClients.push(res);
    
    req.on('close', () => {
        connectedClients = connectedClients.filter(client => client !== res);
    });
});

const broadcastUpdate = (data) => {
    connectedClients.forEach(client => {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
};

app.post('/api/start-agent', async (req, res) => {
    const { userData } = req.body;
    
    res.status(200).json({ message: "AI Agent dispatched." });
    
    try {
        await runAutomation(userData, broadcastUpdate);
    } catch (error) {
        broadcastUpdate({ status: 'error', message: error.message });
    }
});

/**
 * 3. The "Chat to Form" Endpoint
 * Takes raw natural language, uses AI to extract JSON, and triggers the bot.
*/
app.post('/api/chat-to-form', async (req, res) => {
    const { message } = req.body;
    
    // Respond immediately so the frontend knows we received the message
    res.status(200).json({ status: "Received, AI is processing..." });
    
    try {
        // 1. Tell the frontend we are thinking
        broadcastUpdate({ step: 'ai_parsing', message: 'AI is analyzing your business details to find the right NIC codes...' });
        
        // 2. Let Gemini do the heavy lifting
        const userData = await extractBusinessDetails(message);
        console.log("🤖 Gemini Extracted:", userData);

        // 3. Hand the formatted data over to Playwright
        await runAutomation(userData, broadcastUpdate);

    } catch (error) {
        console.error(error);
        broadcastUpdate({ status: 'error', message: 'Failed to process AI request.' });
    }
});

/**
 * 1. Webhook Verification
 * Meta requires this endpoint to verify you actually own the server.
 */
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WHATSAPP_TOKEN) {
        console.log('✅ WhatsApp Webhook Verified!');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

/**
 * 2. Receiving Messages
 * This is where WhatsApp sends the text messages from your users.
 */
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            
            const message = body.entry[0].changes[0].value.messages[0];
            const senderPhone = message.from;
            const textText = message.text.body;

            console.log(`📱 WhatsApp from ${senderPhone}: ${textText}`);

            // 1. Acknowledge receipt to Meta instantly (crucial so they don't retry)
            res.sendStatus(200);

            try {
                // 2. Tell the user we are thinking
                await sendWhatsAppMessage(senderPhone, "Checking government databases for your best match...");
                
                // 3. Let Gemini do the heavy lifting
                const userData = await extractBusinessDetails(textText);
                
                // 4. Send the Magic Link back to WhatsApp
                const magicLink = "http://localhost:3000"; // Your Next.js frontend
                const successMsg = `Great news! You are eligible for the *${userData.recommendedScheme}*.\n\nClick your Magic Link to watch me fill your registration live: ${magicLink}`;
                await sendWhatsAppMessage(senderPhone, successMsg);

                // 5. Trigger the Playwright browser automation
                await runAutomation(userData, broadcastUpdate);

            } catch (error) {
                console.error("Webhook processing error:", error);
                await sendWhatsAppMessage(senderPhone, "Sorry, I hit a snag checking the databases. Let's try again.");
            }

        } else {
            res.sendStatus(200);
        }
    } else {
        res.sendStatus(404);
    }
});

// Function to send a WhatsApp message back to the user
async function sendWhatsAppMessage(toPhone, messageText) {
    const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;
    
    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: toPhone,
                type: "text",
                text: { body: messageText }
            })
        });
    } catch (error) {
        console.error("Failed to send WhatsApp message:", error);
    }
}

initializeKnowledgeBase();

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LaunchHer Backend running on port ${PORT}`);
});