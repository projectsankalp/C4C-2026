const express = require('express');
const cors = require('cors');

const { errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const screeningRoutes = require('./routes/screening.routes');
const alertRoutes = require('./routes/alert.routes');
const followupRoutes = require('./routes/followup.routes');
const referralRoutes = require('./routes/referral.routes');
const diabetesRoutes = require('./routes/diabetes.routes');

const app = express();

// ==============================
// CORS CONFIGURATION
// ==============================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle preflight OPTIONS requests explicitly
app.options('*', cors());

// ==============================
// BODY PARSER
// ==============================
app.use(express.json());

// ==============================
// HEALTH CHECK ROUTE
// ==============================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    app: 'NirAmaya',
  });
});

// ==============================
// API ROUTES
// ==============================
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/screenings', screeningRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/followups', followupRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/diabetes', diabetesRoutes);

// ==============================
// GLOBAL ERROR HANDLER
// ==============================
app.use(errorHandler);

module.exports = app;