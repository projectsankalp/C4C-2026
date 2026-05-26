const axios = require('axios')

exports.detectPlastic =
  async (req, res) => {

    try {

      const {
        imageUrl
      } = req.body

      if (!imageUrl) {

        return res.status(400).json({

          error:
            'Image URL required'

        })

      }

      console.log(
        'IMAGE URL:',
        imageUrl
      )

      /* REAL ROBOFLOW REQUEST */

      const response =
        await axios({

          method: 'POST',

          url:
            'https://detect.roboflow.com/plastic-waste-cdvko-437ra/1',

          params: {

            api_key:
              process.env.ROBOFLOW_API_KEY,

            image:
              imageUrl

          }

        })

      console.log(
        'ROBOFLOW RESPONSE:',
        response.data
      )

      /* PREDICTIONS */

      const predictions =
        response.data
          .predictions || []

      const objectCount =
        predictions.length

      /* CONFIDENCE */

      let confidence = 0

      if (objectCount > 0) {

        confidence =
          Math.max(

            ...predictions.map(
              (p) =>

                Math.round(
                  p.confidence * 100
                )

            )

          )

      }

      /* DETECTED */

      const detected =
        objectCount > 0

      /* POINTS */

      const points =
        detected
          ? objectCount * 50
          : 0

      /* RESPONSE */

      res.json({

        isPlastic:
          detected,

        confidence,

        points,

        objectCount,

        predictions

      })

    } catch (error) {

      console.log(
        'BACKEND ERROR:'
      )

      if (error.response) {

        console.log(
          error.response.data
        )

      } else {

        console.log(error)

      }

      res.status(500).json({

        error:
          'Detection failed'

      })

    }

  }