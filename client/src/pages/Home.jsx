import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NutriContext } from "../context/NutriContext";
import ImageUpload from "../components/ImageUpload";

import heroBg from "../assets/hero-bg.jpeg";

import {
  Sparkles,
  ChefHat,
  ArrowRight,
  Utensils,
} from "lucide-react";

export default function Home() {
  const { pantry, setPantry } = useContext(NutriContext);
  const navigate = useNavigate();

  // Stores ingredients detected from Snap & Cook
  const [scannedIngredients, setScannedIngredients] = useState([]);

  // Handle ingredients returned by ImageUpload
  const handleScan = (ingredients) => {
    let items = [];

    if (typeof ingredients === "string") {
      items = ingredients
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);
    } else if (Array.isArray(ingredients)) {
      items = ingredients
        .map((i) => String(i).trim())
        .filter(Boolean);
    }

    console.log("🥕 Detected ingredients:", items);

    // Save ingredients to pantry
    const newPantry = [...new Set([...pantry, ...items])];
    setPantry(newPantry);

    // Display ingredients on Snap & Cook
    setScannedIngredients(items);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-[#0b0b0b] font-sans text-white">

      {/* ================= BACKGROUND ================= */}

      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      {/* Black cinematic overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-r from-black via-black/80 to-black/45" />

      <div className="fixed inset-0 z-0 bg-black/20" />

      {/* Warm ambient glow */}
      <div className="fixed -right-40 top-20 z-0 h-96 w-96 rounded-full bg-orange-500/10 blur-[140px]" />

      <div className="fixed -bottom-40 left-20 z-0 h-80 w-80 rounded-full bg-orange-400/5 blur-[120px]" />


      {/* ================= MAIN ================= */}

      <main className="relative z-10 container mx-auto flex min-h-[calc(100vh-64px)] items-center px-6 py-12">

        <div className="grid w-full grid-cols-1 items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">


          {/* ================= LEFT SECTION ================= */}

          <section className="max-w-2xl">

            {/* Badge */}

            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 backdrop-blur-md">

              <Sparkles className="h-4 w-4 text-orange-400" />

              <span className="text-xs font-semibold tracking-[0.18em] text-gray-300">
                AI FOOD COMPANION
              </span>

            </div>


            {/* Heading */}

            <h1 className="text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-[72px]">

              Turn What You Have

              <br />

              <span className="text-white">
                Into Something
              </span>

              <br />

              <span className="bg-gradient-to-r from-orange-300 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                Amazing.
              </span>

            </h1>


            {/* CTA */}

            <div className="mt-9 flex flex-wrap items-center gap-4">

              <button
                onClick={() => navigate("/search")}
                className="group flex items-center gap-3 rounded-full bg-orange-500 px-6 py-3.5 font-semibold text-black shadow-xl shadow-orange-950/40 transition-all duration-300 hover:-translate-y-1 hover:bg-orange-400"
              >
                Explore Recipes

                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

            </div>


            {/* Feature strip */}

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-white/10 pt-6">

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-orange-400">✦</span>
                AI Recommendations
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-orange-400">✦</span>
                Smart Pantry
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="text-orange-400">✦</span>
                Personalized Meals
              </div>

            </div>

          </section>


          {/* ================= RIGHT CARD ================= */}

          <section className="flex justify-center lg:justify-end">

            <div className="relative w-full max-w-[430px]">

              {/* Card glow */}

              <div className="absolute -inset-1 rounded-[32px] bg-orange-500/10 blur-2xl" />


              {/* Main glass card */}

              <div className="relative overflow-hidden rounded-[30px] border border-white/15 bg-[#111111]/85 p-7 shadow-2xl backdrop-blur-xl">


                {/* ================= TOP LINE ================= */}

                <div className="mb-7 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500">

                      <ChefHat className="h-6 w-6 text-black" />

                    </div>

                    <div>

                      <p className="text-lg font-bold">
                        Let's Cook
                      </p>

                      <p className="text-xs text-gray-500">
                        Powered by AI
                      </p>

                    </div>

                  </div>


                  <div className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-orange-300">
                    AI CHEF
                  </div>

                </div>


                {/* ================= HEADING ================= */}

                <h2 className="text-3xl font-bold tracking-tight">
                  What's in your kitchen?
                </h2>


                {/* ================= IMAGE UPLOAD ================= */}

                <div className="mt-7 rounded-2xl border border-dashed border-orange-400/30 bg-white/[0.035] p-5 transition-all duration-300 hover:border-orange-400/60 hover:bg-orange-400/[0.04]">

                  <ImageUpload onScan={handleScan} />


                  {/* ================= DETECTED INGREDIENTS ================= */}

                  {scannedIngredients.length > 0 && (

                    <div className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/5 p-4">

                      <div className="mb-3 flex items-center justify-between">

                        <p className="text-sm font-semibold text-orange-300">
                          🥕 Detected Ingredients
                        </p>

                        <span className="text-xs text-gray-500">
                          {scannedIngredients.length} found
                        </span>

                      </div>


                      <div className="flex flex-wrap gap-2">

                        {scannedIngredients.map((item, index) => (

                          <span
                            key={`${item}-${index}`}
                            className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-xs text-orange-200"
                          >
                            {item}
                          </span>

                        ))}

                      </div>

                    </div>

                  )}

                </div>


                {/* ================= BOTTOM INFO ================= */}

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">

                  <Utensils className="h-3.5 w-3.5 text-orange-400" />

                  AI identifies ingredients automatically

                </div>


                {/* ================= FIND RECIPES BUTTON ================= */}

                {scannedIngredients.length > 0 && (

                  <button
                    onClick={() => navigate("/search")}
                    className="mt-5 w-full rounded-xl bg-orange-500 px-5 py-3 font-semibold text-black transition-all duration-300 hover:bg-orange-400 hover:-translate-y-0.5"
                  >
                    Find Recipes With These Ingredients →
                  </button>

                )}

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}