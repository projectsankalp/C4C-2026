"""
AarogyaNet AI Pipeline — Dataset schema registry.

Defines expected schemas, column mappings, and feature descriptions for
the four supported public health datasets:

  1. ICMR Diabetes Registry
  2. NFHS (National Family Health Survey)
  3. NIKSHAY (National TB Elimination Programme surveillance)
  4. HMIS (Health Management Information System)

Each schema object contains:
  source_name       — canonical dataset name
  description       — brief description
  expected_columns  — list of column names expected after normalisation
  target_column     — supervised learning target (None if unsupervised)
  feature_columns   — columns to include in feature vectors
  categorical_cols  — columns requiring one-hot or label encoding
  continuous_cols   — columns requiring normalisation (z-score / min-max)
  phi_columns       — columns that must be stripped before training
  column_map        — {raw_name: normalised_name} rename mapping

These schemas are used by DatasetIngestion.normalise_columns() to produce
consistent, model-ready DataFrames regardless of raw column naming.
"""

from typing import Any


# ─────────────────────────────────────────────────────────────────────────────
# 1. ICMR Diabetes Dataset
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# 0. Pima Indians Diabetes Dataset (real, trained)
# ─────────────────────────────────────────────────────────────────────────────

PIMA_DIABETES_SCHEMA: dict[str, Any] = {
    "source_name": "Pima Indians Diabetes Database",
    "description": (
        "National Institute of Diabetes and Digestive and Kidney Diseases. "
        "768 female patients of Pima Indian heritage, ≥21 years old. "
        "Binary classification: diabetes diagnosis (Outcome 0/1)."
    ),
    "version": "1.0",
    "expected_columns": [
        "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
        "Insulin", "BMI", "DiabetesPedigreeFunction", "Age", "Outcome",
    ],
    "target_column": "Outcome",
    "feature_columns": [
        "pregnancies", "glucose", "blood_pressure", "skin_thickness",
        "insulin", "bmi", "diabetes_pedigree", "age",
    ],
    "categorical_cols": [],
    "continuous_cols": [
        "pregnancies", "glucose", "blood_pressure", "skin_thickness",
        "insulin", "bmi", "diabetes_pedigree", "age",
    ],
    "phi_columns": [],
    "zero_as_missing": ["glucose", "blood_pressure", "skin_thickness", "insulin", "bmi"],
    "column_map": {
        "Pregnancies":             "pregnancies",
        "Glucose":                 "glucose",
        "BloodPressure":           "blood_pressure",
        "SkinThickness":           "skin_thickness",
        "Insulin":                 "insulin",
        "BMI":                     "bmi",
        "DiabetesPedigreeFunction": "diabetes_pedigree",
        "Age":                     "age",
        "Outcome":                 "Outcome",
    },
    "missing_value_strategy": {
        "glucose":          "median",
        "blood_pressure":   "median",
        "skin_thickness":   "median",
        "insulin":          "median",
        "bmi":              "median",
    },
    "ml_status": "trained",
    "model_key": "diabetes_risk",
}


ICMR_DIABETES_SCHEMA: dict[str, Any] = {
    "source_name": "ICMR Diabetes Registry",
    "description": (
        "ICMR multisite diabetes registry covering urban/rural populations "
        "across India. Contains anthropometric, clinical, and lifestyle features."
    ),
    "version": "1.0",
    "expected_columns": [
        "age", "gender", "bmi", "waist_circumference", "hip_circumference",
        "fasting_glucose", "postprandial_glucose", "hba1c",
        "systolic_bp", "diastolic_bp", "total_cholesterol", "hdl", "ldl",
        "triglycerides", "family_history_diabetes", "physical_activity_level",
        "smoking_status", "alcohol_use", "diabetes_diagnosis",
        "duration_diabetes", "treatment_type", "state", "residence_type",
    ],
    "target_column":     "diabetes_diagnosis",
    "feature_columns": [
        "age", "gender", "bmi", "waist_circumference",
        "fasting_glucose", "postprandial_glucose", "hba1c",
        "systolic_bp", "diastolic_bp", "total_cholesterol", "hdl", "ldl",
        "triglycerides", "family_history_diabetes", "physical_activity_level",
        "smoking_status", "alcohol_use",
    ],
    "categorical_cols": [
        "gender", "family_history_diabetes", "physical_activity_level",
        "smoking_status", "alcohol_use", "treatment_type", "residence_type",
    ],
    "continuous_cols": [
        "age", "bmi", "waist_circumference", "hip_circumference",
        "fasting_glucose", "postprandial_glucose", "hba1c",
        "systolic_bp", "diastolic_bp",
        "total_cholesterol", "hdl", "ldl", "triglycerides",
    ],
    "phi_columns": ["state", "district", "village", "name", "patient_id", "phone"],
    "column_map": {
        "systolic":      "systolic_bp",
        "diastolic":     "diastolic_bp",
        "glucose_fast":  "fasting_glucose",
        "glucose_pp":    "postprandial_glucose",
        "diagnosis":     "diabetes_diagnosis",
        "sex":           "gender",
        "body_mass_index": "bmi",
    },
    "missing_value_strategy": {
        "hba1c":             "median",
        "postprandial_glucose": "median",
        "ldl":               "median",
        "physical_activity_level": "mode",
        "smoking_status":    "mode",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# 2. NFHS (National Family Health Survey)
# ─────────────────────────────────────────────────────────────────────────────

NFHS_SCHEMA: dict[str, Any] = {
    "source_name": "NFHS-5 (2019-21)",
    "description": (
        "National Family Health Survey Round 5 — covers maternal health, "
        "child nutrition, anaemia, hypertension prevalence, and household "
        "socioeconomic indicators across all Indian states/UTs."
    ),
    "version": "5",
    "expected_columns": [
        "age", "gender", "wealth_index", "education_level",
        "region", "residence_type",
        "anaemia_level", "bmi", "systolic_bp", "diastolic_bp",
        "currently_pregnant", "num_children", "contraceptive_use",
        "antenatal_visits", "skilled_birth_attendant",
        "child_stunting", "child_wasting", "child_underweight",
        "tobacco_use", "alcohol_use",
        "health_insurance", "has_bank_account",
        "hypertension_diagnosis",
    ],
    "target_column":     "hypertension_diagnosis",
    "feature_columns": [
        "age", "gender", "wealth_index", "education_level",
        "residence_type", "anaemia_level", "bmi",
        "systolic_bp", "diastolic_bp", "currently_pregnant",
        "num_children", "tobacco_use", "alcohol_use",
        "health_insurance",
    ],
    "categorical_cols": [
        "gender", "wealth_index", "education_level", "residence_type",
        "anaemia_level", "currently_pregnant", "contraceptive_use",
        "tobacco_use", "alcohol_use", "health_insurance",
    ],
    "continuous_cols": [
        "age", "bmi", "systolic_bp", "diastolic_bp",
        "num_children", "antenatal_visits",
    ],
    "phi_columns": ["state", "district", "village", "household_id", "respondent_id"],
    "column_map": {
        "v012":  "age",
        "v025":  "residence_type",
        "v190":  "wealth_index",
        "v106":  "education_level",
        "v467e": "systolic_bp",
        "v467f": "diastolic_bp",
        "v445":  "bmi",
    },
    "missing_value_strategy": {
        "systolic_bp":     "median",
        "diastolic_bp":    "median",
        "bmi":             "median",
        "education_level": "mode",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# 3. NIKSHAY (TB Surveillance)
# ─────────────────────────────────────────────────────────────────────────────

NIKSHAY_SCHEMA: dict[str, Any] = {
    "source_name": "NIKSHAY — National TB Elimination Programme",
    "description": (
        "TB patient notification and treatment outcome data from the NTEP "
        "(National Tuberculosis Elimination Programme) portal. Covers "
        "presumptive cases, diagnosis, treatment initiation, and outcomes."
    ),
    "version": "2.0",
    "expected_columns": [
        "age", "gender", "disease_site", "diagnosis_type",
        "treatment_regimen", "treatment_outcome",
        "month_of_treatment", "sputum_status_2m", "sputum_status_6m",
        "hiv_status", "diabetes_comorbidity",
        "weight_at_diagnosis", "weight_at_2months",
        "drug_resistance_type", "nikshay_poshan_yojana_status",
        "quarter_of_notification",
    ],
    "target_column":     "treatment_outcome",
    "feature_columns": [
        "age", "gender", "disease_site", "diagnosis_type",
        "treatment_regimen", "hiv_status", "diabetes_comorbidity",
        "weight_at_diagnosis", "weight_at_2months",
        "drug_resistance_type", "sputum_status_2m",
    ],
    "categorical_cols": [
        "gender", "disease_site", "diagnosis_type", "treatment_regimen",
        "treatment_outcome", "hiv_status", "drug_resistance_type",
        "sputum_status_2m", "sputum_status_6m",
    ],
    "continuous_cols": [
        "age", "weight_at_diagnosis", "weight_at_2months",
        "month_of_treatment",
    ],
    "phi_columns": [
        "name", "nikshay_id", "phone", "address", "district", "state",
        "date_of_diagnosis", "date_of_treatment_initiation",
    ],
    "column_map": {
        "sex":              "gender",
        "tb_site":          "disease_site",
        "outcome":          "treatment_outcome",
        "hiv":              "hiv_status",
        "dm_comorbidity":   "diabetes_comorbidity",
        "dr_type":          "drug_resistance_type",
    },
    "missing_value_strategy": {
        "weight_at_2months":  "median",
        "hiv_status":         "unknown",
        "drug_resistance_type": "not_tested",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# 4. HMIS (Health Management Information System)
# ─────────────────────────────────────────────────────────────────────────────

HMIS_SCHEMA: dict[str, Any] = {
    "source_name": "HMIS — MoHFW India",
    "description": (
        "Monthly facility-level health service data from the Ministry of "
        "Health & Family Welfare HMIS portal. Covers OPD attendance, "
        "institutional deliveries, immunisation, and NCD screening."
    ),
    "version": "2024",
    "expected_columns": [
        "state", "district", "block", "facility_type",
        "month", "year",
        "opd_total", "ipd_total",
        "institutional_deliveries", "c_section_deliveries",
        "antenatal_registrations", "full_antenatal_care",
        "immunisation_measles", "immunisation_pentavalent",
        "ncd_screening_hypertension", "ncd_screening_diabetes",
        "hypertension_on_treatment", "diabetes_on_treatment",
        "tb_notifications", "tb_treatment_success",
        "asha_home_visits",
    ],
    "target_column":     None,
    "feature_columns": [
        "facility_type", "month", "year",
        "opd_total", "ipd_total",
        "ncd_screening_hypertension", "ncd_screening_diabetes",
        "hypertension_on_treatment", "diabetes_on_treatment",
        "tb_notifications", "asha_home_visits",
    ],
    "categorical_cols": ["state", "district", "block", "facility_type"],
    "continuous_cols": [
        "opd_total", "ipd_total", "institutional_deliveries",
        "ncd_screening_hypertension", "ncd_screening_diabetes",
        "hypertension_on_treatment", "tb_notifications",
        "asha_home_visits",
    ],
    "phi_columns": [],
    "column_map": {
        "htninstitution":     "ncd_screening_hypertension",
        "diabetesinstitution": "ncd_screening_diabetes",
        "ashavisits":         "asha_home_visits",
    },
    "missing_value_strategy": {
        "opd_total":                  "zero",
        "ncd_screening_hypertension": "zero",
        "asha_home_visits":           "zero",
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# Dataset registry
# ─────────────────────────────────────────────────────────────────────────────

DATASET_REGISTRY: dict[str, dict] = {
    "pima_diabetes": PIMA_DIABETES_SCHEMA,
    "icmr_diabetes": ICMR_DIABETES_SCHEMA,
    "nfhs":          NFHS_SCHEMA,
    "nikshay":       NIKSHAY_SCHEMA,
    "hmis":          HMIS_SCHEMA,
}
