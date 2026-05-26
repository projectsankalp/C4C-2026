const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const openaiService = require('../services/azure/openai');
const User = require('../models/User');
const IVRSignal = require('../models/IVRSignal');
const CheckIn = require('../models/CheckIn');
const HealthAggregate = require('../models/HealthAggregate');
const DailyMetric = require('../models/DailyMetric');
const twilioService = require('../services/twilioService');

const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_SESSION_MESSAGES = 12;
const voiceSessions = new Map();

const pruneSessions = () => {
  const now = Date.now();
  for (const [callSid, session] of voiceSessions.entries()) {
    if (!session || now - session.updatedAt > SESSION_TTL_MS) {
      voiceSessions.delete(callSid);
    }
  }
};

const getOrCreateSession = (callSid) => {
  if (!callSid) {
    return null;
  }
  const existing = voiceSessions.get(callSid);
  if (existing) {
    return existing;
  }
  const session = { messages: [], updatedAt: Date.now() };
  voiceSessions.set(callSid, session);
  return session;
};

const updateSession = (session, userText, reply) => {
  session.messages.push(
    { role: 'user', content: userText },
    { role: 'assistant', content: reply }
  );

  while (session.messages.length > MAX_SESSION_MESSAGES) {
    session.messages.shift();
  }

  session.updatedAt = Date.now();
};

const getSpeechActionUrl = () => {
  const baseUrl = process.env.PUBLIC_BASE_URL;
  if (!baseUrl) {
    return '/api/voice/speech';
  }
  return `${baseUrl.replace(/\/$/, '')}/api/voice/speech`;
};

const buildSpeechGatherResponse = (messages, language = 'en') => {
  const response = new twilio.twiml.VoiceResponse();
  
  let gatherLang = 'en-IN';
  let voiceLang = 'en-IN';
  if (language === 'kn') {
    gatherLang = 'kn-IN';
    voiceLang = 'kn-IN';
  } else if (language === 'hi') {
    gatherLang = 'hi-IN';
    voiceLang = 'hi-IN';
  }

  const gather = response.gather({
    input: 'speech',
    action: getSpeechActionUrl(),
    method: 'POST',
    speechTimeout: 'auto',
    actionOnEmptyResult: true,
    language: gatherLang,
  });

  messages.forEach((message) => {
    gather.say({ language: voiceLang }, message);
  });
  return response;
};

// Mock data responses for hackathon speed

router.post('/checkin', (req, res) => {
  res.json({ success: true, message: 'Check-in recorded' });
});

router.post('/health-aggregate', (req, res) => {
  res.json({ success: true, message: 'Health aggregate processed' });
});

router.post('/ivr-signal', (req, res) => {
  res.json({ success: true, message: 'IVR signal processed' });
});

const getRequestValue = (req, key) => {
  if (req.body && req.body[key] !== undefined) {
    return req.body[key];
  }
  if (req.query && req.query[key] !== undefined) {
    return req.query[key];
  }
  return undefined;
};

const handleVoiceIncoming = async (req, res) => {
  const callSid = getRequestValue(req, 'CallSid');
  const from = getRequestValue(req, 'From') || 'unknown';
  console.log('[INCOMING]', req.method, 'CallSid:', callSid, 'From:', from);
  pruneSessions();
  
  let userId = null;
  let userLang = 'en';
  try {
    // Find or create User based on phone number
    let user = await User.findOne({ phoneNumber: from });
    if (!user) {
      user = await User.create({
        firebaseUid: `phone_${from}`,
        phoneNumber: from,
      });
      console.log(`[DB] Created new user for ${from}`);
    }
    userId = user._id;
    userLang = user.language || 'en';
  } catch (dbError) {
    console.error('Failed to resolve user in DB:', dbError.message);
  }

  if (callSid) {
    voiceSessions.set(callSid, { messages: [], updatedAt: Date.now(), userId, language: userLang });
  }

  let greetings = [
    'Hello, you have reached Swasthya support.',
    'Please tell me how you are feeling today.',
  ];
  if (userLang === 'kn') {
    greetings = [
      'ನಮಸ್ಕಾರ, ಸ್ವಸ್ಥ ಬೆಂಬಲಕ್ಕೆ ಸ್ವಾಗತ.',
      'ಇಂದು ನೀವು ಹೇಗೆ ಭಾವಿಸುತ್ತಿದ್ದೀರಿ ಎಂದು ದಯವಿಟ್ಟು ನನಗೆ ತಿಳಿಸಿ.',
    ];
  } else if (userLang === 'hi') {
    greetings = [
      'नमस्कार, स्वास्थ्य सहायता केंद्र में आपका स्वागत है।',
      'कृपया मुझे बताएं कि आज आप कैसा महसूस कर रहे हैं।',
    ];
  }

  const response = buildSpeechGatherResponse(greetings, userLang);
  res.type('text/xml').send(response.toString());
};

const handleVoiceSpeech = async (req, res) => {
  const callSid = getRequestValue(req, 'CallSid');
  const speechResult = getRequestValue(req, 'SpeechResult') || '';
  console.log('[SPEECH]', req.method, 'CallSid:', callSid, 'SpeechResult:', speechResult);
  pruneSessions();
  const speechText = speechResult.trim();
  const session = getOrCreateSession(callSid);
  const userLang = session?.language || 'en';

  if (!speechText) {
    let retryMsg = ['I did not catch that. Please say that again.'];
    if (userLang === 'kn') {
      retryMsg = ['ನನಗೆ ಅದು ಸರಿಯಾಗಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.'];
    } else if (userLang === 'hi') {
      retryMsg = ['मैं सुन नहीं पाया। कृपया फिर से कहें।'];
    }
    const response = buildSpeechGatherResponse(retryMsg, userLang);
    return res.type('text/xml').send(response.toString());
  }

  try {
    const history = session ? session.messages.slice() : [];
    
    // Process Gemma voice reply immediately (low latency, saves rate limit resources for the caller)
    const reply = await openaiService.generateReply(speechText, history, userLang);
    console.log('[SPEECH] Gemma reply:', reply);
    
    if (session) {
      updateSession(session, speechText, reply);
      
      // Perform advanced behavioral intelligence analysis and database logging asynchronously in the background
      if (session.userId) {
        openaiService.analyzeBehavioralData(speechText)
          .then(async (behavioralData) => {
            await IVRSignal.create({
              userId: session.userId,
              callDuration: Math.floor(Math.random() * 120) + 30, // mock duration
              speechMetrics: {
                pauseDensity: Math.random() * 0.5,
                pace: 'normal',
                vocalFatigue: false,
              },
              transcript: speechText,
              transcriptSentiment: behavioralData.sentimentScore,
              distressFlag: behavioralData.distressFlag,
              behavioralIndicators: behavioralData.behavioralIndicators,
              crisisPhrases: behavioralData.crisisPhrases,
              gpSummaryNote: behavioralData.gpSummaryNote
            });
            console.log('[DB] Saved IVRSignal with advanced behavioral intelligence');
            if (behavioralData.distressFlag) {
              twilioService.sendEmergencyAlert(session.userId, behavioralData.gpSummaryNote);
            }
          })
          .catch(async (err) => {
            console.error('[ANALYSIS] Background behavioral analysis failed:', err.message);
            // Resiliency Fallback: Always save the voice transcript in MongoDB even if AI analysis is rate-limited!
            try {
              await IVRSignal.create({
                userId: session.userId,
                callDuration: Math.floor(Math.random() * 120) + 30,
                speechMetrics: {
                  pauseDensity: 0.1,
                  pace: 'normal',
                  vocalFatigue: false,
                },
                transcript: speechText,
                transcriptSentiment: 0.5,
                distressFlag: false,
                behavioralIndicators: [],
                crisisPhrases: [],
                gpSummaryNote: "Analysis rate-limited."
              });
              console.log('[DB] Saved fallback IVRSignal after rate-limit');
            } catch (dbErr) {
              console.error('[DB] Failed to save fallback IVRSignal:', dbErr.message);
            }
          });
      }
    } else if (!callSid) {
      console.warn('Voice webhook missing CallSid; continuing without session history.');
    }
    
    const response = buildSpeechGatherResponse([reply], userLang);
    return res.type('text/xml').send(response.toString());
  } catch (error) {
    console.error('Voice webhook error:', error.message || error);
    let errorMsg = ['I had a brief hiccup. Could you please repeat that?'];
    if (userLang === 'kn') {
      errorMsg = ['ನನಗೆ ಸ್ವಲ್ಪ ತೊಂದರೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಹೇಳಿ.'];
    } else if (userLang === 'hi') {
      errorMsg = ['मुझे थोड़ी समस्या हुई है। कृपया फिर से कहें।'];
    }
    const response = buildSpeechGatherResponse(errorMsg, userLang);
    return res.type('text/xml').send(response.toString());
  }
};

router.post('/voice/incoming', handleVoiceIncoming);
router.get('/voice/incoming', handleVoiceIncoming);

router.post('/voice/speech', handleVoiceSpeech);
router.get('/voice/speech', handleVoiceSpeech);

router.get('/session-flag', (req, res) => {
  res.json({ success: true, flag: 'low', message: 'Session flag retrieved' });
});

router.post('/trigger-referral', (req, res) => {
  res.json({ success: true, message: 'Referral triggered (mock)' });
});

// --- REST API ENDPOINTS FOR MOBILE APP ---

// 1. User Login / Registration
router.post('/users', async (req, res) => {
  try {
    const { phoneNumber, email, firebaseUid, name, steps, activeMins, sleepHours, sleepMins, heartRate } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber is required' });

    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({
        firebaseUid: firebaseUid || `mock_${phoneNumber}`,
        phoneNumber,
        name: name || 'Swasthya User',
        email,
      });
    } else {
      if (email) user.email = email;
      if (name && (!user.name || user.name === 'Guest User' || user.name === 'Swasthya User')) {
        user.name = name;
      }
      if (firebaseUid) user.firebaseUid = firebaseUid;
    }

    if (steps !== undefined) user.steps = steps;
    if (activeMins !== undefined) user.activeMins = activeMins;
    if (sleepHours !== undefined) user.sleepHours = sleepHours;
    if (sleepMins !== undefined) user.sleepMins = sleepMins;
    if (heartRate !== undefined) user.heartRate = heartRate;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 1b. Synchronize Fitness Metrics On Demand
router.post('/users/sync-fit', async (req, res) => {
  try {
    const { userId, steps, activeMins, sleepHours, sleepMins, heartRate } = req.body;
    console.log('[DEBUG sync-fit] Mobile sent:', req.body);
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (steps !== undefined) user.steps = steps;
    if (activeMins !== undefined) user.activeMins = activeMins;
    if (sleepHours !== undefined) user.sleepHours = sleepHours;
    if (sleepMins !== undefined) user.sleepMins = sleepMins;
    if (heartRate !== undefined) user.heartRate = heartRate;

    await user.save();
    // Persist daily samples if provided
    if (Array.isArray(req.body.dailySamples) && req.body.dailySamples.length > 0) {
      try {
        for (const sample of req.body.dailySamples) {
          // Normalize sample date to UTC start-of-day to avoid timezone mismatches
          const sampleDate = sample.date ? new Date(sample.date) : new Date();
          const y = sampleDate.getUTCFullYear();
          const m = sampleDate.getUTCMonth();
          const d = sampleDate.getUTCDate();
          const startOfDay = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
          const endOfDay = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));

          console.log('[SYNC-FIT] incoming sample date:', sample.date, 'normalized startOfDay(UTC):', startOfDay.toISOString());

          await DailyMetric.findOneAndUpdate(
            { userId: user._id, date: { $gte: startOfDay, $lt: endOfDay } },
            {
              $set: {
                userId: user._id,
                date: startOfDay,
                steps: sample.steps || 0,
                activeMins: sample.activeMins || 0,
                sleepHours: sample.sleepHours || 0,
                sleepMins: sample.sleepMins || 0,
                heartRate: sample.heartRate || user.heartRate
              }
            },
            { upsert: true, setDefaultsOnInsert: true }
          );
        }
      } catch (e) {
        console.error('Failed to persist daily samples:', e.message || e);
      }
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Sync fit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: return recent daily health history (default 7 days)
router.get('/users/:userId/health-history', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days || '7', 10);
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    // Use UTC cutoff to match stored UTC start-of-day values
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
    cutoff.setUTCHours(0,0,0,0);

    console.log('[HEALTH-HISTORY] cutoff(UTC):', cutoff.toISOString());
    const samples = await DailyMetric.find({ userId, date: { $gte: cutoff } }).sort({ date: 1 });
    console.log('[HEALTH-HISTORY] returning samples:', samples.length);
    res.json({ success: true, data: samples });
  } catch (err) {
    console.error('Health history error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: per-day AI summary for a specific date (YYYY-MM-DD)
router.get('/users/:userId/health-summary', async (req, res) => {
  try {
    const { userId } = req.params;
    const dateParam = req.query.date;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!dateParam) return res.status(400).json({ error: 'date is required in YYYY-MM-DD format' });

    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) return res.status(400).json({ error: 'Invalid date format' });
    // Normalize the target to UTC start/end of that ISO date
    const y = targetDate.getUTCFullYear();
    const m = targetDate.getUTCMonth();
    const d = targetDate.getUTCDate();
    const startOfDay = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));
    console.log('[HEALTH-SUMMARY] requested date:', dateParam, 'normalized startOfDay(UTC):', startOfDay.toISOString());

    const metric = await DailyMetric.findOne({ userId, date: { $gte: startOfDay, $lt: endOfDay } });
    if (!metric) return res.status(404).json({ success: false, error: 'No metrics for that date' });

    // Optionally enrich with latest HealthAggregate or user info
    const user = await User.findById(userId);
    const health = await HealthAggregate.findOne({ userId, date: { $gte: startOfDay, $lt: endOfDay } }).sort({ date: -1 });

    const payload = {
      user: user ? { id: user._id, steps: metric.steps, sleepHours: metric.sleepHours, heartRate: metric.heartRate, activeMins: metric.activeMins } : null,
      health: health || null,
      recentCheckIns: []
    };

    let insights = null;
    try {
      insights = await openaiService.summarizeHealthMetrics(payload);
    } catch (err) {
      console.error('Per-day insight generation failed:', err?.message || err);
      insights = { summaryText: 'Insight unavailable', severityScore: 0.5, recommendedAction: 'Complete a quick check-in.' };
    }

    res.json({ success: true, data: { metric, insights } });
  } catch (err) {
    console.error('Health summary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 1c. Update User's Preferred Language
router.post('/users/update-language', async (req, res) => {
  try {
    const { userId, language } = req.body;
    if (!userId || !language) {
      return res.status(400).json({ error: 'userId and language are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.language = language;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 1d. Multilingual AI Chat Agent Endpoint
router.post('/chat', async (req, res) => {
  try {
    const { userId, message, history } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'userId and message are required' });
    }

    const user = await User.findById(userId);
    const language = user ? user.language : 'en';

    const reply = await openaiService.generateReply(message, history || [], language);
    res.json({ success: true, reply });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2. Submit a Check-In
router.post('/checkins', async (req, res) => {
  try {
    const { userId, type, responses } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const checkIn = await CheckIn.create({
      userId,
      type: type || 'daily_micro',
      responses,
    });
    
    // Simple sentiment analysis for the check-in text if provided
    if (responses && responses.textNotes) {
      // Async background task to analyze sentiment and update health aggregate
      openaiService.analyzeBehavioralData(responses.textNotes).then(async (behavioralData) => {
        await HealthAggregate.create({
          userId,
          checkInId: checkIn._id,
          anomalyScore: behavioralData.sentimentScore < 0.3 ? 0.8 : 0.1, // Mock anomaly logic
          distressFlag: behavioralData.distressFlag,
        });
      }).catch(err => console.error('Behavioral extraction failed:', err));
    }

    res.json({ success: true, checkIn });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3. Get Dashboard Summary
router.get('/dashboard/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch latest check-ins, IVR signals, health aggregates, and the user profile
    const [checkIns, signals, health, user] = await Promise.all([
      CheckIn.find({ userId }).sort({ timestamp: -1 }).limit(5),
      IVRSignal.find({ userId }).sort({ timestamp: -1 }).limit(5),
      HealthAggregate.findOne({ userId }).sort({ timestamp: -1 }),
      User.findById(userId)
    ]);

    // Attempt to generate a concise AI-driven health insight for the dashboard
    let insights = null;
    try {
      const metricsPayload = {
        user: user ? {
          id: user._id,
          steps: user.steps,
          sleepHours: user.sleepHours,
          sleepMins: user.sleepMins,
          heartRate: user.heartRate,
          activeMins: user.activeMins
        } : null,
        health: health || null,
        recentCheckIns: checkIns ? checkIns.map(c => ({ type: c.type, responses: c.responses })) : []
      };
      insights = await openaiService.summarizeHealthMetrics(metricsPayload);
    } catch (err) {
      console.error('Health insight generation failed:', err?.message || err);
      insights = { summaryText: 'Insight not available', severityScore: 0.5, recommendedAction: 'Complete a quick check-in.' };
    }

    res.json({
      success: true,
      data: {
        recentCheckIns: checkIns,
        recentVoiceCalls: signals,
        healthStatus: health || { anomalyScore: 0, distressFlag: false },
        user: user || { name: 'Guest User' },
        insights
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/visit-log', (req, res) => {
  res.json({ success: true, message: 'Visit logged' });
});

router.get('/district-stats', (req, res) => {
  res.json({ success: true, stats: { district: 'Central', activeUsers: 150, riskFlags: 5 } });
});

module.exports = router;
