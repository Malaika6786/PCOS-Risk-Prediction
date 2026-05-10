# import streamlit as st
# import pandas as pd
# import joblib

# # Load the trained model
# model = joblib.load("trained_model.pkl")

# st.set_page_config(page_title="PCOS Risk Predictor", layout="centered")
# st.title("🩺 FEMCARE - PCOS Risk Prediction")

# uploaded_file = st.file_uploader("Upload Excel File with Patient Data", type=["xlsx"])

# if uploaded_file is not None:
#     try:
#         df = pd.read_excel(uploaded_file)

#         # Drop unused columns
#         drop_cols = ["Sl. No", "Patient File No.", "PCOS (Y/N)"]
#         df = df.drop(columns=[col for col in drop_cols if col in df.columns], errors='ignore')

#         # Fill missing values
#         df.fillna(df.median(numeric_only=True), inplace=True)

#         # Predict risk
#         probs = model.predict_proba(df)[:, 1] * 100
#         df_results = pd.DataFrame({
#             "Patient": [f"Patient {i+1}" for i in range(len(probs))],
#             "PCOS Risk (%)": probs.round(1)
#         })

#         st.success("✅ Predictions Complete")
#         st.write(df_results)

#         # Download button
#         result_file = "pcos_risk_results.xlsx"
#         df_results.to_excel(result_file, index=False)
#         with open(result_file, "rb") as f:
#             st.download_button("📥 Download Results as Excel", f, file_name=result_file)

#     except Exception as e:
#         st.error(f"❌ Error reading or processing file: {e}")
# else:
#     st.info("👈 Please upload an Excel file containing patient data.")
import streamlit as st
import pandas as pd
import joblib
from PIL import Image
import base64
import time  # For simulating progress
import os
print("Current working directory:", os.getcwd())

# Page setup
st.set_page_config(
    page_title="FEMCARE - PCOS Risk Predictor",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS with more feminine design and improved visibility
st.markdown("""
    <style>
    /* Main background and text */
    .stApp {
        background: #ffffff; /* Pure white background for maximum contrast */
        color: #000000; /* Black text for maximum readability */
    }
    
    /* Header styling */
    h1 {
        color: #9c0063; /* Deep pink for headers - high contrast */
        text-align: center;
        font-size: 2.8rem;
        margin-bottom: 1rem;
        font-weight: 700;
        text-shadow: none; /* Removed for better readability */
    }
    
    h2, h3, h4 {
        color: #9c0063; /* Same deep pink color for consistency */
        margin-top: 1rem;
        font-weight: 600; /* Bolder for better visibility */
    }
    
    /* All text elements - ensuring visibility */
    p, span, div, li {
        color: #000000; /* Black text */
        font-weight: 500; /* Slightly bold for better visibility */
    }
    
    /* Container styling */
    div.stButton > button {
        background-color: #ff0066 !important; /* Bright pink button */
        color: white !important;
        font-weight: bold;
        border-radius: 8px; /* Less rounded for more space */
        padding: 0.5rem 1rem;
        border: 2px solid #9c0063; /* Border for more definition */
        box-shadow: 3px 3px 0px #9c0063; /* Offset shadow for depth */
        transition: all 0.2s;
    }
    
    div.stButton > button:hover {
        background-color: #9c0063 !important; 
        transform: translateY(-1px);
    }
    
    div.stDownloadButton > button {
        background-color: #ff0066 !important;
        color: white !important;
        font-weight: bold;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        border: 2px solid #9c0063;
        box-shadow: 3px 3px 0px #9c0063;
        transition: all 0.2s;
    }
    
    div.stDownloadButton > button:hover {
        background-color: #9c0063 !important;
        transform: translateY(-1px);
    }
    
    /* File uploader - high visibility border */
    .uploadedFile {
        border: 3px solid #ff0066;
        border-radius: 8px;
        padding: 15px;
        background-color: #fff0f5; /* Light pink background */
    }
    
    /* Dataframe styling for high contrast */
    .dataframe {
        font-family: Arial, sans-serif; /* More readable font */
        border-collapse: collapse;
        width: 100%;
        border: 2px solid #9c0063; /* Bold border */
    }
    
    .dataframe th {
        background-color: #9c0063; /* Deep pink headers */
        color: white;
        text-align: center;
        padding: 12px;
        font-weight: bold;
        font-size: 1.1em; /* Larger font for headers */
    }
    
    .dataframe td {
        padding: 12px;
        border-bottom: 1px solid #9c0063;
        text-align: center;
        color: #000000; /* Black text in cells */
        font-weight: 500;
    }
    
    .dataframe tr:nth-child(even) {
        background-color: #ffe6f2; /* Light pink for alternating rows */
    }
    
    .dataframe tr:nth-child(odd) {
        background-color: #ffffff; /* White for alternating rows */
    }
    
    .dataframe tr:hover {
        background-color: #ffb6c1; /* Bright pink on hover */
    }
    
    /* Card for content - solid background for better visibility */
    .css-1r6slb0, .css-12oz5g7, .css-18e3th9, .css-1d391kg, .css-1vq4p4l {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 8px rgba(156, 0, 99, 0.2);
        margin-bottom: 20px;
        border: 1px solid #ff6699; /* Light pink border */
    }
    
    /* Override any default text colors in Streamlit */
    .css-10trblm, .css-16idsys {
        color: #9c0063 !important;
    }
    
    .css-1avcm0n, .css-145kmo2 {
        color: #000000 !important;
    }
    
    /* Success/info/error messages - enhanced visibility */
    .stSuccess {
        background-color: #e8f5e9 !important; /* Light green background */
        border-left: 5px solid #4caf50 !important; /* Green border */
        color: #1b5e20 !important; /* Dark green text */
        font-weight: bold;
        padding: 15px !important;
    }
    
    .stInfo {
        background-color: #e3f2fd !important; /* Light blue background */
        border-left: 5px solid #2196f3 !important; /* Blue border */
        color: #0d47a1 !important; /* Dark blue text */
        font-weight: bold;
        padding: 15px !important;
    }
    
    .stError {
        background-color: #ffebee !important; /* Light red background */
        border-left: 5px solid #f44336 !important; /* Red border */
        color: #b71c1c !important; /* Dark red text */
        font-weight: bold;
        padding: 15px !important;
    }
    
    /* Horizontal rule */
    hr {
        border-top: 3px solid #9c0063;
        margin: 1.5rem 0;
    }
    
    /* For decorative elements - larger and bolder */
    .decoration {
        text-align: center;
        font-size: 28px;
        color: #ff0066;
        margin: 15px 0;
        font-weight: bold;
    }
    
    /* Custom container - improved visibility */
    .custom-container {
        border: 3px solid #9c0063;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
        background-color: #fff0f5; /* Light pink background */
    }
    </style>
""", unsafe_allow_html=True)

# Helper function to create decorative divider
def decorative_divider():
    st.markdown('<div class="decoration" style="background-color:#ffe6f2; padding:8px; border-radius:8px; border:2px solid #ff0066;">✿ ❀ ✿ ❀ ✿</div>', unsafe_allow_html=True)

# Custom container
def custom_container(content_function):
    st.markdown('<div class="custom-container">', unsafe_allow_html=True)
    content_function()
    st.markdown('</div>', unsafe_allow_html=True)

# Create column layout
col1, col2, col3 = st.columns([1, 3, 1])

with col2:
    # Title with emoji
    st.markdown('<h1>💖 FEMCARE 💖<br><span style="font-size:1.8rem; color:#9c0063; font-weight:bold;">PCOS Risk Prediction Tool</span></h1>', unsafe_allow_html=True)
    
    decorative_divider()
    
    # Introduction
    def intro_content():
        st.markdown("""
        <div style="font-size:1.2rem; font-weight:500;">
        Welcome to <span style="color:#9c0063; font-weight:700;">FemCare</span> - a specialized tool designed to help healthcare professionals
        assess the risk of Polycystic Ovary Syndrome (PCOS) in patients. Upload your patient data
        file to get instant risk predictions.
        </div>
        """, unsafe_allow_html=True)
    
    custom_container(intro_content)
    
    # Upload Excel file section
    def upload_content():
        uploaded_file = st.file_uploader("📊 Upload Excel File with Patient Data", type=["xlsx"])
        
        if uploaded_file is not None:
            try:
                st.success("✅ File successfully uploaded!")
                
                # Show file details
                file_details = {
                    "Filename": uploaded_file.name,
                    "File type": uploaded_file.type,
                    "File size": f"{round(uploaded_file.size / 1024, 2)} KB"
                }
                
                st.write("**File Details:**")
                for key, value in file_details.items():
                    st.write(f"**{key}:** {value}")
                
                # Process the file
                df = pd.read_excel(uploaded_file)
                
                # Optional: Show preview of data
                with st.expander("Preview Data"):
                    st.dataframe(df.head())
                
                # Drop non-feature columns if they exist
                drop_cols = ["Sl. No", "Patient File No.", "PCOS (Y/N)"]
                df = df.drop(columns=[col for col in drop_cols if col in df.columns], errors='ignore')
                
                # Fill missing values
                df.fillna(df.median(numeric_only=True), inplace=True)
                
                # Load model
                try:
                    # Add a progress indicator for better visibility
                    with st.spinner("Loading the prediction model..."):
                        model = joblib.load("trained_model.pkl")
                    
                    # Predict risk with progress bar
                    progress_bar = st.progress(0)
                    st.info("⏳ Processing patient data...")
                    
                    # Simulate progress for better user experience
                    for i in range(101):
                        progress_bar.progress(i)
                        if i == 100:
                            break
                        time.sleep(0.01)
                    
                    probs = model.predict_proba(df)[:, 1] * 100
                    progress_bar.empty()
                    
                    st.success("✅ Predictions Complete!")
                    
                    # Create results dataframe with color coding
                    df_results = pd.DataFrame({
                        "Patient ID": [f"Patient {i+1}" for i in range(len(probs))],
                        "PCOS Risk (%)": probs.round(1)
                    })
                    
                    # Risk categories
                    df_results["Risk Category"] = pd.cut(
                        df_results["PCOS Risk (%)"],
                        bins=[0, 25, 50, 75, 100],
                        labels=["Low", "Moderate", "High", "Very High"]
                    )
                    
                    # Display results with styled dataframe
                    st.markdown("<h3 style='color:#9c0063; font-weight:bold; font-size:1.5rem;'>📊 Prediction Results</h3>", unsafe_allow_html=True)
                    
                    # Apply styling to risk categories with colored backgrounds
                    def highlight_risk(val):
                        if val == "Low":
                            return 'background-color: #e8f5e9; color: #1b5e20; font-weight: bold'
                        elif val == "Moderate":
                            return 'background-color: #fff9c4; color: #f57f17; font-weight: bold'
                        elif val == "High":
                            return 'background-color: #ffccbc; color: #bf360c; font-weight: bold'
                        elif val == "Very High":
                            return 'background-color: #ffcdd2; color: #b71c1c; font-weight: bold'
                        else:
                            return ''
                    
                    # Style the dataframe
                    styled_df = df_results.style.applymap(highlight_risk, subset=['Risk Category'])
                    st.dataframe(styled_df)
                    
                    # Summary statistics
                    st.markdown("<h3 style='color:#9c0063; font-weight:bold; font-size:1.5rem;'>📈 Summary Statistics</h3>", unsafe_allow_html=True)
                    st.markdown("<div style='border:2px solid #ff0066; padding:15px; border-radius:10px; background-color:#fff0f5;'>", unsafe_allow_html=True)
                    col_stats1, col_stats2 = st.columns(2)
                    
                    with col_stats1:
                        avg_risk = df_results["PCOS Risk (%)"].mean()
                        st.metric("Average Risk Score", f"{avg_risk:.1f}%")
                        
                    with col_stats2:
                        high_risk_count = len(df_results[df_results["PCOS Risk (%)"] > 70])
                        st.metric("Patients with High Risk (>70%)", high_risk_count)
                    
                    # Risk distribution
                    risk_counts = df_results["Risk Category"].value_counts().reset_index()
                    risk_counts.columns = ["Risk Category", "Count"]
                    
                    col_chart1, col_chart2 = st.columns(2)
                    
                    with col_chart1:
                        st.markdown("#### Risk Distribution")
                        st.bar_chart(risk_counts.set_index("Risk Category"))
                    
                    with col_chart2:
                        st.markdown("<h4 style='color:#9c0063; font-weight:bold;'>Risk Percentiles</h4>", unsafe_allow_html=True)
                        percentiles = df_results["PCOS Risk (%)"].quantile([0.25, 0.5, 0.75]).to_dict()
                        for quantile, value in percentiles.items():
                            st.markdown(f"<div style='background-color:#fff0f5; padding:8px; margin:5px 0; border-radius:5px; border:1px solid #ff0066;'><b>{int(quantile*100)}th Percentile:</b> <span style='font-size:1.2rem; font-weight:bold; color:#9c0063;'>{value:.1f}%</span></div>", unsafe_allow_html=True)
                    
                    st.markdown("</div>", unsafe_allow_html=True)
                    
                    # Download section with improved visibility
                    st.markdown("<div style='background-color:#ffe6f2; padding:20px; border-radius:10px; border:3px solid #ff0066; margin-top:20px;'>", unsafe_allow_html=True)
                    st.markdown("<h4 style='color:#9c0063; font-weight:bold; text-align:center;'>Download Your Results</h4>", unsafe_allow_html=True)
                    
                    # Download results
                    result_file = "pcos_risk_results.xlsx"
                    df_results.to_excel(result_file, index=False)
                    
                    # Center the download button
                    col1, col2, col3 = st.columns([1,2,1])
                    with col2:
                        with open(result_file, "rb") as f:
                            st.download_button(
                                "📥 Download Complete Results as Excel",
                                f,
                                file_name=result_file,
                                mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            )
                    
                    st.markdown("</div>", unsafe_allow_html=True)
                    
                except FileNotFoundError:
                    st.error("❌ Model file not found. Please ensure the 'trained_model.pkl' file is in the same directory.")
                except Exception as e:
                    st.error(f"❌ Error during prediction: {e}")
                
            except Exception as e:
                st.error(f"❌ Error reading or processing file: {e}")
        else:
            st.info("👉 Please upload an Excel file containing patient data.")
    
    custom_container(upload_content)
    
    # Information section
    st.markdown("<h3 style='color:#9c0063; font-weight:bold; font-size:1.5rem;'>📚 About PCOS</h3>", unsafe_allow_html=True)
    
    def about_pcos():
        st.markdown("""
        <div style="font-size:1.1rem; font-weight:500;">
        <span style="color:#9c0063; font-weight:700; font-size:1.2rem;">Polycystic Ovary Syndrome (PCOS)</span> is a hormonal disorder common among women of reproductive age.
        <br><br>
        Women with PCOS may have:
        <ul style="font-weight:500; color:#000000;">
          <li><b>Infrequent or prolonged menstrual periods</b></li>
          <li><b>Excess male hormone (androgen) levels</b></li>
          <li><b>Numerous small follicles in the ovaries</b></li>
        </ul>
        <br>
        <span style="background-color:#ffe6f2; padding:5px; border-radius:5px;">Early diagnosis and treatment can reduce the risk of long-term complications such as type 2 diabetes
        and heart disease.</span>
        </div>
        """, unsafe_allow_html=True)
    
    custom_container(about_pcos)
    
    # Footer
    decorative_divider()
    st.markdown("""
    <div style="text-align: center; color: #9c0063; font-size: 1rem; font-weight:bold; background-color:#ffe6f2; padding:10px; border-radius:8px; border:2px solid #ff0066;">
        FemCare PCOS Risk Predictor © 2025<br>
        Designed for healthcare professionals
    </div>
    """, unsafe_allow_html=True)