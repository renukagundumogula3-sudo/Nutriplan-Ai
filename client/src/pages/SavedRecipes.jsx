import { useContext, useState } from "react";
import { NutriContext } from "../context/NutriContext";
import RecipeCard from "../components/RecipeCard";

export default function SavedRecipes() {
  const {
    savedRecipes,
    removeSavedRecipe,
  } = useContext(NutriContext);

  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Remove invalid/undefined saved items
  const validRecipes = (savedRecipes || []).filter(
    (recipe) => recipe && typeof recipe === "object"
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Saved Recipes
          </h1>

          <p className="mt-2 text-slate-400">
            Your saved recipes in one place
          </p>
        </div>

        {/* Empty State */}
        {validRecipes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <h2 className="text-xl font-semibold text-slate-200">
              No saved recipes yet
            </h2>

            <p className="mt-2 text-slate-500">
              Save recipes from Pantry, Planner or Search.
            </p>
          </div>
        ) : (

          /* Recipe Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {validRecipes.map((recipe, index) => (
  <RecipeCard
    key={`${recipe.title || "recipe"}-${index}`}
    recipe={recipe}
    fallbackIndex={index}
    onClick={() => setSelectedRecipe(recipe)}
    onDelete={() => removeSavedRecipe(recipe.title)}
  />
))}
          </div>
        )}

        {/* Recipe Details Modal */}
        {selectedRecipe && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setSelectedRecipe(null)}
          >
            <div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Modal Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedRecipe.title || "Recipe"}
                  </h2>

                  {selectedRecipe.description && (
                    <p className="mt-2 text-slate-400">
                      {selectedRecipe.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-xl text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-500">
                    Calories
                  </p>

                  <p className="mt-1 font-bold text-orange-400">
                    {selectedRecipe.calories || "--"} kcal
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-500">
                    Protein
                  </p>

                  <p className="mt-1 font-bold text-emerald-400">
                    {selectedRecipe.protein || "--"} g
                  </p>
                </div>
              </div>

              {/* Ingredients */}
              <h3 className="mb-3 text-lg font-bold">
                Ingredients
              </h3>

              <div className="mb-6 space-y-2">
                {(selectedRecipe.ingredients || []).map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-white/5 px-3 py-2 text-slate-300"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>

              {/* Instructions */}
              <h3 className="mb-3 text-lg font-bold">
                Instructions
              </h3>

              <div className="space-y-3">
                {(selectedRecipe.instructions || []).map(
                  (step, index) => (
                    <div
                      key={index}
                      className="flex gap-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-black">
                        {index + 1}
                      </span>

                      <p className="pt-1 text-slate-300">
                        {step}
                      </p>
                    </div>
                  )
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}