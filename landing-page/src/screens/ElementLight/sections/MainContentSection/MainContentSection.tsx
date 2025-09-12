import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Separator } from "../../../../components/ui/separator";
import { RotatingText } from "../../../../components/animations/RotatingText";

gsap.registerPlugin(ScrollTrigger);

export const MainContentSection = (): JSX.Element => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);

  const rotatingWords = ["Sustainable", "Green", "Eco-Friendly", "Carbon-Neutral"];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation with letter stagger
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

      // Separator line animation
      gsap.fromTo(separatorRef.current,
        { scaleY: 0, transformOrigin: "bottom" },
        {
          scaleY: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: separatorRef.current,
            start: "top 80%",
          }
        }
      );

      // Text paragraph animation
      gsap.from(textRef.current, {
        x: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 80%",
        }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full bg-gradient-to-b from-white to-green-50/20 py-10 md:py-20 px-4 md:px-5">
      <div className="max-w-[1163px] mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-0">
        <div className="flex-shrink-0 text-center">
          <h2 
            ref={titleRef}
            className="[font-family:'Inter',Helvetica] font-bold text-black text-5xl md:text-6xl lg:text-6xl tracking-[-1px] lg:tracking-[-1.86px] leading-tight lg:leading-[62px] text-center lg:text-left"
          >
            Our Commitment <br />
            to a <RotatingText 
              words={rotatingWords}
              className="text-forest-green inline-block min-w-[200px] lg:min-w-[300px]"
            /> <br />
            Future.
          </h2>
        </div>

        <div ref={separatorRef} className="hidden lg:block">
          <Separator 
            orientation="vertical" 
            className="h-64 w-px bg-forest-green/30 shadow-sm" 
          />
        </div>

        <div className="flex justify-center lg:justify-end items-end lg:pt-[89px]">
          <div className="text-left space-y-[1px]">
            <p 
              ref={textRef}
              className="w-full max-w-[300px] [font-family:'Inter',Helvetica] font-normal text-[#575757] text-sm md:text-[15px] tracking-[0] leading-[19.2px] text-center lg:text-right"
            >
              We prioritize transparency in every
              transaction, ensuring that all carbon
              credits are backed by verified projects.
              Our platform allows users to trace the
              journey of each credit, fostering trust and
              accountability.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-forest-green {
          color: #228B22;
        }
        .bg-forest-green\\/30 {
          background-color: rgba(34, 139, 34, 0.3);
        }
      `}</style>
    </section>
  );
};