import React from 'react';

const Navbar = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="w-full max-w-[1203px] mx-auto px-4 md:px-10 py-4">
        <header className="flex w-full items-center justify-between overflow-visible">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/src/photos/logo.jpg"
              alt="Logo"
              className="h-8 w-8 object-cover rounded-md"
              draggable={false}
              loading="eager"
            />
            <span className="[font-family:'Inter',Helvetica] font-bold text-xl text-black/90 hidden sm:block">
              CarbonChain
            </span>
          </div>

          {/* Right side - Navigation Links */}
          <div className="flex items-center gap-6 md:gap-8">
            {/* Navigation Links - Desktop Only */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('marketplace')}
                className="[font-family:'Inter',Helvetica] font-medium text-base tracking-[0] leading-[24px] cursor-pointer relative group transition-colors duration-300 text-black/80 hover:text-[#1DBF73]"
              >
                Marketplace
                <span className="absolute bottom-0 left-0 h-0.5 bg-[#1DBF73] transition-all duration-300 w-0 group-hover:w-full"></span>
              </button>
            </div>
          </div>
        </header>
      </div>
    </nav>
  );
};

export default Navbar;
