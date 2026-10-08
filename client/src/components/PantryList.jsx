import { useContext, useState } from "react";
import { NutriContext } from "../context/NutriContext";

export default function PantryList() {
  const { pantry, setPantry } = useContext(NutriContext);
  const [item, setItem] = useState("");

  const addItem = () => {
    if (item) setPantry([...pantry, item]);
    setItem("");
  };

  return (
    <div>
      <input
        className="border p-2"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        placeholder="Add ingredient"
      />
      <button onClick={addItem} className="bg-green-500 text-white p-2 ml-2">
        Add
      </button>

      <ul className="mt-4 list-disc ml-6">
        {pantry.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
