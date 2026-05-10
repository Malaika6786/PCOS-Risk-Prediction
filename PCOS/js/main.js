// femcure-app/js/main.js
import { pcosFriendlyMeals, pcosFriendlyTeas, affirmations, dailyChallenges } from './data.js';
import { renderRiskGauge, calculateBMI, calculateWaistHipRatio, toggleAccordion } from './utils.js';
import { performFemalePrediction, performClinicalPrediction, predictionFormData } from './prediction.js';
import { generateMealPlan } from './meal_generator.js';

// --- DOM Elements (Global access within main.js) ---
const pages = {
    home: document.getElementById('homePage'),
    prediction: document.getElementById('predictionPage'),
    clinical: document.getElementById('clinicalPage'),
    meal: document.getElementById('mealPage')
};

const navButtons = {
    home: document.getElementById('navButtonHome'),
    prediction: document.getElementById('navButtonPrediction'),
    clinical: document.getElementById('navButtonClinical'),
    meal: document.getElementById('navButtonMeal')
};

const heroGetStartedButton = document.getElementById('heroGetStartedButton');
const featureCardPrediction = document.getElementById('featureCardPrediction');
const featureCardMeal = document.getElementById('featureCardMeal');
const featureCardClinical = document.getElementById('featureCardClinical');
const clinicalToPredictionButton = document.getElementById('clinicalToPredictionButton');

// Prediction Form Elements (for direct manipulation in main.js if needed, or passed to prediction.js)
const predictionForm = document.getElementById('predictionForm');
const ageInput = document.getElementById('age');
const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const bmiInput = document.getElementById('bmi');
const waistInput = document.getElementById('waist');
const hipInput = document.getElementById('hip');
const waistHipRatioInput = document.getElementById('waist_hip_ratio');
const predictionResultsDiv = document.getElementById('predictionResults');
// Removed direct references to riskPercentageSpan, riskGaugeCircle, predictionResultText
// as they are now handled by passing elements to renderRiskGauge in prediction.js

// Clinical Prediction Form Elements (NEW)
const clinicalPredictionForm = document.getElementById('clinicalPredictionForm');
const ageInputClinical = document.getElementById('age_clinical');
const weightInputClinical = document.getElementById('weight_clinical');
const heightInputClinical = document.getElementById('height_clinical');
const bmiInputClinical = document.getElementById('bmi_clinical');
const waistInputClinical = document.getElementById('waist_clinical');
const hipInputClinical = document.getElementById('hip_clinical');
const waistHipRatioInputClinical = document.getElementById('waist_hip_ratio_clinical');
const clinicalPredictionResultsDiv = document.getElementById('clinicalPredictionResults');

// New Clinical Inputs (for BMI/WHR calculation and form data collection)
const fshInputClinical = document.getElementById('fsh_clinical');
const fshLhRatioInputClinical = document.getElementById('fsh_lh_ratio_clinical');
const iBetaHcgInputClinical = document.getElementById('i_beta_hcg_clinical');
const iiBetaHcgInputClinical = document.getElementById('ii_beta_hcg_clinical'); // New
const lhInputClinical = document.getElementById('lh_clinical'); // New
const prgInputClinical = document.getElementById('prg_clinical'); // New


// Meal Plan Elements
const mealPlanForm = document.getElementById('mealPlanForm');
const generatedMealPlanDiv = document.getElementById('generatedMealPlan');
const mealPlanContentDiv = document.getElementById('mealPlanContent');
const mealsContainer = document.getElementById('mealsContainer');
const teasContainer = document.getElementById('teasContainer');

// Modals
const itemDetailsModal = document.getElementById('itemDetailsModal');
const closeDetailsModalButton = document.getElementById('closeDetailsModalButton');
const modalItemName = document.getElementById('modalItemName');
const modalItemImage = document.getElementById('modalItemImage');
const modalFullDescription = document.getElementById('modalFullDescription');
const modalIngredients = document.getElementById('modalIngredients');
const modalNutritionalInfo = document.getElementById('modalNutritionalInfo');
const modalBenefits = document.getElementById('modalBenefits');
const modalPrice = document.getElementById('modalPrice');
const modalOrderNowButton = document.getElementById('modalOrderNowButton');

const orderConfirmationModal = document.getElementById('orderConfirmationModal');
const closeOrderConfirmationButton = document.getElementById('closeOrderConfirmationButton');
const orderedItemNameSpan = document.getElementById('orderedItemName');

// Accordions
const accordionHeaders = document.querySelectorAll('.accordion-header'); // General accordion headers

// Daily Affirmation/Challenge
const dailyAffirmationElement = document.getElementById('dailyAffirmation');
const dailyChallengeElement = document.getElementById('dailyChallenge');

// --- State Management (Centralized in main.js for simplicity) ---
let appState = {
    currentPage: 'home',
    selectedItem: null,
    orderedItemName: '',
    // predictionFormData is now managed within prediction.js, but main.js can access it if needed
};

// --- Functions ---

/**
 * Navigates to a specified page, updates URL hash, and manages active navigation button.
 * @param {string} pageId - The ID of the page to navigate to (e.g., 'home', 'prediction').
 */
function navigateTo(pageId) {
    // Hide all pages
    Object.values(pages).forEach(page => page.classList.add('hidden'));
    // Show the target page
    pages[pageId].classList.remove('hidden');

    // Update active navigation button
    Object.values(navButtons).forEach(button => button.classList.remove('active'));
    if (navButtons[pageId]) {
        navButtons[pageId].classList.add('active');
    }

    // Update URL hash
    window.location.hash = pageId;
    appState.currentPage = pageId;

    // Special handling for prediction results visibility on page change
    if (pageId !== 'prediction') {
        predictionResultsDiv.classList.add('hidden');
    }
    // Also hide clinical prediction results when not on clinical page
    if (pageId !== 'clinical') {
        clinicalPredictionResultsDiv.classList.add('hidden');
    }
    // Reset meal plan content when navigating away from meal page
    if (pageId !== 'meal') {
        generatedMealPlanDiv.classList.add('hidden');
        mealPlanContentDiv.innerHTML = '';
    }
}

/**
 * Populates and displays the item details modal.
 * @param {object} item - The item object (meal or tea).
 */
function showItemDetailsModal(item) {
    appState.selectedItem = item;
    modalItemName.textContent = item.name;
    modalItemImage.src = item.imageUrl;
    modalItemImage.alt = item.name;
    modalFullDescription.textContent = item.fullDescription;
    modalIngredients.textContent = item.ingredients.join(', ');
    modalNutritionalInfo.textContent = item.nutritionalInfo;
    modalBenefits.textContent = item.benefits;
    modalPrice.textContent = item.price;
    modalOrderNowButton.dataset.itemName = item.name; // Store item name for order confirmation

    itemDetailsModal.classList.add('open');
}

/**
 * Hides the item details modal.
 */
function hideItemDetailsModal() {
    itemDetailsModal.classList.remove('open');
    appState.selectedItem = null;
}

/**
 * Displays the order confirmation modal.
 * @param {string} itemName - The name of the item ordered.
 */
function showOrderConfirmationModal(itemName) {
    orderedItemNameSpan.textContent = itemName;
    orderConfirmationModal.classList.add('open');
    hideItemDetailsModal(); // Close details modal when order is confirmed
}

/**
 * Hides the order confirmation modal.
 */
function hideOrderConfirmationModal() {
    orderConfirmationModal.classList.remove('open');
    appState.orderedItemName = '';
}

/**
 * Renders meal and tea cards dynamically.
 */
function renderMealAndTeaCards() {
    mealsContainer.innerHTML = ''; // Clear existing cards
    pcosFriendlyMeals.forEach(meal => {
        const cardHtml = `
            <div class="feature-card meal-card" data-item='${JSON.stringify(meal)}' style="padding: 0;">
                <img src="${meal.imageUrl}" alt="${meal.name}" class="meal-card-img"/>
                <div class="p-6 text-left w-full">
                    <h4 class="text-xl font-bold text-purple-700 mb-2">${meal.name}</h4>
                    <p class="text-gray-600 text-sm mb-3">${meal.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-500 text-sm">${meal.nutritionalInfo}</span>
                        <span class="text-lg font-bold text-blush-pink-600">${meal.price}</span>
                    </div>
                </div>
            </div>
        `;
        mealsContainer.insertAdjacentHTML('beforeend', cardHtml);
    });

    teasContainer.innerHTML = ''; // Clear existing cards
    pcosFriendlyTeas.forEach(tea => {
        const cardHtml = `
            <div class="feature-card tea-card" data-item='${JSON.stringify(tea)}' style="padding: 0;">
                <img src="${tea.imageUrl}" alt="${tea.name}" class="meal-card-img"/>
                <div class="p-6 text-left w-full">
                    <h4 class="text-xl font-bold text-purple-700 mb-2">${tea.name}</h4>
                    <p class="text-gray-600 text-sm mb-3">${tea.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-500 text-sm">${tea.nutritionalInfo}</span>
                        <span class="text-lg font-bold text-blush-pink-600">${tea.price}</span>
                    </div>
                </div>
            </div>
        `;
        teasContainer.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Attach event listeners to newly created cards
    document.querySelectorAll('.meal-card, .tea-card').forEach(card => {
        card.addEventListener('click', function() {
            const itemData = JSON.parse(this.dataset.item);
            showItemDetailsModal(itemData);
        });
    });
}

// --- Event Listeners ---

// Navigation Buttons
navButtons.home.addEventListener('click', () => navigateTo('home'));
navButtons.prediction.addEventListener('click', () => navigateTo('prediction'));
navButtons.clinical.addEventListener('click', () => navigateTo('clinical'));
navButtons.meal.addEventListener('click', () => navigateTo('meal'));

// Home Page Buttons
heroGetStartedButton.addEventListener('click', () => navigateTo('prediction'));
featureCardPrediction.addEventListener('click', () => navigateTo('prediction'));
featureCardMeal.addEventListener('click', () => navigateTo('meal'));
featureCardClinical.addEventListener('click', () => navigateTo('clinical'));
// clinicalToPredictionButton is on the clinical insights page itself, handled below

// Prediction Form (General User)
predictionForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    performFemalePrediction(predictionForm, predictionResultsDiv, renderRiskGauge);
});

// Clinical Prediction Form (NEW)
clinicalPredictionForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission
    performClinicalPrediction(clinicalPredictionForm, clinicalPredictionResultsDiv, renderRiskGauge);
});

// Auto-calculate BMI and Waist:Hip Ratio on input change for GENERAL form
ageInput.addEventListener('input', () => { calculateBMI(weightInput, heightInput, bmiInput); calculateWaistHipRatio(waistInput, hipInput, waistHipRatioInput); });
weightInput.addEventListener('input', () => calculateBMI(weightInput, heightInput, bmiInput));
heightInput.addEventListener('input', () => calculateBMI(weightInput, heightInput, bmiInput));
waistInput.addEventListener('input', () => calculateWaistHipRatio(waistInput, hipInput, waistHipRatioInput));
hipInput.addEventListener('input', () => calculateWaistHipRatio(waistInput, hipInput, waistHipRatioInput));

// Auto-calculate BMI and Waist:Hip Ratio on input change for CLINICAL form (NEW)
ageInputClinical.addEventListener('input', () => { calculateBMI(weightInputClinical, heightInputClinical, bmiInputClinical); calculateWaistHipRatio(waistInputClinical, hipInputClinical, waistHipRatioInputClinical); });
weightInputClinical.addEventListener('input', () => calculateBMI(weightInputClinical, heightInputClinical, bmiInputClinical));
heightInputClinical.addEventListener('input', () => calculateBMI(weightInputClinical, heightInputClinical, bmiInputClinical));
waistInputClinical.addEventListener('input', () => calculateWaistHipRatio(waistInputClinical, hipInputClinical, waistHipRatioInputClinical));
hipInputClinical.addEventListener('input', () => calculateWaistHipRatio(waistInputClinical, hipInputClinical, waistHipRatioInputClinical));


// Meal Plan Form
mealPlanForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const dietaryPreferences = document.getElementById('dietaryPreferences').value;
    const calorieGoals = document.getElementById('calorieGoals').value;
    
    mealPlanContentDiv.innerHTML = '<div class="text-center text-purple-700 flex items-center justify-center"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mr-3"></div>Crafting your personalized meal plan...</div>';
    generatedMealPlanDiv.classList.remove('hidden');

    // Call the meal generator function from meal_generator.js
    const planHtml = await generateMealPlan(dietaryPreferences, calorieGoals);
    mealPlanContentDiv.innerHTML = planHtml;
});

// Modals
closeDetailsModalButton.addEventListener('click', hideItemDetailsModal);
modalOrderNowButton.addEventListener('click', function() {
    const itemName = this.dataset.itemName;
    showOrderConfirmationModal(itemName);
});
closeOrderConfirmationButton.addEventListener('click', hideOrderConfirmationModal);

// Close modals if clicking outside (on overlay)
itemDetailsModal.addEventListener('click', function(event) {
    if (event.target === itemDetailsModal) {
        hideItemDetailsModal();
    }
});
orderConfirmationModal.addEventListener('click', function(event) {
    if (event.target === orderConfirmationModal) {
        hideOrderConfirmationModal();
    }
});

// Accordion functionality (re-attaching after dynamic content load)
// It's better to delegate this if possible, or ensure it's called after content updates.
// For now, it's called on initial load and within prediction.js after re-rendering.
accordionHeaders.forEach(header => {
    header.addEventListener('click', () => toggleAccordion(header));
});

// Clinical page button to navigate to prediction page
if (clinicalToPredictionButton) {
    clinicalToPredictionButton.addEventListener('click', () => navigateTo('prediction'));
}


// --- Initial Load / Router Logic ---
function initializePage() {
    const hash = window.location.hash.substring(1); // Get hash without '#'
    if (hash && pages[hash]) {
        navigateTo(hash);
    } else {
        navigateTo('home'); // Default to home page
    }

    // Set random daily affirmation and challenge on load
    dailyAffirmationElement.textContent = affirmations[Math.floor(Math.random() * affirmations.length)];
    dailyChallengeElement.textContent = dailyChallenges[Math.floor(Math.random() * dailyChallenges.length)];

    // Render meal and tea cards initially
    renderMealAndTeaCards();

    // Perform initial calculations for prediction forms
    calculateBMI(weightInput, heightInput, bmiInput);
    calculateWaistHipRatio(waistInput, hipInput, waistHipRatioInput);
    // Also for clinical form if present
    if (weightInputClinical && heightInputClinical && bmiInputClinical) {
        calculateBMI(weightInputClinical, heightInputClinical, bmiInputClinical);
    }
    if (waistInputClinical && hipInputClinical && waistHipRatioInputClinical) {
        calculateWaistHipRatio(waistInputClinical, hipInputClinical, waistHipRatioInputClinical);
    }
}

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Listen for hash changes (e.g., browser back/forward)
window.addEventListener('hashchange', initializePage);
