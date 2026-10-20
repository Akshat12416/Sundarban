import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';

interface CircularGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width: string;
    height: string;
  }>;
  className?: string;
}

export const CircularGallery: React.FC<CircularGalleryProps> = ({ 
  images, 
  className = "" 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const items = itemsRef.current;
    
    if (!container || items.length === 0) return;

    // Position items in a circle
    const radius = 300;
    const centerX = 0;
    const centerY = 0;

    items.forEach((item, index) => {
      if (!item) return;
      
      const angle = (index / items.length) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      gsap.set(item, {
        x: x,
        y: y,
        rotation: (angle * 180) / Math.PI + 90
      });
    });

    // Create rotation animation
    const tl = gsap.timeline({ repeat: -1, ease: "none" });
    
    tl.to(items, {
      rotation: "+=360",
      duration: 20,
      ease: "none",
      transformOrigin: `${-centerX}px ${-centerY}px`
    });

    animationRef.current = tl;

    return () => {
      tl.kill();
    };
  }, [images]);

  const toggleAnimation = () => {
    if (animationRef.current) {
      if (isPlaying) {
        animationRef.current.pause();
      } else {
        animationRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div 
        ref={containerRef}
        className="relative w-full h-[600px] flex items-center justify-center"
        onClick={toggleAnimation}
      >
        {images.map((image, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) itemsRef.current[index] = el;
            }}
            className={`absolute ${image.width} ${image.height} cursor-pointer group`}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
              style={{ backgroundImage: `url(${image.src})` }}
              role="img"
              aria-label={image.alt}
            >
              <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent group-hover:from-[#1DBF73]/30 transition-all duration-300"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={toggleAnimation}
          className="px-4 py-2 bg-[#1DBF73] text-white rounded-full text-sm hover:bg-[#1DBF73] transition-colors duration-300"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>

      <style jsx>{`
        .forest-green {
          color: #1DBF73;
        }
        .bg-forest-green {
          background-color: #1DBF73;
        }
        .hover\\:bg-emerald-700:hover {
          background-color: #1DBF73;
        }
        .from-forest-green\\/30 {
          --tw-gradient-from: rgba(29, 191, 115, 0.3);
          --tw-gradient-to: rgba(29, 191, 115, 0);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }
      `}</style>
    </div>
  );
};