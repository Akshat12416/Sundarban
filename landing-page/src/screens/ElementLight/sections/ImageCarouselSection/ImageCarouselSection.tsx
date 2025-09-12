import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CircularGallery from './CircularGallery';
const f1 = "https://images.pexels.com/photos/20889052/pexels-photo-20889052.jpeg";
const f2 = "https://images.pexels.com/photos/2876511/pexels-photo-2876511.jpeg";
const f3 = "https://images.pexels.com/photos/1061623/pexels-photo-1061623.jpeg";
const f10 = "https://images.pexels.com/photos/32465940/pexels-photo-32465940.jpeg";
const f13 = "https://images.pexels.com/photos/2215534/pexels-photo-2215534.jpeg";
const f15 = "https://images.pexels.com/photos/1250260/pexels-photo-1250260.jpeg";
const f16 = "https://images.pexels.com/photos/259670/pexels-photo-259670.jpeg";
const f20 = "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg";

gsap.registerPlugin(ScrollTrigger);

export const ImageCarouselSection = (): JSX.Element => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const circularGalleryRef = useRef<HTMLDivElement>(null);
  const swipeTextRef = useRef<HTMLParagraphElement>(null);

  // Convert carousel images to CircularGallery format
  const circularGalleryItems = [
    { image: f1, text: "Clean Energy" },
    { image: f2, text: "Sustainable Future" },
    { image: f3, text: "Green Innovation" },
    { image: f10, text: "Eco Solutions" },
    { image: f13, text: "Environment" },
    { image: f15, text: "Renewable Power" },
    { image: f16, text: "Carbon Neutral" },
    { image: f20, text: "Earth Friendly" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title reveal animation
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
        }
      });

      // Circular gallery container animation
      gsap.fromTo(circularGalleryRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: circularGalleryRef.current,
            start: "top 70%",
          }
        }
      );

      // Swipe text animation
      gsap.from(swipeTextRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: swipeTextRef.current,
          start: "top 80%",
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full h-[600px] bg-gradient-to-b from-white to-green-50/30 overflow-hidden relative">
      <header className="pt-[47px] pl-5">
        <h1 
          ref={titleRef}
          className="w-[896px] h-24 [font-family:'Inter',Helvetica] font-normal text-[#575757] text-5xl md:text-6xl lg:text-[80px] tracking-[0] leading-[96px] whitespace-nowrap"
        >
          Building a <span className="text-forest-green font-semibold">Cleaner</span> Future.
        </h1>
      </header>

      <div 
        ref={circularGalleryRef} 
        className="mt-[40px] h-[400px] relative px-5"
      >
        <CircularGallery
          items={circularGalleryItems}
          bend={2.5}
          textColor="#575757"
          borderRadius={0.08}
          font="bold 24px Inter"
          scrollSpeed={1.8}
          scrollEase={0.08}
        />
      </div>

      <div className="flex justify-center pt-3">
        <p 
          ref={swipeTextRef}
          className="w-[108px] h-[29px] [font-family:'Inter',Helvetica] font-normal text-[#575757] text-[21.6px] tracking-[0] leading-[28.8px] whitespace-nowrap text-center hover:text-forest-green transition-colors duration-300"
        >
          …DRAG ...
        </p>
      </div>

      <style>{`
        .text-forest-green {
          color: #228B22;
        }
        .hover\\:text-forest-green:hover {
          color: #228B22;
        }
        .from-forest-green\\/30 {
          --tw-gradient-from: rgba(34, 139, 34, 0.3);
          --tw-gradient-to: rgba(34, 139, 34, 0);
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
        }
        @media (prefers-reduced-motion: reduce) {
          .circular-gallery {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};