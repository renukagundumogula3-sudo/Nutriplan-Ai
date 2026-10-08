import { useState, useEffect,useContext } from "react";
import { NutriContext } from "../context/NutriContext";
import api from "../api/axios";
import RecipeCard from "../components/RecipeCard";
import {
  Search,
  Loader2,
  X,
  Clock,
  Flame,
  ChefHat,
  Sparkles,
  Leaf,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import heroBg from "../assets/hero-bg.jpeg";

export default function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const {
  saveRecipe,
  isRecipeSaved,
} = useContext(NutriContext);
  const [healthifying, setHealthifying] = useState(false);
  const [healthierVersion, setHealthierVersion] = useState(null);
  const [activeTab, setActiveTab] = useState("original");

  useEffect(() => {
    fetchDefaultRecipes();
  }, []);

  const fetchDefaultRecipes = async () => {
    setLoading(true);

    try {
      const res = await api.get("/recipes");
      setResults(res.data);
    } catch (err) {
      console.error("Failed to fetch defaults", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const search = async () => {
    if (!query.trim()) {
      fetchDefaultRecipes();
      return;
    }

    setLoading(true);

    try {
      const res = await api.get(
        `/recipes/search/vibe?q=${encodeURIComponent(query.trim())}`
      );
      setResults(res.data);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      await api.delete(`/recipes/${id}`);

      setResults((prev) => prev.filter((recipe) => recipe._id !== id));

      if (selectedRecipe && selectedRecipe._id === id) {
        closeRecipeModal();
      }
    } catch (err) {
      console.error("Failed to delete recipe", err);
      alert("Failed to delete recipe");
    }
  };

  const handleHealthify = async () => {
  if (!selectedRecipe) return;

  setHealthifying(true);
  setHealthierVersion(null);

  try {
    const res = await api.post("/recipes/healthify", {
      recipe: selectedRecipe,

      instruction: `
Return ONLY a compact modification of the original recipe.

STRICT RULES:
1. Do NOT rewrite the entire recipe.
2. Do NOT create a new recipe title.
3. Do NOT add a description.
4. Do NOT add nutrition information.
5. Do NOT add calories, protein, diet type, or preparation time.
6. Do NOT add health explanations.
7. Do NOT add an "AI Health Logic" section.
8. Keep the original recipe structure.
9. Keep unchanged ingredients exactly as they are.
10. Keep unchanged instructions exactly as they are.
11. Change ONLY ingredients or instruction parts that genuinely need improvement.
12. Maximum 5 ingredient changes.
13. Maximum 5 instruction changes.
14. Keep instructions short, similar to the original recipe.
15. Show every changed original value using:
    ~~original text~~ → **healthier replacement**
16. Do NOT use long paragraphs.
17. Do NOT add extra sections.
18. Output ONLY these two sections:

Ingredients

Instructions

Example:

Ingredients
- chicken breast
- lettuce
- tomato
- ~~2 tbsp olive oil~~ → **1 tbsp olive oil**

Instructions
1. Marinate chicken with ~~2 tbsp olive oil~~ → **1 tbsp olive oil**, salt and pepper.
2. Grill chicken for 5–7 minutes on each side.
3. Chop lettuce and tomatoes.
4. Slice the chicken and place over the greens.
5. Serve with ~~olive oil~~ → **lemon-herb dressing**.

Remember:
The goal is NOT to create a new recipe.
The goal is to show ONLY the small healthy modifications made to the ORIGINAL recipe.
  `,
    });

    setHealthierVersion(res.data.healthier);
    setActiveTab("healthier");
  } catch (err) {
    console.error("Health-ify failed", err);
    alert("Failed to health-ify recipe. Try again.");
  } finally {
    setHealthifying(false);
  }
};

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
    setHealthierVersion(null);
    setActiveTab("original");
    setHealthifying(false);
  };

  const markdownComponents = {
    h1: ({ children }) => (
      <h3 className="text-lg font-bold text-slate-200 mt-1 mb-3">
        {children}
      </h3>
    ),
    h2: ({ children }) => (
      <h3 className="text-lg font-bold text-slate-200 mt-1 mb-3">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold text-slate-200 mt-1 mb-3">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-sm text-slate-300 leading-6 mb-2 last:mb-0">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-300 mb-3">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-300 mb-3">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="pl-1 leading-6 marker:text-orange-400">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-emerald-300">{children}</strong>
    ),
    del: ({ children }) => (
      <del className="text-red-300/80 decoration-red-400 decoration-2">
        {children}
      </del>
    ),
    hr: () => <hr className="my-4 border-white/10" />,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-orange-400/50 pl-3 my-3 text-slate-400">
        {children}
      </blockquote>
    ),
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col font-sans">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black/95 via-black/85 to-black/65 backdrop-blur-[2px]" />

      <div className="container mx-auto p-6 max-w-7xl relative z-10">
        <div className="text-center mb-16 mt-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-lg text-sm font-medium text-slate-300">
            <Sparkles size={16} className="text-accent-400" />
            <span>AI-Powered Cravings Hunter</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-2xl">
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-500 to-amber-400">
              Flavor Vibe
            </span>
          </h1>

          <p className="text-slate-300 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Search for recipes by mood, occasion, or craving. Our AI
            understands what you mean, not just keywords.
          </p>
        </div>

        <div className="flex gap-2 max-w-3xl mx-auto mb-16 relative">
          <div className="relative w-full group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-200" />

            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <Search
                className="absolute left-6 text-slate-400"
                size={24}
              />

              <input
                className="w-full p-5 pl-16 outline-none text-lg text-white placeholder:text-slate-500 bg-transparent"
                placeholder="e.g. 'Comforting rainy dinner' or 'High protein post-workout'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") search();
                }}
              />

              <div className="pr-2">
                <button
                  onClick={search}
                  disabled={loading}
                  className="bg-orange-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-orange-400 transition-all disabled:opacity-70 flex items-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-3">
          <ChefHat className="text-orange-400" size={28} />
          <h2 className="text-2xl font-bold text-white">Discover Recipes</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[400px] bg-slate-900/40 rounded-2xl border border-white/5 shadow-sm animate-pulse backdrop-blur-md"
              >
                <div className="h-48 bg-slate-800 rounded-t-2xl mb-4" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onClick={() => setSelectedRecipe(recipe)}
                onDelete={() => handleDelete(recipe._id)}
              />
            ))}
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full bg-slate-800/50 mb-4 ring-1 ring-white/10">
              <Search size={48} className="text-slate-500" />
            </div>
            <p className="text-xl text-slate-400 font-medium">
              No recipes found.
            </p>
          </div>
        )}
      </div>

      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeRecipeModal}
          />

          {/* Compact recipe detail modal */}
          <div className="relative z-10 w-full max-w-5xl h-auto max-h-[88vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl flex flex-col md:flex-row">
            <button
              onClick={closeRecipeModal}
              className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur rounded-full hover:bg-black/80 transition-colors z-30 text-white hover:text-red-400"
              title="Close"
            >
              <X size={22} />
            </button>

            {/* IMAGE */}
            <div className="relative w-full md:w-[38%] h-52 md:h-auto md:min-h-[520px] shrink-0">
              <img
                src={
                  selectedRecipe.image ||
                  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800"
                }
                alt={selectedRecipe.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 md:hidden">
                <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">
                  {selectedRecipe.title}
                </h2>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-slate-900/95">
              <div className="p-5 sm:p-6 pb-3 border-b border-white/5 shrink-0">
                <h2 className="hidden md:block text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2 pr-8">
                  {selectedRecipe.title}
                </h2>

                <div className="flex gap-4 text-sm font-medium text-slate-400 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />
                    {selectedRecipe.time || "30 min"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Flame size={16} className="text-orange-500" />
                    {selectedRecipe.calories} kcal
                  </span>
                </div>

                <div className="flex p-1 bg-slate-800 rounded-xl relative">
                  <button
                    onClick={() => setActiveTab("original")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                      activeTab === "original"
                        ? "bg-slate-700 text-white shadow-md"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Original
                  </button>

                  <button
                    onClick={() => {
                      if (healthierVersion) {
                        setActiveTab("healthier");
                      } else {
                        handleHealthify();
                      }
                    }}
                    disabled={healthifying}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${
                      activeTab === "healthier"
                        ? "bg-orange-500/15 text-orange-400 shadow-md border border-orange-500/30"
                        : "text-slate-400 hover:text-orange-400"
                    }`}
                  >
                    {healthifying ? (
                      <Loader2
                        className="animate-spin text-orange-400"
                        size={16}
                      />
                    ) : (
                      <Leaf size={16} />
                    )}

                    {healthifying
                      ? "Making Healthy..."
                      : healthierVersion
                      ? "Healthier Version"
                      : "Make it Healthy"}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 sm:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {activeTab === "original" ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-orange-500 rounded-full" />
                        Ingredients
                      </h3>

                      <ul className="grid grid-cols-1 gap-2 text-slate-300 pl-4 text-sm">
                        {selectedRecipe.ingredients &&
                        selectedRecipe.ingredients.length > 0 ? (
                          selectedRecipe.ingredients.map((ing, i) => (
                            <li
                              key={i}
                              className="list-disc marker:text-orange-500"
                            >
                              {ing}
                            </li>
                          ))
                        ) : (
                          <p className="text-slate-500 italic">
                            Ingredients list not available.
                          </p>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-200 mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-orange-500 rounded-full" />
                        Instructions
                      </h3>

                      <div className="bg-slate-800/90 p-4 rounded-xl text-slate-300 leading-relaxed text-sm font-medium border border-white/5">
                        {selectedRecipe.instructions &&
                        selectedRecipe.instructions.length > 0 ? (
                          Array.isArray(selectedRecipe.instructions) ? (
                            selectedRecipe.instructions.map((step, i) => (
                              <div
                                key={i}
                                className="mb-2 last:mb-0 flex gap-2"
                              >
                                <span className="font-bold text-orange-400 shrink-0">
                                  {i + 1}.
                                </span>
                                <span>{step}</span>
                              </div>
                            ))
                          ) : (
                            <div className="whitespace-pre-wrap">
                              {selectedRecipe.instructions}
                            </div>
                          )
                        ) : (
                          "No instructions provided for this recipe."
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {healthifying ? (
                      <div className="flex flex-col items-center justify-center py-14 text-center space-y-3">
                        <Loader2
                          className="animate-spin text-orange-400"
                          size={38}
                        />
                        <p className="text-slate-300 font-medium">
                          Making this recipe healthier...
                        </p>
                        <p className="text-slate-500 text-sm">
                          Keeping the recipe simple and changing only what is
                          needed.
                        </p>
                      </div>
                    ) : healthierVersion ? (
                      <div className="max-w-none">
                        <div className="mb-4 flex items-center gap-2">
                          <Leaf size={18} className="text-orange-400" />
                          <h3 className="text-lg font-bold text-slate-200">
                            Healthier Version
                          </h3>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-slate-800/70 px-4 py-3 text-sm text-slate-300 leading-6 overflow-hidden">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {healthierVersion}
                          </ReactMarkdown>
                        </div>

                        <div className="mt-3 text-xs text-slate-500">
                          <span className="text-red-300/80 line-through">
                            Original
                          </span>
                          <span className="mx-2">→</span>
                          <span className="text-emerald-300">
                            Healthier change
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Leaf
                          size={42}
                          className="mx-auto text-orange-400 mb-4"
                        />
                        <p className="text-slate-400">
                          Click "Make it Healthy" to generate a healthier
                          version.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-white/10 bg-slate-900/80 flex justify-between items-center gap-3 shrink-0">

  <div className="text-xs text-slate-600 truncate max-w-[30%]">
    ID: {selectedRecipe._id}
  </div>

  <div className="flex items-center gap-3">

    {/* Save Recipe */}
    <button
      onClick={() =>
        saveRecipe({
          ...selectedRecipe,
          source: "search",
        })
      }
      className={`px-5 py-2 rounded-lg font-bold transition-all ${
        isRecipeSaved(selectedRecipe.title)
          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
          : "bg-orange-500 text-black hover:bg-orange-400"
      }`}
    >
      {isRecipeSaved(selectedRecipe.title)
        ? "✓ Recipe Saved"
        : "♡ Save Recipe"}
    </button>

    {/* Close */}
    <button
      onClick={closeRecipeModal}
      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
    >
      Close
    </button>

  </div>
</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
