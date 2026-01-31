import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-green-600">
          Verified Waste Marketplace
        </h1>
        <p className="text-sm text-gray-500">
          AI-verified waste listings for recyclers & processors
        </p>
      </div>

      <div className="flex gap-6 text-sm font-medium">
        <Link to="/" className="text-gray-700 hover:text-green-600">
          Marketplace
        </Link>
        <Link to="/orders" className="text-gray-700 hover:text-green-600">
          My Orders
        </Link>
      </div>
    </div>
  );
}
