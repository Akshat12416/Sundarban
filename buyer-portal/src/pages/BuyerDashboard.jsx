import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import WasteCard from "../components/WasteCard";
import Filters from "../components/Filters";

export default function BuyerDashboard() {
  const [wasteList, setWasteList] = useState([]);
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const wasteRef = ref(db, "WasteProjects");

    const unsub = onValue(wasteRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const flat = [];
      Object.entries(data).forEach(([userKey, userNode]) => {
        Object.entries(userNode || {}).forEach(([id, waste]) => {
          if (waste.status === "VERIFIED") {
            flat.push({ id, userKey, ...waste });
          }
        });
      });

      setWasteList(flat);
    });

    return () => unsub();
  }, []);

  const cities = [...new Set(wasteList.map(w => w.city))];

  const filtered = wasteList.filter(w =>
    (!category || w.aiCategory === category) &&
    (!city || w.city === city)
  );

  return (
    <div className="p-6">
      <Filters
        category={category}
        city={city}
        setCategory={setCategory}
        setCity={setCity}
        cities={cities}
      />

      {filtered.length === 0 && (
        <p className="text-gray-500">No listings found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(waste => (
          <WasteCard key={waste.id} waste={waste} />
        ))}
      </div>
    </div>
  );
}
