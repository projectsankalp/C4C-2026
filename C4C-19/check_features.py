import joblib

print("DIABETES FEATURES:")
print(
    joblib.load(
        "models/diabetes_features.pkl"
    )
)

print("\nHYPERTENSION FEATURES:")
print(
    joblib.load(
        "models/hypertension_features.pkl"
    )
)