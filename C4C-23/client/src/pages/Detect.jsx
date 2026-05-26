import { useState } from 'react'

import Navbar from '../components/Navbar'

import { useAuth }
from '../context/AuthContext'

import api from '../services/api'

import {
  submitUpload
} from '../firebase/firestore'

function Detect() {

  const { currentUser } =
    useAuth()

  const [image, setImage] =
    useState(null)

  const [loading, setLoading] =
    useState(false)

  const [result, setResult] =
    useState(null)

  const uploadToCloudinary =
    async () => {

      console.log(
        'Uploading to Cloudinary...'
      )

      const formData =
        new FormData()

      formData.append(
        'file',
        image
      )

      formData.append(

        'upload_preset',

        import.meta.env
          .VITE_CLOUDINARY_UPLOAD_PRESET

      )

      const res = await fetch(

        `https://api.cloudinary.com/v1_1/${
          import.meta.env
            .VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,

        {
          method: 'POST',

          body: formData
        }

      )

      const data =
        await res.json()

      console.log(
        'Cloudinary Response:',
        data
      )

      return data.secure_url

    }

  const handleDetect =
    async () => {

      if (!image) {

        alert('Select image')

        return

      }

      setLoading(true)

      try {

        /* CLOUDINARY */

        const imageUrl =
          await uploadToCloudinary()

        console.log(
          'Image URL:',
          imageUrl
        )

        /* GEMINI */

        const response =
          await api.post(
            '/detect',
            {
              imageUrl
            }
          )

        console.log(
          'Gemini Response:',
          response.data
        )

        const aiResult =
          response.data

        setResult(aiResult)

        /* FIRESTORE */

        await submitUpload({

          imageUrl,

          userId:
            currentUser.uid,

          userName:
            currentUser.name,

          city:
            currentUser.city,

          confidence:
            aiResult.confidence,

          status: 'pending',

          pointsAwarded:
            aiResult.points

        })

        console.log(
          'Upload saved to Firestore'
        )

        alert(
          'Submitted for admin approval'
        )

      } catch (error) {

        console.log(
          'DETECT ERROR:',
          error
        )

        alert(
          'Detection failed'
        )

      }

      setLoading(false)

    }

  return (

    <>
      <Navbar />

      <div className='section'>

        <div className='dashboard-header'>

          <div>

            <div className='section-tag'>
              Gemini Vision AI
            </div>

            <h2>
              Plastic Waste Detection ♻
            </h2>

            <p>

              Upload waste images
              for AI verification.

            </p>

          </div>

        </div>

        <div className='detect-card'>

          <input
            type='file'
            accept='image/*'
            onChange={(e) =>
              setImage(
                e.target.files[0]
              )
            }
          />

          {image && (

            <img
              src={URL.createObjectURL(image)}
              alt='preview'
              className='detect-preview'
            />

          )}

          <button
            className='btn-primary'
            onClick={handleDetect}
            disabled={loading}
          >

            {loading
              ? 'Analyzing...'
              : 'Analyze Plastic'}

          </button>

          {result && (

            <div className='detect-result'>

              <h3>

                {result.isPlastic
                  ? 'Plastic Detected ♻'
                  : 'Not Plastic ❌'}

              </h3>

              <p>

                Confidence:
                {' '}
                {result.confidence}%

              </p>

              <p>

                Reward Points:
                {' '}
                {result.points}

              </p>

            </div>

          )}

        </div>

      </div>

    </>

  )

}

export default Detect