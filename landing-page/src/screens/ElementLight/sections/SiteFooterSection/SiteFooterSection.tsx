import React, { useEffect, useRef, useState } from "react";
import { Github, Twitter, Linkedin, Mail, Phone, MapPin, Leaf, Shield, Users } from "lucide-react";

export const SiteFooterSection = (): JSX.Element => {
  const footerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const platformLinks = [
    { name: "Carbon Trading", href: "#" },
    { name: "Carbon Credits", href: "#" },
    { name: "Verification", href: "#" },
    { name: "Marketplace", href: "#" },
    { name: "Analytics", href: "#" }
  ];

  const companyLinks = [
    { name: "About Us", href: "#" },
    { name: "Our Mission", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press Kit", href: "#" },
    { name: "Partners", href: "#" }
  ];

  const resourceLinks = [
    { name: "Documentation", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Whitepaper", href: "#" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "GDPR Compliance", href: "#" }
  ];

  const socialLinks = [
    { icon: Github, href: "#", name: "GitHub" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Linkedin, href: "#", name: "LinkedIn" },
    { icon: Mail, href: "#", name: "Email" }
  ];

  const features = [
    { 
      icon: Leaf, 
      title: "100% Verified", 
      description: "All carbon credits are blockchain-verified"
    },
    { 
      icon: Shield, 
      title: "Secure Trading", 
      description: "Military-grade encryption & security"
    },
    { 
      icon: Users, 
      title: "Global Network", 
      description: "Connected with 50+ countries worldwide"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer 
      ref={footerRef}
      className={`w-full bg-black text-white relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          
          {/* Top Section */}
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 transition-all duration-800 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            
            {/* Company Info - Larger on desktop */}
            <div className="lg:col-span-4 space-y-6">
              <div className={`transition-all duration-600 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}>
                <img
                  className="w-8 h-8 object-cover sm:w-8 sm:h-8 mb-4 hover:opacity-80 transition-opacity duration-300"
                  alt="CarbonChain Logo"
                  src="/src/photos/logo.jpg"
                  loading="lazy"
                />
                <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
                  Leading the future of sustainable carbon trading through blockchain innovation. 
                  Join thousands of organizations making a positive environmental impact.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 group cursor-pointer">
                  <Mail size={16} className="group-hover:text-green-400 transition-colors" />
                  <span className="text-sm">contact@carbonchain.eco</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 group cursor-pointer">
                  <Phone size={16} className="group-hover:text-green-400 transition-colors" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 group cursor-pointer">
                  <MapPin size={16} className="group-hover:text-green-400 transition-colors" />
                  <span className="text-sm">San Francisco, CA 94103</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              
              {/* Platform */}
              <div className={`transition-all duration-600 delay-400 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Platform</h3>
                <ul className="space-y-3">
                  {platformLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div className={`transition-all duration-600 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Company</h3>
                <ul className="space-y-3">
                  {companyLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div className={`transition-all duration-600 delay-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Resources</h3>
                <ul className="space-y-3">
                  {resourceLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div className={`transition-all duration-600 delay-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Legal</h3>
                <ul className="space-y-3">
                  {legalLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

          {/* Features Section - Minimal */}
          <div className={`mb-16 transition-all duration-800 delay-900 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="text-center mb-8">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Why Choose Us</h3>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-16">
              {features.map((feature, index) => (
                <div key={index} className={`flex items-center space-x-3 group transition-all duration-600 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`} style={{ 
                  transitionDelay: isVisible ? `${1000 + index * 200}ms` : '0ms'
                }}>
                  <feature.icon size={16} className="text-green-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <h4 className="text-white text-sm font-medium">{feature.title}</h4>
                    <p className="text-gray-400 text-xs">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className={`border-t border-gray-800 mb-8 transition-all duration-800 delay-1000 ${
            isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
          }`}></div>

          {/* Bottom Section */}
          <div className={`flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 transition-all duration-600 delay-1200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            
            {/* Copyright */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
              <p className="text-gray-500 text-sm">
                © 2025 CarbonChain. All rights reserved.
              </p>
              <p className="text-gray-600 text-xs">
                Empowering sustainable futures through blockchain innovation
              </p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                    aria-label={social.name}
                    style={{ 
                      transitionDelay: isVisible ? `${1300 + index * 100}ms` : '0ms',
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'scale(1)' : 'scale(0.8)'
                    }}
                  >
                    <IconComponent size={18} />
                  </a>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};