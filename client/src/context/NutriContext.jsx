import { createContext, useEffect, useState } from "react";

export const NutriContext = createContext();

export const NutriProvider = ({ children }) => {
  const [pantry, setPantry] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nutriPantry")) || [];
    } catch {
      return [];
    }
  });

  const [chat, setChat] = useState([]);

  // Pantry generated recipe
  const [generatedRecipe, setGeneratedRecipe] = useState(() => {
    try {
      const saved = localStorage.getItem("generatedRecipe");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Meal Planner result
  const [mealPlan, setMealPlan] = useState(() => {
    return localStorage.getItem("mealPlan") || "";
  });

  // Saved recipes
  const [savedRecipes, setSavedRecipes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedRecipes")) || [];
    } catch {
      return [];
    }
  });

  // Persist pantry
  useEffect(() => {
    localStorage.setItem("nutriPantry", JSON.stringify(pantry));
  }, [pantry]);

  // Persist generated Pantry recipe
  useEffect(() => {
    if (generatedRecipe) {
      localStorage.setItem(
        "generatedRecipe",
        JSON.stringify(generatedRecipe)
      );
    } else {
      localStorage.removeItem("generatedRecipe");
    }
  }, [generatedRecipe]);

  // Persist Meal Planner
  useEffect(() => {
    if (mealPlan) {
      localStorage.setItem("mealPlan", mealPlan);
    } else {
      localStorage.removeItem("mealPlan");
    }
  }, [mealPlan]);

  // Persist saved recipes
  useEffect(() => {
    localStorage.setItem(
      "savedRecipes",
      JSON.stringify(savedRecipes)
    );
  }, [savedRecipes]);

  // Save recipe
  const saveRecipe = (recipe) => {
    if (!recipe) return;

    setSavedRecipes((previousRecipes) => {
      const alreadySaved = previousRecipes.some(
        (item) => item.title === recipe.title
      );

      if (alreadySaved) {
        return previousRecipes;
      }

      return [
        ...previousRecipes,
        {
          ...recipe,
          savedAt: new Date().toISOString(),
        },
      ];
    });
  };

  // Remove recipe
  const removeSavedRecipe = (title) => {
    setSavedRecipes((previousRecipes) =>
      previousRecipes.filter(
        (recipe) => recipe.title !== title
      )
    );
  };

  // Check saved
  const isRecipeSaved = (title) => {
    return savedRecipes.some(
      (recipe) => recipe.title === title
    );
  };

  return (
    <NutriContext.Provider
      value={{
        pantry,
        setPantry,

        chat,
        setChat,

        generatedRecipe,
        setGeneratedRecipe,

        mealPlan,
        setMealPlan,

        savedRecipes,
        saveRecipe,
        removeSavedRecipe,
        isRecipeSaved,
      }}
    >
      {children}
    </NutriContext.Provider>
  );
};