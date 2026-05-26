# EcoRewards ♻️

EcoRewards is a full-stack sustainability platform that encourages responsible plastic waste disposal through AI-powered detection, gamification, and community engagement.

Users upload images of plastic waste, earn eco-points after admin verification, compete on leaderboards, redeem eco-friendly rewards, and participate in municipality cleanup drives.

---

# 🌍 Problem Statement

Plastic waste pollution is one of the biggest environmental challenges today. Many citizens lack motivation and incentives to properly segregate and dispose of recyclable waste.

EcoRewards solves this problem by:

* encouraging sustainable habits
* rewarding responsible disposal
* building eco-conscious communities
* supporting municipality cleanup initiatives

---

# 🚀 Features

## 🔐 Authentication

* Firebase Authentication
* User & Admin roles
* Secure login/register system

## 🤖 AI Plastic Detection

* Upload waste images
* AI verifies plastic waste
* Confidence-based detection
* Admin approval workflow

## 🏆 Gamification

* Eco points system
* Realtime leaderboard
* Achievement badges
* Sustainability ranks

## 🎁 Rewards System

Users can redeem points for:

* saplings
* fertilizers
* eco-friendly municipal rewards

## 🌱 Community Cleanup Drives

* Municipality-organized events
* Event registration system
* Bonus participation rewards
* QR-based reward expansion support

## 📊 Dashboard

Users can track:

* approved uploads
* total points
* waste prevented
* joined events
* eco achievements

## 🛠 Admin Panel

Admins can:

* approve/reject uploads
* create events
* manage users
* monitor platform activity

---

# 🧠 Tech Stack

## Frontend

* React.js
* React Router
* Context API
* CSS3

## Backend

* Node.js
* Express.js

## Database & Auth

* Firebase Authentication
* Firestore Realtime Database

## AI & Media

* Roboflow Object Detection
* Cloudinary Image Hosting

---

# 📂 Project Structure

```bash
EcoRewards/
│
├── client/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── context/
│   └── firebase/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   └── index.js
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/ecorewards.git
cd ecorewards
```

## 2️⃣ Install Client Dependencies

```bash
cd client
npm install
```

## 3️⃣ Install Server Dependencies

```bash
cd ../server
npm install
```

---

# 🔑 Environment Variables

## Client `.env`

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Server `.env`

```env
PORT=5000
ROBOFLOW_API_KEY=your_roboflow_api_key
```

---

# ▶️ Run Project

## Start Backend

```bash
cd server
npm run dev
```

## Start Frontend

```bash
cd client
npm run dev
```

---

# 👥 User Flow

1. User registers/login
2. Uploads plastic waste image
3. AI analyzes image
4. Upload goes for admin verification
5. Admin approves/rejects
6. Points awarded on approval
7. Leaderboard updates in realtime
8. Users redeem rewards & join events

---

# 🏅 Future Enhancements

* QR code verification for events
* Municipality analytics dashboard
* Mobile app version
* GPS-based cleanup mapping
* Multi-material waste classification
* Carbon footprint tracking

---

# 📸 Demo Highlights

* Realtime eco leaderboard
* AI waste verification
* Event participation system
* Community gamification
* Reward-based sustainability model

---

# 🌿 Impact

EcoRewards promotes:

* cleaner cities
* sustainable recycling habits
* community participation
* environmental awareness
* smart civic engagement

---

# 👨‍💻 Developed By

**Mohammed Rayyan**

Cybersecurity & Full Stack Developer

---

# 📄 License

This project is built for educational and hackathon purposes.
