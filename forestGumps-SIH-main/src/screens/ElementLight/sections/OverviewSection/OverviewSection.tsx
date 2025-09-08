import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const OverviewSection = (): JSX.Element => {
  const barItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const overviewItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  const statisticsData = [
    { number: "30+", label: "Awards." },
    { number: "32+", label: "Investments." },
    { number: "10K", label: "Users." },
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

      // Statistics counter animation
      const statElements = statsRef.current?.querySelectorAll('.stat-number');
      if (statElements) {
        statElements.forEach((element, index) => {
          const endValue = statisticsData[index].number;
          gsap.from(element, {
            innerText: "0",
            duration: 2,
            ease: "power2.out",
            snap: { innerText: 1 },
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
            },
            onUpdate: function() {
              if (endValue.includes('+')) {
                element.textContent = Math.ceil(this.targets()[0].innerText) + '+';
              } else if (endValue.includes('K')) {
                element.textContent = Math.ceil(this.targets()[0].innerText / 1000) + 'K';
              } else {
                element.textContent = Math.ceil(this.targets()[0].innerText);
              }
            }
          });
        });
      }
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
      <div className="w-full h-fit flex justify-between px-10 py-5 border-b border-forest-green/10">
        <div 
          ref={el => addToBarRefs(el, 0)}
          className="w-[300px] h-fit [font-family:'Inter',Helvetica] font-medium text-[#0f0f0f] text-base text-left tracking-[-0.32px] leading-[25.6px] hover:text-forest-green transition-colors duration-300"
        >
          Transparency
        </div>
        <div 
          ref={el => addToBarRefs(el, 1)}
          className="w-[300px] h-fit [font-family:'Inter',Helvetica] font-medium text-[#0f0f0f] text-base text-center tracking-[-0.32px] leading-[25.6px] hover:text-forest-green transition-colors duration-300"
        >
          Green Energy
        </div>
        <div 
          ref={el => addToBarRefs(el, 2)}
          className="w-[300px] h-fit [font-family:'Inter',Helvetica] font-medium text-[#0f0f0f] text-base text-right tracking-[-0.32px] leading-[25.6px] hover:text-forest-green transition-colors duration-300"
        >
          Eco Friendly
        </div>
      </div>

      {/* Section Wrap */}
      <div className="relative justify-center w-full px-5 py-20">
        {/* main overview */}
        <div className="max-w-[1163px] mx-auto flex items-center w-full justify-between">
          <div 
            ref={el => addToOverviewRefs(el, 0)}
            className="h-full w-fit [font-family:'Inter',Helvetica] font-bold text-[#0f0f0f] text-2xl align-text-top tracking-[-0.48px] leading-[38.4px] self-start"
          >
            Your Path to <span className="text-forest-green">Sustainable</span> <br />
            Change
          </div>

          <div 
            ref={el => addToOverviewRefs(el, 1)}
            className="h-fit w-fit [font-family:'Inter',Helvetica] font-bold text-[#0f0f0f] text-base text-right tracking-[-0.32px] leading-[25.6px] space-y-1"
          >
            <div className="hover:text-forest-green transition-colors duration-300">Transparent Carbon Action</div>
            <div className="hover:text-forest-green transition-colors duration-300">Carbon Credits, Simplified</div>
            <div className="hover:text-forest-green transition-colors duration-300">Real Projects. Real Impact.</div>
            <div className="hover:text-forest-green transition-colors duration-300">Traceable Impact, Trusted Results</div>
          </div>

          <div 
            ref={el => addToOverviewRefs(el, 2)}
            className="h-full w-fit [font-family:'Inter',Helvetica] font-bold text-[#0f0f0f] text-[80px] text-right tracking-[-1.60px] leading-[128px]"
          >
            <span className="hover:text-forest-green transition-colors duration-300">Measure.</span> <br />
            <span className="hover:text-forest-green transition-colors duration-300">Trade.</span> <br />
            <span className="text-forest-green">Transform.</span>
          </div>
        </div>

        <div ref={statsRef} className="flex w-full h-fit pt-20 justify-center gap-16">
          {statisticsData.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col justify-center h-fit w-full group cursor-default"
            >
              <div className="stat-number font-bold w-full h-fit text-black text-[59.4px] leading-[64px] [font-family:'Inter',Helvetica] text-center whitespace-nowrap group-hover:text-forest-green transition-colors duration-300">
                {stat.number}
              </div>
              <div className="font-normal w-full h-fit text-[#999999] text-[20.5px] leading-[22px] [font-family:'Inter',Helvetica] text-center whitespace-nowrap group-hover:text-forest-green/70 transition-colors duration-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .text-forest-green {
          color: #228B22;
        }
        .hover\\:text-forest-green:hover {
          color: #228B22;
        }
        .hover\\:text-forest-green\\/70:hover {
          color: rgba(34, 139, 34, 0.7);
        }
        .border-forest-green\\/10 {
          border-color: rgba(34, 139, 34, 0.1);
        }
      `}</style>
    </section>
  );
};