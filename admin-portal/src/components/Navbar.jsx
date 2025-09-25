import { Link, useLocation } from "react-router-dom";

const logo = "/src/photos/logo.jpg"; // Same logo as hero section

export default function NavBar() {
  const { pathname } = useLocation();

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "Approved", path: "/approved" },
    { label: "Rejected", path: "/rejected" },
  ];

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
        <div className="w-full max-w-[1203px] mx-auto px-4 md:px-10 py-4">
          <header className="flex w-full items-center justify-between overflow-visible">
            {/* Logo - exactly matching hero header */}
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo"
                className="h-8 w-8 object-cover rounded-md"
                draggable={false}
                loading="eager"
              />
              {/* <span className="[font-family:'Inter',Helvetica] font-bold text-xl text-black/90 hidden sm:block">
                CarbonChain
              </span> */}
            </div>

            {/* Right side - Navigation Links and Menu */}
            <div className="flex items-center gap-6 md:gap-8">
              {/* Navigation Links - Desktop Only */}
              <div className="hidden lg:flex items-center gap-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`[font-family:'Inter',Helvetica] font-medium text-base tracking-[0] leading-[24px] cursor-pointer relative group transition-colors duration-300 ${
                      pathname === item.path
                        ? "text-[#1DBF73]"
                        : "text-black/80 hover:text-[#1DBF73]"
                    }`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-[#1DBF73] transition-all duration-300 ${
                      pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                  </Link>
                ))}
              </div>


            </div>
          </header>
        </div>
      </nav>

      {/* Custom styles to match hero section */}
      <style>{`
        .forest-green {
          color: #228B22;
        }
        .bg-forest-green {
          background-color: #228B22;
        }

        /* Ensure navbar stays consistent with hero design */
        nav {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Mobile responsiveness */
        @media (max-width: 1024px) {
          .lg\\:flex {
            display: none !important;
          }
        }

        @media (max-width: 640px) {
          nav .max-w-\\[1203px\\] {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </>
  );
}
