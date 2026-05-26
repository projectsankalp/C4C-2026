# 🛡️ ToxCore — Cyberbullying Detection & Education Platform
### Hackathon Project Documentation

---

## 🚀 Project Overview

# 🛡️ ToxCore — Cyberbullying Detection & Education Platform
**** is a web application that analyzes YouTube video comments using machine learning sentiment analysis to detect cyberbullying. It identifies harmful comments, explains *why* they're harmful, and provides tailored educational resources to help users understand and prevent online bullying.

---

## 🎯 MVP Scope (Hackathon Build)

> Keep it lean. Ship what matters. The MVP proves the concept end-to-end.

### What the MVP Does

| Feature | Description |
|---|---|
| **Any YouTube URL Input** | User pastes **any** YouTube video URL — music videos, vlogs, news, anything |
| **Real Account Names** | Comments are fetched with the **actual YouTube display name** of who posted them (e.g., `@MrBeast`, `@xXDarkSlayer99Xx`) — never anonymized |
| **Comment Fetching** | Backend fetches top N comments using YouTube Data API v3 |
| **Sentiment Analysis** | ML model classifies each comment (toxic / not toxic) |
| **Explanation** | Each flagged comment gets a human-readable reason (e.g., "Contains hate speech targeting identity") |
| **Resource Cards** | Tailored anti-bullying resources shown based on comment category |
| **Results Dashboard** | Visual 














ary — total comments analyzed, % harmful, category breakdown |


### What the MVP Does NOT include (Post-hackathon)
- User authentication / saved history
- Real-time comment streaming
- Multi-platform support (Twitter, Instagram, etc.)
- Admin moderation dashboard
- Email alerts / notifications

---

## 🏗️ Tech Stack

```
Frontend        →  React.js + TailwindCSS
Backend         →  Python + FastAPI
ML Model        →  HuggingFace Transformers (Detoxify or cardiffnlp/twitter-roberta-base-offensive)
YouTube API     →  Google YouTube Data API v3
Database        →  None required for MVP (in-memory / stateless)
Deployment      →  Render.com (backend) + Vercel (frontend)
```

---

## 🗂️ Project Structure

```
cyberguard/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── URLInput.jsx          # YouTube URL form
│   │   │   ├── CommentCard.jsx       # Single comment with verdict
│   │   │   ├── ResourceCard.jsx      # Anti-bullying resource display
│   │   │   └── Dashboard.jsx         # Summary stats
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── main.py                       # FastAPI app entrypoint
│   ├── routes/
│   │   └── analyze.py                # POST /analyze endpoint
│   ├── services/
│   │   ├── youtube_service.py        # Fetch comments via YouTube API
│   │   ├── ml_service.py             # Run sentiment/toxicity model
│   │   └── resource_service.py       # Map categories → resources
│   ├── models/
│   │   └── schemas.py                # Pydantic request/response models
│   ├── requirements.txt
│   └── .env                          # API keys (never commit this!)
│
└── README.md
```

---

## ⚙️ Backend — FastAPI Setup

### `requirements.txt`
```
fastapi
uvicorn
httpx
google-api-python-client
detoxify
transformers
torch
python-dotenv
pydantic
```

### `backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyze import router

app = FastAPI(title="CyberGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
```

### `backend/models/schemas.py`
```python
from pydantic import BaseModel
from typing import List

class AnalyzeRequest(BaseModel):
    youtube_url: str
    max_comments: int = 50

class CommentResult(BaseModel):
   comment_id: str
    text: str
    author: str               # Real YouTube display name (e.g. "@PewDiePie")
    author_channel_url: str   # Link to commenter's YouTube channel
    author_profile_img: str   # Profile picture URL
    like_count: int           # Number of likes on the comment
    is_harmful: bool
    toxicity_score: float
    category: str             # e.g., "insult", "threat", "identity_attack"
    reason: str               # Human-readable explanation
    resources: List[dict]     # Tailored anti-bullying resources

class AnalyzeResponse(BaseModel):
     video_id: str
    video_title: str          # Actual YouTube video title
    youtube_url: str          # Echo back the original URL
    total_comments: int
    harmful_count: int
    results: List[CommentResult]
```

### `backend/services/youtube_service.py`
```python
import re
from googleapiclient.discovery import build
from dotenv import load_dotenv
import os

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def extract_video_id(url: str) -> str:
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11})"
    match = re.search(pattern, url)
    if not match:
        raise ValueError("Invalid YouTube URL")
    return match.group(1)

def fetch_comments(video_id: str, max_results: int = 50) -> list:
    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    response = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=max_results,
        textFormat="plainText"
    ).execute()

    comments = []
    for item in response.get("items", []):
        snippet = item["snippet"]["topLevelComment"]["snippet"]
        comments.append({
            "comment_id": item["id"],
            "text": snippet["textDisplay"],
            "author": snippet["authorDisplayName"]
        })
    return comments

```

### `backend/services/ml_service.py`
```python
from detoxify import Detoxify

model = Detoxify("original")  # Load once at startup

CATEGORY_LABELS = {
    "toxicity": "General Toxicity",
    "severe_toxicity": "Severe Toxicity",
    "obscene": "Obscene Language",
    "threat": "Threat / Violence",
    "insult": "Personal Insult",
    "identity_attack": "Identity-Based Attack",
}

REASONS = {
    "toxicity": "This comment contains language that is rude or disrespectful.",
    "severe_toxicity": "This comment contains extremely harmful language.",
    "obscene": "This comment uses explicit or offensive language.",
    "threat": "This comment appears to threaten harm to someone.",
    "insult": "This comment personally attacks or demeans an individual.",
    "identity_attack": "This comment targets someone based on their identity (race, religion, gender, etc.).",
}

THRESHOLD = 0.6

def analyze_comment(text: str) -> dict:
    scores = model.predict(text)
    top_category = max(scores, key=scores.get)
    top_score = scores[top_category]
    is_harmful = top_score >= THRESHOLD

    return {
        "is_harmful": is_harmful,
        "toxicity_score": round(top_score, 3),
        "category": top_category if is_harmful else "clean",
        "reason": REASONS.get(top_category, "No issues detected.") if is_harmful else "This comment appears safe.",
    }
```

### `backend/services/resource_service.py`
```python
RESOURCES = {
    "threat": [
        {"title": "Report to Platform", "url": "https://support.google.com/youtube/answer/2801979", "description": "Report threatening content directly to YouTube."},
        {"title": "StopBullying.gov", "url": "https://www.stopbullying.gov", "description": "Official U.S. government cyberbullying resources."},
    ],
    "identity_attack": [
        {"title": "ADL Cyberhate", "url": "https://www.adl.org/resources/tools-to-track-hate", "description": "Resources for identity-based hate speech."},
        {"title": "No Hate Speech Movement", "url": "https://www.coe.int/en/web/no-hate-campaign", "description": "Council of Europe campaign against online hate."},
    ],
    "insult": [
        {"title": "Cybersmile Foundation", "url": "https://www.cybersmile.org", "description": "Support and resources for bullying victims."},
        {"title": "Crisis Text Line", "url": "https://www.crisistextline.org", "description": "Text HOME to 741741 for free, 24/7 crisis support."},
    ],
    "default": [
        {"title": "StopBullying.gov", "url": "https://www.stopbullying.gov", "description": "Recognize, prevent, and respond to bullying."},
        {"title": "Cybersmile Foundation", "url": "https://www.cybersmile.org", "description": "Cyberbullying help and support."},
    ]
}

def get_resources(category: str) -> list:
    return RESOURCES.get(category, RESOURCES["default"])
```

### `backend/routes/analyze.py`
```python
from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse, CommentResult
from services.youtube_service import extract_video_id, fetch_comments
from services.ml_service import analyze_comment
from services.resource_service import get_resources

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    try:
        video_id = extract_video_id(request.youtube_url)
        comments = fetch_comments(video_id, request.max_comments)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube API error: {str(e)}")

    results = []
    for comment in comments:
        analysis = analyze_comment(comment["text"])
        resources = get_resources(analysis["category"]) if analysis["is_harmful"] else []
        results.append(CommentResult(
            comment_id=comment["comment_id"],
            text=comment["text"],
            author=comment["author"],
            resources=resources,
            **analysis
        ))

    return AnalyzeResponse(
        video_id=video_id,
        total_comments=len(results),
        harmful_count=sum(1 for r in results if r.is_harmful),
        results=results
    )
```

---

## 🖥️ Frontend — React Setup

### Key Component: `URLInput.jsx`
```jsx
import { useState } from "react";

export default function URLInput({ onResults }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtube_url: url, max_comments: 50 }),
    });
    const data = await res.json();
    onResults(data);
    setLoading(false);
  };

  return (
    <div className="flex gap-2 p-4">
      <input
        className="flex-1 border rounded px-4 py-2"
        placeholder="Paste YouTube URL here..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  );
}
```

---

## 🛠️ VS Code Setup — Step by Step

### 1. Clone & Open Project
```bash
git clone https://github.com/your-team/cyberguard.git
cd cyberguard
code .
```

### 2. Recommended VS Code Extensions
Install these from the Extensions panel (`Ctrl+Shift+X`):

| Extension | Purpose |
|---|---|
| **Python** (Microsoft) | Python IntelliSense & debugging |
| **Pylance** | Type checking for FastAPI |
| **ES7+ React/Redux Snippets** | React component shortcuts |
| **Tailwind CSS IntelliSense** | Tailwind class autocomplete |
| **REST Client** | Test API right inside VS Code |
| **Thunder Client** | Lightweight Postman alternative in VS Code |
| **GitLens** | Git blame + history |
| **dotenv** | `.env` file syntax highlighting |

### 3. Backend Setup in VS Code
```bash
# Open integrated terminal (Ctrl+`)
cd backend
python -m venv venv
source venv/bin/activate          # Mac/Linux
# OR: venv\Scripts\activate       # Windows

pip install -r requirements.txt

# Create .env file
echo "YOUTUBE_API_KEY=your_key_here" > .env

# Run backend
uvicorn main:app --reload --port 8000
```

### 4. Frontend Setup in VS Code
```bash
# Open a second terminal tab
cd frontend
npm install
npm start
```

### 5. VS Code Workspace Settings
Create `.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python",
  "editor.formatOnSave": true,
  "python.formatting.provider": "black",
  "tailwindCSS.includeLanguages": { "javascript": "javascript" }
}
```

### 6. VS Code Launch Config (Debugger)
Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI Debug",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload"],
      "cwd": "${workspaceFolder}/backend",
      "envFile": "${workspaceFolder}/backend/.env"
    }
  ]
}
```
Now hit `F5` to launch the backend with full debugging support.

---

## 🧪 Testing in Postman

### 1. Import Setup
- Open Postman → Create new Collection → Name it `CyberGuard API`
- Set base URL variable: `{{base_url}}` = `http://localhost:8000`

### 2. Test: Analyze YouTube URL

**Request:**
```
POST {{base_url}}/api/analyze
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "max_comments": 20
}
```

**Expected Response (200 OK):**
```json
{
  "video_id": "dQw4w9WgXcQ",
  "total_comments": 20,
  "harmful_count": 3,
  "results": [
    {
      "comment_id": "abc123",
      "text": "You're such an idiot",
      "author": "SomeUser",
      "is_harmful": true,
      "toxicity_score": 0.87,
      "category": "insult",
      "reason": "This comment personally attacks or demeans an individual.",
      "resources": [...]
    }
  ]
}
```

### 3. Test: Invalid URL

**Body:**
```json
{
  "youtube_url": "not-a-real-url"
}
```
**Expected:** `400 Bad Request` with `"detail": "Invalid YouTube URL"`

### 4. Test: Docs UI
FastAPI auto-generates interactive docs. Visit:
```
http://localhost:8000/docs
```
You can run all requests directly from the browser — great for quick demos during judging!

### 5. Postman Environment Variables
| Variable | Value |
|---|---|
| `base_url` | `http://localhost:8000` |
| `youtube_key` | *(your API key for reference)* |

---

## 🌐 Deployment Options

### Option 1: Render + Vercel ⭐ (Recommended for Hackathon)

**Backend on Render:**
1. Push backend to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect repo, set:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add env var: `YOUTUBE_API_KEY`
5. Free tier gives you a live HTTPS URL in ~3 minutes

**Frontend on Vercel:**
1. Push frontend to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Set env var: `REACT_APP_API_URL=https://your-render-url.onrender.com`
4. Deploy — live in ~1 minute

---

### Option 2: Railway (Full-stack on one platform)
- Supports Python + Node in same project
- Free $5/month credits — enough for a hackathon
- Great GitHub integration

---

### Option 3: Docker + Fly.io
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```
```bash
fly launch
fly secrets set YOUTUBE_API_KEY=your_key
fly deploy
```

---

### Option 4: Google Cloud Run (Free Tier)
- Serverless — scales to zero when not in use
- Good for ML workloads (can request GPU instances)
- Connects well with YouTube API (same Google ecosystem)

---

## 🔑 Environment Variables Needed

| Variable | Where to Get |
|---|---|
| `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) → Enable YouTube Data API v3 |

---

## 🧠 ML Model Options (Pick One)

| Model | Library | Pros | Cons |
|---|---|---|---|
| **Detoxify** | `detoxify` | Easy setup, 6 toxicity categories | English only |
| **cardiffnlp/twitter-roberta** | `transformers` | Twitter-trained, realistic | Slower to load |
| **OpenAI Moderation API** | REST API | No GPU needed, free | Requires OpenAI key |
| **Perspective API** (Google) | REST API | Purpose-built for comments | API quota limits |

> 💡 For a hackathon, **Detoxify** or **Perspective API** are the fastest to integrate.

---

## 📋 Hackathon Day Checklist

- [ ] YouTube Data API key created and working
- [ ] Backend runs locally: `uvicorn main:app --reload`
- [ ] Frontend runs locally: `npm start`
- [ ] `/api/analyze` tested in Postman with a real YouTube URL
- [ ] Frontend displays harmful comments with red highlights
- [ ] Resource cards shown for flagged comments
- [ ] Summary stats (total / harmful count / %) visible on dashboard
- [ ] Deployed backend URL updated in frontend env
- [ ] Both frontend and backend deployed and publicly accessible
- [ ] Demo video URL ready (optional but impressive)

---

## 💡 Bonus Features (If Time Allows)

- **Severity heatmap** — color-coded comment list (red/yellow/green)
- **Download Report** — export flagged comments as PDF/CSV
- **Share Results** — shareable URL for analysis results
- **Comment Reply Suggestions** — AI-generated kind responses to bullying
- **Trend Chart** — toxicity over comment timeline (newer vs older comments)

---

*Built with ❤️ for a safer internet. CyberGuard — Hackathon 2025*
