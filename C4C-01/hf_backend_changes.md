# AI Backend Refactor: Pivot to DM/HTN Screening (Zero API Contract Changes)

**Objective:** We are pivoting the application from "Acute OPD Triage" to "Rural Diabetes & Hypertension Screening." 
**Constraint:** To move fast for the hackathon, **we are NOT changing the API contracts.** The frontend will send the exact same JSON shapes it does today. Your job is to change the **internal system prompts and scoring logic** so the outputs map to chronic disease risk instead of acute triage severity.

Here is exactly what needs to change under the hood for each endpoint.

---

## 1. `POST /api/v1/triage/interview` (The "Risk Factor" Collector)

**Current Behavior:** Acts as a generic symptom checker (e.g., "Is the pain sharp or dull?").
**New Behavior:** Needs to actively hunt for Diabetes (IDRS) and Hypertension risk factors if it sees *any* related symptoms (like fatigue, frequent urination, headache).

**Internal Changes Required:**
Update your LLM system prompt for the interviewer. Instruct it to prioritize asking about:
- **Family History:** "Does anyone in your immediate family have diabetes or high blood pressure?"
- **Physical Activity:** "How much physical activity do you do daily? (Sedentary, moderate, or heavy manual labor?)"
- **Waist Circumference/BMI:** "Do you know your waist size, or would you consider yourself overweight?"
- **Vitals (if missing):** "Have you checked your blood pressure or blood sugar recently?"

*Note: The frontend still expects `expected_answer_type` ("yes_no", "scale", "free_text"). Keep returning those normally.*

---

## 2. `POST /api/v1/triage/assess` (The "Scoring Engine")

This is the heavy lifter. You will receive the collected symptoms, answers from the interview, and any provided vitals. 

**Current Behavior:** Runs an acute illness classifier and returns a `severity` tier (LOW to EMERGENCY).
**New Behavior:** Calculates chronic disease risk (IDRS for Diabetes, JNC-8 for BP) and maps the risk level back to our existing severity tiers.

**Internal Changes Required:**

**A. Scoring Logic Extraction:**
Instead of a generic ML classification, parse the vitals and interview answers to calculate:
1. **IDRS Score (0-100)** based on Age, Family History, Waist size, and Activity level.
2. **Hypertension Risk** based on `bp_systolic` and `bp_diastolic`.

**B. Mapping to Existing `severity` Output:**
You must return one of the existing strings (`"LOW"`, `"MEDIUM"`, `"HIGH"`, `"URGENT"`, `"EMERGENCY"`). Map them like this:
- **`EMERGENCY` / `URGENT`** → High Risk (e.g., IDRS > 60, or BP > 160/100, or Fasting Sugar > 126). *This triggers our OPD fast-track referral.*
- **`HIGH` / `MEDIUM`** → Borderline / Pre-diabetic / Elevated BP. *Triggers standard PHC appointment.*
- **`LOW`** → Normal. *Triggers lifestyle advice, no hospital visit.*

**C. Overriding Text Fields:**
- `top_conditions`: Hardcode the predictions to return `[{ name: "Type 2 Diabetes Risk", icd10: "E11", prob: X }, { name: "Hypertension Risk", icd10: "I10", prob: Y }]`.
- `doctor_briefing`: Generate a highly specific summary. Example: *"Patient screened HIGH RISK for Type 2 Diabetes. IDRS Score: 75/100 (Driven by age and family history). BP is elevated (135/85). Refer to PHC for fasting blood sugar test."*
- `next_action`: E.g., *"Refer to nearest PHC for confirmatory screening."*

---

## 3. `POST /api/v1/predict/labs` (Lab Report Parsing)

**Current Behavior:** Flags general abnormal values.
**New Behavior:** Needs to be hyper-sensitive to DM/HTN markers.

**Internal Changes Required:**
When parsing the OCR text, ensure your logic explicitly looks for and flags:
- **HbA1c:** Flag as `high` if ≥ 5.7% (Pre-diabetic) or ≥ 6.5% (Diabetic).
- **Fasting Blood Glucose (FBS):** Flag as `high` if ≥ 100 mg/dL.
- **Lipid Profile:** Flag abnormal LDL/Triglycerides as they are strong cardiovascular risk indicators.

---

## 4. `POST /api/v1/predict/disease`

**Current Behavior:** Predicts ICD-10 codes based on symptoms.
**New Behavior:** You can either deprecate this internally (return a generic response) OR repurpose it to just return the raw IDRS / BP risk probabilities if the frontend calls it directly.

---

## Summary

By doing this, the frontend developers don't have to change a single line of API integration code. The app will magically transform from an "OPD Triage Tool" into a "Rural Diabetes Screening Tool" simply because your backend is now asking chronic-disease questions and returning IDRS-based severity scores. 

**ETA:** This is mostly prompt engineering and adding a simple rule-based IDRS/BP calculator before the LLM step. Should be a very quick refactor!
