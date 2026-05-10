// femcure-app/js/meal_generator.js
import { pcosFriendlyMeals, pcosFriendlyTeas } from './data.js';

/**
 * Filters meals and teas based on dietary preference and calorie goal.
 * Then generates HTML for a sample plan.
 * 
 * @param {string} preference - e.g., 'vegetarian', 'non-vegetarian', 'low-carb', etc.
 * @param {string} calorieGoal - e.g., '1200-1400', '1400-1600', etc.
 * @returns {string} - Generated HTML
 */
export async function generateMealPlan(preference, calorieGoal) {
    const filteredMeals = pcosFriendlyMeals.filter(meal => {
        const isVeg = !meal.ingredients.some(ing => /chicken|salmon|egg/i.test(ing));
        const isLowCarb = parseFloat(meal.nutritionalInfo.match(/(\d+)g Carbs/)[1]) <= 30;

        if (preference === 'vegetarian' && !isVeg) return false;
        if (preference === 'non-vegetarian' && isVeg) return false;
        if (preference === 'low-carb' && !isLowCarb) return false;

        return true;
    });

    const filteredTeas = pcosFriendlyTeas; // All teas are allowed regardless of preference

    // Pick 2 meals and 1 tea randomly
    const selectedMeals = filteredMeals.sort(() => 0.5 - Math.random()).slice(0, 2);
    const selectedTea = filteredTeas[Math.floor(Math.random() * filteredTeas.length)];

    // Build HTML
    let planHTML = `
        <div class="grid md:grid-cols-3 gap-6 mt-6">
            ${selectedMeals.map(meal => `
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
            `).join('')}
            <div class="feature-card tea-card" data-item='${JSON.stringify(selectedTea)}' style="padding: 0;">
                <img src="${selectedTea.imageUrl}" alt="${selectedTea.name}" class="meal-card-img"/>
                <div class="p-6 text-left w-full">
                    <h4 class="text-xl font-bold text-purple-700 mb-2">${selectedTea.name}</h4>
                    <p class="text-gray-600 text-sm mb-3">${selectedTea.description}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-500 text-sm">${selectedTea.nutritionalInfo}</span>
                        <span class="text-lg font-bold text-blush-pink-600">${selectedTea.price}</span>
                    </div>
                </div>
            </div>
        </div>
        <p class="mt-6 text-center text-gray-600">Tap any item to view details and benefits.</p>
    `;

    return planHTML;
}
