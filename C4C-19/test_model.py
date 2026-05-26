import joblib

print("Loading model...")

model = joblib.load(
    "models/diabetes_model.pkl"
)

print("MODEL LOADED SUCCESSFULLY")