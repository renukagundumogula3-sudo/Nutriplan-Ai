const { MongoClient } = require("mongodb");
const { Pinecone } = require("@pinecone-database/pinecone");
const { generateEmbedding } = require("./services/aiservices");
require("dotenv").config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = "nutriplan";

// Pinecone Setup
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX);



const recipes = [
  {
    title: "Grilled Chicken Salad",
    description: "High-protein grilled chicken with fresh greens. Light, filling, and perfect for lunch.",
    ingredients: ["chicken breast", "lettuce", "tomato", "olive oil"],
    instructions: [
      "Marinate chicken breast with olive oil, salt, and pepper.",
      "Grill the chicken for 5-7 minutes on each side until cooked through.",
      "Chop the lettuce and tomatoes.",
      "Slice the grilled chicken and place it over the bed of greens.",
      "Drizzle with a little more olive oil and serve."
    ],
    time: "20 min",
    calories: 420,
    protein: 35,
    dietType: "Non-Vegetarian",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800"
  },
  {
    title: "Veg Protein Bowl",
    description: "Plant-based protein bowl packed with chickpeas, quinoa, and spinach.",
    ingredients: ["chickpeas", "quinoa", "spinach", "lemon"],
    instructions: [
      "Rinse and cook quinoa according to package instructions.",
      "In a separate pan, sauté spinach with a little olive oil until wilted.",
      "Rinse canned chickpeas.",
      "Assemble the bowl starting with quinoa, then add spinach and chickpeas.",
      "Squeeze fresh lemon juice over the top before serving."
    ],
    time: "25 min",
    calories: 380,
    protein: 22,
    dietType: "Vegetarian",
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800"
  },
  {
    title: "Oats & Fruit Breakfast",
    description: "Healthy oats cooked with fruits and nuts. Keeps you full all morning.",
    ingredients: ["oats", "milk", "banana", "almonds"],
    instructions: [
      "Combine oats and milk in a pot and bring to a simmer.",
      "Cook for 5-10 minutes, stirring occasionally, until oats are soft.",
      "Slice the banana and chop the almonds.",
      "Top the oatmeal with fruit and nuts.",
      "Serve warm."
    ],
    time: "15 min",
    calories: 300,
    protein: 12,
    dietType: "Vegetarian",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800"
  },
  {
    title: "Paneer Stir Fry",
    description: "Protein-rich paneer tossed with vegetables and mild spices.",
    ingredients: ["paneer", "capsicum", "onion", "olive oil"],
    instructions: [
      "Cube the paneer and chop onion and capsicum.",
      "Heat olive oil in a wok or large pan.",
      "Add onions and Sauté until translucent.",
      "Add capsicum and cook for another 2 minutes.",
      "Toss in the paneer cubes and spices, cooking for 3-4 minutes until golden."
    ],
    time: "20 min",
    calories: 450,
    protein: 28,
    dietType: "Vegetarian",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800"
  },
  {
    title: "Fish Curry",
    description: "Omega-3 rich fish curry cooked in light coconut gravy.",
    ingredients: ["fish", "coconut milk", "onion", "spices"],
    instructions: [
      "Marinate fish pieces with turmeric and salt.",
      "Sauté onions and spices in a pot.",
      "Add coconut milk and bring to a gentle boil.",
      "Add fish pieces and simmer for 10-15 minutes until fish is cooked.",
      "Garnish with coriander and serve with rice."
    ],
    time: "35 min",
    calories: 480,
    protein: 32,
    dietType: "Non-Vegetarian",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800"
  },
  {
    title: "Fruit Smoothie",
    description: "Refreshing smoothie loaded with vitamins and antioxidants.",
    ingredients: ["banana", "berries", "yogurt"],
    instructions: [
      "Peel the banana.",
      "Add banana, frozen berries, and yogurt to a blender.",
      "Blend until smooth.",
      "Pour into a glass and serve immediately."
    ],
    time: "5 min",
    calories: 220,
    protein: 10,
    dietType: "Vegetarian",
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800"
  },
  {
    title: "Egg White Omelette",
    description: "Low-fat, high-protein omelette for fitness lovers.",
    ingredients: ["egg whites", "onion", "spinach"],
    instructions: [
      "Separate egg whites into a bowl and whisk.",
      "Chop onions and spinach.",
      "Heat a non-stick pan with cooking spray.",
      "Pour in egg whites, then sprinkle vegetables on top.",
      "Cook until set, then fold and serve."
    ],
    time: "10 min",
    calories: 260,
    protein: 26,
    dietType: "Eggetarian",
    image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800"
  },
  {
    title: "Brown Rice Veg Khichdi",
    description: "Comforting one-pot meal with lentils and vegetables.",
    ingredients: ["brown rice", "lentils", "carrot", "beans"],
    instructions: [
      "Wash rice and lentils together.",
      "Chop carrots and beans.",
      "Add all ingredients to a pressure cooker or pot with water and spices.",
      "Cook for 3-4 whistles or 25 minutes until soft and mushy.",
      "Serve hot with a dollop of ghee (optional)."
    ],
    time: "40 min",
    calories: 360,
    protein: 16,
    dietType: "Vegetarian",
    image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=800"
  },
  {
    title: "Avocado Toast",
    description: "Simple and nutritious breakfast with healthy fats.",
    ingredients: ["whole wheat bread", "avocado", "olive oil"],
    instructions: [
      "Toast the whole wheat bread slices.",
      "Slice or mash the avocado.",
      "Spread avocado on top of the toast.",
      "Drizzle with a little olive oil, salt/pepper, or chili flakes."
    ],
    time: "8 min",
    calories: 290,
    protein: 8,
    dietType: "Vegetarian",
    image: "https://images.unsplash.com/photo-1603046891744-1f763644026e?w=800"
  },
  {
    title: "Chicken Soup",
    description: "Warm and comforting soup, perfect for cold days.",
    ingredients: ["chicken", "carrot", "celery", "pepper"],
    instructions: [
      "Chop chicken, carrots, and celery into bite-sized pieces.",
      "Sauté vegetables in a pot for 5 minutes.",
      "Add chicken and broth (or water).",
      "Simmer for 25-30 minutes until chicken is tender.",
      "Season with salt and pepper."
    ],
    time: "45 min",
    calories: 250,
    protein: 20,
    dietType: "Non-Vegetarian",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"
  }
];

/* ===============================
   SEED DATABASE
================================ */
const seedDB = async () => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB for seeding");

    const db = client.db(dbName);
    const collection = db.collection("recipes");

    await collection.deleteMany({});
    console.log("🗑️ Cleared existing recipes");

    const result = await collection.insertMany(recipes);
    console.log(`🍽️ ${result.insertedCount} recipes added successfully`);

    // Generate Embeddings and Upsert to Pinecone
    console.log("🧬 Generating embeddings and syncing with Pinecone...");

    // Map insertedIds to an array
    const insertedIds = result.insertedIds;
    const count = result.insertedCount;

    for (let i = 0; i < count; i++) {
      const id = insertedIds[i];
      const recipe = recipes[i];

      const textToEmbed = `${recipe.title} ${recipe.description} ${recipe.dietType}`;
      const embedding = await generateEmbedding(textToEmbed);

      await index.upsert([{
        id: id.toString(),
        values: embedding,
        metadata: {
          title: recipe.title,
          dietType: recipe.dietType,
          calories: recipe.calories
        }
      }]);
      console.log(`   - Embedded & Upserted: ${recipe.title}`);
    }

    console.log("✅ Pinecone sync complete");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await client.close();
    console.log("🔒 Database connection closed");
    process.exit();
  }
};

seedDB();
