const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'EcoRewards API Running' })
})

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/detect', require('./routes/detectRoutes'))
app.use('/api/rewards', require('./routes/rewardRoutes'))
app.use('/api/events', require('./routes/eventRoutes'))
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})