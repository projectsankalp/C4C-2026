const router = require('express').Router()

router.get('/', (req, res) => {
  res.json({ message: 'Events Route Working' })
})

module.exports = router