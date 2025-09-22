import { Link, useLocation } from "react-router-dom";


export default function NavBar() {
  const { pathname } = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Approved", path: "/approved" },
    { label: "Rejected", path: "/rejected" },
  ];

  return (
    <nav className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* <img src="" alt="Logo" className="h-8 w-auto rounded-md" /> */}
          <span className="font-bold text-xl text-green-300">
            Blue Carbon
          </span>
        </div>

        {/* Links */}
        <div className="flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative font-medium transition-colors duration-300 
                ${pathname === item.path ? "text-green-300" : "text-white hover:text-green-400"}`}
            >
              {item.label}
              {pathname === item.path && (
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-green-400 rounded-full"></span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
