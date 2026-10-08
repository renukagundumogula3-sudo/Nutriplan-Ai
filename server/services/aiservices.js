require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

/* ===============================
   GEMINI SETUP
================================ */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ===============================
   1️⃣ GENERATE EMBEDDING
================================ */
const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-embedding-001"
    });

    const result = await model.embedContent({
      content: {
        parts: [{ text: text }]
      },
      outputDimensionality: 768
    });

    return result.embedding.values;
  } catch (err) {
    console.error("Embedding Error:", err);
    throw err;
  }
};

/* ===============================
   2️⃣ SNAP & COOK (VISION)
================================ */
/* ===============================
   2️⃣ SNAP & COOK (VISION)
================================ */
const identifyIngredientsFromImage = async (imageBase64, mimeType) => {
  try {
    console.log("🔍 Starting Gemini Vision...");
    console.log("📷 MIME Type:", mimeType);
    console.log("📦 Image buffer received:", !!imageBase64);

    if (!imageBase64) {
      throw new Error("Image data is missing");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const base64Data = Buffer.isBuffer(imageBase64)
      ? imageBase64.toString("base64")
      : imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

    const prompt = `
You are an AI food ingredient detection system.

Analyze the uploaded image and identify all individual food ingredients
that are clearly visible.

The image can contain ANY type of food ingredient. Do not assume that
the image contains a particular set of ingredients.

Return ONLY a valid JSON array containing the detected ingredients.

Rules:
- Detect ingredients based ONLY on what is visually present.
- Do not assume ingredients that are not visible.
- Do not invent ingredients.
- Identify individual ingredients whenever possible.
- Use specific ingredient names instead of vague categories.
- Do not return words such as "food", "ingredients", "vegetables",
  "meat", "greens", or "items".
- Do not return plates, bowls, containers, utensils, packaging,
  furniture, or background objects.
- If a prepared food is visible, identify its individual ingredients
  only when they can be visually recognized with reasonable confidence.
- Do not guess hidden ingredients based on a common recipe.
- Use simple lowercase ingredient names.
- Remove duplicate ingredients.
- Return between 0 and 15 clearly recognizable ingredients.
- If no food ingredients can be identified, return [].
- Return JSON only.
- Do not use Markdown.
- Do not add explanations.

The output must always follow this structure:

["ingredient1", "ingredient2", "ingredient3"]
`;
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: base64Data,
        },
      },
      {
        text: prompt,
      },
    ]);

    const response = await result.response;
    const text = response.text().trim();

    console.log("🤖 Gemini Vision Raw Response:", text);

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    console.log("🧹 Cleaned Response:", cleaned);

    const ingredients = JSON.parse(cleaned);

    if (!Array.isArray(ingredients)) {
      throw new Error("Gemini did not return an ingredient array");
    }

    console.log("✅ Detected Ingredients:", ingredients);

    return ingredients;

  } catch (err) {
    console.error("❌ Gemini Vision Error:", err);
    console.error("Message:", err.message);
    console.error("Status:", err.status);
    console.error("Stack:", err.stack);

    throw err;
  }
};


/* ===============================
   3️⃣ HEALTH-IFY MY PLATE
================================ */
const healthifyRecipeWithAI = async (recipe) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
You are modifying an existing recipe, NOT creating a new recipe.

Your job is to make ONLY small, meaningful health improvements to the ORIGINAL recipe.

IMPORTANT RULES:

1. DO NOT rewrite the entire recipe.
2. DO NOT create a new recipe title.
3. DO NOT create a new description.
4. DO NOT add nutrition information.
5. DO NOT add calories, protein, diet type, or cooking time.
6. DO NOT add health explanations.
7. DO NOT add an "AI Health Logic" section.
8. DO NOT create new sections such as:
   - For the Chicken & Marinade
   - For the Salad
   - For the Dressing
   - Nutrition
   - Description
9. Keep the ORIGINAL recipe structure.
10. Keep unchanged ingredients exactly as they are.
11. Keep unchanged instructions exactly as they are.
12. Change ONLY ingredients or instruction parts that genuinely need to be healthier.
13. Make a maximum of 5 meaningful changes.
14. Do not change something just for the sake of changing it.
15. Keep the instructions short.
16. Do not add alternative cooking methods unless the original cooking method itself needs to be changed.
17. Do not add extra ingredients unless necessary for the health improvement.
18. Do not remove ingredients unless there is a clear health reason.

MOST IMPORTANT FORMATTING RULE:

Whenever something is changed, show:

~~ORIGINAL TEXT~~ → **HEALTHIER TEXT**

Example:

- ~~2 tablespoons olive oil~~ → **1 tablespoon olive oil**

Example inside an instruction:

1. Marinate the chicken with ~~2 tablespoons olive oil~~ → **1 tablespoon olive oil**, salt and pepper.

UNCHANGED CONTENT MUST REMAIN NORMAL.

OUTPUT FORMAT:

Ingredients

- Original unchanged ingredient
- Original unchanged ingredient
- ~~Original ingredient~~ → **Healthier replacement**

Instructions

1. Original unchanged instruction.
2. Instruction with ~~original part~~ → **healthier replacement**.
3. Original unchanged instruction.
4. Original unchanged instruction.
5. Original unchanged instruction.

STRICT OUTPUT LIMITS:

- Maximum 5 changed ingredients.
- Maximum 5 changed instruction parts.
- Maximum 5 instruction steps.
- Keep the total response SHORT.
- Do NOT write introductory sentences.
- Do NOT write concluding sentences.
- Do NOT explain why the changes are healthy.
- Do NOT write "Here's a healthier version".
- Do NOT write a new recipe.

Return ONLY:

Ingredients

Instructions

ORIGINAL RECIPE:
${JSON.stringify(recipe, null, 2)}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (err) {
    console.error("Healthify Error:", err);
    throw err;
  }
};
/* ===============================
   4️⃣ GOAL-BASED MEAL PLAN (RAG)
================================ */
/* ===============================
   4️⃣ GOAL-BASED MEAL PLAN (RAG)
================================ */

const generateMealPlan = async (
  goal,
  calories,
  diet,
  pantry,
  recipes
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const context = (recipes || [])
      .map(
        (r) =>
          `Title: ${r.title}, Calories: ${r.calories}, Protein: ${
            r.protein
          }, Ingredients: ${(r.ingredients || []).join(", ")}`
      )
      .join("\n");

    const pantryList =
      pantry && pantry.length > 0
        ? pantry.join(", ")
        : "No pantry ingredients provided";

    const prompt = `
Create a 1-day personalized meal plan.

USER GOAL:
${goal}

TARGET CALORIES:
${calories}

DIETARY PREFERENCE:
${diet}

PANTRY INGREDIENTS:
${pantryList}

AVAILABLE RECIPES:
${context}

IMPORTANT RULES:

1. Generate exactly 3 meals:
   - Breakfast
   - Lunch
   - Dinner

2. Use pantry ingredients whenever possible.

3. Each meal MUST contain:
   - A recipe/meal name
   - Calories
   - Protein
   - Ingredients
   - 3 to 5 short cooking instructions
   - One short reason why it fits the user's goal

4. The cooking instructions must explain HOW TO MAKE the recipe.

5. Keep instructions short and practical and also each step new line.

6. Do NOT write long paragraphs.

7. Do NOT create a shopping list after every meal.

8. Create ONLY ONE shopping list at the very end.

9. Shopping list should contain ONLY ingredients that are needed but are not reasonably available in the pantry and each ingredient new line.

10. Do NOT repeat shopping-list items.

11. Do NOT add an introduction.

12. Do NOT add a conclusion.

13. Do NOT add extra sections.

14. Do NOT use Markdown headings such as # or ##.

15. Follow the exact format below.

RETURN ONLY THIS FORMAT:

BREAKFAST:
MEAL: <meal name>
CALORIES: <number> kcal
PROTEIN: <number> g
INGREDIENTS:
- <ingredient>
- <ingredient>
- <ingredient>
INSTRUCTIONS:
1. <short cooking step>
2. <short cooking step>
3. <short cooking step>
4. <short cooking step>
WHY: <one short sentence>

LUNCH:
MEAL: <meal name>
CALORIES: <number> kcal
PROTEIN: <number> g
INGREDIENTS:
- <ingredient>
- <ingredient>
- <ingredient>
INSTRUCTIONS:
1. <short cooking step>
2. <short cooking step>
3. <short cooking step>
4. <short cooking step>
WHY: <one short sentence>

DINNER:
MEAL: <meal name>
CALORIES: <number> kcal
PROTEIN: <number> g
INGREDIENTS:
- <ingredient>
- <ingredient>
- <ingredient>
INSTRUCTIONS:
1. <short cooking step>
2. <short cooking step>
3. <short cooking step>
4. <short cooking step>
WHY: <one short sentence>

SHOPPING_LIST:
- <ingredient needed>
- <ingredient needed>
- <ingredient needed>

IMPORTANT:
The SHOPPING_LIST section must appear ONLY ONCE and ONLY AFTER DINNER.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text().trim();
  } catch (err) {
    console.error("Meal Plan Error:", err);
    throw err;
  }
};
/* ===============================
   5️⃣ SUGGEST RECIPES FROM INGREDIENTS
================================ */
const suggestRecipesFromIngredients = async (ingredients) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    I have these ingredients: ${ingredients.join(", ")}.
    Create a detailed recipe using mainly these ingredients. You can add common pantry staples (salt, oil, spices).
    
    Structure the response in Markdown:
    ## [Recipe Title]
    **Calories:** ~X kcal | **Protein:** ~X g

    ### Ingredients
    - ...
    
    ### Instructions
    1. ...
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Recipe Gen Error:", err);
    throw err;
  }
};

/* ===============================
   EXPORTS
================================ */
module.exports = {
  generateEmbedding,
  identifyIngredientsFromImage,
  healthifyRecipeWithAI,
  generateMealPlan,
  suggestRecipesFromIngredients
};
