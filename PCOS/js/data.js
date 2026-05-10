// femcure-app/js/data.js
// --- Data Definitions ---
export const pcosFriendlyMeals = [
    {
        id: 'm1',
        type: 'meal',
        name: 'Mediterranean Quinoa Bowl',
        description: 'A vibrant and fiber-rich bowl.',
        fullDescription: 'Quinoa with chickpeas, crisp cucumber, juicy tomatoes, briny olives, and a zesty lemon-tahini dressing. This meal is packed with plant-based protein, healthy fats, and complex carbohydrates, making it ideal for blood sugar management.',
        ingredients: ['Quinoa', 'Chickpeas', 'Cucumber', 'Tomatoes', 'Olives', 'Lemon', 'Tahini', 'Herbs'],
        nutritionalInfo: '450 kcal, 18g Protein, 55g Carbs, 15g Fat, 12g Fiber',
        benefits: 'High in fiber, supports gut health, helps stabilize blood sugar.',
        price: 'PKR 1299',
        imageUrl: 'https://placehold.co/300x200/A8C3A1/FFFFFF?text=Quinoa+Bowl'
    },
    {
        id: 'm2',
        type: 'meal',
        name: 'Baked Salmon & Roasted Veggies',
        description: 'Omega-3 rich salmon with seasonal vegetables.',
        fullDescription: 'Perfectly baked salmon fillet served alongside a colorful medley of roasted broccoli, vibrant bell peppers, and tender asparagus. This dish is an excellent source of anti-inflammatory Omega-3 fatty acids, crucial for hormonal balance.',
        ingredients: ['Salmon', 'Broccoli', 'Bell Peppers', 'Asparagus', 'Olive Oil', 'Garlic', 'Herbs'],
        nutritionalInfo: '550 kcal, 35g Protein, 25g Carbs, 35g Fat, 8g Fiber',
        benefits: 'Rich in Omega-3s, anti-inflammatory, supports heart health.',
        price: 'PKR 1850',
        imageUrl: 'https://placehold.co/300x200/F7D6E0/FFFFFF?text=Salmon+Veg'
    },
    {
        id: 'm3',
        type: 'meal',
        name: 'Hearty Lentil Soup',
        description: 'A comforting and protein-packed soup.',
        fullDescription: 'A warm and comforting lentil soup, brimming with a variety of garden vegetables like carrots, celery, and spinach, simmered in a savory broth. Served with a slice of whole grain bread, it’s high in plant-based protein and fiber, promoting satiety and stable energy.',
        ingredients: ['Lentils', 'Carrots', 'Celery', 'Spinach', 'Vegetable Broth', 'Whole Grain Bread'],
        nutritionalInfo: '400 kcal, 22g Protein, 60g Carbs, 5g Fat, 15g Fiber',
        benefits: 'High fiber, plant-based protein, sustained energy.',
        price: 'PKR 1000',
        imageUrl: 'https://placehold.co/300x200/B497BD/FFFFFF?text=Lentil+Soup'
    },
    {
        id: 'm4',
        type: 'meal',
        name: 'Chicken & Avocado Power Salad',
        description: 'Lean protein and healthy fats for sustained energy.',
        fullDescription: 'Grilled chicken breast atop a bed of fresh mixed greens, creamy avocado slices, and juicy cherry tomatoes, all tossed in a light, refreshing vinaigrette. This salad offers a perfect balance of lean protein and essential healthy fats.',
        ingredients: ['Grilled Chicken', 'Mixed Greens', 'Avocado', 'Cherry Tomatoes', 'Vinaigrette'],
        nutritionalInfo: '480 kcal, 30g Protein, 20g Carbs, 30g Fat, 7g Fiber',
        benefits: 'Supports muscle health, provides healthy fats, nutrient-dense.',
        price: 'PKR 1425',
        imageUrl: 'https://placehold.co/300x200/A0D7D5/FFFFFF?text=Chicken+Salad'
    },
    {
        id: 'm5',
        type: 'meal',
        name: 'Berry & Nut Oatmeal',
        description: 'A wholesome breakfast for lasting fullness.',
        fullDescription: 'Creamy oatmeal topped with a generous mix of fresh berries (strawberries, blueberries, raspberries) and crunchy mixed nuts (almonds, walnuts). This breakfast is rich in antioxidants and fiber, promoting digestive health and sustained energy.',
        ingredients: ['Rolled Oats', 'Mixed Berries', 'Almonds', 'Walnuts', 'Chia Seeds', 'Milk (dairy/non-dairy)'],
        nutritionalInfo: '380 kcal, 10g Protein, 50g Carbs, 15g Fat, 10g Fiber',
        benefits: 'High in antioxidants, promotes satiety, good for gut health.',
        price: 'PKR 850',
        imageUrl: 'https://placehold.co/300x200/F0EBF8/FFFFFF?text=Oatmeal'
    },
    {
        id: 'm6',
        type: 'meal',
        name: 'Spinach & Feta Egg Muffins',
        description: 'Protein-rich and convenient breakfast or snack.',
        fullDescription: 'Baked egg muffins loaded with fresh spinach and crumbled feta cheese. These portable, protein-packed muffins are perfect for a quick breakfast or a healthy snack, helping to keep blood sugar stable throughout the day.',
        ingredients: ['Eggs', 'Spinach', 'Feta Cheese', 'Onion', 'Bell Pepper', 'Herbs'],
        nutritionalInfo: '150 kcal per muffin (2 muffins per serving), 12g Protein, 5g Carbs, 9g Fat',
        benefits: 'High protein, low carb, excellent for on-the-go.',
        price: 'PKR 950',
        imageUrl: 'https://placehold.co/300x200/E3F6F5/000000?text=Egg+Muffins'
    }
];

export const pcosFriendlyTeas = [
    {
        id: 't1',
        type: 'tea',
        name: 'Spearmint Tea',
        description: 'Known for its anti-androgen properties.',
        fullDescription: 'Spearmint tea is widely researched for its ability to help reduce androgen levels, which can alleviate symptoms like hirsutism (excess hair growth) and acne in women with PCOS. It has a refreshing, mild minty flavor.',
        ingredients: ['Dried Spearmint Leaves'],
        nutritionalInfo: '0 kcal, Caffeine-free',
        benefits: 'Reduces androgen, alleviates hirsutism and acne.',
        price: 'PKR 450',
        imageUrl: 'https://placehold.co/300x200/A8C3A1/FFFFFF?text=Spearmint+Tea'
    },
    {
        id: 't2',
        type: 'tea',
        name: 'Green Tea',
        description: 'Rich in antioxidants, supports metabolism.',
        fullDescription: 'Green tea is packed with antioxidants, particularly EGCG, which can support metabolism, aid in weight management, and help regulate blood sugar levels. Its mild, earthy flavor makes it a great daily beverage.',
        ingredients: ['Green Tea Leaves'],
        nutritionalInfo: '0 kcal, Contains Caffeine',
        benefits: 'Antioxidant-rich, boosts metabolism, aids blood sugar regulation.',
        price: 'PKR 350',
        imageUrl: 'https://placehold.co/300x200/F7D6E0/FFFFFF?text=Green+Tea'
    },
    {
        id: 't3',
        type: 'tea',
        name: 'Chamomile Tea',
        description: 'Promotes relaxation and reduces stress.',
        fullDescription: 'Chamomile tea is well-known for its calming properties, helping to reduce stress and improve sleep quality. Managing stress is vital for women with PCOS, as stress can exacerbate hormonal imbalances.',
        ingredients: ['Dried Chamomile Flowers'],
        nutritionalInfo: '0 kcal, Caffeine-free',
        benefits: 'Reduces stress, improves sleep, calming effect.',
        price: 'PKR 400',
        imageUrl: 'https://placehold.co/300x200/B497BD/FFFFFF?text=Chamomile+Tea'
    },
    {
        id: 't4',
        type: 'tea',
        name: 'Cinnamon Tea',
        description: 'Helps improve insulin sensitivity.',
        fullDescription: 'Cinnamon tea has been studied for its potential to improve insulin sensitivity and lower blood sugar levels, which are common issues in PCOS. It has a warm, comforting, and slightly sweet flavor.',
        ingredients: ['Cinnamon Sticks', 'Water'],
        nutritionalInfo: '0 kcal, Caffeine-free',
        benefits: 'Improves insulin sensitivity, helps regulate blood sugar.',
        price: 'PKR 380',
        imageUrl: 'https://placehold.co/300x200/A0D7D5/FFFFFF?text=Cinnamon+Tea'
    }
];

export const affirmations = [
    "You are strong, resilient, and capable of achieving your health goals.",
    "Every small step you take contributes to your overall well-being.",
    "Listen to your body with kindness and compassion.",
    "You are worthy of health, happiness, and peace.",
    "Embrace your journey with patience and self-love."
];

export const dailyChallenges = [
    "Drink 8 glasses of water today.",
    "Take a 20-minute walk outdoors.",
    "Practice 5 minutes of mindful breathing.",
    "Prepare one home-cooked meal.",
    "Get 7-9 hours of sleep tonight."
];
