import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def train_and_evaluate_models():
    csv_path = os.path.join("backend", "patient_data.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}. Please run generate_dataset.py first.")

    print("Loading dataset...")
    df = pd.read_csv(csv_path)

    # Features and Targets
    feature_cols = [
        "age", "bmi", "family_history", "exercise", "sugary_food",
        "smoking", "thirst", "headaches", "sleep", "stress"
    ]
    
    X = df[feature_cols]
    y_diabetes = df["diabetes"]
    y_hypertension = df["hypertension"]

    # Compute population statistics for local explainability
    means = X.mean().to_dict()
    stds = X.std().to_dict()

    print("\n--- Training Diabetes Models ---")
    X_train, X_test, y_train_db, y_test_db = train_test_split(X, y_diabetes, test_size=0.2, random_state=42)
    
    # Scale continuous features: age, bmi, sleep
    scaler = StandardScaler()
    
    # We will fit the scaler on the continuous columns of the training set
    cont_cols = ["age", "bmi", "sleep"]
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    
    X_train_scaled[cont_cols] = scaler.fit_transform(X_train[cont_cols])
    X_test_scaled[cont_cols] = scaler.transform(X_test[cont_cols])

    # Train models
    db_models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1),
        "XGBoost": XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, n_jobs=-1)
    }

    db_results = {}
    for name, model in db_models.items():
        print(f"Training {name} for Diabetes...")
        # Logistic Regression performs better with scaled continuous inputs
        if name == "Logistic Regression":
            model.fit(X_train_scaled, y_train_db)
            preds = model.predict(X_test_scaled)
            probs = model.predict_proba(X_test_scaled)[:, 1]
        else:
            model.fit(X_train, y_train_db)
            preds = model.predict(X_test)
            probs = model.predict_proba(X_test)[:, 1]
            
        db_results[name] = {
            "Accuracy": accuracy_score(y_test_db, preds),
            "Precision": precision_score(y_test_db, preds),
            "Recall": recall_score(y_test_db, preds),
            "F1": f1_score(y_test_db, preds),
            "ROC AUC": roc_auc_score(y_test_db, probs)
        }

    # Print results
    print("\nDiabetes Model Comparison:")
    db_df = pd.DataFrame(db_results).T
    print(db_df.round(4))

    # Choose best model (based on F1 Score)
    best_db_name = db_df["F1"].idxmax()
    print(f"\nBest Diabetes Model selected: {best_db_name}")
    best_db_model = db_models[best_db_name]

    # Feature Importance for Diabetes
    if best_db_name == "Logistic Regression":
        importances = np.abs(best_db_model.coef_[0])
    elif best_db_name == "Random Forest":
        importances = best_db_model.feature_importances_
    else:  # XGBoost
        importances = best_db_model.feature_importances_
        
    db_importance_dict = dict(zip(feature_cols, [float(x) for x in importances]))
    # Normalize importances to sum to 1.0 for visual consistency
    db_total = sum(db_importance_dict.values())
    db_importance_dict = {k: v / db_total for k, v in db_importance_dict.items()}

    print("\n--- Training Hypertension Models ---")
    X_train_ht, X_test_ht, y_train_ht, y_test_ht = train_test_split(X, y_hypertension, test_size=0.2, random_state=42)
    
    X_train_ht_scaled = X_train_ht.copy()
    X_test_ht_scaled = X_test_ht.copy()
    X_train_ht_scaled[cont_cols] = scaler.fit_transform(X_train_ht[cont_cols])
    X_test_ht_scaled[cont_cols] = scaler.transform(X_test_ht[cont_cols])

    ht_models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1),
        "XGBoost": XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42, n_jobs=-1)
    }

    ht_results = {}
    for name, model in ht_models.items():
        print(f"Training {name} for Hypertension...")
        if name == "Logistic Regression":
            model.fit(X_train_ht_scaled, y_train_ht)
            preds = model.predict(X_test_ht_scaled)
            probs = model.predict_proba(X_test_ht_scaled)[:, 1]
        else:
            model.fit(X_train_ht, y_train_ht)
            preds = model.predict(X_test_ht)
            probs = model.predict_proba(X_test_ht)[:, 1]
            
        ht_results[name] = {
            "Accuracy": accuracy_score(y_test_ht, preds),
            "Precision": precision_score(y_test_ht, preds),
            "Recall": recall_score(y_test_ht, preds),
            "F1": f1_score(y_test_ht, preds),
            "ROC AUC": roc_auc_score(y_test_ht, probs)
        }

    # Print results
    print("\nHypertension Model Comparison:")
    ht_df = pd.DataFrame(ht_results).T
    print(ht_df.round(4))

    # Choose best model
    best_ht_name = ht_df["F1"].idxmax()
    print(f"\nBest Hypertension Model selected: {best_ht_name}")
    best_ht_model = ht_models[best_ht_name]

    # Feature Importance for Hypertension
    if best_ht_name == "Logistic Regression":
        importances_ht = np.abs(best_ht_model.coef_[0])
    elif best_ht_name == "Random Forest":
        importances_ht = best_ht_model.feature_importances_
    else:  # XGBoost
        importances_ht = best_ht_model.feature_importances_
        
    ht_importance_dict = dict(zip(feature_cols, [float(x) for x in importances_ht]))
    ht_total = sum(ht_importance_dict.values())
    ht_importance_dict = {k: v / ht_total for k, v in ht_importance_dict.items()}

    # Model metadata to save in .pkl
    model_metadata = {
        # Models
        "diabetes_model": best_db_model,
        "diabetes_model_name": best_db_name,
        "hypertension_model": best_ht_model,
        "hypertension_model_name": best_ht_name,
        
        # Scaling continuous features
        "scaler": scaler,
        "cont_cols": cont_cols,
        "feature_cols": feature_cols,
        
        # Reference distributions for local explanations
        "means": means,
        "stds": stds,
        
        # Global metrics to display in dashboard
        "metrics": {
            "diabetes": db_results,
            "hypertension": ht_results,
            "selected_diabetes_model": best_db_name,
            "selected_hypertension_model": best_ht_name
        },
        
        # Feature importances
        "importances": {
            "diabetes": db_importance_dict,
            "hypertension": ht_importance_dict
        }
    }

    # Save to model.pkl
    pkl_path = os.path.join("backend", "model.pkl")
    joblib.dump(model_metadata, pkl_path)
    print(f"\nSuccessfully trained models and saved to {pkl_path}")

if __name__ == "__main__":
    train_and_evaluate_models()
