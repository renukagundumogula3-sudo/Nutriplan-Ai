import { Flame, Clock, Trash2 } from "lucide-react";

const fallbackImages = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
  "https://images.unsplash.com/photo-1547592180-85f173990554?w=800",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800",
];

export default function RecipeCard({
  recipe,
  onClick,
  onDelete,
  fallbackIndex = 0,
}) {
  if (!recipe) return null;

  const image =
    recipe.image ||
    fallbackImages[fallbackIndex % fallbackImages.length];

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/10 flex flex-col h-full group cursor-pointer hover:-translate-y-1 hover:border-orange-500/30 relative"
    >
      {/* Image */}
      <div className="h-48 overflow-hidden relative">
        <img
          src={image}
          alt={recipe.title || "Recipe"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImages[0];
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Diet Badge */}
        {recipe.dietType && (
          <span className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-md font-bold shadow-sm border border-white/10">
            {recipe.dietType}
          </span>
        )}

        {/* Delete */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-3 left-3 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors backdrop-blur-md shadow-sm z-10 opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 duration-200"
            title="Delete Recipe"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 relative">
        <h3 className="font-bold text-xl text-slate-100 line-clamp-1 mb-2 group-hover:text-orange-400 transition-colors">
          {recipe.title || "Recipe"}
        </h3>

        <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-1 font-light leading-relaxed">
          {recipe.description || "A delicious personalized recipe."}
        </p>

        <div className="flex items-center justify-between text-sm pt-4 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
            <Flame size={16} />
            {recipe.calories || "--"}
            {!String(recipe.calories || "").toLowerCase().includes("kcal") &&
              " kcal"}
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Clock size={16} />
            {recipe.time || "30 min"}
          </div>
        </div>
      </div>
    </div>
  );
}