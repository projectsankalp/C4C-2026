const { connectDB } = require('../../src/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();

    console.log('✅ Follow-up cron executed');

    res.status(200).json({
      success: true,
      message: 'Cron job executed successfully',
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};