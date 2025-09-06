import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      navigate("/login"); // redirect if not logged in
    }
  }, [navigate]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {user.name || "Contributor"}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        <p><strong>Wallet:</strong> {user.wallet_address}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Age:</strong> {user.age}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/projects/new")}
          className="bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700"
        >
          📤 Submit New Plantation Project
        </button>
        <button
          onClick={() => navigate("/projects")}
          className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700"
        >
          📜 View My Projects
        </button>
        <button
          onClick={() => navigate("/credits")}
          className="bg-yellow-500 text-white p-4 rounded-lg shadow hover:bg-yellow-600"
        >
          🪙 My Carbon Credits
        </button>
      </div>
    </div>
  );
}
