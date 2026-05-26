from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(
    title="AI Healthcare Risk Prediction System API",
    description="FastAPI backend serving machine learning models for Diabetes and Hypertension risk predictions, including explainable AI feature contribution analysis.",
    version="1.0.0"
)

# Enable CORS for frontend communications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model global state
MODEL_PATH = os.path.join("backend", "model.pkl")
model_data = None

def load_model():
    global model_data
    if os.path.exists(MODEL_PATH):
        try:
            model_data = joblib.load(MODEL_PATH)
            print("Successfully loaded model.pkl from disk.")
        except Exception as e:
            print(f"Error loading model.pkl: {str(e)}")
            model_data = None
    else:
        print(f"Warning: model.pkl not found at {MODEL_PATH}. API will operate in fallback mode.")

@app.on_event("startup")
def startup_event():
    load_model()

# Define input schema
class PatientQuestionnaire(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age in years", example=45)
    bmi: float = Field(..., ge=10, le=60, description="Body Mass Index", example=31.2)
    family_history: int = Field(..., ge=0, le=1, description="Family history of disease (0 = No, 1 = Yes)", example=1)
    exercise: int = Field(..., ge=0, le=4, description="Exercise frequency per week (0 to 4 times)", example=2)
    sugary_food: int = Field(..., ge=0, le=4, description="Sugary food intake scale (0 = None, 4 = High)", example=3)
    smoking: int = Field(..., ge=0, le=1, description="Smoking/Alcohol habits (0 = No, 1 = Yes)", example=0)
    thirst: int = Field(..., ge=0, le=1, description="Frequent urination / excessive thirst symptom (0 = No, 1 = Yes)", example=1)
    headaches: int = Field(..., ge=0, le=1, description="Frequent headaches / dizziness symptom (0 = No, 1 = Yes)", example=0)
    sleep: int = Field(..., ge=4, le=10, description="Average sleep duration in hours (4 to 10)", example=7)
    stress: int = Field(..., ge=0, le=3, description="Stress level (0 = Low, 3 = High)", example=2)

# Risk categories thresholds
def get_risk_category(probability: float) -> str:
    if probability < 30:
        return "Low"
    elif probability < 70:
        return "Moderate"
    else:
        return "High"

@app.post("/predict")
def predict_risk(data: PatientQuestionnaire):
    global model_data
    
    # Check if model is loaded; if not, reload it
    if model_data is None:
        load_model()
        
    # Standard fallback values if model training hasn't completed yet or fails
    if model_data is None:
        return fallback_predict(data)
        
    try:
        # 1. Unpack model data
        db_model = model_data["diabetes_model"]
        db_model_name = model_data["diabetes_model_name"]
        ht_model = model_data["hypertension_model"]
        ht_model_name = model_data["hypertension_model_name"]
        scaler = model_data["scaler"]
        cont_cols = model_data["cont_cols"]
        feature_cols = model_data["feature_cols"]
        means = model_data["means"]
        stds = model_data["stds"]
        importances = model_data["importances"]

        # Create input DataFrame
        input_dict = data.dict()
        input_df = pd.DataFrame([input_dict])[feature_cols]

        # 2. Preprocess input for models requiring scaling (Logistic Regression)
        input_df_scaled = input_df.copy()
        input_df_scaled[cont_cols] = scaler.transform(input_df[cont_cols])

        # 3. Predict Diabetes Probability
        if db_model_name == "Logistic Regression":
            db_prob = db_model.predict_proba(input_df_scaled)[0, 1]
        else:
            db_prob = db_model.predict_proba(input_df)[0, 1]

        # 4. Predict Hypertension Probability
        if ht_model_name == "Logistic Regression":
            ht_prob = ht_model.predict_proba(input_df_scaled)[0, 1]
        else:
            ht_prob = ht_model.predict_proba(input_df)[0, 1]

        # Convert probabilities to percentages (0 - 100)
        db_percentage = int(round(db_prob * 100))
        ht_percentage = int(round(ht_prob * 100))

        # Risk categories
        db_risk = get_risk_category(db_percentage)
        ht_risk = get_risk_category(ht_percentage)

        # 5. Overall Risk is determined by the highest prediction
        overall_percentage = max(db_percentage, ht_percentage)
        overall_risk = get_risk_category(overall_percentage)

        # 6. Calculate Explainable AI (Local Feature Contributions / SHAP-like explanations)
        # We calculate: (user_value - population_mean) / population_std * global_importance
        # Positive score: increases risk relative to average patient
        # Negative score: decreases risk relative to average patient
        db_contributions = {}
        ht_contributions = {}

        for col in feature_cols:
            val = input_dict[col]
            mean_val = means[col]
            std_val = stds[col] if stds[col] > 0 else 1.0
            
            # Standardized deviation
            z_score = (val - mean_val) / std_val
            
            # Diabetes contribution
            db_imp = importances["diabetes"].get(col, 0.1)
            # Adjust direction: for exercise and sleep, higher values lower diabetes risk (represented in coefficient/logit)
            # In our dataset: exercise decreases diabetes risk, sleep decreases ht risk
            direction_db = -1.0 if col in ["exercise"] else 1.0
            db_contrib = z_score * db_imp * direction_db
            db_contributions[col] = float(np.round(db_contrib, 3))

            # Hypertension contribution
            ht_imp = importances["hypertension"].get(col, 0.1)
            direction_ht = -1.0 if col in ["sleep", "exercise"] else 1.0
            ht_contrib = z_score * ht_imp * direction_ht
            ht_contributions[col] = float(np.round(ht_contrib, 3))

        # Format and sort explainability factors
        db_factors = sorted([{"feature": k, "impact": v} for k, v in db_contributions.items()], key=lambda x: abs(x["impact"]), reverse=True)
        ht_factors = sorted([{"feature": k, "impact": v} for k, v in ht_contributions.items()], key=lambda x: abs(x["impact"]), reverse=True)

        return {
            "diabetes_risk": db_risk,
            "diabetes_probability": db_percentage,
            "hypertension_risk": ht_risk,
            "hypertension_probability": ht_percentage,
            "overall_risk": overall_risk,
            "overall_probability": overall_percentage,
            "explainability": {
                "diabetes_factors": db_factors,
                "hypertension_factors": ht_factors
            },
            "models_used": {
                "diabetes": db_model_name,
                "hypertension": ht_model_name
            }
        }

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        # Raise HTTP exception or fallback
        return fallback_predict(data)

def fallback_predict(data: PatientQuestionnaire):
    # Safe fallback using deterministic clinical rules if ML engine is not online
    print("Executing deterministic fallback predictions...")
    
    # Custom score for Diabetes
    db_score = -4.2 + (data.age * 0.03) + ((data.bmi - 22) * 0.12) + (data.family_history * 1.5) + (data.sugary_food * 0.4) - (data.exercise * 0.5) + (data.thirst * 2.5)
    db_prob = 1 / (1 + np.exp(-db_score))
    db_percentage = int(round(db_prob * 100))
    
    # Custom score for Hypertension
    ht_score = -4.6 + (data.age * 0.05) + ((data.bmi - 22) * 0.15) + (data.smoking * 1.0) + (data.stress * 0.5) - ((data.sleep - 7) * 0.3) + (data.headaches * 2.0)
    ht_prob = 1 / (1 + np.exp(-ht_score))
    ht_percentage = int(round(ht_prob * 100))
    
    db_percentage = min(max(db_percentage, 5), 98)
    ht_percentage = min(max(ht_percentage, 5), 98)
    
    db_risk = get_risk_category(db_percentage)
    ht_risk = get_risk_category(ht_percentage)
    
    overall_percentage = max(db_percentage, ht_percentage)
    overall_risk = get_risk_category(overall_percentage)
    
    # Simple explainability mocks
    dummy_features = ["age", "bmi", "family_history", "exercise", "sugary_food", "smoking", "thirst", "headaches", "sleep", "stress"]
    db_factors = [{"feature": f, "impact": 0.0} for f in dummy_features]
    ht_factors = [{"feature": f, "impact": 0.0} for f in dummy_features]
    
    return {
        "diabetes_risk": db_risk,
        "diabetes_probability": db_percentage,
        "hypertension_risk": ht_risk,
        "hypertension_probability": ht_percentage,
        "overall_risk": overall_risk,
        "overall_probability": overall_percentage,
        "explainability": {
            "diabetes_factors": db_factors,
            "hypertension_factors": ht_factors
        },
        "models_used": {
            "diabetes": "Fallback Clinical Logic",
            "hypertension": "Fallback Clinical Logic"
        }
    }

@app.get("/metrics")
def get_metrics():
    global model_data
    if model_data is None:
        load_model()
        
    if model_data is None or "metrics" not in model_data:
        raise HTTPException(status_code=404, detail="Model training metrics are currently unavailable. Please run training.")
        
    return model_data["metrics"]

@app.get("/feature-importance")
def get_feature_importance():
    global model_data
    if model_data is None:
        load_model()
        
    if model_data is None or "importances" not in model_data:
        raise HTTPException(status_code=404, detail="Model feature importances are currently unavailable. Please run training.")
        
    return model_data["importances"]
