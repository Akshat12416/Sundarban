import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface PreloaderPageProps {
  onLoadComplete: () => void;
  isLoaded?: boolean;
}

const PreloaderPage: React.FC<PreloaderPageProps> = ({ onLoadComplete, isLoaded = false }) => {
  const [animateOut, setAnimateOut] = useState(false);
  const stripeRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Set initial state for all strips
    if (stripeRefs.current.length > 0) {
      gsap.set(stripeRefs.current, { yPercent: 0 });
    }

    // Start exit animation after a fixed delay
    const timer = setTimeout(() => {
      setAnimateOut(true);

      // GSAP staggered animation for stripes moving up
      if (stripeRefs.current.length > 0) {
        gsap.to(stripeRefs.current, {
          yPercent: -100,
          duration: 0.6,
          ease: 'none',
          stagger: {
            each: 0.15,
            from: 'start'
          },
          onComplete: () => {
            // Animation completes when the last strip finishes moving
            setTimeout(onLoadComplete, 200);
          }
        });
      }

      // Fade out logo and progress indicator
      const logoContainer = document.querySelector('.preloader-logo-container');
      const progressIndicator = document.querySelector('.preloader-progress');

      if (logoContainer) {
        gsap.to(logoContainer, {
          scale: 0.95,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.3
        });
      }

      if (progressIndicator) {
        gsap.to(progressIndicator, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          delay: 0.3
        });
      }
    }, 2000); // 2 second delay before starting exit animation

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Vertical container strips - each moves up sequentially from left to right */}
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          ref={el => {
            if (el) stripeRefs.current[index] = el;
          }}
          className="absolute h-full"
          style={{
            width: '20%',
            left: `${index * 20}%`,
            top: '0',
            backgroundColor: '#1DBF73',
          }}
        />
      ))}
      
      {/* Logo in center - fades out after containers start moving */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="preloader-logo-container transition-all duration-600 ease-out">
          {/* Logo */}
          <img
            src="/src/photos/LOGOsimple.svg"
            alt="CarbonChain Logo"
            className="w-10 h-10 md:w-10 md:h-10 rounded-lg object-cover"
          />
          
          {/* Loading text and animation */}
          <div className="mt-4 text-center">
            <div className="flex justify-center">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: '1.4s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress indicator - fades out with logo */}
      <div className="preloader-progress absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-600">
        <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-white transition-all duration-2000 ease-out ${
              isLoaded ? 'w-full' : 'w-0'
            }`}
          />
        </div>
      </div>

      <style>{`
        /* Ensure smooth animations on all devices */
        .preloader-logo-container {
          will-change: transform, opacity;
        }
        
        .preloader-progress {
          will-change: opacity;
        }
        
        /* Fallback CSS animations for older browsers */
        @keyframes slideUpStagger {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-100%);
          }
        }
        
        /* Enhanced pulse animation for loading dots */
        @keyframes enhanced-pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        .animate-pulse {
          animation: enhanced-pulse 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PreloaderPage;