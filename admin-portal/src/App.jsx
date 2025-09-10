import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import ApprovedProjects from "./pages/ApprovedProjects";
import RejectedProjects from "./pages/RejectedProjects";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/approved" element={<ApprovedProjects />} />
        <Route path="/rejected" element={<RejectedProjects />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
