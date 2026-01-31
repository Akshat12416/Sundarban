import { BrowserRouter, Routes, Route } from "react-router-dom";
import BuyerDashboard from "./pages/BuyerDashboard";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<BuyerDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
