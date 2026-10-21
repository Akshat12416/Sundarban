import { Link, useLocation } from "react-router-dom";

import { useSession } from "../auth";

const links = [
  { label: "Review", path: "/" },
  { label: "Verify", path: "/verify" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, signOutAdmin } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-white shadow-md">
      <div className="mx-auto flex w-full max-w-[1203px] items-center justify-between px-4 py-4 md:px-10">
        <Link to="/" className="font-bold text-xl text-[#1DBF73]">
          Sundarban
        </Link>
        <div className="flex items-center gap-8">
          {links.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative font-medium text-base leading-6 ${
                pathname === item.path ? "text-[#1DBF73]" : "text-black/80 hover:text-[#1DBF73]"
              }`}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-[#1DBF73] ${
                  pathname === item.path ? "w-full" : "w-0"
                }`}
              />
            </Link>
          ))}
          {user ? (
            <button
              type="button"
              onClick={() => void signOutAdmin()}
              className="rounded-full border border-[#1DBF73] px-4 py-1 text-sm font-medium text-[#1DBF73]"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
