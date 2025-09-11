import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "../../../../components/animations/SplitText";
import { StaggeredMenu } from "../../../../components/animations/StaggeredMenu";
import { AnimatedButton } from "../../../../components/animations/AnimatedButton";

gsap.registerPlugin(ScrollTrigger);

const Herobg = "https://images.pexels.com/photos/8514903/pexels-photo-8514903.jpeg";
const logo = "/src/photos/logo.jpg";

export const HeroSection = (): JSX.Element => {
  const heroRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // Menu items for StaggeredMenu
  const menuItems = [
    { label: 'Home', ariaLabel: 'Go to home page', link: '/' },
    { label: 'About', ariaLabel: 'Learn about us', link: '/about' },
    { label: 'Services', ariaLabel: 'View our services', link: '/services' },
    { label: 'Contact', ariaLabel: 'Get in touch', link: '/contact' }
  ];

  const socialItems = [
    { label: 'Twitter', link: 'https://twitter.com' },
    { label: 'GitHub', link: 'https://github.com' },
    { label: 'LinkedIn', link: 'https://linkedin.com' }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax effect for background
      if (parallaxRef.current) {
        gsap.to(parallaxRef.current, {
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });
      }

      // Text animations
      gsap.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.5
      });

      gsap.from(subtitleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.8
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section ref={heroRef} className="relative w-full lg:h-screen md:h-[90vh] sm:h-[90vh] overflow-hidden">
        <div className="relative h-full">
          {/* Parallax Background with Gradient Overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <img 
              ref={parallaxRef}
              src={Herobg} 
              className="absolute inset-0 w-full h-[140%] object-cover" 
              alt="Hero background"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
          </div>

          {/* Main content */}
          <div className="relative z-10 h-full flex items-center flex-col max-w-full">
            {/* Header with logo and menu/login wrapper */}
            <header className="flex w-full max-w-[1203px] items-center justify-between px-4 md:px-10 py-7 overflow-visible">
              {/* Logo */}
              <div className="flex items-center">
                <img
                  src={logo}
                  alt="Logo"
                  className="h-8 w-auto object-contain"
                  draggable={false}
                />
              </div>

              {/* Menu and Login wrapper */}
              <div className="flex items-center gap-4 md:gap-8">
                <Link to="/login-type-selector" className="[font-family:'Inter',Helvetica] font-normal text-white text-lg md:text-[22.7px] tracking-[0] leading-[28.8px] cursor-pointer relative group hidden md:block">
                  LOGIN
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-forest-green transition-all duration-300 group-hover:w-full"></span>
                </Link>

                {/* StaggeredMenu Component - embedded in header */}
                <div className="relative z-50">
                  <StaggeredMenu
                    position="right"
                    items={menuItems}
                    socialItems={socialItems}
                    displaySocials={true}
                    displayItemNumbering={true}
                    menuButtonColor="#fff"
                    openMenuButtonColor="#fff"
                    changeMenuColorOnOpen={true}
                    colors={['#228B22', '#32CD32', '#006400']} // Green theme colors
                    logoUrl={logo}
                    accentColor="#228B22" // Forest green accent
                    onMenuOpen={() => console.log('Menu opened')}
                    onMenuClose={() => console.log('Menu closed')}
                    embedded={true} // Add embedded prop to indicate it's inside header
                  />
                </div>
              </div>
            </header>

            <main className="flex-1 flex flex-col w-full max-w-[1203px] justify-between px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 md:pb-14 mt-4 sm:mt-6 md:mt-8">
              <div className="max-w-full md:max-w-[718px]">
                <div className="mb-4 sm:mb-5">
                  <SplitText
                    text="Empowering Climate Action Through Blockchain Innovation"
                    tag="h1"
                    className="[font-family:'Inter',Helvetica] font-bold text-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[74px] tracking-[-0.5px] sm:tracking-[-1px] md:tracking-[-2px] lg:tracking-[-3.20px] leading-tight sm:leading-tight md:leading-[1.1] lg:leading-[70px]"
                    delay={30}
                    duration={0.5}
                    ease="power3.out"
                    splitType="words, chars"
                    from={{ opacity: 0, y: 50, scale: 0.8 }}
                    to={{ opacity: 1, y: 0, scale: 1 }}
                    threshold={0.8}
                    rootMargin="0px"
                    textAlign="left"
                    onLetterAnimationComplete={() => console.log('Hero title animation complete!')}
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-center md:justify-end md:pl-16 lg:pl-32 xl:pl-56 max-w-full md:max-w-[718px] mt-6 sm:mt-8 md:mt-0">
                <div className="max-w-full md:max-w-[499px]">
                  <div className="mb-4 sm:mb-6">
                    <p ref={subtitleRef} className="[font-family:'Inter',Helvetica] font-bold text-[#252a18] text-xs sm:text-sm md:text-[16px] text-center md:text-right tracking-[-0.20px] sm:tracking-[-0.40px] md:tracking-[-0.80px] leading-4 sm:leading-5 px-4 sm:px-2 md:px-0">
                      Our blockchain-enabled carbon credit platform ensures 
                      transparency and integrity in the voluntary carbon market.{" "}
                      Join us in making a measurable impact through verified
                      afforestation projects.
                    </p>
                  </div>

                  <div className="flex justify-center md:justify-end">
                    <AnimatedButton
                      variant="primary"
                      size="lg"
                      onClick={() => window.location.href = '/login-type-selector'}
                      className="bg-forest-green hover:bg-emerald-700 shadow-xl hover:shadow-forest-green/30 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    >
                      <span className="flex items-center gap-2">
                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17l10-10m0 0v7m0-7h-7" />
                        </svg>
                      </span>
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      <style>{`
        .forest-green {
          color: #228B22;
        }
        .bg-forest-green {
          background-color: #228B22;
        }
        .bg-forest-green\\/50 {
          background-color: rgba(34, 139, 34, 0.5);
        }
        .bg-forest-green\\/70 {
          background-color: rgba(34, 139, 34, 0.7);
        }
        .shadow-forest-green\\/25 {
          box-shadow: 0 10px 15px -3px rgba(34, 139, 34, 0.25);
        }
        .shadow-forest-green\\/30 {
          box-shadow: 0 25px 50px -12px rgba(34, 139, 34, 0.3);
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-reverse {
          animation: float-reverse 12s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 6s ease-in-out infinite;
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(20px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(15px) translateX(-10px); }
          50% { transform: translateY(25px) translateX(-20px); }
          75% { transform: translateY(10px) translateX(-15px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(15px); }
        }
      `}</style>
    </>
  );
};