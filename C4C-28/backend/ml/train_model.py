import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score

# --- Configuration ---
# Replace this with the path to your downloaded Kaggle CSV dataset
DATASET_PATH = 'cpcb_air_quality.csv' 
MODEL_OUTPUT_PATH = os.path.join(os.path.dirname(__file__), 'rf_model.pkl')

def generate_mock_training_data_if_missing():
    """
    If you haven't downloaded a Kaggle CSV yet, this generates a highly-realistic 
    meteorological time-series dataset representing rural Indian cooking & agricultural burning 
    patterns to let you test compilation immediately!
    """
    print("⚠️ Kaggle CSV not found. Generating a high-fidelity synthetic training dataset...")
    np.random.seed(42)
    rows = 10000
    
    # Generate realistic hourly timestamps
    base_time = pd.Timestamp('2026-01-01 00:00:00')
    times = [base_time + pd.Timedelta(hours=i) for i in range(rows)]
    
    df = pd.DataFrame({
        'timestamp': times,
        'temperature': 25.0 + 8.0 * np.sin(np.array([t.hour for t in times]) * np.pi / 12) + np.random.normal(0, 1.5, rows),
        'humidity': 55.0 - 15.0 * np.sin(np.array([t.hour for t in times]) * np.pi / 12) + np.random.normal(0, 3.0, rows),
        'calculated_aqi': np.random.randint(40, 120, rows)
    })
    
    # Inject diurnal rural pollution spikes (e.g. evening biomass cooking fires at 7PM-9PM)
    for i, row in df.iterrows():
        hour = row['timestamp'].hour
        if 7 <= hour <= 9:  # Morning breakfast fires
            df.at[i, 'calculated_aqi'] += np.random.randint(60, 150)
        elif 18 <= hour <= 21:  # Evening dinner fires
            df.at[i, 'calculated_aqi'] += np.random.randint(90, 220)
        # Random high-pollution burning days
        if i % 200 == 0:
            df.at[i, 'calculated_aqi'] += np.random.randint(150, 300)
            
    df['calculated_aqi'] = df['calculated_aqi'].clip(10, 500)
    df.to_csv(DATASET_PATH, index=False)
    print(f"✅ Generated mock rural CPCB dataset at {DATASET_PATH}!")

def main():
    if not os.path.exists(DATASET_PATH):
        generate_mock_training_data_if_missing()
        
    print(f"\n📂 Loading dataset from {DATASET_PATH}...")
    df = pd.read_csv(DATASET_PATH)
    
    # Parse timestamps
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['hour_of_day'] = df['timestamp'].dt.hour
        df['day_of_week'] = df['timestamp'].dt.dayofweek
    else:
        # Fallback if no timestamps exist
        df['hour_of_day'] = np.random.randint(0, 24, len(df))
        df['day_of_week'] = np.random.randint(0, 7, len(df))

    # Feature Engineering (mirroring prediction_service.py)
    print("🛠️ Performing Time-Series Feature Engineering...")
    df['previous_aqi'] = df['calculated_aqi'].shift(1).fillna(method='bfill')
    df['rolling_avg_3h'] = df['calculated_aqi'].rolling(window=3, min_periods=1).mean()
    df['aqi_change_rate'] = df['calculated_aqi'] - df['previous_aqi']
    
    # Target variable: AQI 4 hours into the future
    df['target_aqi_4h'] = df['calculated_aqi'].shift(-4)
    
    # Drop rows with NaN targets due to shifting
    df = df.dropna().reset_index(drop=True)
    
    # Define features and labels
    feature_cols = [
        'calculated_aqi', 'previous_aqi', 'temperature', 
        'humidity', 'hour_of_day', 'day_of_week', 
        'rolling_avg_3h', 'aqi_change_rate'
    ]
    
    X = df[feature_cols]
    y = df['target_aqi_4h']
    
    # Train / Test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"🌲 Training RandomForestRegressor on {len(X_train)} samples...")
    # Initialize Random Forest Regressor
    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)
    model.fit(X_train, y_train)
    
    # Model evaluation
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("\n==================================")
    print("       MODEL TRAINING SUCCESS!    ")
    print("==================================")
    print(f"Mean Absolute Error (MAE): {mae:.2f} AQI points")
    print(f"Accuracy Metric (R² Score): {r2*100:.2f}%")
    print("==================================")
    
    # Save the trained model
    os.makedirs(os.path.dirname(MODEL_OUTPUT_PATH), exist_ok=True)
    joblib.dump(model, MODEL_OUTPUT_PATH)
    print(f"💾 Saved trained Random Forest model successfully to:")
    print(f"   ➔ {MODEL_OUTPUT_PATH}\n")

if __name__ == '__main__':
    main()
