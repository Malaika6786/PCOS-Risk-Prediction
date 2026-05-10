// femcure-app/js/utils.js

/**
 * Renders the risk gauge dynamically.
 * @param {number} riskPercentage - The calculated risk percentage.
 * @param {HTMLElement} riskGaugeCircleElement - The DOM element for the risk gauge circle.
 * @param {HTMLElement} riskPercentageSpanElement - The DOM element for the risk percentage span.
 * @param {HTMLElement} predictionResultTextElement - The DOM element for the prediction result text.
 */
export function renderRiskGauge(riskPercentage, riskGaugeCircleElement, riskPercentageSpanElement, predictionResultTextElement) {
    let color = '#22C55E'; // Green for low risk
    let resultText = 'Low PCOS Risk';
    if (riskPercentage > 60) {
        color = '#EF4444'; // Red for high risk
        resultText = 'PCOS Risk Detected';
    } else if (riskPercentage > 30) {
        color = '#EAB308'; // Yellow for moderate risk
        resultText = 'Moderate PCOS Risk';
    }

    // Ensure elements exist before trying to set properties
    if (riskGaugeCircleElement) {
        riskGaugeCircleElement.style.setProperty('--risk-percentage', `${riskPercentage}%`);
        riskGaugeCircleElement.style.setProperty('--gauge-color', color);
    }
    if (riskPercentageSpanElement) {
        riskPercentageSpanElement.textContent = `${riskPercentage}%`;
    }
    if (predictionResultTextElement) {
        predictionResultTextElement.textContent = resultText;
        predictionResultTextElement.style.color = color; // Apply color to text
    }
}

/**
 * Calculates BMI based on weight (Kg) and height (Cm).
 * @param {HTMLInputElement} weightInput - The weight input element.
 * @param {HTMLInputElement} heightInput - The height input element.
 * @param {HTMLInputElement} bmiInput - The BMI display element.
 */
export function calculateBMI(weightInput, heightInput, bmiInput) {
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value); // Height in Cm
    if (weight > 0 && height > 0) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        bmiInput.value = bmi.toFixed(2);
    } else {
        bmiInput.value = '';
    }
}

/**
 * Calculates Waist:Hip Ratio.
 * @param {HTMLInputElement} waistInput - The waist input element.
 * @param {HTMLInputElement} hipInput - The hip input element.
 * @param {HTMLInputElement} waistHipRatioInput - The Waist:Hip Ratio display element.
 */
export function calculateWaistHipRatio(waistInput, hipInput, waistHipRatioInput) {
    const waist = parseFloat(waistInput.value);
    const hip = parseFloat(hipInput.value);
    if (waist > 0 && hip > 0) {
        const whr = waist / hip;
        waistHipRatioInput.value = whr.toFixed(2);
    } else {
        waistHipRatioInput.value = '';
    }
}

/**
 * Toggles accordion content visibility.
 * @param {HTMLElement} header - The clicked accordion header.
 */
export function toggleAccordion(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.accordion-icon');

    if (content.classList.contains('open')) {
        content.classList.remove('open');
        content.style.maxHeight = null;
        content.style.padding = '0 1.5rem';
        icon.classList.remove('rotate');
    } else {
        const container = header.closest('.accordion-container');
        if (container) {
            container.querySelectorAll('.accordion-content.open').forEach(openContent => {
                openContent.classList.remove('open');
                openContent.style.maxHeight = null;
                openContent.style.padding = '0 1.5rem';
                const openIcon = openContent.previousElementSibling.querySelector('.accordion-icon');
                if (openIcon) openIcon.classList.remove('rotate');
            });
        }

        content.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.padding = '1rem 1.5rem';
        icon.classList.add('rotate');
    }
}
