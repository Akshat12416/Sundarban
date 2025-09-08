import React from 'react';

function Button({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-black text-white font-bold rounded-full flex items-center px-4 py-2 space-x-3"
    >
      <span className="text-white">{text}</span>
      <div className="flex items-center justify-center bg-white rounded-full w-6 h-6">
        <svg
          className="w-4 h-4 text-black"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </button>
  );
}

export default Button;
