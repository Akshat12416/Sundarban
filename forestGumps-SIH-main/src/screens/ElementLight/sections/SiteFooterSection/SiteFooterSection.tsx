import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const SiteFooterSection = (): JSX.Element => {
  const footerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);
  const socialRef = useRef<HTMLDivElement>(null);
  const copyrightRef = useRef<HTMLDivElement>(null);

  const footerColumns = [
    {
      title: "Platform",
      links: [
        { name: "Carbon Trading", href: "#" },
        { name: "Verification", href: "#" },
        { name: "Projects", href: "#" }
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Contact", href: "#" },
        { name: "Careers", href: "#" }
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Help Center", href: "#" },
        { name: "Privacy Policy", href: "#" }
      ],
    },
  ];

  const socialLinks = [
    { icon: Github, href: "#", name: "GitHub" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Linkedin, href: "#", name: "LinkedIn" },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Footer entrance animation
      gsap.from(footerRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
        }
      });

      // Logo animation
      gsap.from(logoRef.current, {
        scale: 0,
        rotation: -180,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: logoRef.current,
          start: "top 85%",
        }
      });

      // Columns staggered animation
      gsap.from(columnsRef.current.filter(Boolean), {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: columnsRef.current[0],
          start: "top 85%",
        }
      });

      // Social icons animation
      gsap.from(socialRef.current?.querySelectorAll('.social-icon'), {
        scale: 0,
        rotation: 360,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: socialRef.current,
          start: "top 85%",
        }
      });

      // Copyright animation
      gsap.from(copyrightRef.current, {
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: copyrightRef.current,
          start: "top 90%",
        }
      });
    });

    return () => ctx.revert();
  }, []);

  const addToColumnsRef = (el: HTMLDivElement | null, index: number) => {
    if (columnsRef.current) {
      columnsRef.current[index] = el;
    }
  };

  return (
    <footer 
      ref={footerRef}
      className="w-full bg-gradient-to-b from-white to-green-50/30 border-t border-forest-green/20 pt-16 pb-8"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Main Footer Content */}
        <div className="flex justify-between items-start mb-12">
          {/* Logo and Company Info */}
          <div className="flex flex-col space-y-6">
            <img
              ref={logoRef}
              className="w-[60px] h-[20px] hover:scale-110 transition-transform duration-300"
              alt="Company Logo"
              src="/mask-group.svg"
            />
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-600 hover:text-[#1DBF73] transition-colors duration-300">
                <Mail size={16} />
                <span className="text-sm">contact@carbonchain.eco</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 hover:text-[#1DBF73] transition-colors duration-300">
                <Phone size={16} />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 hover:text-[#1DBF73] transition-colors duration-300">
                <MapPin size={16} />
                <span className="text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Footer Columns */}
          <div className="flex gap-[120px]">
            {footerColumns.map((column, columnIndex) => (
              <div 
                key={columnIndex} 
                ref={el => addToColumnsRef(el, columnIndex)}
                className="flex flex-col"
              >
                <div className="[font-family:'Inter',Helvetica] font-semibold text-[#1DBF73] text-[16px] tracking-[-0.15px] leading-[18px] whitespace-nowrap mb-6">
                  {column.title}
                </div>
                {column.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    className="[font-family:'Inter',Helvetica] font-medium text-[#666666] text-[14.5px] tracking-[-0.15px] leading-[16px] whitespace-nowrap mb-4 last:mb-0 hover:text-[#1DBF73] transition-all duration-300 hover:translate-x-1 cursor-pointer"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div
          ref={socialRef}
          className="flex justify-center space-x-6 mb-8 sm:mb-12 md:mb-12 pb-8 border-b border-forest-green/10"
        >
          {socialLinks.map((social, index) => {
            const IconComponent = social.icon;
            return (
              <a
                key={index}
                href={social.href}
                className="social-icon w-10 h-10 bg-white border border-forest-green/20 rounded-full flex items-center justify-center text-[#1DBF73] hover:bg-forest-green hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-forest-green/25"
                aria-label={social.name}
              >
                <IconComponent size={20} />
              </a>
            );
          })}
        </div>

        {/* Copyright */}
        <div 
          ref={copyrightRef}
          className="text-center"
        >
          <p className="text-gray-500 text-sm [font-family:'Inter',Helvetica]">
            © 2025 CarbonChain. All rights reserved. | Empowering sustainable futures through blockchain innovation.
          </p>
        </div>
      </div>

      <style jsx>{`
        .text-[#1DBF73] {
          color: #228B22;
        }
        .hover\\:text-[#1DBF73]:hover {
          color: #228B22;
        }
        .bg-forest-green {
          background-color: #228B22;
        }
        .hover\\:bg-forest-green:hover {
          background-color: #228B22;
        }
        .border-forest-green\\/20 {
          border-color: rgba(34, 139, 34, 0.2);
        }
        .border-forest-green\\/10 {
          border-color: rgba(34, 139, 34, 0.1);
        }
        .shadow-forest-green\\/25 {
          box-shadow: 0 10px 15px -3px rgba(34, 139, 34, 0.25);
        }
      `}</style>
    </footer>
  );
};