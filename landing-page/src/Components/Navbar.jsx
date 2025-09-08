import React from 'react';
import Button from './Button';

const Navbar = () => {
  return (
    <nav className="w-full h-[10vh] bg-transparent z-60 shadow-md flex items-center justify-between px-20">
      {/* Logo on the left */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-black">Logo</h1>
      </div>

      {/* Button on the right */}
      <div className="flex items-center">
        <Button text="Get Started" onClick={() => console.log('Button clicked')} />
      </div>
    </nav>
  );
};

export default Navbar;
