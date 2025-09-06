import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const wallet = location.state?.wallet || "";

  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "individual",
    age: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, wallet_address: wallet }),
    });

    const data = await res.json();
    if (res.status === 201) {
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100">
      <h1 className="text-2xl font-bold mb-6">Register as Contributor</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full border p-2 mb-3 rounded"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          className="w-full border p-2 mb-3 rounded"
          onChange={handleChange}
          required
        />
        <select
          name="role"
          className="w-full border p-2 mb-3 rounded"
          onChange={handleChange}
        >
          <option value="individual">Individual</option>
          <option value="ngo">NGO</option>
          <option value="community">Community</option>
        </select>
        <input
          type="number"
          name="age"
          placeholder="Age"
          className="w-full border p-2 mb-3 rounded"
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
        >
          Register
        </button>
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </form>
    </div>
  );
}
