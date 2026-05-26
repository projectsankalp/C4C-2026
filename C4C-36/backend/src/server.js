require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Import Routes (commented out for now)
// const adminRoutes = require('./routes/adminRoutes');
// const volunteerRoutes = require('./routes/volunteerRoutes');
// const userRoutes = require('./routes/userRoutes');
// const publicRoutes = require('./routes/publicRoutes');

// Base Routes
// app.use('/api/admin', adminRoutes);
// app.use('/api/volunteers', volunteerRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/public', publicRoutes);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running successfully' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
