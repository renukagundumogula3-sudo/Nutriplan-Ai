const Recipe = require("../models/Recipe");

const {
  generateEmbedding,
  identifyIngredientsFromImage,
  healthifyRecipeWithAI,
  generateMealPlan,
  suggestRecipesFromIngredients
} = require("../services/aiservices");

const { Pinecone } = require("@pinecone-database/pinecone");

/* ===============================
   PINECONE SETUP
================================ */

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.index(
  process.env.PINECONE_INDEX
);


/* ===============================
   GET ALL RECIPES
================================ */

const getRecipes = async (req, res) => {
  try {

    const { diet } = req.query;

    const query = diet
      ? { dietType: diet }
      : {};

    const recipes = await Recipe.find(query);

    res.json(recipes);

  } catch (err) {

    console.error(
      "❌ Get Recipes Error:",
      err
    );

    res.status(500).json({
      message: err.message
    });

  }
};


/* ===============================
   ADD RECIPE + EMBEDDING
================================ */

const createRecipe = async (req, res) => {
  try {

    const {
      title,
      description,
      ingredients,
      instructions,
      time,
      calories,
      protein,
      dietType,
      image
    } = req.body;


    /* ===============================
       CREATE RECIPE IN MONGODB
    ================================ */

    const recipe = await Recipe.create({

      title,
      description,
      ingredients,
      instructions,
      time,
      calories,
      protein,
      dietType,
      image

    });


    /* ===============================
       GENERATE EMBEDDING
    ================================ */

    const embedding = await generateEmbedding(
      `${title} ${description} ${dietType} ${ingredients.join(" ")}`
    );


    /* ===============================
       SAVE VECTOR TO PINECONE
    ================================ */

    await index.upsert([
      {
        id: recipe._id.toString(),

        values: embedding,

        metadata: {
          title,
          dietType,
          calories,
          protein
        }
      }
    ]);


    res.status(201).json(recipe);

  } catch (err) {

    console.error(
      "❌ Create Recipe Error:",
      err
    );

    res.status(500).json({
      message: err.message
    });

  }
};


/* ===============================
   SNAP & COOK (VISION)
================================ */

const snapAndCook = async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        message: "No image uploaded"
      });

    }


    /* ===============================
       IDENTIFY INGREDIENTS
    ================================ */

    const ingredients =
      await identifyIngredientsFromImage(
        req.file.buffer,
        req.file.mimetype
      );


    console.log(
      "Controller received ingredients:",
      ingredients
    );


    res.json({
      ingredients
    });


  } catch (err) {

    console.error(
      "❌ Snap & Cook Error:",
      err
    );

    res.status(500).json({
      message: err.message
    });

  }
};


/* ===============================
   SEMANTIC VIBE SEARCH
================================ */

const vibeSearch = async (req, res) => {

  try {

    const { q } = req.query;


    /* ===============================
       VALIDATE SEARCH QUERY
    ================================ */

    if (!q || !q.trim()) {

      return res.status(400).json({
        message: "Search query is required"
      });

    }


    const searchQuery =
      q.trim().toLowerCase();


    console.log(
      `🔎 Vibe Search Query: "${searchQuery}"`
    );


    /* ===============================
       GENERATE QUERY EMBEDDING
    ================================ */

    const vector =
      await generateEmbedding(
        searchQuery
      );


    console.log(
      `🧬 Generated Embedding (dim: ${vector.length})`
    );


    /* ===============================
       PINECONE SEMANTIC SEARCH
    ================================ */

    const response =
      await index.query({

        vector,

        topK: 10,

        includeMetadata: true

      });


    console.log(
      `🌲 Pinecone Matches: ${response.matches.length}`
    );


    response.matches.forEach(match => {

      console.log(
        `   - ${match.metadata?.title} (score: ${match.score})`
      );

    });


    /* =================================================
       EXACT KEYWORD SEARCH
       
       Examples:
       chicken
       paneer
       fish
       avocado
       oats
    ================================================== */

    const escapedQuery =
      searchQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );


    const keywordRegex =
      new RegExp(
        escapedQuery,
        "i"
      );


    const keywordRecipes =
      await Recipe.find({

        $or: [

          {
            title: keywordRegex
          },

          {
            description: keywordRegex
          },

          {
            ingredients: keywordRegex
          }

        ]

      });


    /* =================================================
       RETURN EXACT KEYWORD RESULTS
    ================================================== */

    if (keywordRecipes.length > 0) {

      const keywordIds =
        new Set(

          keywordRecipes.map(
            recipe =>
              recipe._id.toString()
          )

        );


      const recipesMap =
        new Map(

          keywordRecipes.map(
            recipe => [

              recipe._id.toString(),

              recipe

            ]
          )

        );


      /* ===============================
         PRESERVE PINECONE ORDER
      ================================ */

      const orderedKeywordRecipes =
        response.matches

          .filter(match =>
            keywordIds.has(
              match.id
            )
          )

          .map(match =>
            recipesMap.get(
              match.id
            )
          )

          .filter(Boolean);


      console.log(
        `🎯 Keyword Matches Found: ${orderedKeywordRecipes.length}`
      );


      return res.json(
        orderedKeywordRecipes
      );

    }


    /* =================================================
       SEMANTIC SEARCH FALLBACK
       
       Used for searches such as:
       
       "comforting rainy dinner"
       "high protein meal"
       "healthy breakfast"
       "light lunch"
    ================================================== */

    const ids =
      response.matches.map(
        match => match.id
      );


    const recipes =
      await Recipe.find({

        _id: {
          $in: ids
        }

      });


    /* ===============================
       CREATE RECIPE MAP
    ================================ */

    const recipesMap =
      new Map(

        recipes.map(
          recipe => [

            recipe._id.toString(),

            recipe

          ]
        )

      );


    /* ===============================
       PRESERVE PINECONE ORDER
    ================================ */

    const orderedSemanticRecipes =
      response.matches

        .map(match => ({

          recipe:
            recipesMap.get(
              match.id
            ),

          score:
            match.score

        }))

        .filter(
          item => item.recipe
        );


    /* =================================================
       RETURN ONLY TOP 3 RESULTS
       
       This prevents all 10 recipes from appearing.
    ================================================== */

    const topSemanticRecipes =
      orderedSemanticRecipes

        .slice(0, 3)

        .map(
          item =>
            item.recipe
        );


    console.log(
      `🧠 Semantic Results Returned: ${topSemanticRecipes.length}`
    );


    res.json(
      topSemanticRecipes
    );


  } catch (err) {

    console.error(
      "❌ Vibe Search Error:",
      err
    );


    res.status(500).json({
      message: err.message
    });

  }

};


/* ===============================
   GOAL-ORIENTED MEAL PLAN (RAG)
================================ */

const planMeal = async (req, res) => {

  try {

    const {
      goal,
      calories,
      diet,
      pantry
    } = req.body;


    /* ===============================
       DIET FILTER
    ================================ */

    let query = {};


    if (
      diet &&
      diet !== "None" &&
      diet !== "Non-Veg"
    ) {

      query.dietType = diet;

    }


    /* ===============================
       PANTRY MATCHING
    ================================ */

    let recipes;


    if (
      pantry &&
      pantry.length > 0
    ) {

      recipes =
        await Recipe.find({

          ...query,

          ingredients: {
            $in: pantry
          }

        }).limit(20);

    } else {

      recipes =
        await Recipe.find(
          query
        ).limit(20);

    }


    /* ===============================
       FALLBACK
    ================================ */

    if (
      recipes.length < 5
    ) {

      recipes =
        await Recipe.find(
          query
        ).limit(10);

    }


    /* ===============================
       GENERATE MEAL PLAN
    ================================ */

    const plan =
      await generateMealPlan(

        goal,

        calories,

        diet,

        pantry,

        recipes

      );


    res.json({
      plan
    });


  } catch (err) {

    console.error(
      "❌ Meal Plan Error:",
      err
    );


    res.status(500).json({
      message: err.message
    });

  }

};


/* ===============================
   HEALTH-IFY MY PLATE
================================ */

const healthifyRecipe = async (req, res) => {

  try {

    const { recipe } =
      req.body;


    const healthier =
      await healthifyRecipeWithAI(
        recipe
      );


    res.json({
      healthier
    });


  } catch (err) {

    console.error(
      "❌ Healthify Error:",
      err
    );


    res.status(500).json({
      message: err.message
    });

  }

};


/* ===============================
   SUGGEST RECIPE FROM INGREDIENTS
================================ */

const suggestRecipes = async (req, res) => {

  try {

    const { ingredients } =
      req.body;


    if (
      !ingredients ||
      ingredients.length === 0
    ) {

      return res.status(400).json({
        message:
          "No ingredients provided"
      });

    }


    const recipe =
      await suggestRecipesFromIngredients(
        ingredients
      );


    res.json({
      recipe
    });


  } catch (err) {

    console.error(
      "❌ Suggest Recipe Error:",
      err
    );


    res.status(500).json({
      message: err.message
    });

  }

};


/* ===============================
   EXPORTS
================================ */

module.exports = {

  getRecipes,

  createRecipe,

  snapAndCook,

  vibeSearch,

  planMeal,

  healthifyRecipe,

  suggestRecipes

};