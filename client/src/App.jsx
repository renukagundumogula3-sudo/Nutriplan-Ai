import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pantry from "./pages/Pantry";
import MealPlanner from "./pages/MealPlanner";
import RecipeSearch from "./pages/RecipeSearch";
import SavedRecipes from "./pages/SavedRecipes";
export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/planner" element={<MealPlanner />} />
        <Route path="/search" element={<RecipeSearch />} />
        <Route path="/saved-recipes" element={<SavedRecipes />} />
      </Routes>
    </>
  );
}
