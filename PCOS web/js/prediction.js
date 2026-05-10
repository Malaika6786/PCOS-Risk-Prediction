// femcure-app/js/prediction.js
import { renderRiskGauge } from './utils.js';

// Centralized state for prediction form data (initial values)
// These values will be updated by the form inputs in main.js
export let predictionFormData = {
    Age_yrs: 25.0, Weight_Kg: 60.0, Height_Cm: 160.0, BMI: 23.44,
    Cycle_RI: 'Regular', Cyclelength_days: 28.0, MarraigeStatus_Yrs: 0.0,
    Pregnant_YN: 'No', No_ofaborptions: 0.0, Hip_inch: 38.0,
    Waist_inch: 30.0, Waist_HipRatio: 0.79, Weightgain_YN: 'No',
    hairgrowth_YN: 'No', Skindarkening_YN: 'No',
    Hairloss_YN: 'No', Pimples_YN: 'No',
    Fastfood_YN: 'No', Reg_Exercise_YN: 'Yes',
    BP_Systolic_mmHg: 120.0, BP_Diastolic_mmHg: 80.0,
    // Add initial values for new clinical fields here if they are part of a shared form
    Blood_Group: '', Pulse_rate_bpm: 0.0, RR_breaths_min: 0.0, Hb_g_dl: 0.0,
    TSH_mIU_L: 0.0, AMH_ng_mL: 0.0, PRL_ng_mL: 0.0, VitD3_ng_mL: 0.0,
    RBS_mg_dL: 0.0, Follicle_No_L: 0, Follicle_No_R: 0,
    Avg_F_size_L_mm: 0.0, Avg_F_size_R_mm: 0.0, Endometrium_mm: 0.0,
    FSH_mIU_mL: 0.0, FSH_LH_Ratio: 0.0, I_beta_HCG_mIU_mL: 0.0,
    II_beta_HCG_mIU_mL: 0.0, LH_mIU_mL: 0.0, PRG_ng_mL: 0.0 // New fields
};

/**
 * Handles the prediction logic for female users by sending data to a backend API.
 * @param {HTMLFormElement} formElement - The prediction form element.
 * @param {HTMLElement} resultsDisplayElement - The element to show results.
 * @param {function} renderGaugeCallback - Callback to render the risk gauge.
 */
export async function performFemalePrediction(formElement, resultsDisplayElement, renderGaugeCallback) {
    resultsDisplayElement.classList.add('hidden'); // Hide previous results
    
    // Show a loading indicator while waiting for the backend response
    resultsDisplayElement.innerHTML = `
        <div class="text-center text-purple-700 flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mr-3"></div>
            Calculating your personalized PCOS risk...
        </div>
    `;
    resultsDisplayElement.classList.remove('hidden');

    const formData = new FormData(formElement);
    const dataToSend = {}; // Use a new object to send to backend

    // Populate dataToSend from form inputs
    for (let [key, value] of formData.entries()) {
        // Only include keys that are part of our predictionFormData or are needed by backend
        if (predictionFormData.hasOwnProperty(key)) {
            dataToSend[key] = value;
        }
    }

    // IMPORTANT: Ensure BMI and Waist:Hip Ratio are calculated and included.
    // These are disabled inputs, so their values aren't directly in formData.
    // We get them from the DOM elements.
    dataToSend.BMI = parseFloat(document.getElementById('bmi').value);
    dataToSend.Waist_HipRatio = parseFloat(document.getElementById('waist_hip_ratio').value);

    // No frontend categorical encoding here. Send the raw string values.
    // The backend (app.py) will handle the mapping to model's expected feature names
    // and numerical conversion (e.g., 'Regular'/'Irregular' to 0/1).

    // Ensure numerical values are parsed as floats before sending
    // This loop is safer as it only attempts to parse values that are expected to be numbers.
    for (const key in dataToSend) {
        // Check if the key is one of the numerical fields
        if (['Age_yrs', 'Weight_Kg', 'Height_Cm', 'BMI', 'Cyclelength_days', 'MarraigeStatus_Yrs',
             'No_ofaborptions', 'Hip_inch', 'Waist_inch', 'Waist_HipRatio',
             'BP_Systolic_mmHg', 'BP_Diastolic_mmHg'].includes(key)) {
            dataToSend[key] = parseFloat(dataToSend[key]);
        }
    }

    // Define your backend API endpoint for female prediction
    const backendUrl = 'http://127.0.0.1:5000/predict_pcos';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend), // Send the collected and transformed data as JSON
        });

        if (!response.ok) {
            let errorDetails = 'Unknown error';
            try {
                // Attempt to parse JSON response for detailed error message
                const errorJson = await response.json();
                // Prioritize 'error' field from backend, then 'message', then statusText
                errorDetails = errorJson.error || errorJson.message || response.statusText;
            } catch (jsonParseError) {
                // If response is not valid JSON, use statusText
                errorDetails = response.statusText;
            }
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorDetails}`);
        }

        const result = await response.json(); // Expecting JSON response from backend
        const predictedRisk = result.pcos_risk_percentage; // Assuming backend sends 'pcos_risk_percentage'

        // First, insert the full HTML structure into the DOM.
        // This ensures the elements like 'riskGaugeCircle' exist before renderGaugeCallback is called.
        resultsDisplayElement.innerHTML = `
            <h3 class="text-2xl font-bold text-purple-800 mb-6">Your Personalized Health Insights</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <h4 class="text-lg font-semibold text-purple-700 mb-4">PCOS Risk Assessment</h4>
                    <div class="risk-gauge-container">
                        <div id="riskGaugeCircle" class="risk-gauge-circle" style="--risk-percentage: 0%; --gauge-color: #22C55E;">
                            <div class="risk-gauge-inner">
                                <span id="riskPercentage" class="risk-gauge-percentage">0%</span>
                                <span class="risk-gauge-label">Risk</span>
                            </div>
                        </div>
                    </div>
                    <p id="predictionResultText" class="text-lg font-bold mt-4 text-green-500">Low PCOS Risk</p>
                    <p class="text-sm text-gray-500 mt-2">This is an estimated risk. Consult a doctor for diagnosis.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="text-lg font-semibold text-soft-teal-700 mb-4">Lifestyle Tips of the Day</h4>
                    <ul class="list-disc pl-5 text-gray-700 leading-relaxed">
                        <li>Prioritize 7-9 hours of quality sleep.</li>
                        <li>Incorporate whole foods and limit processed sugars.</li>
                        <li>Aim for 30 minutes of moderate exercise daily.</li>
                        <li>Manage stress through mindfulness or yoga.</li>
                    </ul>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="text-lg font-semibold text-purple-700 mb-4">Your Symptom Tracker</h4>
                    <p class="text-gray-700 mb-4">
                        Track your symptoms over time to identify patterns and discuss with your healthcare provider.
                    </p>
                    <button class="text-purple-700 font-semibold hover:text-purple-800 transition-colors">
                        Log Symptoms (Coming Soon)
                    </button>
                </div>
            </div>

            <div class="mt-8">
                <h3 class="text-xl font-bold text-purple-700 mb-4">Learn More About PCOS</h3>
                <div class="accordion-container">
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <span>What is PCOS?</span>
                            <span class="accordion-icon">></span>
                        </div>
                        <div class="accordion-content">
                            <p class="text-gray-700">Polycystic Ovary Syndrome (PCOS) is a hormonal disorder common among women of reproductive age. Women with PCOS may have infrequent or prolonged menstrual periods or excess male hormone (androgen) levels. The ovaries may develop numerous small collections of fluid (follicles) and fail to regularly release eggs.</p>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <span>When to Consult a Doctor?</span>
                            <span class="accordion-icon">></span>
                        </div>
                        <div class="accordion-content">
                            <p class="text-gray-700">If you have concerns about your menstrual periods, fertility, or symptoms like acne and excess hair growth, it's advisable to consult a doctor. Early diagnosis and treatment can reduce the risk of long-term complications such as type 2 diabetes and heart disease.</p>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <span>PCOS & Diet: What to Eat?</span>
                            <span class="accordion-icon">></span>
                        </div>
                        <div class="accordion-content">
                            <p class="text-gray-700">A balanced diet focusing on whole, unprocessed foods, lean proteins, and healthy fats can help manage PCOS symptoms. Limiting refined carbohydrates, sugary drinks, and highly processed foods is often recommended. Consider a low glycemic index diet to help regulate blood sugar levels.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-center bg-pink-50 p-6 rounded-xl shadow-sm border border-pink-100 mt-8">
                <h4 class="text-xl font-bold text-purple-700 mb-2">🎉 Congratulations!</h4>
                <p class="text-gray-700">You've completed your PCOS risk assessment. Keep tracking your progress!</p>
            </div>
        `;

        // Now that the elements are in the DOM, get their references and pass them to renderGaugeCallback
        const riskGaugeCircleElement = document.getElementById('riskGaugeCircle');
        const riskPercentageSpanElement = document.getElementById('riskPercentage');
        const predictionResultTextElement = document.getElementById('predictionResultText');
        renderGaugeCallback(predictedRisk, riskGaugeCircleElement, riskPercentageSpanElement, predictionResultTextElement);

        // Re-attach accordion event listeners after re-rendering content
        document.querySelectorAll('#predictionResults .accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('.accordion-icon');

                if (content.classList.contains('open')) {
                    content.classList.remove('open');
                    content.style.maxHeight = null;
                    content.style.padding = '0 1.5rem';
                    icon.classList.remove('rotate');
                } else {
                    header.closest('.accordion-container').querySelectorAll('.accordion-content.open').forEach(openContent => {
                        openContent.classList.remove('open');
                        openContent.style.maxHeight = null;
                        openContent.style.padding = '0 1.5rem';
                        openContent.previousElementSibling.querySelector('.accordion-icon').classList.remove('rotate');
                    });
                    content.classList.add('open');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.padding = '1rem 1.5rem';
                    icon.classList.add('rotate');
                }
            });
        });


    } catch (error) {
        console.error("Error during female PCOS prediction:", error);
        resultsDisplayElement.innerHTML = `<p class="text-rose-500 text-center py-8">Error getting prediction: ${error.message}. Please ensure the backend server is running and accessible.</p>`;
    }
}

/**
 * Handles the prediction logic for clinical users by sending data to a backend API.
 * @param {HTMLFormElement} formElement - The prediction form element.
 * @param {HTMLElement} resultsDisplayElement - The element to show results.
 * @param {function} renderGaugeCallback - Callback to render the risk gauge.
 */
export async function performClinicalPrediction(formElement, resultsDisplayElement, renderGaugeCallback) {
    resultsDisplayElement.classList.add('hidden'); // Hide previous results

    // Show a loading indicator
    resultsDisplayElement.innerHTML = `
        <div class="text-center text-purple-700 flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mr-3"></div>
            Calculating clinical insights...
        </div>
    `;
    resultsDisplayElement.classList.remove('hidden');

    const formData = new FormData(formElement);
    const dataToSend = {}; // Use a new object to send to backend

    // Define a mapping for Blood Group to numerical values
    const bloodGroupMapping = {
        'A+': 1.0, 'A-': 2.0, 'B+': 3.0, 'B-': 4.0,
        'AB+': 5.0, 'AB-': 6.0, 'O+': 7.0, 'O-': 8.0,
        '': 0.0 // Handle empty string (no selection) as 0.0
    };

    // Populate dataToSend from form inputs
    for (let [key, value] of formData.entries()) {
        // Collect all form data, including new clinical fields
        dataToSend[key] = value;
    }

    // Handle Blood_Group separately before general numerical parsing
    if (dataToSend.hasOwnProperty('Blood_Group')) {
        dataToSend.Blood_Group = bloodGroupMapping[dataToSend.Blood_Group] !== undefined ?
                                  bloodGroupMapping[dataToSend.Blood_Group] : 0.0; // Default to 0.0 if not found
    }

    // Ensure numerical values are parsed as floats before sending
    // This loop is safer as it only attempts to parse values that are expected to be numbers.
    // Include all new clinical fields here for parsing.
    const numericalFields = [
        'Age_yrs', 'Weight_Kg', 'Height_Cm', 'BMI', 'Cyclelength_days', 'MarraigeStatus_Yrs',
        'No_ofaborptions', 'Hip_inch', 'Waist_inch', 'Waist_HipRatio',
        'BP_Systolic_mmHg', 'BP_Diastolic_mmHg',
        // New clinical fields (match names from your clinical form)
        'Pulse_rate_bpm', 'RR_breaths_min', 'Hb_g_dl',
        'TSH_mIU_L', 'AMH_ng_mL', 'PRL_ng_mL', 'VitD3_ng_mL', 'RBS_mg_dL',
        'Follicle_No_L', 'Follicle_No_R', 'Avg_F_size_L_mm', 'Avg_F_size_R_mm', 'Endometrium_mm',
        'FSH_mIU_mL', 'FSH_LH_Ratio', 'I_beta_HCG_mIU_mL',
        'II_beta_HCG_mIU_mL', 'LH_mIU_mL', 'PRG_ng_mL' // New fields
    ];

    for (const key in dataToSend) {
        // Exclude Blood_Group from this general numerical parsing as it's handled above
        if (numericalFields.includes(key) && key !== 'Blood_Group') {
            // Check if the value is an empty string before parsing
            if (dataToSend[key] === '') {
                dataToSend[key] = 0.0; // Default to 0.0 for empty numerical fields
            } else {
                dataToSend[key] = parseFloat(dataToSend[key]);
            }
        }
    }

    // Define your backend API endpoint for clinical prediction
    const backendUrl = 'http://127.0.0.1:5000/predict_clinical_pcos'; 

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });

        if (!response.ok) {
            let errorDetails = 'Unknown error';
            try {
                const errorJson = await response.json();
                errorDetails = errorJson.error || errorJson.message || response.statusText;
            } catch (jsonParseError) {
                errorDetails = response.statusText;
            }
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorDetails}`);
        }

        const result = await response.json();
        const predictedRisk = result.pcos_risk_percentage; // Assuming backend sends 'pcos_risk_percentage'

        // First, insert the full HTML structure for clinical results into the DOM.
        resultsDisplayElement.innerHTML = `
            <h3 class="text-2xl font-bold text-purple-800 mb-6">Clinical Insights for this Patient</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <h4 class="text-lg font-semibold text-purple-700 mb-4">PCOS Risk Assessment</h4>
                    <div class="risk-gauge-container">
                        <div id="clinicalRiskGaugeCircle" class="risk-gauge-circle" style="--risk-percentage: 0%; --gauge-color: #22C55E;">
                            <div class="risk-gauge-inner">
                                <span id="clinicalRiskPercentage" class="risk-gauge-percentage">0%</span>
                                <span class="risk-gauge-label">Risk</span>
                            </div>
                        </div>
                    </div>
                    <p id="clinicalPredictionResultText" class="text-lg font-bold mt-4 text-green-500">Low PCOS Risk (Clinical)</p>
                    <p class="text-sm text-gray-500 mt-2">This is an estimated risk. Further clinical evaluation is recommended.</p>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="text-lg font-semibold text-soft-teal-700 mb-4">Clinical Recommendations</h4>
                    <ul class="list-disc pl-5 text-gray-700 leading-relaxed">
                        <li>Consider further hormonal assays (e.g., free testosterone, SHBG).</li>
                        <li>Recommend ultrasound for ovarian morphology assessment.</li>
                        <li>Evaluate insulin resistance markers (e.g., HOMA-IR).</li>
                        <li>Discuss long-term metabolic and cardiovascular risks.</li>
                    </ul>
                </div>

                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 class="text-lg font-semibold text-purple-700 mb-4">Patient Education Points</h4>
                    <p class="text-gray-700 mb-4">
                        Provide patient-friendly explanations for lifestyle changes, medication options, and fertility management.
                    </p>
                    <button class="text-purple-700 font-semibold hover:text-purple-800 transition-colors">
                        Generate Patient Handout (Coming Soon)
                    </button>
                </div>
            </div>

            <div class="mt-8">
                <h3 class="text-xl font-bold text-purple-700 mb-4">Further Clinical Resources</h3>
                <div class="accordion-container">
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <span>Diagnostic Criteria for PCOS</span>
                            <span class="accordion-icon">></span>
                        </div>
                        <div class="accordion-content">
                            <p class="text-gray-700">The Rotterdam criteria are commonly used for diagnosing PCOS, requiring at least two of the following three: oligo- or anovulation, clinical or biochemical signs of hyperandrogenism, and polycystic ovaries on ultrasound (12 or more follicles in each ovary measuring 2–9 mm in diameter and/or increased ovarian volume >10 mL).</p>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <span>Treatment Approaches</span>
                            <span class="accordion-icon">></span>
                        </div>
                        <div class="accordion-content">
                            <p class="text-gray-700">Treatment strategies for PCOS are individualized based on symptoms and goals. They may include oral contraceptives for menstrual regulation and androgen reduction, metformin for insulin resistance, anti-androgens for hirsutism/acne, and fertility treatments for conception.</p>
                        <p class="text-gray-700">This is a placeholder for clinical-specific content.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-center bg-pink-50 p-6 rounded-xl shadow-sm border border-pink-100 mt-8">
                <h4 class="text-xl font-bold text-purple-700 mb-2">Clinical Assessment Complete!</h4>
                <p class="text-gray-700">Review the insights and consider further patient management.</p>
            </div>
        `;
        // Now that the elements are in the DOM, get their references and pass them to renderGaugeCallback
        const riskGaugeCircleElement = document.getElementById('clinicalRiskGaugeCircle'); // Updated ID
        const riskPercentageSpanElement = document.getElementById('clinicalRiskPercentage'); // Updated ID
        const predictionResultTextElement = document.getElementById('clinicalPredictionResultText'); // Updated ID
        renderGaugeCallback(predictedRisk, riskGaugeCircleElement, riskPercentageSpanElement, predictionResultTextElement);

        // Re-attach accordion event listeners
        document.querySelectorAll('#clinicalPredictionResults .accordion-header').forEach(header => { // Scope to clinical results
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('.accordion-icon');

                if (content.classList.contains('open')) {
                    content.classList.remove('open');
                    content.style.maxHeight = null;
                    content.style.padding = '0 1.5rem';
                    icon.classList.remove('rotate');
                } else {
                    header.closest('.accordion-container').querySelectorAll('.accordion-content.open').forEach(openContent => {
                        openContent.classList.remove('open');
                        openContent.style.maxHeight = null;
                        openContent.style.padding = '0 1.5rem';
                        openContent.previousElementSibling.querySelector('.accordion-icon').classList.remove('rotate');
                    });
                    content.classList.add('open');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.padding = '1rem 1.5rem';
                    icon.classList.add('rotate');
                }
            });
        });

    } catch (error) {
        console.error("Error during clinical PCOS prediction:", error);
        resultsDisplayElement.innerHTML = `<p class="text-rose-500 text-center py-8">Error getting clinical prediction: ${error.message}. Please ensure the backend server is running and accessible.</p>`;
    }
}
