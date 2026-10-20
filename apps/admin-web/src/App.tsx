import { firebaseConfigured } from "./firebase";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "not set";

export default function App() {
  return (
    <main className="min-h-screen bg-[#EDFCF3] text-black">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium text-[#1DBF73]">Sundarban</p>
        <h1 className="mt-3 text-5xl font-bold tracking-tight">Admin</h1>
        <p className="mt-4 max-w-xl text-lg text-black/80">
          The review queue is not built yet. This shell is wired to Firebase
          Auth and Firestore only.
        </p>
        <p className="mt-8 inline-flex w-fit rounded-full bg-[#ACEEC7] px-4 py-2 text-sm font-medium text-[#1DBF73]">
          {firebaseConfigured ? `Project ${projectId}` : "Firebase web config missing"}
        </p>
      </div>
    </main>
  );
}
