
import { ArrowRight } from "lucide-react";
import heroBackground from "@/assets/hero-mountain-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-start overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-background/40" />
      </div>
      
      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 xl:px-16">
        <div className="max-w-2xl">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-8 text-hero-primary">
            Empowering Climate Action Through Blockchain Innovation
          </h1>
          
          {/* Description Text */}
          <p className="text-lg md:text-xl lg:text-2xl text-hero-secondary leading-relaxed mb-12 max-w-xl">
            Our blockchain-enabled carbon credit platform ensures transparency and integrity in the voluntary carbon market. Join us in making a measurable impact through verified afforestation projects.
          </p>
          
          {/* CTA Button */}
          <button>GET STARTED</button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;