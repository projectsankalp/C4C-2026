import pandas as pd
import numpy as np
import os

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def generate_synthetic_data(num_samples=100000, seed=42):
    np.random.seed(seed)
    print(f"Generating {num_samples:,} patient records...")

    # Generate continuous and discrete features with clinical-like distributions
    # 1. Age: 18 to 85, heavily populated in 30-70 range
    age = np.random.randint(18, 86, size=num_samples)
    
    # 2. BMI: skewed distribution, normal to obese (mean 26.5, std 6.0) clipped between 15 and 50
    bmi = np.random.lognormal(mean=3.25, sigma=0.2, size=num_samples)
    bmi = np.clip(bmi, 15.0, 50.0)
    
    # 3. Family History (Diabetes or Cardiovascular): 25% have it
    family_history = np.random.binomial(n=1, p=0.25, size=num_samples)
    
    # 4. Exercise Frequency: 0 to 4 times per week (0 = sedentary, 4 = active)
    exercise = np.random.choice([0, 1, 2, 3, 4], size=num_samples, p=[0.25, 0.20, 0.25, 0.15, 0.15])
    
    # 5. Sugary Food Intake: 0 to 4 scale (0 = low, 4 = very high)
    sugary_food = np.random.choice([0, 1, 2, 3, 4], size=num_samples, p=[0.15, 0.25, 0.30, 0.20, 0.10])
    
    # 6. Smoking / Alcohol: 30% has these habits
    smoking = np.random.binomial(n=1, p=0.30, size=num_samples)
    
    # 7. Frequent Urination / Thirst: 15% overall, but will correlate heavily with age and diabetes
    # Let's generate a base value first
    thirst = np.random.binomial(n=1, p=0.15, size=num_samples)
    
    # 8. Headaches / Dizziness: 20% overall, will correlate with hypertension
    headaches = np.random.binomial(n=1, p=0.20, size=num_samples)
    
    # 9. Sleep Duration: 4 to 10 hours, mean 7, std 1.2
    sleep = np.random.normal(loc=7.1, scale=1.2, size=num_samples)
    sleep = np.clip(np.round(sleep), 4, 10).astype(int)
    
    # 10. Stress Level: 0 to 3 scale (0 = low, 3 = high)
    stress = np.random.choice([0, 1, 2, 3], size=num_samples, p=[0.20, 0.40, 0.25, 0.15])

    # Now calculate target labels using clinical logit rules
    # Diabetes: Risk increases with BMI, Family History, Sugary Food, Thirst, Age, and decreases with Exercise
    diabetes_logit = (
        -4.2
        + 0.028 * age
        + 0.110 * (bmi - 22.0)
        + 1.300 * family_history
        + 0.350 * sugary_food
        - 0.400 * exercise
        + 2.600 * thirst
    )
    diabetes_prob = sigmoid(diabetes_logit)
    diabetes = (np.random.rand(num_samples) < diabetes_prob).astype(int)
    
    # Adjust thirst in diabetes positive patients to enforce physical correlation (e.g. 70% of diabetes patients have thirst)
    # This matches clinical intuition
    has_diabetes_idx = np.where(diabetes == 1)[0]
    thirst[has_diabetes_idx] = np.random.binomial(n=1, p=0.75, size=len(has_diabetes_idx))

    # Hypertension: Risk increases with Age, BMI, Smoking, Stress, Headaches, and decreases with Sleep
    hypertension_logit = (
        -4.6
        + 0.045 * age
        + 0.130 * (bmi - 22.0)
        + 0.950 * smoking
        + 0.450 * stress
        - 0.250 * (sleep - 7)
        + 2.100 * headaches
    )
    hypertension_prob = sigmoid(hypertension_logit)
    hypertension = (np.random.rand(num_samples) < hypertension_prob).astype(int)
    
    # Adjust headaches in hypertension patients (e.g. 60% of hypertension patients have headaches)
    has_ht_idx = np.where(hypertension == 1)[0]
    headaches[has_ht_idx] = np.random.binomial(n=1, p=0.60, size=len(has_ht_idx))

    # Construct DataFrame
    df = pd.DataFrame({
        "age": age,
        "bmi": np.round(bmi, 1),
        "family_history": family_history,
        "exercise": exercise,
        "sugary_food": sugary_food,
        "smoking": smoking,
        "thirst": thirst,
        "headaches": headaches,
        "sleep": sleep,
        "stress": stress,
        "diabetes": diabetes,
        "hypertension": hypertension
    })
    
    # Verification check
    print(f"Generated DataFrame shape: {df.shape}")
    print(f"Diabetes prevalence: {df['diabetes'].mean() * 100:.2f}% ({df['diabetes'].sum()} cases)")
    print(f"Hypertension prevalence: {df['hypertension'].mean() * 100:.2f}% ({df['hypertension'].sum()} cases)")

    # Save to CSV
    os.makedirs("backend", exist_ok=True)
    csv_path = os.path.join("backend", "patient_data.csv")
    df.to_csv(csv_path, index=False)
    print(f"Successfully saved dataset to {csv_path}")

if __name__ == "__main__":
    generate_synthetic_data()
