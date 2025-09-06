import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import UploadAfter from "./pages/UploadAfter";
import ProjectStatus from "./pages/ProjectStatus";
import MyProjects from "./pages/MyProjects";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/new" element={<NewProject />} />
        <Route path="/projects" element={<MyProjects />} />
        <Route path="/project/:id/upload-after" element={<UploadAfter />} />
        <Route path="/project/:id/status" element={<ProjectStatus />} />
      </Routes>
    </Router>
  );
}
