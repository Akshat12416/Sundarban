import { ArrowRightIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "../../../../components/ui/button";

gsap.registerPlugin(ScrollTrigger);

const pic1 = "/src/photos/f21.jpg";

export const InfoCard1 = (): JSX.Element => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card scaling and z-axis animation on scroll
      gsap.fromTo(cardRef.current,
        { scale: 1, z: 0 },
        {
          scale: 0.95,
          z: -100,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
            pin: false,
          }
        }
      );

      // Image hover effect enhancement
      if (imageRef.current) {
        const imageHover = gsap.to(imageRef.current, {
          scale: 1.05,
          duration: 0.4,
          paused: true,
          ease: "power2.out"
        });

        imageRef.current.addEventListener('mouseenter', () => imageHover.play());
        imageRef.current.addEventListener('mouseleave', () => imageHover.reverse());
      }

      // Staggered text animations
      gsap.from([titleRef.current, ...textRefs.current.filter(Boolean)], {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 70%",
        }
      });

      // Button animation
      gsap.from(buttonRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: buttonRef.current,
          start: "top 80%",
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const addToTextRefs = (el: HTMLParagraphElement | null, index: number) => {
    if (textRefs.current) {
      textRefs.current[index] = el;
    }
  };

  return (
    <section className="w-full h-[100vh] flex justify-center bg-gradient-to-b from-green-50/20 to-white px-5 py-10">
      <div ref={cardRef} className="max-w-[960px] h-[calc(100vh-80px)] gap-5 flex relative transition-all duration-300">
        <div className="w-2/4 relative group">
          <img
            ref={imageRef}
            className="w-full rounded-3xl h-[calc(100vh-80px)] object-cover shadow-xl transition-all duration-300 group-hover:shadow-2xl"
            alt="Forest landscape"
            src={pic1}
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
                ref={titleRef}
                className="[font-family:'Inter',Helvetica] font-bold text-black text-[29.8px] tracking-[-0.96px] leading-8"
              >
                Unlock the
                Future of
                <span className="text-forest-green"> Carbon Trading</span>.
              </h2>

              <div className="w-[220px] h-[3px] bg-forest-green rounded-full" />
            </div>

            <p 
              ref={el => addToTextRefs(el, 0)}
              className="pt-5 [font-family:'Inter',Helvetica] font-medium text-[#666666] text-[15.1px] tracking-[-0.16px] leading-[19.2px] max-w-[233px]"
            >
              Our platform is revolutionizing
              carbon credit trading by bringing
              transparency, integrity, and trust
              through blockchain technology.
              Every credit is securely verified
              and recorded, eliminating risks of
              fraud or duplication while
              ensuring accountability at each
              step.
            </p>
          </div>

          <div className="flex w-1/2 flex-col justify-end p-2">
            <div className="text-right pb-5 max-w-[225px]">
              <p 
                ref={el => addToTextRefs(el, 1)}
                className="[font-family:'Inter',Helvetica] font-medium text-[#666666] text-[15.6px] text-right tracking-[-0.16px] leading-[19.2px]"
              >
                Users can easily track their
                contributions and see the real
                impact of the projects they
                support, from renewable energy
                to reforestation. This makes
                carbon offsetting not only
                reliable but also engaging,
                inspiring individuals and
                businesses to take meaningful
                action toward a sustainable
                future.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                ref={buttonRef}
                className="animated-button w-fit flex bg-gradient-to-r from-[#010204] to-[#1a1a1a] hover:from-forest-green hover:to-green-600 rounded-[50px] h-[57px] px-4 items-center gap-2 whitespace-nowrap transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-forest-green/30 group relative overflow-hidden border border-transparent hover:border-white/20"
              >
                {/* <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div> */}
                <span className="[font-family:'Inter',Helvetica] font-bold text-white text-[15px] tracking-[0] leading-[19.2px] relative z-10 group-hover:tracking-wide transition-all duration-300">
                  Learn More
                </span>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-gray-100 shadow-md group-hover:shadow-lg relative z-10">
                  <ArrowRightIcon className="w-5 h-5 text-black transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                </div>
              </Button>
            </div>
          </div>
        </div>
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
      `}</style>
    </section>
  );
};