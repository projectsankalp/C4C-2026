require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { startScheduler } = require('./services/followupScheduler');

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🌿 NirAmaya server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    startScheduler();
  });
});
