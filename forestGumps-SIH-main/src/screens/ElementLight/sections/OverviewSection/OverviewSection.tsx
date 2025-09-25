import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CountUp from 'react-countup';

gsap.registerPlugin(ScrollTrigger);

export const OverviewSection = (): JSX.Element => {
  const barItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const overviewItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const tradeRef = useRef<HTMLSpanElement>(null);
  const transformRef = useRef<HTMLSpanElement>(null);

  const statisticsData = [
    { number: 30, suffix: "+", label: "Awards." },
    { number: 32, suffix: "+", label: "Investments." },
    { number: 10, suffix: "K", label: "Users." },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Bar section animation
      gsap.from(barItemsRef.current.filter(Boolean), {
        y: -50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: barItemsRef.current[0],
          start: "top 90%",
        }
      });

      // Main overview staggered animation
      gsap.from(overviewItemsRef.current.filter(Boolean), {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: overviewItemsRef.current[0],
          start: "top 80%",
        }
      });

      // Animate "Measure", "Trade", "Transform" text
      gsap.fromTo([measureRef.current, tradeRef.current, transformRef.current],
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.3,
          ease: "power3.out",
          scrollTrigger: {
            trigger: overviewItemsRef.current[2],
            start: "top 80%",
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const addToBarRefs = (el: HTMLDivElement | null, index: number) => {
    if (barItemsRef.current) {
      barItemsRef.current[index] = el;
    }
  };

  const addToOverviewRefs = (el: HTMLDivElement | null, index: number) => {
    if (overviewItemsRef.current) {
      overviewItemsRef.current[index] = el;
    }
  };

  return (
    <section className="relative w-full flex-col bg-gradient-to-b from-green-50/20 to-white">
      {/* Bar section */}
      <div className="w-full h-fit flex flex-col md:flex-row justify-between px-4 md:px-10 py-5 border-b border-forest-green/10 gap-4 md:gap-0">
        <div 
          ref={el => addToBarRefs(el, 0)}
          className="w-full md:w-[300px] h-fit [font-family:'Inter',Helvetica] font-medium text-[#0f0f0f] text-base text-center md:text-left tracking-[-0.32px] leading-[25.6px] hover:text-[#1DBF73] transition-colors duration-300"
        >
          Transparency
        </div>
        <div 
          ref={el => addToBarRefs(el, 1)}
          className="w-full md:w-[300px] h-fit [font-family:'Inter',Helvetica] font-medium text-[#0f0f0f] text-base text-center tracking-[-0.32px] leading-[25.6px] hover:text-[#1DBF73] transition-colors duration-300"
        >
          Green Energy
        </div>
        <div 
          ref={el => addToBarRefs(el, 2)}
          className="w-full md:w-[300px] h-fit [font-family:'Inter',Helvetica] font-medium text-[#0f0f0f] text-base text-center md:text-right tracking-[-0.32px] leading-[25.6px] hover:text-[#1DBF73] transition-colors duration-300"
        >
          Eco Friendly
        </div>
      </div>

      {/* Section Wrap */}
      <div className="relative justify-center w-full px-4 md:px-5 py-10 md:py-20">
        {/* main overview */}
        <div className="max-w-[1163px] mx-auto flex flex-col lg:flex-row items-center w-full justify-between gap-8 lg:gap-0">
          <div 
            ref={el => addToOverviewRefs(el, 0)}
            className="h-full w-fit [font-family:'Inter',Helvetica] font-bold text-[#0f0f0f] text-xl md:text-2xl text-center lg:text-left align-text-top tracking-[-0.48px] leading-[38.4px] lg:self-start"
          >
            Your Path to <span className="text-[#1DBF73]">Sustainable</span> <br />
            Change
          </div>

          <div 
            ref={el => addToOverviewRefs(el, 1)}
            className="h-fit w-fit [font-family:'Inter',Helvetica] font-bold text-[#0f0f0f] text-sm md:text-base text-center lg:text-right tracking-[-0.32px] leading-[25.6px] space-y-1"
          >
            <div className="hover:text-[#1DBF73] transition-colors duration-300">Transparent Carbon Action</div>
            <div className="hover:text-[#1DBF73] transition-colors duration-300">Carbon Credits, Simplified</div>
            <div className="hover:text-[#1DBF73] transition-colors duration-300">Real Projects. Real Impact.</div>
            <div className="hover:text-[#1DBF73] transition-colors duration-300">Traceable Impact, Trusted Results</div>
          </div>

          <div 
            ref={el => addToOverviewRefs(el, 2)}
            className="h-full w-fit [font-family:'Inter',Helvetica] font-bold text-[#0f0f0f] text-4xl md:text-6xl lg:text-[80px] text-center lg:text-right tracking-[-1.60px] leading-tight lg:leading-[128px]"
          >
            <span ref={measureRef} className="block hover:text-[#1DBF73] transition-colors duration-300">Measure.</span>
            <span ref={tradeRef} className="block hover:text-[#1DBF73] transition-colors duration-300">Trade.</span>
            <span ref={transformRef} className="block text-[#1DBF73]">Transform.</span>
          </div>
        </div>

        <div ref={statsRef} className="flex flex-col md:flex-row w-full h-fit pt-10 md:pt-20 justify-center gap-8 md:gap-16">
          {statisticsData.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col justify-center h-fit w-full group cursor-default"
            >
              <div className="font-bold w-full h-fit text-black text-3xl md:text-[59.4px] leading-tight md:leading-[64px] [font-family:'Inter',Helvetica] text-center whitespace-nowrap group-hover:text-[#1DBF73] transition-colors duration-300">
                <CountUp
                  end={stat.number}
                  duration={2}
                  suffix={stat.suffix}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </div>
              <div className="font-normal w-full h-fit text-[#999999] text-base md:text-[20.5px] leading-tight md:leading-[22px] [font-family:'Inter',Helvetica] text-center whitespace-nowrap group-hover:text-[#1DBF73]/70 transition-colors duration-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .text-[#1DBF73] {
          color: #228B22;
        }
        .hover\\:text-[#1DBF73]:hover {
          color: #228B22;
        }
        .hover\\:text-[#1DBF73]\\/70:hover {
          color: rgba(34, 139, 34, 0.7);
        }
        .border-forest-green\\/10 {
          border-color: rgba(34, 139, 34, 0.1);
        }
      `}</style>
    </section>
  );
};