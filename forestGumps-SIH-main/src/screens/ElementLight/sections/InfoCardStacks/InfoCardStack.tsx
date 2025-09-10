import { ArrowRightIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "../../../../components/ui/button";

gsap.registerPlugin(ScrollTrigger);

// Image paths
const pic1 = "https://images.pexels.com/photos/15938873/pexels-photo-15938873.jpeg";
const pic2 = "https://images.pexels.com/photos/1226302/pexels-photo-1226302.jpeg";
const pic3 = "https://images.pexels.com/photos/1999579/pexels-photo-1999579.jpeg";

export const InfoCardsStack = (): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Individual refs for animations within each card
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const textRefs = useRef<(HTMLParagraphElement | null)[][]>([[], [], []]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current.filter(Boolean);

      if (cards.length === 0) return;

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

      // Individual card hover effects and internal animations
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
  }, []);

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

  const addToButtonRefs = (el: HTMLButtonElement | null, index: number) => {
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
          <span className="text-forest-green"> Carbon Trading</span>.
        </>
      ),
      text1: `Our platform is revolutionizing carbon credit trading by bringing transparency, integrity, and trust through blockchain technology. Every credit is securely verified and recorded, eliminating risks of fraud or duplication while ensuring accountability at each step.`,
      text2: `Users can easily track their contributions and see the real impact of the projects they support, from renewable energy to reforestation. This makes carbon offsetting not only reliable but also engaging, inspiring individuals and businesses to take meaningful action toward a sustainable future.`,
      buttonText: "Learn More",
      image: pic1,
      alt: "Forest landscape",
      layout: "image-left" // Image on left, text on right
    },
    {
      title: (
        <>
          Empower Your
          <span className="text-forest-green"> Climate Action</span> with Carbon Credits.
        </>
      ),
      text1: `Join us in transforming the voluntary carbon market through transparency and integrity. Our blockchain-enabled platform makes it easy for you to buy, trade, and retire carbon credits from verified afforestation projects.`,
      text2: `Our platform makes it simple to buy, trade, and retire carbon credits sourced from verified afforestation projects. This ensures that your contributions directly support real, measurable climate action while building a sustainable future for generations to come.`,
      buttonText: "Get Started",
      image: pic2,
      alt: "Forest conservation project",
      layout: "image-center" // Text on sides, image in center
    },
    {
      title: (
        <>
          Experience Effortless Trading and Retirement of
          <span className="text-forest-green"> Carbon Credits</span> with Confidence.
        </>
      ),
      text1: `Our platform makes trading and retiring carbon credits simple and seamless for everyone. By supporting verified projects and maintaining transparent processes, we ensure that your participation in climate action is both trustworthy and impactful.`,
      text2: `With every credit accounted for and traceable, you can confidently contribute to meaningful environmental change, knowing your efforts are making a real difference in building a sustainable future.`,
      buttonText: "Trade Now",
      image: pic3,
      alt: "Sustainable forest ecosystem",
      layout: "image-right" // Text on left, image on right
    }
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: '100vh' }} // 3x viewport height to accommodate 3 cards
    >
      {/* Card Stack Container */}
      <div className="relative w-full h-screen">
        {cardData.map((card, index) => (
          <div
            key={index}
            ref={(el) => addToCardsRef(el, index)}
            className="absolute inset-0 w-full h-full"
          >
            {/* Card 1 Layout: Image Left */}
            {card.layout === "image-left" && (
              <section className="w-full h-full flex justify-center bg-gradient-to-b from-green-50/20 to-white px-10 py-10">
                <div className="md:max-w-[1163px] lg:max-w-[960px] h-[calc(100vh-80px)] gap-5 flex relative transition-all duration-300">
                  <div className="w-2/4 relative group">
                    <img
                      ref={(el) => addToImageRefs(el, index)}
                      className="w-full rounded-3xl h-[calc(100vh-80px)] object-cover shadow-xl transition-all duration-300 group-hover:shadow-2xl"
                      alt={card.alt}
                      src={card.image}
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
                        <Button
                          ref={(el) => addToButtonRefs(el, index)}
                          className="animated-button w-fit flex bg-gradient-to-r from-[#010204] to-[#1a1a1a] hover:from-forest-green hover:to-green-600 rounded-[50px] h-[57px] px-4 items-center gap-2 whitespace-nowrap transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-forest-green/30 group relative overflow-hidden border border-transparent hover:border-white/20"
                        >
                          <span className="[font-family:'Inter',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[19.2px] relative z-10 group-hover:tracking-wide transition-all duration-300">
                            {card.buttonText}
                          </span>
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-gray-100 shadow-md group-hover:shadow-lg relative z-10">
                            <ArrowRightIcon className="w-5 h-5 text-black transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Card 2 Layout: Image Center */}
            {card.layout === "image-center" && (
              <section className="w-full h-full flex justify-center bg-gradient-to-b from-green-50/20 to-white px-10 py-10">
                <div className="md:max-w-[1163px] lg:max-w-[960px] h-[calc(100vh-80px)] gap-5 flex relative transition-all duration-300">
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
                      <Button
                        ref={(el) => addToButtonRefs(el, index)}
                        className="animated-button bg-gradient-to-r from-[#010204] to-[#1a1a1a] hover:from-forest-green hover:to-green-600 rounded-[50px] h-[57px] w-auto px-4 flex items-center gap-2 whitespace-nowrap transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-forest-green/30 group relative overflow-hidden border border-transparent hover:border-white/20"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                        <span className="[font-family:'Inter',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[19.2px] relative z-10 group-hover:tracking-wide transition-all duration-300">
                          {card.buttonText}
                        </span>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-gray-100 shadow-md group-hover:shadow-lg relative z-10">
                          <ArrowRightIcon className="w-5 h-5 text-black transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Card 3 Layout: Image Right */}
            {card.layout === "image-right" && (
              <section className="w-full h-full flex justify-center bg-gradient-to-b from-green-50/20 to-white px-10 py-10 relative bg-white"> {/* Added bg-white */}
                <div className="md:max-w-[1163px] lg:max-w-[960px] gap-5 h-[calc(100vh-80px)] flex relative transition-all duration-300">
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
                        <Button
                          ref={(el) => addToButtonRefs(el, index)}
                          className="animated-button bg-gradient-to-r from-[#010204] to-[#1a1a1a] hover:from-forest-green hover:to-green-600 rounded-[50px] h-[57px] w-fit px-6 pr-3 flex items-center gap-3 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-forest-green/30 group relative overflow-hidden border border-transparent hover:border-white/20"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                          <span className="[font-family:'Inter',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[19.2px] relative z-10 group-hover:tracking-wide transition-all duration-300">
                            {card.buttonText}
                          </span>
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-gray-100 shadow-md group-hover:shadow-lg relative z-10">
                            <ArrowRightIcon className="w-5 h-5 text-black transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="w-2/4 relative group">
                    <img
                      ref={(el) => addToImageRefs(el, index)}
                      className="w-full rounded-3xl h-[calc(100vh-80px)] object-cover shadow-xl transition-all duration-300 group-hover:shadow-2xl"
                      alt={card.alt}
                      src={card.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[56px] h-[56px] bg-white/90 backdrop-blur-sm rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .text-forest-green {
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