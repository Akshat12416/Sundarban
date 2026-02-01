import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import ApprovedProjects from "./pages/ApprovedProjects";
import RejectedProjects from "./pages/RejectedProjects";
import NavBar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import PlantationExecution from "./pages/PlantationExecution.jsx";
import PlantationVerification from "./pages/PlantationVerification.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen text-white">
        {/* Nav */}
        <NavBar />

        {/* Routes */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/approved" element={<ApprovedProjects />} />
            <Route path="/rejected" element={<RejectedProjects />} />
            <Route path="/plantation-execution" element={<PlantationExecution />} />
            <Route path="/plantation-verification" element={<PlantationVerification />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
