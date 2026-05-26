from pathlib import Path
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
import requests

MODEL_PATHS = [
    Path("apps/ai/model/groundwater_xgboost_model.pkl"),
    Path("apps/ai/model/groundwater_model.pkl"),
]


def load_model():
    for model_path in MODEL_PATHS:
        if model_path.exists():
            return joblib.load(model_path)

    raise FileNotFoundError(
        "No groundwater model file found in apps/ai/model/"
    )


model = load_model()

district_encoder = joblib.load(
    "apps/ai/model/district_encoder.pkl"
)

state_encoder = joblib.load(
    "apps/ai/model/state_encoder.pkl"
)

API_KEY = "99ad26a0baf8948c7978c3e12e14c08a"


class AIService:

    @staticmethod
    def get_weather(city):

        url = (
            f"https://api.openweathermap.org/data/2.5/weather"
            f"?q={city}&appid={API_KEY}&units=metric"
        )

        response = requests.get(url)

        data = response.json()

        return {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "rainfall": data.get("rain", {}).get("1h", 0)
        }

    @staticmethod
    def predict(city, district, state):

        weather = AIService.get_weather(city)

        district_encoded = district_encoder.transform(
            [district]
        )[0]

        state_encoded = state_encoder.transform(
            [state]
        )[0]

        now = datetime.now()

        month = now.month

        features = pd.DataFrame([{

            'District': district_encoded,

            'State': state_encoded,

            'Rainfall': weather["rainfall"],

            'Temperature': weather["temperature"],

            'Humidity': weather["humidity"],

            'year': now.year,

            'month': now.month,

            'day': now.day,

            'month_sin': np.sin(2 * np.pi * month / 12),

            'month_cos': np.cos(2 * np.pi * month / 12),

            'lag_1': 120,

            'lag_2': 118,

            'lag_3': 115,

            'rolling_mean_3': 117,

            'rolling_mean_7': 116
        }])

        prediction = model.predict(features)[0]

        if prediction < 50:
            risk = "CRITICAL"

        elif prediction < 100:
            risk = "MODERATE"

        else:
            risk = "SAFE"

        return {
            "city": city,
            "prediction": float(prediction),
            "risk": risk,
            "weather": weather
        }