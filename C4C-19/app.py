from fastapi import FastAPI
import joblib
import pandas as pd

app = FastAPI()

# LOAD MODELS

diabetes_model = joblib.load(
    "models/diabetes_model.pkl"
)

hypertension_model = joblib.load(
    "models/hypertension_model.pkl"
)

# ROOT ROUTE

@app.get("/")
def root():

    return {
        "message": "ML Server Running"
    }

# PREDICTION ROUTE

@app.post("/predict")
def predict(data: dict):

    diabetes_input = pd.DataFrame(
        [data["diabetes"]]
    )

    hypertension_input = pd.DataFrame(
        [data["hypertension"]]
    )

    diabetes_prediction = diabetes_model.predict(
        diabetes_input
    )[0]

    hypertension_prediction = hypertension_model.predict(
        hypertension_input
    )[0]

    return {

        "diabetesRisk":
            "High Risk"
            if diabetes_prediction == 1
            else "Low Risk",

        "hypertensionRisk":
            "High Risk"
            if hypertension_prediction == 1
            else "Low Risk"

    }