require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./server/middleware/errorMiddleware');
const authRoutes    = require('./server/routes/authRoutes');
const productRoutes = require('./server/routes/productRoutes');
const orderRoutes   = require('./server/routes/orderRoutes');
const geminiChatRoutes = require('./server/routes/geminiChatRoutes');
const voiceRoutes = require('./server/routes/voiceRoutes');
const uploadRoutes = require('./server/routes/imageUploadRoutes');
const cartRoutes = require('./server/routes/cartRoutes');
const feedbackRoutes = require('./server/routes/feedbackRoutes');
const sellerRoutes = require('./server/routes/sellerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'KariGhar Backend Running', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/gemini',   geminiChatRoutes);
app.use('/api/voice',    voiceRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/seller',   sellerRoutes);

// ── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[KariGhar] Server running on http://localhost:${PORT}`);
  console.log(`[KariGhar] Environment: ${process.env.NODE_ENV || 'development'}`);
});