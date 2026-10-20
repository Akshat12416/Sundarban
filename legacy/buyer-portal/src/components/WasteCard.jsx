import { ref, update } from "firebase/database";
import { db } from "../firebase";
import { getImageSrc } from "../utils/imageUtils";

const BUYER_ID = "buyer_demo";

export default function WasteCard({ waste, mode }) {

  const buyAndReserve = async () => {
    const path = `WasteProjects/${waste.userKey}/${waste.id}`;

    await update(ref(db, path), {
      status: "RESERVED",
      buyerId: BUYER_ID,
      reservedAt: Date.now()
    });

    alert("Waste reserved. Go to My Orders to confirm weight.");
  };

  return (
    <div className="bg-white rounded shadow p-4">
     <h3 className="text-lg font-semibold">
  {waste.wasteName}
</h3>

{/* Waste Image */}
{waste.photo && (
  <img
    src={getImageSrc(waste.photo)}
    alt="Waste"
    className="mt-2 w-full h-40 object-cover rounded border"
  />
)}


      <p className="text-sm text-gray-600">
        Declared Weight: {waste.wasteWeight} kg
      </p>

      <p className="text-sm text-gray-600">
        Location: {waste.city}, {waste.state}
      </p>

      {mode === "BUY" && (
        <button
          onClick={buyAndReserve}
          className="mt-4 bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
        >
          Buy & Process
        </button>
      )}
    </div>
  );
}
