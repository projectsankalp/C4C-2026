# HealAI Risk - Complete AI Healthcare Risk Prediction System

HealAI Risk is an advanced, modern AI-powered health monitoring and screening application designed to predict the risk of **Diabetes** and **Hypertension**, and compute an **Overall Health Risk Score** utilizing multiple Machine Learning pipelines.

This system consists of an isolated, high-performance **FastAPI backend** in Python that evaluates patient attributes using clinical models trained on **100,000 synthetic patient records**, and a premium **React.js frontend** featuring interactive responsive layouts, dark mode, high-fidelity Recharts visual metrics, an Explainable AI (XAI) feature contribution dashboard (simulating local SHAP explanations), a real-time BMI calculator, and automated clinical recommendation exporting (PDF).

---

## 📂 Project Architecture

```
Risk Analysis/
 ├── backend/
 │    ├── generate_dataset.py   # Synthesizes 100,000 clinically correlated records
 │    ├── train_model.py        # Compares XGBoost, RF, & LR; serializes the best model
 │    ├── main.py               # FastAPI endpoints, CORS settings, predictive engine
 │    ├── requirements.txt      # Python dependencies
 │    ├── patient_data.csv      # Generated dataset (100k rows)
 │    └── model.pkl             # Serialized best model state & scaler binaries
 │
 ├── frontend/
 │    ├── src/
 │    │    ├── components/
 │    │    │    ├── Navbar.jsx        # Premium responsive glass navbar with dark mode toggles
 │    │    │    └── BMIWidget.jsx     # Dual-unit real-time BMI slider widget
 │    │    ├── pages/
 │    │    │    ├── Home.jsx          # Dashboard with ML model performance & feature importances
 │    │    │    ├── RiskForm.jsx      # Animated multi-step clinical questionnaire
 │    │    │    ├── Results.jsx       # Visual gauges, XAI SHAP waterfall bars, & PDF export
 │    │    │    ├── Recommendations.jsx # Personalized medical & nutritional advisor
 │    │    │    ├── History.jsx       # Past assessment tracking & Recharts trend lines
 │    │    │    └── Auth.jsx          # Mock patient login/signup gateway
 │    │    ├── services/
 │    │    │    └── api.js            # Axios client with robust offline clinical rules fallback
 │    │    ├── App.jsx                # Router & page configurations
 │    │    ├── main.jsx               # Application entrypoint
 │    │    ├── index.css              # Custom Tailwind directives & glassmorphic system styles
 │    │    └── App.css                # Cleared default styles
 │    ├── tailwind.config.js          # Tailwind CSS compiler configs
 │    ├── postcss.config.js           # PostCSS compiler configs
 │    ├── index.html                  # HTML template with embedded Inter typography
 │    └── package.json                # Frontend packages list
 │
 └── README.md                        # Project handbook & deployment instructions
```

---

## 🚀 Local Quick-Start Guide

Follow these commands to run both the FastAPI server and the React Vite server locally.

### 🐍 Step 1: Set Up & Run the Backend

You must have **Python 3.10+** (we recommend Python 3.11) installed on your local machine.

1. **Navigate to the workspace root directory and create a virtual environment:**
   ```bash
   py -3.11 -m venv .venv
   ```

2. **Activate the virtual environment:**
   - **PowerShell:**
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **Command Prompt (CMD):**
     ```cmd
     .venv\Scripts\activate.bat
     ```

3. **Install the Python requirements:**
   ```bash
   pip install -r backend\requirements.txt
   ```

4. **Synthesize the patient dataset (100,000 records):**
   ```bash
   python backend\generate_dataset.py
   ```
   *Expected Output: `Successfully saved dataset to backend\patient_data.csv`*

5. **Train and evaluate the machine learning models:**
   ```bash
   python backend\train_model.py
   ```
   *Expected Output: Fits and compares XGBoost, Random Forest, and Logistic Regression on both targets, logs a metrics comparison grid, and serializes the best performing architecture (Logistic Regression due to perfect logit fits) to `backend\model.pkl`.*

6. **Boot up the FastAPI REST API server:**
   ```bash
   uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The FastAPI server will be active at `http://127.0.0.1:8000`. You can inspect the interactive OpenAPI Swagger docs at `http://127.0.0.1:8000/docs`.*

---

### ⚛️ Step 2: Set Up & Run the Frontend

You must have **Node.js (v18+)** and **npm** installed.

1. **Open a new terminal window, navigate to the `frontend/` directory:**
   ```bash
   cd frontend
   ```

2. **Install all frontend dependencies (utilizing React 19 and Tailwind CSS v3):**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the Vite local development server:**
   ```bash
   npm run dev
   ```
   *The React interface will boot up instantly. Access it in your browser at `http://localhost:5173`.*

---

## ⚡ REST API Specification

### `POST /predict`
Evaluates a patient's questionnaire inputs and calculates their predictive health risks.
- **Request Body Schema:**
  ```json
  {
    "age": 45,
    "bmi": 31.2,
    "family_history": 1,
    "exercise": 2,
    "sugary_food": 3,
    "smoking": 0,
    "thirst": 1,
    "headaches": 0,
    "sleep": 7,
    "stress": 2
  }
  ```
- **Response Body Schema:**
  ```json
  {
    "diabetes_risk": "High",
    "diabetes_probability": 87,
    "hypertension_risk": "Moderate",
    "hypertension_probability": 65,
    "overall_risk": "High",
    "overall_probability": 87,
    "explainability": {
      "diabetes_factors": [
        { "feature": "thirst", "impact": 1.25 },
        { "feature": "bmi", "impact": 0.38 }
      ],
      "hypertension_factors": [
        { "feature": "age", "impact": 0.88 },
        { "feature": "stress", "impact": 0.42 }
      ]
    },
    "models_used": {
      "diabetes": "Logistic Regression",
      "hypertension": "Logistic Regression"
    }
  }
  ```

### `GET /metrics`
Exposes the metrics logged during the training of the models (XGBoost, Random Forest, Logistic Regression).

### `GET /feature-importance`
Exposes the global feature weights mapped by the best-fitting classifiers.

---

## ☁️ Production Deployment Instructions

### 🌐 1. Deploying the FastAPI Backend to Render / Railway

You can deploy the Python API for free to **Render** or **Railway**.

#### For Render:
1. Commit your codebase to a GitHub repository.
2. Sign in to [Render Dashboard](https://dashboard.render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following service parameters:
   - **Environment:** `Python`
   - **Region:** Choose a region close to your target audience.
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt && python backend/generate_dataset.py && python backend/train_model.py
     ```
     *(This automatically installs packages, synthesizes the 100k dataset, and trains the model parameters during deployment so the server boots up with `model.pkl` fully ready!)*
   - **Start Command:**
     ```bash
     uvicorn backend.main:app --host 0.0.0.0 --port $PORT
     ```
5. Click **Create Web Service**. Render will spin up the backend, assign a public HTTPS domain (e.g. `https://healai-backend.onrender.com`), and expose your endpoints!

---

### 🎨 2. Deploying the React Frontend to Vercel

Vercel provides seamless deployment for Vite React applications.

1. Install Vercel CLI globally or use the dashboard:
   - Sign in to the [Vercel Dashboard](https://vercel.com).
   - Create a **New Project** and connect your GitHub repository.
2. Configure project parameters:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Set **Environment Variables**:
   - If you want the frontend to call your live production backend, open `frontend/src/services/api.js` and change `const API_URL = 'http://localhost:8000'` to point to your live Render/Railway URL (e.g., `https://healai-backend.onrender.com`).
4. Click **Deploy**. Vercel will bundle the assets and host your modern UI live!
