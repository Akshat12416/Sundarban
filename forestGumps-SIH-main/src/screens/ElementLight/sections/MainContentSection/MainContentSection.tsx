import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Separator } from "../../../../components/ui/separator";

gsap.registerPlugin(ScrollTrigger);

export const MainContentSection = (): JSX.Element => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);

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
    <section className="w-full bg-gradient-to-b from-white to-green-50/20 py-20 px-5">
      <div className="max-w-[1163px] mx-auto flex items-start justify-between">
        <div className="flex-shrink-0">
          <h2 
            ref={titleRef}
            className="[font-family:'Inter',Helvetica] font-bold text-black text-[60.2px] tracking-[-1.86px] leading-[62px]"
          >
            Our Commitment <br />
            to a <span className="text-forest-green">Sustainable</span> <br />
            Future
          </h2>
        </div>

        <div ref={separatorRef}>
          <Separator 
            orientation="vertical" 
            className="h-64 w-px bg-forest-green/30 shadow-sm" 
          />
        </div>

        <div className="flex justify-end items-end pt-[89px]">
          <div className="text-left space-y-[1px]">
            <p 
              ref={textRef}
              className="w-[300px] [font-family:'Inter',Helvetica] font-normal text-[#575757] text-[15px] tracking-[0] leading-[19.2px]"
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