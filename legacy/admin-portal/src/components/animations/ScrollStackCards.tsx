import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CardData {
  id: number;
  title: string;
  description: string;
  secondaryDescription?: string;
  image: string;
  buttonText: string;
  layout: 'left' | 'right' | 'center';
}

interface ScrollStackCardsProps {
  cards: CardData[];
  className?: string;
}

export const ScrollStackCards: React.FC<ScrollStackCardsProps> = ({ 
  cards, 
  className = "" 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    const cardElements = cardsRef.current.filter(Boolean);
    
    if (!container || cardElements.length === 0) return;

    const ctx = gsap.context(() => {
      // Set initial positions for stacking effect
      cardElements.forEach((card, index) => {
        if (!card) return;
        
        gsap.set(card, {
          zIndex: cardElements.length - index,
          y: index * 20,
          scale: 1 - index * 0.05,
        });
      });

      // Create scroll-triggered animations for each card
      cardElements.forEach((card, index) => {
        if (!card) return;

        const isLast = index === cardElements.length - 1;
        
        if (!isLast) {
          ScrollTrigger.create({
            trigger: card,
            start: "top center",
            end: "bottom center",
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress;
              const nextCard = cardElements[index + 1];
              
              if (nextCard) {
                gsap.to(card, {
                  y: -progress * 100,
                  scale: 1 - progress * 0.1,
                  opacity: 1 - progress * 0.5,
                  duration: 0.3,
                  ease: "none"
                });
                
                gsap.to(nextCard, {
                  y: (1 - progress) * 20,
                  scale: 0.95 + progress * 0.05,
                  duration: 0.3,
                  ease: "none"
                });
              }
            }
          });
        }

        // Individual card animations
        const image = card.querySelector('.card-image');
        const title = card.querySelector('.card-title');
        const descriptions = card.querySelectorAll('.card-description');
        const button = card.querySelector('.card-button');

        if (image) {
          gsap.from(image, {
            scale: 0.8,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
            }
          });
        }

        if (title) {
          gsap.from(title, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 70%",
            }
          });
        }

        if (descriptions.length > 0) {
          gsap.from(descriptions, {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 70%",
            }
          });
        }

        if (button) {
          gsap.from(button, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: card,
              start: "top 60%",
            }
          });
        }
      });
    });

    return () => ctx.revert();
  }, [cards]);

  const addToCardsRef = (el: HTMLDivElement | null, index: number) => {
    if (cardsRef.current) {
      cardsRef.current[index] = el;
    }
  };

  const getLayoutClasses = (layout: string, isMobile: boolean) => {
    if (isMobile) {
      return "flex-col items-center text-center";
    }
    
    switch (layout) {
      case 'left':
        return "flex-row";
      case 'right':
        return "flex-row-reverse";
      case 'center':
        return "flex-row";
      default:
        return "flex-row";
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {cards.map((card, index) => (
        <div
          key={card.id}
          ref={(el) => addToCardsRef(el, index)}
          className="sticky top-20 w-full min-h-screen flex items-center justify-center px-4 md:px-5 py-10"
        >
          <div className="max-w-[960px] w-full bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={`flex ${getLayoutClasses(card.layout, false)} md:${getLayoutClasses(card.layout, false)} flex-col md:flex-row gap-5 h-auto md:h-[calc(100vh-160px)] max-h-[800px]`}>
              
              {/* Image Section */}
              <div className="w-full md:w-1/2 relative group">
                <img
                  src={card.image}
                  alt={card.title}
                  className="card-image w-full h-[300px] md:h-[400px] lg:h-full max-h-[500px] md:max-h-none object-cover transition-all duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content Section */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h2 className="card-title [font-family:'Inter',Helvetica] font-bold text-black text-xl md:text-2xl lg:text-[29.8px] tracking-[-0.96px] leading-tight">
                      {card.title.split(' ').map((word, wordIndex) => (
                        <span key={wordIndex}>
                          {word.includes('Carbon') || word.includes('Sustainable') || word.includes('Climate') || word.includes('Credits') ? (
                            <span className="text-[#1DBF73]">{word}</span>
                          ) : (
                            word
                          )}
                          {wordIndex < card.title.split(' ').length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </h2>
                    <div className="w-[100px] md:w-[220px] h-[3px] bg-[#1DBF73] rounded-full mx-auto md:mx-0" />
                  </div>

                  <div className="space-y-4">
                    <p className="card-description [font-family:'Inter',Helvetica] font-medium text-[#666666] text-sm md:text-[15.1px] tracking-[-0.16px] leading-[19.2px] text-center md:text-left">
                      {card.description}
                    </p>
                    
                    {/* Hide secondary description on mobile */}
                    {card.secondaryDescription && (
                      <p className="card-description hidden md:block [font-family:'Inter',Helvetica] font-medium text-[#666666] text-[15.6px] tracking-[-0.16px] leading-[19.2px] text-left">
                        {card.secondaryDescription}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center md:justify-end mt-6">
                  <button className="card-button animated-button bg-gradient-to-r from-[#010204] to-[#1a1a1a] hover:from-[#1DBF73] hover:to-[#1DBF73] rounded-[50px] h-[50px] md:h-[57px] px-6 md:px-8 flex items-center gap-3 whitespace-nowrap transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-[#1DBF73]/30 group relative overflow-hidden border border-transparent hover:border-white/20">
                    <span className="[font-family:'Inter',Helvetica] font-bold text-white text-sm md:text-[15px] tracking-[0] leading-[19.2px] relative z-10 group-hover:tracking-wide transition-all duration-300">
                      {card.buttonText}
                    </span>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 relative z-10">
                      <svg className="w-4 h-4 md:w-5 md:h-5 text-black transition-all duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        .text-[#1DBF73] {
          color: #1DBF73;
        }
        .bg-forest-green {
          background-color: #1DBF73;
        }
        .hover\\:from-forest-green:hover {
          --tw-gradient-from: #1DBF73;
        }
        .hover\\:to-green-600:hover {
          --tw-gradient-to: #1DBF73;
        }
        .shadow-forest-green\\/30 {
          box-shadow: 0 25px 50px -12px rgba(29, 191, 115, 0.3);
        }
      `}</style>
    </div>
  );
};