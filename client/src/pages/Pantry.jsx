import { useContext, useState, useMemo } from "react";
import { NutriContext } from "../context/NutriContext";
import {
  X,
  Plus,
  ChefHat,
  Sparkles,
  ShoppingBasket,
  Clock,
  Flame,
  Dumbbell,
  Utensils,
} from "lucide-react";
import api from "../api/axios";
import heroBg from "../assets/hero-bg.jpeg";

export default function Pantry() {
 const {
  pantry,
  setPantry,
  generatedRecipe,
  setGeneratedRecipe,
  saveRecipe,
  isRecipeSaved,
} = useContext(NutriContext);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const commonIngredients = [
    "Chicken",
    "Tomato",
    "Olive Oil",
    "Onions",
    "Garlic",
    "Rice",
    "Pasta",
    "Eggs",
    "Milk",
    "Spinach",
  ];

  const addIngredient = (item) => {
    if (!item.trim()) return;

    if (
      pantry.some(
        (i) => i.toLowerCase() === item.toLowerCase()
      )
    )
      return;

    setPantry([...pantry, item]);
    setInputValue("");
  };

  const remove = (item) => {
    setPantry(pantry.filter((i) => i !== item));
  };

  const handleGenerateRecipe = async () => {
    if (pantry.length === 0) return;

    setLoading(true);
    

    try {
      const res = await api.post("/recipes/suggest", {
        ingredients: pantry,
      });

      setGeneratedRecipe(res.data.recipe);
    } catch (err) {
      console.error("Failed to generate recipe:", err);
      alert("Could not generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseGeneratedRecipe = () => {
    if (!generatedRecipe) {
      return { title: "Chef's Suggestion", time: "—", calories: "—", protein: "—", ingredients: [], instructions: [] };
    }

    const text = String(generatedRecipe).replace(/\r/g, "").trim();
    const clean = (value = "") => value.replace(/\*\*/g, "").trim();

    const title =
      text.match(/^\s*#\s+(.+?)(?=\n|$)/)?.[1] ||
      text.match(/^\s*##\s+(.+?)(?=\n|$)/)?.[1] ||
      "Chef's Suggestion";

    const calories = text.match(/(?:\*\*)?Calories(?:\*\*)?\s*:\s*~?([^\n|]+)/i)?.[1];
    const protein = text.match(/(?:\*\*)?Protein(?:\*\*)?\s*:\s*~?([^\n|]+)/i)?.[1];
    const time = text.match(/(?:\*\*)?(?:Time|Prep Time|Cooking Time)(?:\*\*)?\s*:\s*([^\n|]+)/i)?.[1];

    const ingredientHeading = text.match(/(?:^|\n)#{0,4}\s*Ingredients\s*(?=\n|$)/i);
    const instructionHeading = text.match(/(?:^|\n)#{0,4}\s*(?:Instructions|Directions|Steps)\s*(?=\n|$)/i);

    let ingredients = [];
    let instructions = [];

    if (ingredientHeading) {
      const start = ingredientHeading.index + ingredientHeading[0].length;
      const end = instructionHeading ? instructionHeading.index : text.length;
      ingredients = text.slice(start, end)
        .split("\n")
        .map((line) => line.replace(/^\s*[-*•]\s*/, "").replace(/^\s*\d+[.)]\s*/, "").trim())
        .filter(Boolean);
    }

    if (instructionHeading) {
      const start = instructionHeading.index + instructionHeading[0].length;
      instructions = text.slice(start)
        .split("\n")
        .map((line) => line.replace(/^\s*[-*•]\s*/, "").replace(/^\s*\d+[.)]\s*/, "").trim())
        .filter(Boolean)
        .filter((line) => !/^nutrition$/i.test(clean(line)));
    }

    return {
      title: clean(title),
      time: clean(time || "—"),
      calories: clean(calories || "—"),
      protein: clean(protein || "—"),
      ingredients: ingredients.map(clean),
      instructions: instructions.map(clean),
    };
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#0b0b0b] font-sans text-white">

      {/* Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Cinematic black overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black/95 via-black/85 to-black/65 backdrop-blur-[2px]" />

      {/* Orange glow */}
      <div className="fixed -right-40 top-20 z-0 h-96 w-96 rounded-full bg-orange-500/10 blur-[140px]" />

      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <header className="mb-9">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-orange-300">
            <ShoppingBasket size={15} />
            SMART KITCHEN
          </div>

          <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-white">
            My Smart Pantry
          </h1>

          <p className="mt-2 text-base text-slate-400">
            Manage what you have and let AI turn it into something delicious.
          </p>

        </header>


        <div className="grid gap-7 md:grid-cols-12">

          {/* ================= LEFT ================= */}
          <div className="space-y-6 md:col-span-4">

            {/* ADD INGREDIENTS */}
            <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]/85 shadow-2xl backdrop-blur-xl">

              <div className="border-b border-white/10 bg-white/[0.03] p-5">

                <h2 className="flex items-center gap-2 font-bold text-white">
                  <Plus size={18} className="text-orange-400" />
                  Add Ingredients
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Build your pantry for smarter recommendations.
                </p>

              </div>


              <div className="space-y-5 p-5">

                {/* INPUT */}
                <div className="flex gap-2">

                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      addIngredient(inputValue)
                    }
                    placeholder="e.g. Avocados"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition-all placeholder:text-slate-600 focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/10"
                  />

                  <button
                    onClick={() => addIngredient(inputValue)}
                    className="rounded-xl bg-orange-500 p-3 text-black shadow-lg shadow-orange-950/30 transition-all hover:bg-orange-400 active:scale-95"
                  >
                    <Plus size={20} />
                  </button>

                </div>


                {/* QUICK ADD */}
                <div>

                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Quick Add
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {commonIngredients.map((item) => (
                      <button
                        key={item}
                        onClick={() => addIngredient(item)}
                        className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-orange-300"
                      >
                        + {item}
                      </button>
                    ))}

                  </div>

                </div>

              </div>

            </div>


            {/* PANTRY LIST */}
            <div className="flex min-h-[320px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]/85 shadow-2xl backdrop-blur-xl">

              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] p-5">

                <div>
                  <h2 className="font-bold text-white">
                    In Stock
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Ingredients available
                  </p>
                </div>

                <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">
                  {pantry.length} items
                </span>

              </div>


              <div className="flex-1 p-5">

                {pantry.length === 0 ? (

                  <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center text-slate-500">

                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      <ShoppingBasket
                        size={30}
                        className="text-slate-600"
                      />
                    </div>

                    <p className="text-sm italic">
                      Your pantry is empty.
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Add ingredients to get started.
                    </p>

                  </div>

                ) : (

                  <div className="flex flex-wrap gap-2">

                    {pantry.map((item, i) => (
                      <span
                        key={i}
                        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] py-2 pl-4 pr-2 text-sm text-slate-200 transition-all hover:border-orange-400/40 hover:bg-orange-500/10"
                      >
                        {item}

                        <button
                          onClick={() => remove(item)}
                          className="rounded-full p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-orange-400"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}

                  </div>

                )}

              </div>


              {/* CONVERT BUTTON */}
              <div className="border-t border-white/10 bg-black/20 p-5">

                <button
                  onClick={handleGenerateRecipe}
                  disabled={pantry.length === 0 || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-black shadow-lg shadow-orange-950/30 transition-all hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {loading ? (
                    "Creating your recipe..."
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Convert to Recipe
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>


          {/* ================= RIGHT ================= */}
          <div className="md:col-span-8">

            {generatedRecipe ? (

              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]/85 shadow-2xl backdrop-blur-xl">

                {/* RECIPE HEADER */}
                <div className="border-b border-orange-400/20 bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent p-6">

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-950/30">
                      <ChefHat size={28} className="text-black" />
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                        AI CHEF
                      </p>

                      <h2 className="text-2xl font-black text-white">
                        Chef's Suggestion
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        Created from the ingredients in your pantry.
                      </p>
                    </div>

                  </div>

                </div>


                {/* STRUCTURED RECIPE */}
                {(() => {
                  const recipe = parseGeneratedRecipe();
                  return (
                    <div className="p-5 sm:p-7">
                      <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="mb-1 flex items-center gap-2 text-xs text-slate-500"><Clock size={14} className="text-orange-400" /> Time</div>
                          <p className="truncate text-sm font-bold text-white">{recipe.time}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="mb-1 flex items-center gap-2 text-xs text-slate-500"><Flame size={14} className="text-orange-400" /> Calories</div>
                          <p className="truncate text-sm font-bold text-white">{recipe.calories}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="mb-1 flex items-center gap-2 text-xs text-slate-500"><Dumbbell size={14} className="text-orange-400" /> Protein</div>
                          <p className="truncate text-sm font-bold text-white">{recipe.protein}</p>
                        </div>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <section className="rounded-2xl border border-white/10 bg-[#0d0d0d]/80 p-5">
                          <div className="mb-4 flex items-center gap-2"><Utensils size={18} className="text-orange-400" /><h3 className="text-lg font-bold text-white">Ingredients</h3></div>
                          <div className="space-y-2">
                            {recipe.ingredients.map((item, index) => (
                              <div key={`${item}-${index}`} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-3 py-2.5 text-sm text-slate-300">
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                                <span>{item}</span>
                              </div>
                              
                            ))}
                          </div>
                          
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-[#0d0d0d]/80 p-5">
                          <div className="mb-4 flex items-center gap-2"><ChefHat size={18} className="text-orange-400" /><h3 className="text-lg font-bold text-white">Instructions</h3></div>
                          <div className="space-y-3">
                            {recipe.instructions.map((step, index) => (
                              <div key={`${step}-${index}`} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-xs font-bold text-orange-300">{index + 1}</span>
                                <p className="pt-0.5 text-sm leading-6 text-slate-300">{step}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>
                      {/* SAVE RECIPE */}
<button
  onClick={() =>
    saveRecipe({
      ...recipe,
      source: "pantry",
    })
  }
  className={`mt-6 w-full rounded-xl py-3 font-bold transition-all ${
    isRecipeSaved(recipe.title)
      ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : "bg-orange-500 text-black hover:bg-orange-400"
  }`}
>
  {isRecipeSaved(recipe.title)
    ? "✓ Recipe Saved"
    : "♡ Save Recipe"}
</button>
                    </div>
                  );
                })()}

              </div>

            ) : (

              <div className="flex min-h-[650px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/15 bg-[#111111]/45 p-12 text-center backdrop-blur-xl">

                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-400/20 bg-orange-500/10">
                  <ChefHat size={42} className="text-orange-400" />
                </div>

                <h3 className="mb-2 text-2xl font-bold text-white">
                  Ready to Cook?
                </h3>

                <p className="max-w-md text-sm leading-6 text-slate-500">
                  Add ingredients to your pantry and let AI create
                  a recipe using what you already have.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}