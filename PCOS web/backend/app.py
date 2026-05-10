# app.py
import joblib # Used for loading models saved with joblib (common for scikit-learn)
from flask import Flask, request, jsonify
from flask_cors import CORS # Used to handle Cross-Origin Resource Sharing
import pandas as pd # Essential for creating DataFrames, which models often expect
import numpy as np # Often used by models for numerical operations

app = Flask(__name__)
# Enable CORS for all routes. This is crucial for your frontend (running on a different port/origin)
# to be able to make requests to this backend server.
CORS(app)

# Initialize models to None
general_pcos_model = None
clinical_pcos_model = None
# clinical_scaler is no longer needed if model was trained without scaling

# Define the EXACT order and names of features for the GENERAL PCOS model.
GENERAL_EXPECTED_FEATURES = [
    'Age(yrs)', 'Weight(Kg)', 'Height(Cm)', 'BMI', 'Cycle(R/I)',
    'Cyclelength(days)', 'MarraigeStatus(Yrs)', 'Pregnant(Y/N)',
    'No.ofaborptions', 'Hip(inch)', 'Waist(inch)', 'Waist:HipRatio',
    'Weightgain(Y/N)', 'hairgrowth(Y/N)', 'Skindarkening(Y/N)',
    'Hairloss(Y/N)', 'Pimples(Y/N)', 'Fastfood(Y/N)', 'Reg.Exercise(Y/N)',
    'BP_Systolic(mmHg)', 'BP_Diastolic(mmHg)'
]

# Mapping from frontend keys (from predictionFormData) to GENERAL PCOS model keys
FRONTEND_TO_GENERAL_MODEL_MAP = {
    'Age_yrs': 'Age(yrs)',
    'Weight_Kg': 'Weight(Kg)',
    'Height_Cm': 'Height(Cm)',
    'BMI': 'BMI',
    'Cyclelength_days': 'Cyclelength(days)',
    'MarraigeStatus_Yrs': 'MarraigeStatus(Yrs)',
    'No_ofaborptions': 'No.ofaborptions',
    'Hip_inch': 'Hip(inch)',
    'Waist_inch': 'Waist(inch)',
    'Waist_HipRatio': 'Waist:HipRatio',
    'BP_Systolic_mmHg': 'BP_Systolic(mmHg)',
    'BP_Diastolic_mmHg': 'BP_Diastolic(mmHg)',
    'Cycle_RI': 'Cycle(R/I)', # 'Irregular' to 1.0, 'Regular' to 0.0
    'Pregnant_YN': 'Pregnant(Y/N)', # 'Yes' to 1.0, 'No' to 0.0
    'Weightgain_YN': 'Weightgain(Y/N)', # 'Yes' to 1.0, 'No' to 0.0
    'hairgrowth_YN': 'hairgrowth(Y/N)', # 'Yes' to 1.0, 'No' to 0.0
    'Skindarkening_YN': 'Skindarkening(Y/N)', # 'Yes' to 1.0, 'No' to 0.0
    'Hairloss_YN': 'Hairloss(Y/N)', # 'Yes' to 1.0, 'No' to 0.0
    'Pimples_YN': 'Pimples(Y/N)', # 'Yes' to 1.0, 'No' to 0.0
    'Fastfood_YN': 'Fastfood(Y/N)', # 'Yes' to 1.0, 'No' to 0.0
    'Reg_Exercise_YN': 'Reg.Exercise(Y/N)' # 'Yes' to 1.0, 'No' to 0.0
}

# Define the EXACT order and names of features for the CLINICAL PCOS model
# based on the LATEST error message provided by the user and the training data column list.
CLINICAL_EXPECTED_FEATURES = [
    'Age (yrs)', 'Weight (Kg)', 'Height(Cm)', 'BMI', 'Blood Group',
    'Pulse rate(bpm)', 'RR (breaths/min)', 'Hb(g/dl)', 'Cycle(R/I)',
    'Cycle length(days)', 'Marraige Status (Yrs)', 'Pregnant(Y/N)',
    'No. of aborptions', 'I   beta-HCG(mIU/mL)', 'II    beta-HCG(mIU/mL)', # Corrected spaces based on error
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

# Mapping from frontend keys (from clinical prediction form) to CLINICAL PCOS model keys
FRONTEND_TO_CLINICAL_MODEL_MAP = {
    'Age_yrs': 'Age (yrs)',
    'Weight_Kg': 'Weight (Kg)',
    'Height_Cm': 'Height(Cm)',
    'BMI': 'BMI',
    'Blood_Group': 'Blood Group',
    'Pulse_rate_bpm': 'Pulse rate(bpm)',
    'RR_breaths_min': 'RR (breaths/min)',
    'Hb_g_dl': 'Hb(g/dl)',
    'Cyclelength_days': 'Cycle length(days)',
    'MarraigeStatus_Yrs': 'Marraige Status (Yrs)',
    'No_ofaborptions': 'No. of aborptions',
    'Hip_inch': 'Hip(inch)',
    'Waist_inch': 'Waist(inch)',
    'Waist_HipRatio': 'Waist:Hip Ratio',
    'BP_Systolic_mmHg': 'BP _Systolic (mmHg)',
    'BP_Diastolic_mmHg': 'BP _Diastolic (mmHg)',
    'Cycle_RI': 'Cycle(R/I)',
    'Pregnant_YN': 'Pregnant(Y/N)',
    'Weightgain_YN': 'Weight gain(Y/N)',
    'hairgrowth_YN': 'hair growth(Y/N)',
    'Skindarkening_YN': 'Skin darkening (Y/N)',
    'Hairloss_YN': 'Hair loss(Y/N)',
    'Pimples_YN': 'Pimples(Y/N)',
    'Fastfood_YN': 'Fast food (Y/N)',
    'Reg_Exercise_YN': 'Reg.Exercise(Y/N)',
    # New clinical/hormonal/ultrasound fields
    'TSH_mIU_L': 'TSH (mIU/L)',
    'AMH_ng_mL': 'AMH(ng/mL)',
    'PRL_ng_mL': 'PRL(ng/mL)',
    'VitD3_ng_mL': 'Vit D3 (ng/mL)',
    'RBS_mg_dL': 'RBS(mg/dl)',
    'Follicle_No_L': 'Follicle No. (L)',
    'Follicle_No_R': 'Follicle No. (R)',
    'Avg_F_size_L_mm': 'Avg. F size (L) (mm)',
    'Avg_F_size_R_mm': 'Avg. F size (R) (mm)',
    'Endometrium_mm': 'Endometrium (mm)',
    'FSH_mIU_mL': 'FSH(mIU/mL)',
    'FSH_LH_Ratio': 'FSH/LH',
    'I_beta_HCG_mIU_mL': 'I   beta-HCG(mIU/mL)', # Corrected to three spaces
    'II_beta_HCG_mIU_mL': 'II    beta-HCG(mIU/mL)', # Corrected to four spaces
    'LH_mIU_mL': 'LH(mIU/mL)',
    'PRG_ng_mL': 'PRG(ng/mL)'
}


# Model loading logic. This will execute when the script is run.
try:
    with open('backend//pcos_trained_model.pkl', 'rb') as f:
        general_pcos_model = joblib.load(f)
    print("General PCOS model loaded successfully!")
except FileNotFoundError:
    print("Error: pcos_trained_model.pkl not found. Make sure it's in the same directory as app.py.")
    general_pcos_model = None
except Exception as e:
    print(f"Error loading general PCOS model: {e}")
    general_pcos_model = None

try:
    # Load the clinical model. Ensure 'clinical_pcos_model.pkl' exists.
    with open('backend\\clinical_pcos_model.pkl', 'rb') as f:
        clinical_pcos_model = joblib.load(f)
    print("Clinical PCOS model loaded successfully!")
except FileNotFoundError:
    print("Error: clinical_pcos_model.pkl not found. Make sure it's in the same directory as app.py.")
    clinical_pcos_model = None
except Exception as e:
    print(f"Error loading clinical PCOS model: {e}")
    clinical_pcos_model = None

# Removed scaler loading as per training script analysis
# try:
#     with open('backend\\clinical_scaler.pkl', 'rb') as f:
#         clinical_scaler = joblib.load(f)
#     print("Clinical scaler loaded successfully!")
# except FileNotFoundError:
#     print("Warning: clinical_scaler.pkl not found. If your clinical model was trained on scaled data, predictions might be incorrect.")
#     clinical_scaler = None
# except Exception as e:
#     print(f"Error loading clinical scaler: {e}")
#     clinical_scaler = None


@app.route('/predict_pcos', methods=['POST'])
def predict_pcos():
    """
    API endpoint to receive general user data, make a PCOS prediction using the general model,
    and return the risk percentage.
    """
    if general_pcos_model is None:
        return jsonify({"error": "General PCOS model not loaded. Please check server logs."}), 500

    try:
        data = request.json
        print("Received data for general prediction:", data)

        input_features_dict = {feature: 0.0 for feature in GENERAL_EXPECTED_FEATURES}

        for frontend_key, model_key in FRONTEND_TO_GENERAL_MODEL_MAP.items():
            if frontend_key in data:
                if frontend_key in ['Cycle_RI', 'Pregnant_YN', 'Weightgain_YN', 'hairgrowth_YN',
                                    'Skindarkening_YN', 'Hairloss_YN', 'Pimples_YN',
                                    'Fastfood_YN', 'Reg_Exercise_YN']:
                    if frontend_key == 'Cycle_RI':
                        input_features_dict[model_key] = 1.0 if data[frontend_key] == 'Irregular' else 0.0
                    else:
                        input_features_dict[model_key] = 1.0 if data[frontend_key] == 'Yes' else 0.0
                else:
                    input_features_dict[model_key] = float(data[frontend_key])

        df_input = pd.DataFrame([input_features_dict])[GENERAL_EXPECTED_FEATURES]
        print("DataFrame sent to general model:\n", df_input)

        pcos_risk_percentage = 0.0
        if hasattr(general_pcos_model, 'predict_proba'):
            prediction_proba = general_pcos_model.predict_proba(df_input)[:, 1]
            pcos_risk_percentage = round(prediction_proba[0] * 100, 2)
        else:
            prediction_result = general_pcos_model.predict(df_input)[0]
            pcos_risk_percentage = 100.0 if prediction_result == 1 else 0.0
            print(f"Warning: General model does not have 'predict_proba'. Using 'predict' and mapping result: {prediction_result}")

        return jsonify({"pcos_risk_percentage": pcos_risk_percentage}), 200

    except KeyError as e:
        print(f"KeyError (General Model): Missing data field: {e}")
        return jsonify({"error": f"Missing data field for general model: {e}. Please ensure all required fields are sent."}), 400
    except ValueError as e:
        print(f"ValueError (General Model): Invalid data type: {e}")
        return jsonify({"error": f"Invalid data type for general model: {e}. Please ensure numerical inputs are valid numbers."}), 400
    except Exception as e:
        print(f"An unexpected error occurred during general prediction: {e}")
        return jsonify({"error": f"An internal server error occurred with general model: {e}"}), 500

@app.route('/predict_clinical_pcos', methods=['POST'])
def predict_clinical_pcos():
    """
    API endpoint to receive clinical user data, make a PCOS prediction using the clinical model,
    and return the risk percentage.
    """
    if clinical_pcos_model is None:
        return jsonify({"error": "Clinical PCOS model not loaded. Please check server logs."}), 500

    try:
        data = request.json
        print("Received data for clinical prediction:", data)

        input_features_dict = {feature: 0.0 for feature in CLINICAL_EXPECTED_FEATURES}

        for frontend_key, model_key in FRONTEND_TO_CLINICAL_MODEL_MAP.items():
            if frontend_key in data:
                if frontend_key in ['Cycle_RI', 'Pregnant_YN', 'Weightgain_YN', 'hairgrowth_YN',
                                    'Skindarkening_YN', 'Hairloss_YN', 'Pimples_YN',
                                    'Fastfood_YN', 'Reg_Exercise_YN']:
                    if frontend_key == 'Cycle_RI':
                        input_features_dict[model_key] = 1.0 if data[frontend_key] == 'Irregular' else 0.0
                    else:
                        input_features_dict[model_key] = 1.0 if data[frontend_key] == 'Yes' else 0.0
                else:
                    input_features_dict[model_key] = float(data[frontend_key])
            # For clinical data, if a key is missing, it will default to 0.0 as initialized.
            # This is important if some clinical fields are optional.

        df_input = pd.DataFrame([input_features_dict])[CLINICAL_EXPECTED_FEATURES]
        print("DataFrame sent to clinical model:\n", df_input) # Removed "before scaling" as no scaling happens

        # Removed scaler application as per training script analysis
        # if clinical_scaler is not None:
        #     scaled_data = clinical_scaler.transform(df_input)
        #     df_input_scaled = pd.DataFrame(scaled_data, columns=CLINICAL_EXPECTED_FEATURES)
        #     print("DataFrame sent to clinical model (after scaling):\n", df_input_scaled)
        #     df_to_predict = df_input_scaled
        # else:
        #     df_to_predict = df_input
        df_to_predict = df_input # Direct assignment since no scaling is applied


        pcos_risk_percentage = 0.0
        if hasattr(clinical_pcos_model, 'predict_proba'):
            prediction_proba = clinical_pcos_model.predict_proba(df_to_predict)[:, 1]
            pcos_risk_percentage = round(prediction_proba[0] * 100, 2)
            print(f"Raw prediction probability: {prediction_proba[0]}") # Added raw probability print
        else:
            prediction_result = clinical_pcos_model.predict(df_to_predict)[0]
            pcos_risk_percentage = 100.0 if prediction_result == 1 else 0.0
            print(f"Warning: Clinical model does not have 'predict_proba'. Using 'predict' and mapping result: {prediction_result}")

        return jsonify({"pcos_risk_percentage": pcos_risk_percentage}), 200

    except KeyError as e:
        print(f"KeyError (Clinical Model): Missing data field: {e}")
        return jsonify({"error": f"Missing data field for clinical model: {e}. Please ensure all required fields are sent."}), 400
    except ValueError as e:
        print(f"ValueError (Clinical Model): Invalid data type: {e}")
        return jsonify({"error": f"Invalid data type for clinical model: {e}. Please ensure numerical inputs are valid numbers."}), 400
    except Exception as e:
        print(f"An unexpected error occurred during clinical prediction: {e}")
        return jsonify({"error": f"An internal server error occurred with clinical model: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
# type python backend\app.py in terminal 