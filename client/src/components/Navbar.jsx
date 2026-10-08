import { Link, useLocation } from "react-router-dom";
import {
  Salad,
  Refrigerator,
  Search,
  Calendar,
  ChefHat,Bookmark
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-orange-500 text-black shadow-lg shadow-orange-950/30 font-bold"
      : "text-slate-300 hover:bg-white/10 hover:text-white";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b0b]/85 px-6 py-3.5 backdrop-blur-xl transition-all duration-300">

      <div className="container mx-auto flex items-center justify-between">

        {/* ================= LOGO ================= */}
        <Link
          to="/"
          className="group flex items-center gap-3 text-xl font-bold tracking-tight text-white transition-all duration-300"
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.07] transition-all duration-300 group-hover:border-orange-400/30 group-hover:bg-orange-500">
            <Salad
              className="text-orange-400 transition-colors duration-300 group-hover:text-black"
              size={23}
            />
          </div>

          <span>
            NutriPlan{" "}
            <span className="text-orange-400">
              AI
            </span>
          </span>

        </Link>


        {/* ================= NAV LINKS ================= */}
        <div className="hidden items-center gap-1.5 text-sm md:flex">

          <Link
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 ${isActive(
              "/"
            )}`}
            to="/"
          >
            <ChefHat size={17} />
            Home
          </Link>


          <Link
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 ${isActive(
              "/pantry"
            )}`}
            to="/pantry"
          >
            <Refrigerator size={17} />
            Pantry
          </Link>


          <Link
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 ${isActive(
              "/planner"
            )}`}
            to="/planner"
          >
            <Calendar size={17} />
            Planner
          </Link>


          <Link
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 ${isActive(
              "/search"
            )}`}
            to="/search"
          >
            <Search size={17} />
            Search
          </Link>
            <Link
  to="/saved-recipes"
  className="flex items-center gap-2"
>
  <Bookmark size={18} />
  Saved
</Link>
        </div>

      </div>

    </nav>
  );
}