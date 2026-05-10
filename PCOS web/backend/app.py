import streamlit as st
import joblib
import pandas as pd
import numpy as np
import os

st.set_page_config(page_title="PCOS Risk Predictor", layout="wide")

# ---------------- LOAD MODELS ---------------- #
try:
    general_pcos_model = joblib.load("backend/pcos_trained_model.pkl")
except:
    general_pcos_model = None
    st.error("General PCOS model not found")

try:
    clinical_pcos_model = joblib.load("backend/clinical_pcos_model.pkl")
except:
    clinical_pcos_model = None
    st.error("Clinical PCOS model not found")


# ---------------- FEATURE LISTS ---------------- #
GENERAL_EXPECTED_FEATURES = [
    'Age(yrs)', 'Weight(Kg)', 'Height(Cm)', 'BMI', 'Cycle(R/I)',
    'Cyclelength(days)', 'MarraigeStatus(Yrs)', 'Pregnant(Y/N)',
    'No.ofaborptions', 'Hip(inch)', 'Waist(inch)', 'Waist:HipRatio',
    'Weightgain(Y/N)', 'hairgrowth(Y/N)', 'Skindarkening(Y/N)',
    'Hairloss(Y/N)', 'Pimples(Y/N)', 'Fastfood(Y/N)', 'Reg.Exercise(Y/N)',
    'BP_Systolic(mmHg)', 'BP_Diastolic(mmHg)'
]

CLINICAL_EXPECTED_FEATURES = [
    'Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'BMI', 'Blood Group',
    'Pulse rate(bpm)', 'RR (breaths/min)', 'Hb(g/dl)', 'Cycle(R/I)',
    'Cycle length(days)', 'Marraige Status (Yrs)', 'Pregnant(Y/N)',
    'No. of aborptions', 'I   beta-HCG(mIU/mL)', 'II    beta-HCG(mIU/mL)',
    'FSH(mIU/mL)', 'LH(mIU/mL)', 'FSH/LH',
    'Hip(inch)', 'Waist(inch)', 'Waist:Hip Ratio',
    'TSH (mIU/L)', 'AMH(ng/mL)', 'PRL(ng/mL)', 'Vit D3 (ng/mL)',
    'PRG(ng/mL)', 'RBS(mg/dl)',
    'Weight gain(Y/N)', 'hair growth(Y/N)', 'Skin darkening (Y/N)',
    'Hair loss(Y/N)', 'Pimples(Y/N)', 'Fast food (Y/N)', 'Reg.Exercise(Y/N)',
    'BP _Systolic (mmHg)', 'BP _Diastolic (mmHg)',
    'Follicle No. (L)', 'Follicle No. (R)', 'Avg. F size (L) (mm)',
    'Avg. F size (R) (mm)', 'Endometrium (mm)'
]

# ---------------- UI ---------------- #
st.title("🩺 FEMCARE - PCOS Risk Prediction System")

mode = st.radio("Select Prediction Type:", ["General Prediction", "Clinical Prediction"])


# =========================================================
# GENERAL MODEL UI
# =========================================================
if mode == "General Prediction":
    st.subheader("General PCOS Risk Prediction")

    with st.form("general_form"):
        age = st.number_input("Age")
        weight = st.number_input("Weight (Kg)")
        height = st.number_input("Height (Cm)")
        bmi = st.number_input("BMI")
        cycle = st.selectbox("Cycle (R/I)", ["Regular", "Irregular"])
        cycle_len = st.number_input("Cycle Length")
        married = st.number_input("Marriage Status (Years)")
        pregnant = st.selectbox("Pregnant", ["Yes", "No"])
        abortion = st.number_input("No. of abortions")
        hip = st.number_input("Hip (inch)")
        waist = st.number_input("Waist (inch)")
        w_hr = st.number_input("Waist:Hip Ratio")
        weight_gain = st.selectbox("Weight Gain", ["Yes", "No"])
        hair_growth = st.selectbox("Hair Growth", ["Yes", "No"])
        skin_dark = st.selectbox("Skin Darkening", ["Yes", "No"])
        hair_loss = st.selectbox("Hair Loss", ["Yes", "No"])
        pimples = st.selectbox("Pimples", ["Yes", "No"])
        fast_food = st.selectbox("Fast Food", ["Yes", "No"])
        exercise = st.selectbox("Regular Exercise", ["Yes", "No"])
        bp_sys = st.number_input("BP Systolic")
        bp_dia = st.number_input("BP Diastolic")

        submit = st.form_submit_button("Predict")

    if submit and general_pcos_model:
        input_data = pd.DataFrame([{
            'Age(yrs)': age,
            'Weight(Kg)': weight,
            'Height(Cm)': height,
            'BMI': bmi,
            'Cycle(R/I)': 1 if cycle == "Irregular" else 0,
            'Cyclelength(days)': cycle_len,
            'MarraigeStatus(Yrs)': married,
            'Pregnant(Y/N)': 1 if pregnant == "Yes" else 0,
            'No.ofaborptions': abortion,
            'Hip(inch)': hip,
            'Waist(inch)': waist,
            'Waist:HipRatio': w_hr,
            'Weightgain(Y/N)': 1 if weight_gain == "Yes" else 0,
            'hairgrowth(Y/N)': 1 if hair_growth == "Yes" else 0,
            'Skindarkening(Y/N)': 1 if skin_dark == "Yes" else 0,
            'Hairloss(Y/N)': 1 if hair_loss == "Yes" else 0,
            'Pimples(Y/N)': 1 if pimples == "Yes" else 0,
            'Fastfood(Y/N)': 1 if fast_food == "Yes" else 0,
            'Reg.Exercise(Y/N)': 1 if exercise == "Yes" else 0,
            'BP_Systolic(mmHg)': bp_sys,
            'BP_Diastolic(mmHg)': bp_dia
        }])[GENERAL_EXPECTED_FEATURES]

        if hasattr(general_pcos_model, "predict_proba"):
            prob = general_pcos_model.predict_proba(input_data)[0][1] * 100
        else:
            prob = general_pcos_model.predict(input_data)[0] * 100

        st.success(f"PCOS Risk: {round(prob,2)}%")


# =========================================================
# CLINICAL MODEL UI
# =========================================================
else:
    st.subheader("Clinical PCOS Risk Prediction")

    with st.form("clinical_form"):
        age = st.number_input("Age (yrs)")
        weight = st.number_input("Weight (Kg)")
        height = st.number_input("Height (Cm)")
        bmi = st.number_input("BMI")

        blood_group = st.number_input("Blood Group")
        pulse = st.number_input("Pulse rate")
        rr = st.number_input("RR")
        hb = st.number_input("Hb")

        submit = st.form_submit_button("Predict")

    if submit and clinical_pcos_model:
        input_data = pd.DataFrame([{
            'Age (yrs)': age,
            'Weight (Kg)': weight,
            'Height(Cm)': height,
            'BMI': bmi,
            'Blood Group': blood_group,
            'Pulse rate(bpm)': pulse,
            'RR (breaths/min)': rr,
            'Hb(g/dl)': hb,
            # remaining features default to 0
        }])

        for col in CLINICAL_EXPECTED_FEATURES:
            if col not in input_data.columns:
                input_data[col] = 0

        input_data = input_data[CLINICAL_EXPECTED_FEATURES]

        if hasattr(clinical_pcos_model, "predict_proba"):
            prob = clinical_pcos_model.predict_proba(input_data)[0][1] * 100
        else:
            prob = clinical_pcos_model.predict(input_data)[0] * 100

        st.success(f"Clinical PCOS Risk: {round(prob,2)}%")