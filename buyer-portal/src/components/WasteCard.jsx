import { ref, update } from "firebase/database";
import { db } from "../firebase";

export default function WasteCard({ waste }) {

  const buyAndProcess = async () => {
  const path = `WasteProjects/${waste.userKey}/${waste.id}`;

  await update(ref(db, path), {
    status: "RESERVED",
    buyerId: "buyer_demo",
    reservedAt: Date.now()
  });

  alert("Waste reserved for processing");
};


  return (
    <div className="bg-white rounded-lg shadow p-4">
      <img
        src={waste.photo}
        alt="waste"
        className="w-full h-40 object-cover rounded mb-3"
      />

      <h2 className="text-lg font-semibold">{waste.wasteName}</h2>

      <div className="flex gap-2 my-2">
        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
          {waste.aiCategory}
        </span>
        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
          VERIFIED
        </span>
      </div>

      <p className="text-sm text-gray-600">
        Quantity: <strong>{waste.quantityKg} kg</strong>
      </p>
      <p className="text-sm text-gray-600">
        Location: {waste.city}, {waste.state}
      </p>

      <button
        onClick={buyAndProcess}
        className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Buy & Process
      </button>
    </div>
  );
}
