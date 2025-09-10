import React, { useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = "",
  variant = 'primary',
  size = 'md'
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const textCloneRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    const text = textRef.current;
    const textClone = textCloneRef.current;
    
    if (!text || !textClone) return;

    gsap.to(text, {
      y: -30,
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.fromTo(textClone, 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
  };

  const handleMouseLeave = () => {
    const text = textRef.current;
    const textClone = textCloneRef.current;
    
    if (!text || !textClone) return;

    gsap.to(text, {
      y: 0,
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.to(textClone, {
      y: -30,
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-forest-green hover:bg-emerald-700 text-white';
      case 'secondary':
        return 'bg-black hover:bg-gray-800 text-white';
      case 'outline':
        return 'border border-forest-green text-forest-green hover:bg-forest-green hover:text-white';
      default:
        return 'bg-forest-green hover:bg-emerald-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm h-8';
      case 'md':
        return 'px-6 py-3 text-base h-12';
      case 'lg':
        return 'px-8 py-4 text-lg h-14';
      default:
        return 'px-6 py-3 text-base h-12';
    }
  };

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden rounded-full font-medium transition-all duration-300 
        hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-forest-green/50
        ${getVariantClasses()} ${getSizeClasses()} ${className}
      `}
    >
      <span
        ref={textRef}
        className="relative z-10 inline-block whitespace-nowrap"
      >
        {children}
      </span>
      <span
        ref={textCloneRef}
        className="absolute inset-0 flex items-center justify-center opacity-0 whitespace-nowrap"
      >
        {children}
      </span>

      <style jsx>{`
        .bg-forest-green {
          background-color: #228B22;
        }
        .hover\\:bg-emerald-700:hover {
          background-color: #047857;
        }
        .hover\\:bg-forest-green:hover {
          background-color: #228B22;
        }
        .text-forest-green {
          color: #228B22;
        }
        .border-forest-green {
          border-color: #228B22;
        }
        .focus\\:ring-forest-green\\/50:focus {
          --tw-ring-color: rgba(34, 139, 34, 0.5);
        }
      `}</style>
    </button>
  );
};