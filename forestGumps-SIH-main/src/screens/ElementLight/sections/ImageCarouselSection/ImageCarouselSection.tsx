import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../../../components/ui/carousel";
import f1 from "/src/photos/f1.jpeg";
import f2 from "/src/photos/f2.jpg";
import f3 from "/src/photos/f3.jpg";
import f10 from "/src/photos/f10.jpg";
import f13 from "/src/photos/f13.jpg";
import f15 from "/src/photos/f15.jpg";
import f16 from "/src/photos/f16.jpg";
import f20 from "/src/photos/f20.jpeg";

gsap.registerPlugin(ScrollTrigger);

export const ImageCarouselSection = (): JSX.Element => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const swipeTextRef = useRef<HTMLParagraphElement>(null);

  const carouselImages = [
    { src: f1, alt: "Photo f1", width: "w-[400px]", height: "h-[265px]" },
    { src: f2, alt: "Photo f2", width: "w-[400px]", height: "h-[269px]" },
    { src: f3, alt: "Photo f3", width: "w-[400px]", height: "h-[300px]" },
    { src: f10, alt: "Photo f10", width: "w-[200px]", height: "h-[300px]" },
    { src: f13, alt: "Photo f13", width: "w-[400px]", height: "h-[265px]" },
    { src: f15, alt: "Photo f15", width: "w-[400px]", height: "h-[265px]" },
    { src: f16, alt: "Photo f16", width: "w-[400px]", height: "h-[265px]" },
    { src: f20, alt: "Photo f20", width: "w-[400px]", height: "h-[265px]" },
    // Duplicate for infinite effect
    { src: f1, alt: "Photo f1", width: "w-[400px]", height: "h-[265px]" },
    { src: f2, alt: "Photo f2", width: "w-[400px]", height: "h-[269px]" },
    { src: f3, alt: "Photo f3", width: "w-[400px]", height: "h-[300px]" },
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

      // Carousel items staggered animation
      const carouselItems = carouselRef.current?.querySelectorAll('[data-carousel-item]');
      if (carouselItems) {
        gsap.fromTo(carouselItems,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: carouselRef.current,
              start: "top 70%",
            }
          }
        );
      }

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

      // Infinite scroll animation for carousel
      const carouselContent = carouselRef.current?.querySelector('[data-carousel-content]');
      if (carouselContent) {
        const scrollWidth = carouselContent.scrollWidth / 2;
        
        gsap.to(carouselContent, {
          x: -scrollWidth,
          duration: 30,
          ease: "none",
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => parseFloat(x) % scrollWidth)
          }
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full h-[600px] bg-gradient-to-b from-white to-green-50/30 overflow-hidden relative">
      <header className="pt-[47px] pl-5">
        <h1 
          ref={titleRef}
          className="w-[896px] h-24 [font-family:'Inter',Helvetica] font-normal text-[#575757] text-[73.9px] tracking-[0] leading-[96px] whitespace-nowrap"
        >
          Building a <span className="text-forest-green font-semibold">Cleaner</span> Future.
        </h1>
      </header>

      <div ref={carouselRef} className="mt-[72px] relative">
        <Carousel 
          className="w-full h-auto"
          opts={{
            align: "start",
            loop: true,
            dragFree: true,
          }}
        >
          <CarouselContent 
            data-carousel-content
            className="flex items-end gap-[30px] pl-5 hover:pause-animation"
          >
            {carouselImages.map((image, index) => (
              <CarouselItem 
                key={index} 
                className="basis-auto"
                data-carousel-item
              >
                <div
                  className={`${image.width} ${image.height} bg-cover bg-center bg-no-repeat rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group cursor-pointer`}
                  style={{ backgroundImage: `url(${image.src})` }}
                  role="img"
                  aria-label={image.alt}
                >
                  <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent group-hover:from-forest-green/30 transition-all duration-300"></div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="flex justify-center pt-5">
        <p 
          ref={swipeTextRef}
          className="w-[108px] h-[29px] [font-family:'Inter',Helvetica] font-normal text-[#575757] text-[21.6px] tracking-[0] leading-[28.8px] whitespace-nowrap text-center hover:text-forest-green transition-colors duration-300"
        >
          …SWIPE ...
        </p>
      </div>

      <style jsx>{`
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
        .hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .hover\\:pause-animation {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};