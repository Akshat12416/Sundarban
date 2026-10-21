import { BrowserRouter, Route, Routes } from "react-router-dom";

import { SessionProvider, useSession } from "./auth";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { firebaseConfigured } from "./firebase";
import ProjectPage from "./pages/ProjectPage";
import Queue from "./pages/Queue";

export default function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-[#EDFCF3] text-black">
          <Navbar />
          <main className="flex-1">
            {firebaseConfigured ? <SignedInRoutes /> : <MissingConfig />}
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </SessionProvider>
  );
}

function SignedInRoutes() {
  const { user, ready, error, signIn } = useSession();
  if (!ready) {
    return <p className="px-6 py-16 text-black/50">Checking the admin session</p>;
  }
  if (!user) {
    return (
      <section className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="text-5xl font-bold text-[#1DBF73]">Admin</h1>
        <p className="text-lg text-black/80">Sign in with a Google account that has the admin claim.</p>
        {error ? <p className="text-sm text-[#E6453A]">{error}</p> : null}
        <button
          type="button"
          onClick={() => void signIn()}
          className="w-fit rounded-full bg-[#1DBF73] px-5 py-2 font-medium text-white"
        >
          Sign in with Google
        </button>
      </section>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Queue />} />
      <Route path="/projects/:projectId" element={<ProjectPage />} />
    </Routes>
  );
}

function MissingConfig() {
  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-5xl font-bold">Admin</h1>
      <p className="mt-4 text-lg">Firebase web config is missing.</p>
    </section>
  );
}
