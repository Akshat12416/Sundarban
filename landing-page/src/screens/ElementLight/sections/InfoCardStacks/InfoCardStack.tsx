import { ArrowRightIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedButton from "../../../../components/animations/AnimatedButton";

gsap.registerPlugin(ScrollTrigger);

// Image paths
const pic1 = "https://images.pexels.com/photos/15938873/pexels-photo-15938873.jpeg";
const pic2 = "https://images.pexels.com/photos/1226302/pexels-photo-1226302.jpeg";
const pic3 = "https://images.pexels.com/photos/1999579/pexels-photo-1999579.jpeg";

export const InfoCardsStack = (): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Individual refs for animations within each card
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const textRefs = useRef<(HTMLParagraphElement | null)[][]>([[], [], []]);
  const buttonRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Check if screen is mobile/tablet
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean);

      if (cards.length === 0) return;

      // Only apply scroll animations on desktop
      if (!isMobile) {
        // Set initial positions - all cards stacked on top of each other
        gsap.set(cards, {
          yPercent: 0,
          scale: 1,
          zIndex: (i) => i + 1, // card1 lowest, cardN highest
        });

        // Set initial positions for cards 2 and 3 (they start below the viewport)
        gsap.set(cards.slice(1), {
          yPercent: 100,
          scale: 0.95,
        });

        // Create timeline for scroll-triggered animations
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "+=300%",
            scrub: true,
            pin: true,
            anticipatePin: 1,
          }
        });

        // Animation sequence for each card transition
        cards.forEach((card, index) => {
          if (index < cards.length - 1) {
            // Move the current card back + tint it gray
            tl.to(card, {
              scale: 0.9,
              yPercent: -10,
              backgroundColor: "#e5e7eb", // Tailwind gray-200 equivalent
              opacity: 1,
              duration: 1,
              ease: "power2.inOut",
            }, index)
              .to(cards[index + 1], {
                yPercent: 0,
                scale: 1,
                backgroundColor: "#ffffff", // keep front card pure white
                opacity: 1,
                duration: 1,
                ease: "power2.inOut",
              }, index);
          }
        });
      } else {
        // On mobile, reset all positioning and make cards static
        gsap.set(cards, {
          yPercent: 0,
          scale: 1,
          zIndex: 1,
          backgroundColor: "#ffffff",
          opacity: 1,
          position: "relative",
          clearProps: "all"
        });
      }

      // Individual card hover effects and internal animations (works on all screens)
      cards.forEach((card, index) => {
        // Image hover effects
        const image = imageRefs.current[index];
        if (image) {
          const imageHover = gsap.to(image, {
            scale: 1.05,
            duration: 0.4,
            paused: true,
            ease: "power2.out"
          });

          image.addEventListener('mouseenter', () => imageHover.play());
          image.addEventListener('mouseleave', () => imageHover.reverse());
        }

        // Staggered text animations for each card
        const cardElements = [
          titleRefs.current[index],
          ...textRefs.current[index].filter(Boolean)
        ].filter(Boolean);

        gsap.from(cardElements, {
          y: 50,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 70%",
          }
        });

        // Button animations
        const button = buttonRefs.current[index];
        if (button) {
          gsap.from(button, {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: button,
              start: "top 80%",
            }
          });
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  // Helper functions for refs
  const addToCardsRef = (el: HTMLDivElement | null, index: number) => {
    if (cardsRef.current) {
      cardsRef.current[index] = el;
    }
  };

  const addToImageRefs = (el: HTMLImageElement | null, index: number) => {
    if (imageRefs.current) {
      imageRefs.current[index] = el;
    }
  };

  const addToTitleRefs = (el: HTMLHeadingElement | null, index: number) => {
    if (titleRefs.current) {
      titleRefs.current[index] = el;
    }
  };

  const addToTextRefs = (el: HTMLParagraphElement | null, cardIndex: number, textIndex: number) => {
    if (textRefs.current[cardIndex]) {
      textRefs.current[cardIndex][textIndex] = el;
    }
  };

  const addToButtonRefs = (el: HTMLDivElement | null, index: number) => {
    if (buttonRefs.current) {
      buttonRefs.current[index] = el;
    }
  };

  // Card data
  const cardData = [
    {
      title: (
        <>
          Unlock the Future of
          <span className="text-[#1DBF73]"> Carbon Trading</span>.
        </>
      ),
      text1: `Our platform is revolutionizing carbon credit trading by bringing transparency, integrity, and trust through blockchain technology. Every credit is securely verified and recorded, eliminating risks of fraud or duplication while ensuring accountability at each step.`,
      text2: `Users can easily track their contributions and see the real impact of the projects they support, from renewable energy to reforestation. This makes carbon offsetting not only reliable but also engaging, inspiring individuals and businesses to take meaningful action toward a sustainable future.`,
      buttonText: "Learn More",
      image: pic1,
      alt: "Forest landscape",
      layout: "image-left"
    },
    {
      title: (
        <>
          Empower Your
          <span className="text-[#1DBF73]"> Climate Action</span> with Carbon Credits.
        </>
      ),
      text1: `Join us in transforming the voluntary carbon market through transparency and integrity. Our blockchain-enabled platform makes it easy for you to buy, trade, and retire carbon credits from verified afforestation projects.`,
      text2: `Our platform makes it simple to buy, trade, and retire carbon credits sourced from verified afforestation projects. This ensures that your contributions directly support real, measurable climate action while building a sustainable future for generations to come.`,
      buttonText: "Get Started",
      image: pic2,
      alt: "Forest conservation project",
      layout: "image-center"
    },
    {
      title: (
        <>
          Experience Effortless Trading and Retirement of
          <span className="text-[#1DBF73]"> Carbon Credits</span> with Confidence.
        </>
      ),
      text1: `Our platform makes trading and retiring carbon credits simple and seamless for everyone. By supporting verified projects and maintaining transparent processes, we ensure that your participation in climate action is both trustworthy and impactful.`,
      text2: `With every credit accounted for and traceable, you can confidently contribute to meaningful environmental change, knowing your efforts are making a real difference in building a sustainable future.`,
      buttonText: "Trade Now",
      image: pic3,
      alt: "Sustainable forest ecosystem",
      layout: "image-right"
    }
  ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isMobile ? '' : 'h-screen'}`}
    >
      {/* Card Stack Container */}
      <div className={`relative w-full ${isMobile ? 'bg-gradient-to-b from-green-50/20 to-white' : 'h-screen'}`}>
        {cardData.map((card, index) => (
          <div
            key={index}
            ref={(el) => addToCardsRef(el, index)}
            className={`${isMobile ? 'relative w-full' : 'absolute inset-0'} w-full ${isMobile ? 'min-h-fit' : 'h-full'}`}
          >
            {/* Mobile Layout - Always Image First */}
            {isMobile ? (
              <section className="w-full flex justify-center px-4 py-8">
                <div className="w-full max-w-4xl">
                  {/* Image First on Mobile */}
                  <div className="w-full mb-6">
                    <img
                      ref={(el) => addToImageRefs(el, index)}
                      className="w-full rounded-2xl h-[500px] object-cover shadow-xl"
                      alt={card.alt}
                      src={card.image}
                      loading="lazy"
                    />
                  </div>

                  {/* Content Section */}
                  <div className="text-center space-y-6">
                    <div className="space-y-4">
                      <h2
                        ref={(el) => addToTitleRefs(el, index)}
                        className="font-bold text-black text-2xl sm:text-3xl tracking-tight leading-tight"
                      >
                        {card.title}
                      </h2>
                      <div className="w-20 h-1 bg-forest-green rounded-full mx-auto" />
                    </div>

                    <p
                      ref={(el) => addToTextRefs(el, index, 0)}
                      className="font-medium text-gray-600 text-base leading-relaxed max-w-3xl mx-auto"
                    >
                      {card.text1}
                    </p>

                    {/* Button Centered on Mobile */}
                    <div className="flex justify-center pt-4">
                      <AnimatedButton
                        text={card.buttonText}
                        bgColor="black"
                        textColor="white"
                        ref={(el) => addToButtonRefs(el, index)}
                      />
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              /* Desktop Layout - Preserve Original Layouts */
              <>
                {/* Card 1 Layout: Image Left */}
                {card.layout === "image-left" && (
                  <section className="w-full h-full flex justify-center bg-gradient-to-b from-green-50/20 to-white px-4 md:px-10 py-10">
                    <div className="w-full max-w-[1163px] lg:max-w-[960px] h-[calc(100vh-80px)] gap-5 flex relative transition-all duration-300">
                      <div className="w-2/4 relative group">
                        <img
                          ref={(el) => addToImageRefs(el, index)}
                          className="w-full rounded-3xl h-[calc(100vh-80px)] object-cover shadow-xl transition-all duration-300 group-hover:shadow-2xl"
                          alt={card.alt}
                          src={card.image}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-[56px] h-[56px] bg-white/90 backdrop-blur-sm rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                        </div>
                      </div>

                      <div className="w-2/4 gap-5 flex">
                        <div className="flex w-1/2 p-2 flex-col">
                          <div className="space-y-4">
                            <h2
                              ref={(el) => addToTitleRefs(el, index)}
                              className="[font-family:'Inter',Helvetica] font-bold text-black text-[29.8px] tracking-[-0.96px] leading-8"
                            >
                              {card.title}
                            </h2>
                            <div className="w-[220px] h-[3px] bg-forest-green rounded-full" />
                          </div>

                          <p
                            ref={(el) => addToTextRefs(el, index, 0)}
                            className="pt-5 [font-family:'Inter',Helvetica] font-medium text-[#666666] text-[15.1px] tracking-[-0.16px] leading-[19.2px] max-w-[233px]"
                          >
                            {card.text1}
                          </p>
                        </div>

                        <div className="flex w-1/2 flex-col items-end justify-end p-2">
                          <div className="text-right pb-5 max-w-[225px]">
                            <p
                              ref={(el) => addToTextRefs(el, index, 1)}
                              className="w-full [font-family:'Inter',Helvetica] font-medium text-[#666666] text-[15.6px] text-right tracking-[-0.16px] leading-[19.2px]"
                            >
                              {card.text2}
                            </p>
                          </div>

                          <div className="flex justify-end">
                            <AnimatedButton
                              text={card.buttonText}
                              bgColor="black"
                              textColor="white"
                              ref={(el) => addToButtonRefs(el, index)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Card 2 Layout: Image Center */}
                {card.layout === "image-center" && (
                  <section className="w-full h-full flex justify-center bg-gradient-to-b from-green-50/20 to-white px-4 md:px-10 py-10">
                    <div className="w-full max-w-[1163px] lg:max-w-[960px] h-[calc(100vh-80px)] gap-5 flex relative transition-all duration-300">
                      <div className="w-1/4 flex justify-center">
                        <div className="flex p-2 flex-col">
                          <div className="space-y-4">
                            <h2
                              ref={(el) => addToTitleRefs(el, index)}
                              className="[font-family:'Inter',Helvetica] font-bold text-black text-[29.8px] tracking-[-0.96px] leading-8"
                            >
                              {card.title}
                            </h2>
                            <div className="w-[220px] h-[3px] bg-forest-green rounded-full" />
                          </div>

                          <p
                            ref={(el) => addToTextRefs(el, index, 0)}
                            className="pt-5 [font-family:'Inter',Helvetica] font-medium text-[#666666] text-[15.1px] tracking-[-0.16px] leading-[19.2px] max-w-[233px]"
                          >
                            {card.text1}
                          </p>
                        </div>
                      </div>

                      <div className="w-2/4 gap-5 relative group">
                        <img
                          ref={(el) => addToImageRefs(el, index)}
                          className="w-full rounded-3xl h-[calc(100vh-80px)] object-cover shadow-xl transition-all duration-300 group-hover:shadow-2xl"
                          alt={card.alt}
                          src={card.image}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-[56px] h-[56px] bg-white/90 backdrop-blur-sm rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                        </div>
                      </div>

                      <div className="flex w-1/4 flex-col items-end justify-end p-2">
                        <div className="text-right pb-5 max-w-[225px]">
                          <p
                            ref={(el) => addToTextRefs(el, index, 1)}
                            className="w-full [font-family:'Inter',Helvetica] font-medium text-[#666666] text-[15.6px] text-right tracking-[-0.16px] leading-[19.2px]"
                          >
                            {card.text2}
                          </p>
                        </div>

                        <div className="flex justify-end">
                          <AnimatedButton
                            text="Get Started"
                            bgColor="black"
                            textColor="white"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Card 3 Layout: Image Right */}
                {card.layout === "image-right" && (
                  <section className="w-full h-full flex justify-center bg-gradient-to-b from-green-50/20 to-white px-4 md:px-10 py-10 relative bg-white">
                    <div className="w-full max-w-[1163px] lg:max-w-[960px] gap-5 h-[calc(100vh-80px)] flex relative transition-all duration-300">
                      <div className="w-2/4 gap-5 flex">
                        <div className="flex w-1/2 p-2 flex-col">
                          <div className="space-y-4">
                            <h2
                              ref={(el) => addToTitleRefs(el, index)}
                              className="[font-family:'Inter',Helvetica] font-bold text-black text-[29.8px] tracking-[-0.96px] leading-8"
                            >
                              {card.title}
                            </h2>
                            <div className="w-[220px] h-[3px] bg-forest-green rounded-full" />
                          </div>

                          <p
                            ref={(el) => addToTextRefs(el, index, 0)}
                            className="pt-5 [font-family:'Inter',Helvetica] font-medium text-[#666666] text-[15.1px] tracking-[-0.16px] leading-[19.2px] max-w-[233px]"
                          >
                            {card.text1}
                          </p>
                        </div>

                        <div className="flex w-1/2 flex-col items-end justify-end p-2">
                          <div className="text-right pb-5 max-w-full">
                            <p
                              ref={(el) => addToTextRefs(el, index, 1)}
                              className="[font-family:'Inter',Helvetica] font-medium text-[#666666] text-[15.6px] text-right tracking-[-0.16px] leading-[19.2px]"
                            >
                              {card.text2}
                            </p>
                          </div>

                          <div className="flex justify-end">
                            <AnimatedButton
                              text={card.buttonText}
                              bgColor="black"
                              textColor="white"
                              ref={(el) => addToButtonRefs(el, index)}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="w-2/4 relative group">
                        <img
                          ref={(el) => addToImageRefs(el, index)}
                          className="w-full rounded-3xl h-[calc(100vh-80px)] object-cover shadow-xl transition-all duration-300 group-hover:shadow-2xl"
                          alt={card.alt}
                          src={card.image}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-[56px] h-[56px] bg-white/90 backdrop-blur-sm rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .text-[#1DBF73] {
          color: #228B22;
        }
        .bg-forest-green {
          background-color: #228B22;
        }
        .hover\\:bg-forest-green:hover {
          background-color: #228B22;
        }
        .shadow-forest-green\\/25 {
          box-shadow: 0 10px 15px -3px rgba(34, 139, 34, 0.25);
        }
        .shadow-forest-green\\/30 {
          box-shadow: 0 10px 15px -3px rgba(34, 139, 34, 0.3);
        }
      `}</style>
    </div>
  );
};