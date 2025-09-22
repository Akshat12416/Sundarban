// src/App.jsx
import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import NewProject from "./pages/NewProject";
import MyProjects from "./pages/MyProjects";
import Transfers from "./pages/Transfers";
import Marketplace from "./pages/Marketplace";
import NavBar from "./components/NavBar";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export const UserContext = createContext(null);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-project"
        element={
          <ProtectedRoute>
            <NewProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <MyProjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfers"
        element={
          <ProtectedRoute>
            <Transfers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <Marketplace />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function ProtectedRoute({ children }) {
  const user = React.useContext(UserContext);
  if (!user?.uid) return <Navigate to="/login" />;
  return (
    <>
      <NavBar />
      <div className="pt-16">{children}</div>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL } : null);
    });
    return () => unsub();
  }, []);

  return (
    <UserContext.Provider value={user}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UserContext.Provider>
  );
}
