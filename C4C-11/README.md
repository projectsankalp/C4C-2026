# ToxCore 🛡️

> AI-powered online toxicity detection and support platform

ToxCore analyzes user-submitted text for harmful content across multiple categories and provides an intelligent chatbot assistant to help users understand toxicity and stay safe online.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

ToxCore combines a fine-tuned BERT model with a conversational AI assistant to deliver real-time toxicity analysis. Whether you're moderating a community, building a safer platform, or simply curious about online content, ToxCore gives you instant, explainable results.

---

## Features

### 🔍 Toxicity Analysis Engine
- Classifies comments across **6 categories**: toxicity, severe toxicity, obscene, threat, insult, and identity attack
- Returns per-category **confidence scores** with a configurable 0.5 threshold for flagging
- Provides **human-readable explanations** for why content was flagged

### 🤖 ToxCore AI Chatbot
- Floating chat widget embedded directly in the UI
- Conversational assistant with **full message history context**
- Helps users understand toxicity concepts and online safety best practices

### ⚡ Real-Time Results
- Instant feedback with toxicity scores, top category, and a clean/harmful verdict
- Smooth, responsive UI with loading animations and auto-scroll

---

## Tech Stack

| Layer | Technology |
|---|---|
| ML Model | `unitary/toxic-bert` (BERT fine-tuned on Jigsaw dataset) |
| ML Framework | PyTorch + HuggingFace Transformers |
| LLM (Chatbot) | Google Gemini 2.5 Flash via `google-generativeai` SDK |
| Backend | Python (FastAPI) |
| Frontend | React (with hooks) + Tailwind CSS |
| Config | `python-dotenv` for API key management |
| Compute | CUDA GPU with CPU fallback |

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- A Google Gemini API key
- (Optional) CUDA-compatible GPU for faster inference

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/toxcore.git
   cd toxcore
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   ```

4. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the App

Start the backend:
```bash
cd backend
uvicorn main:app --reload
```

Start the frontend (in a separate terminal):
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Usage

1. Paste or type any comment into the analysis input box
2. Click **Analyze** to run the toxicity detection
3. View the breakdown of scores across all 6 categories
4. Use the **ToxCore chatbot** (bottom-right widget) to ask follow-up questions or learn more about online safety

---

## API Reference

### `POST /api/analyze`

Analyzes a comment for toxicity.

**Request body:**
```json
{
  "text": "Your comment here"
}
```

**Response:**
```json
{
  "verdict": "harmful",
  "top_category": "insult",
  "scores": {
    "toxicity": 0.87,
    "severe_toxicity": 0.12,
    "obscene": 0.45,
    "threat": 0.03,
    "insult": 0.91,
    "identity_attack": 0.08
  },
  "reason": "The comment contains language that directly demeans an individual."
}
```

### `POST /api/chat`

Sends a message to the ToxCore AI assistant.

**Request body:**
```json
{
  "message": "What is identity-based hate speech?",
  "history": []
}
```

**Response:**
```json
{
  "reply": "Identity-based hate speech targets individuals or groups based on characteristics like race, religion, gender, or sexual orientation..."
}
```

---

## Project Structure

```
toxcore/
├── backend/
│   ├── main.py            # FastAPI app and route definitions
│   ├── model.py           # BERT toxicity classifier
│   ├── chatbot.py         # Gemini chatbot integration
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalysisPanel.jsx
│   │   │   └── ChatWidget.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change, then submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
