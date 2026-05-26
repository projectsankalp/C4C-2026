from fastapi import FastAPI
import joblib

app = FastAPI(title="JalRakshak AI Inference")

@app.post("/predict")
async def predict(data: dict):
    # Load model and serve prediction
    return {"prediction": 45.2}
