import { useState, useContext , useMemo} from "react";
import { NutriContext } from "../context/NutriContext";
import api from "../api/axios";
import {
  ChefHat,
  Loader2,
  Target,
  CalendarDays,
  Download,
  Flame,
  Dumbbell,
  ShoppingBasket,
  Utensils,
} from "lucide-react";
import heroBg from "../assets/hero-bg.jpeg";

export default function MealPlanner() {
  const {
  pantry,
  mealPlan,
  setMealPlan,
  saveRecipe,
  isRecipeSaved,
} = useContext(NutriContext);

  const [goal, setGoal] = useState("Balanced Diet");
  const [calories, setCalories] = useState("2000");
  const [diet, setDiet] = useState("None");
  
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
  setLoading(true);

  try {
    const res = await api.post("/recipes/plan", {
      goal,
      calories,
      diet,
      pantry,
    });

    setMealPlan(res.data.plan);
  } catch (err) {
    console.error(err);
    alert("Failed to generate plan. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const parseMealPlan = useMemo(() => {
  if (!mealPlan) {
    return {
      meals: [],
      shoppingList: [],
    };
  }

  const text = String(mealPlan)
    .replace(/\r/g, "")
    .trim();

  // -----------------------------
  // Get one major section
  // -----------------------------
  const getMajorSection = (name, nextSections) => {
    const nextPattern = nextSections.join("|");

    const regex = new RegExp(
      `(?:^|\\n)\\s*${name}\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${nextPattern})\\s*:|$)`,
      "i"
    );

    return regex.exec(text)?.[1]?.trim() || "";
  };

  // -----------------------------
  // Split ingredients
  // -----------------------------
 const parseIngredients = (value) => {
  if (!value) return [];

  return value
    .replace(/\r/g, "")
    .split(/\n|(?=\s*-\s+)/)
    .flatMap((line) => {
      const clean = line
        .replace(/^\s*[-*•]\s*/, "")
        .trim();

      // Handles: oats - milk - banana - almonds
      if (clean.includes(" - ")) {
        return clean
          .split(/\s+-\s+/)
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return clean ? [clean] : [];
    })
    .filter(Boolean);
};
  // -----------------------------
  // Split numbered instructions
  // Works even when Gemini puts:
  // 1. step 2. step 3. step
  // on ONE line
  // -----------------------------
  const parseInstructions = (value) => {
    if (!value) return [];

    const cleaned = value
      .replace(/\r/g, " ")
      .replace(/\n+/g, " ")
      .trim();

    const matches = cleaned.match(
      /(?:^|\s)(\d+)\.\s+(.*?)(?=\s+\d+\.\s+|$)/g
    );

    if (matches && matches.length > 0) {
      return matches
        .map((item) =>
          item
            .replace(/^\s*\d+\.\s*/, "")
            .trim()
        )
        .filter(Boolean);
    }

    return [cleaned];
  };

  // -----------------------------
  // Parse one meal
  // -----------------------------
  const parseMeal = (type) => {
    const allSections = [
      "BREAKFAST",
      "LUNCH",
      "DINNER",
      "SHOPPING_LIST",
    ];

    const content = getMajorSection(
      type,
      allSections.filter((item) => item !== type)
    );

    if (!content) return null;

    const getSingleLine = (label) => {
      const regex = new RegExp(
        `(?:^|\\n)\\s*${label}\\s*:\\s*([^\\n]+)`,
        "i"
      );

      return regex.exec(content)?.[1]?.trim() || "";
    };

    // -----------------------------
    // Ingredients
    // -----------------------------
    const ingredientsMatch = content.match(
      /(?:^|\n)\s*INGREDIENTS\s*:\s*([\s\S]*?)(?=\n\s*INSTRUCTIONS\s*:|$)/i
    );

    // -----------------------------
    // Instructions
    // -----------------------------
    const instructionsMatch = content.match(
      /(?:^|\n)\s*INSTRUCTIONS\s*:\s*([\s\S]*?)(?=\n\s*WHY\s*:|$)/i
    );

    const ingredients = parseIngredients(
      ingredientsMatch?.[1] || ""
    );

    const instructions = parseInstructions(
      instructionsMatch?.[1] || ""
    );

    return {
      type: type.toLowerCase(),

      title:
        getSingleLine("MEAL") ||
        `${type.charAt(0)}${type.slice(1).toLowerCase()} Meal`,

      calories:
        getSingleLine("CALORIES") || "—",

      protein:
        getSingleLine("PROTEIN") || "—",

      ingredients,

      instructions,

      why:
        getSingleLine("WHY") ||
        "Selected to match your goal and dietary preference.",
    };
  };

  // -----------------------------
  // Breakfast / Lunch / Dinner
  // -----------------------------
  const meals = [
    parseMeal("BREAKFAST"),
    parseMeal("LUNCH"),
    parseMeal("DINNER"),
  ].filter(Boolean);

  // -----------------------------
  // Shopping List
  // -----------------------------
  const shoppingMatch = text.match(
    /(?:^|\n)\s*SHOPPING_LIST\s*:\s*([\s\S]*)$/i
  );

  let shoppingList = [];

  if (shoppingMatch?.[1]) {
    const shoppingText = shoppingMatch[1]
      .replace(/\r/g, " ")
      .trim();

    // Handles:
    // - oats
    // - milk
    //
    // AND also:
    // - oats - milk - banana
    shoppingList = shoppingText
      .split(/\n|(?=\s*-\s+)/)
      .flatMap((line) => {
        const clean = line
          .replace(/^\s*[-*•]\s*/, "")
          .trim();

        // If Gemini returned everything in one line:
        if (clean.includes(" - ")) {
          return clean
            .split(/\s+-\s+/)
            .map((item) => item.trim())
            .filter(Boolean);
        }

        return clean ? [clean] : [];
      })
      .filter(Boolean);
  }

  return {
    meals,
    shoppingList,
  };
}, [mealPlan]);
  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#0b0b0b] font-sans text-white">

      {/* BACKGROUND */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black/95 via-black/85 to-black/65 backdrop-blur-[2px]" />

      <div className="fixed -right-40 top-20 z-0 h-96 w-96 rounded-full bg-orange-500/10 blur-[140px]" />


      <div className="relative z-10 container mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <header className="mb-9">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold tracking-wider text-orange-300">
            <CalendarDays size={15} />
            AI MEAL PLANNER
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white">
            Smart Meal Planner
          </h1>

          <p className="mt-2 text-base text-slate-400">
            Build a personalized meal plan around your goals and preferences.
          </p>

        </header>


        <div className="grid gap-7 md:grid-cols-12">

          {/* ================= SETTINGS ================= */}
          <div className="space-y-5 md:col-span-4">

            <div className="space-y-7 rounded-[24px] border border-white/10 bg-[#111111]/85 p-6 shadow-2xl backdrop-blur-xl">

              {/* GOAL */}
              <div>

                <h2 className="mb-4 flex items-center gap-2 font-bold text-white">
                  <Target size={19} className="text-orange-400" />
                  Your Goal
                </h2>

                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-white/10 bg-black/30 p-3.5 text-white outline-none transition-all focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/10"
                >
                  <option className="bg-[#111111]">
                    Balanced Diet
                  </option>

                  <option className="bg-[#111111]">
                    Weight Loss
                  </option>

                  <option className="bg-[#111111]">
                    Muscle Gain
                  </option>

                  <option className="bg-[#111111]">
                    Keto
                  </option>

                  <option className="bg-[#111111]">
                    Paleo
                  </option>
                </select>

              </div>


              {/* CALORIES */}
              <div>

                <h2 className="mb-4 font-bold text-white">
                  Daily Calories
                </h2>

                <div className="rounded-xl border border-white/10 bg-black/30 p-4">

                  <div className="mb-4 flex items-center justify-between">

                    <span className="text-sm font-medium text-slate-500">
                      Target
                    </span>

                    <span className="font-bold text-orange-400">
                      {calories} kcal
                    </span>

                  </div>

                  <input
                    type="range"
                    min="1200"
                    max="4000"
                    step="50"
                    value={calories}
                    onChange={(e) =>
                      setCalories(e.target.value)
                    }
                    className="w-full cursor-pointer accent-orange-500"
                  />

                  <div className="mt-2 flex justify-between text-xs text-slate-600">
                    <span>1200</span>
                    <span>4000</span>
                  </div>

                </div>

              </div>


              {/* DIET */}
              <div>

                <h2 className="mb-4 font-bold text-white">
                  Dietary Preferences
                </h2>

                <select
                  value={diet}
                  onChange={(e) => setDiet(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-white/10 bg-black/30 p-3.5 text-white outline-none transition-all focus:border-orange-400/60 focus:ring-2 focus:ring-orange-500/10"
                >
                  <option
                    className="bg-[#111111]"
                    value="None"
                  >
                    No Restrictions
                  </option>

                  <option
                    className="bg-[#111111]"
                    value="Vegetarian"
                  >
                    Vegetarian
                  </option>

                  <option
                    className="bg-[#111111]"
                    value="Vegan"
                  >
                    Vegan
                  </option>

                  <option
                    className="bg-[#111111]"
                    value="Gluten-Free"
                  >
                    Gluten-Free
                  </option>

                  <option
                    className="bg-[#111111]"
                    value="Non-Veg"
                  >
                    Non-Vegetarian
                  </option>
                </select>

              </div>


              {/* GENERATE */}
              <button
                onClick={generatePlan}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-bold text-black shadow-lg shadow-orange-950/30 transition-all hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      size={20}
                    />
                    Creating Plan...
                  </>
                ) : (
                  <>
                    <ChefHat size={20} />
                    Generate Plan
                  </>
                )}

              </button>

            </div>


            {/* TIP */}
            <div className="flex gap-3 rounded-2xl border border-orange-400/15 bg-orange-500/[0.06] p-4 backdrop-blur-xl">

              <span className="text-lg">
                ✦
              </span>

              <p className="text-sm leading-6 text-orange-200/70">
                We'll prioritize ingredients you already have
                in your pantry.
              </p>

            </div>

          </div>


          {/* ================= RESULT ================= */}
          <div className="md:col-span-8">

            {mealPlan ? (

              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#111111]/85 shadow-2xl backdrop-blur-xl">

                {/* HEADER */}
                <div className="border-b border-orange-400/20 bg-gradient-to-r from-orange-500/15 via-orange-500/5 to-transparent p-6">

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>

                      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                        PERSONALIZED PLAN
                      </p>

                      <h3 className="text-2xl font-black text-white">
                        Your Personal Plan
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {goal} • {calories} kcal • {diet}
                      </p>

                    </div>


                    {mealPlan.includes("SHOPPING_LIST") && (
                      <button
                        onClick={() => {
                          const shoppingList =
  mealPlan.split("SHOPPING_LIST:")[1] || "";

                          const blob = new Blob(
                            [
                              `SHOPPING LIST\n\n${shoppingList.trim()}`,
                            ],
                            {
                              type: "text/plain",
                            }
                          );

                          const url =
                            window.URL.createObjectURL(blob);

                          const a =
                            document.createElement("a");

                          a.href = url;
                          a.download =
                            "shopping-list.txt";

                          a.click();
                        }}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-200 transition-all hover:border-orange-400/30 hover:bg-orange-500/10 hover:text-orange-300"
                      >
                        <Download size={16} />
                        Download List
                      </button>
                    )}

                  </div>

                </div>


                {/* STRUCTURED PLAN CONTENT */}
                {(() => {
                  const parsed = parseMealPlan;
                  const styles = {
                    breakfast: { label: "BREAKFAST", icon: "☀" },
                    lunch: { label: "LUNCH", icon: "☼" },
                    dinner: { label: "DINNER", icon: "☾" },
                  };

                  return (
                    <div className="p-5 sm:p-7">
                      {parsed.meals.length > 0 ? (
                        <div className="space-y-5">
                          {parsed.meals.map((meal) => {
                            const style = styles[meal.type];
                            return (
                              <div key={meal.type} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]/80">
                                <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4 bg-white/[0.02]">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-lg">{style.icon}</span>
                                  <div>
                                    <p className="text-[11px] font-bold tracking-[0.18em] text-orange-300">{style.label}</p>
                                    <h4 className="text-lg font-bold text-white">{meal.title}</h4>
                                  </div>
                                </div>

                                <div className="grid gap-5 p-5 md:grid-cols-2">
                                  <div>
                                    <div className="mb-4 flex flex-wrap gap-2">
                                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-400/15 bg-orange-500/[0.07] px-3 py-2 text-xs font-semibold text-orange-200">
                                        <Flame size={14} /> {meal.calories}
                                      </span>
                                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300">
                                        <Dumbbell size={14} /> {meal.protein}
                                      </span>
                                    </div>

                                    <h5 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                      <Utensils size={14} /> Ingredients
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                      {meal.ingredients.map((item, index) => (
                                        <span key={`${item}-${index}`} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300">
                                          {item}
                                        </span>
                                      ))}
                                    </div>

                                    <h5 className="mb-3 mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                                      How to Make
                                    </h5>
                                    <div className="space-y-2">
                                      {meal.instructions.length > 0 ? meal.instructions.map((step, index) => (
                                        <div key={`${step}-${index}`} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.025] p-3">
                                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-xs font-bold text-orange-300">
                                            {index + 1}
                                          </span>
                                          <p className="text-sm leading-5 text-slate-300">{step}</p>
                                        </div>
                                      )) : (
                                        <p className="text-sm text-slate-500">Instructions not available.</p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="rounded-xl border border-white/5 bg-white/[0.025] p-4">
                                    <h5 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Why this meal</h5>
                                    <p className="text-sm leading-6 text-slate-400">{meal.why}</p>
                                    <button
  onClick={() =>
    saveRecipe({
      title: meal.title,
      calories: meal.calories,
      protein: meal.protein,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      description: meal.why,
      source: "planner",
    })
  }
  className={`mt-5 w-full rounded-xl py-3 font-bold transition-all ${
    isRecipeSaved(meal.title)
      ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
      : "bg-orange-500 text-black hover:bg-orange-400"
  }`}
>
  {isRecipeSaved(meal.title)
    ? "✓ Recipe Saved"
    : "♡ Save Recipe"}
</button>

                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
                          Please generate the plan again to display the meals in cards.
                        </div>
                      )}

                      {parsed.meals.length === 3 && parsed.shoppingList.length > 0 && (
                        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]/80">
                          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
                                <ShoppingBasket size={18} className="text-orange-400" />
                              </span>
                              <div>
                                <p className="text-[11px] font-bold tracking-[0.18em] text-orange-300">SHOPPING</p>
                                <h4 className="text-lg font-bold text-white">Shopping List</h4>
                              </div>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">{parsed.shoppingList.length} items</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-2">
                            {parsed.shoppingList.map((item, index) => (
                              <div key={`${item}-${index}`} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.025] px-4 py-3 text-sm text-slate-300">
                                <span className="h-4 w-4 shrink-0 rounded border border-orange-400/40" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>

            ) : (

              <div className="flex min-h-[620px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/15 bg-[#111111]/45 p-12 text-center backdrop-blur-xl">

                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-400/20 bg-orange-500/10">
                  <CalendarDays
                    size={42}
                    className="text-orange-400"
                  />
                </div>

                <h3 className="mb-2 text-2xl font-bold text-white">
                  Ready to plan your week?
                </h3>

                <p className="max-w-md text-sm leading-6 text-slate-500">
                  Select your preferences and let AI
                  curate meals around your goals.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}