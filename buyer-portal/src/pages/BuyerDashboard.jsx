import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import WasteCard from "../components/WasteCard";
import Filters from "../components/Filters";

const LISTABLE_STATUS = "APPROVED"; // Step 4 entry point

export default function BuyerDashboard() {
  const [wasteList, setWasteList] = useState([]);
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const wasteRef = ref(db, "WasteProjects");

    const unsub = onValue(wasteRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setWasteList([]);
        return;
      }

      const flat = [];

      Object.entries(data).forEach(([userKey, userNode]) => {
        Object.entries(userNode || {}).forEach(([id, waste]) => {
          // STEP 4: Only show OPEN listings
          if (waste.status === LISTABLE_STATUS) {
            flat.push({ id, userKey, ...waste });
          }
        });
      });

      setWasteList(flat);
    });

    return () => unsub();
  }, []);

  const cities = [...new Set(wasteList.map(w => w.city).filter(Boolean))];

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
        <p className="text-gray-500">
          No approved waste listings available.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(waste => (
          <WasteCard
            key={waste.id}
            waste={waste}
            mode="BUY"   // prepares card for Step 4 action
          />
        ))}
      </div>
    </div>
  );
}
