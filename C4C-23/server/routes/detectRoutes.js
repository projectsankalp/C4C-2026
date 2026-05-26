const express =
  require('express')

const router =
  express.Router()

const {

  detectPlastic

} = require(
  '../controllers/detectController'
)

router.get(
  '/',
  (req, res) => {

    res.json({

      message:
        'Detect API Working'

    })

  }
)

router.post(
  '/',
  detectPlastic
)

module.exports = router