import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask not found");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const wallet = accounts[0];

      // Call backend login
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_address: wallet }),
      });

      const data = await res.json();

      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else if (res.status === 404) {
        navigate("/register", { state: { wallet } });
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Wallet connection failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-blue-100">
      <h1 className="text-3xl font-bold mb-6">Contributor Portal Login</h1>
      <button
        onClick={connectWallet}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Connect MetaMask
      </button>
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
