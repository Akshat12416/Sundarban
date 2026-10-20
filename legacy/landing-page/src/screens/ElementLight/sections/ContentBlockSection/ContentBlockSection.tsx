import React from "react";

// Custom Card Components
const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "" }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

// Custom Separator Component
const Separator = ({ orientation = "horizontal", className = "" }) => {
  const baseClasses = "bg-gray-300";
  const orientationClasses = orientation === "vertical" 
    ? "w-px h-full" 
    : "h-px w-full";
  
  return <div className={`${baseClasses} ${orientationClasses} ${className}`} />;
};

export const ContentBlockSection = (): JSX.Element => {
  const steps = [
    {
      title: "Step 1: Submit Your Afforestation Project for Verification",
      description:
        "Easily upload your project details and evidence for review.",
      action: "Submit",
    },
    {
      title: "Step 2: Get Your Project Verified and Approved",
      description: "Our experts review and validate your project credentials.",
      action: "Verify",
    },
    {
      title: "Step 3: Earn and Trade Carbon Credits",
      description:
        "Start earning credits and participate in the carbon market.",
      action: "Trade",
    },
  ];

  return (
    <section className="w-full bg-white py-12 md:py-20 lg:py-[100px] px-4 md:px-6 lg:px-8">
      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout */}
        <div className="hidden lg:flex items-start justify-between gap-8">
          <div className="flex justify-end items-end pt-[89px]">
            <div className="text-left space-y-[1px]">
              <p className="w-[300px] font-normal text-[#575757] text-[15px] tracking-[0] leading-[19.2px]">
                Every action on our platform is tracked, validated, and recorded transparently using blockchain technology. From project submission to credit issuance, every step is carefully monitored to ensure genuine sustainability.
              </p>
            </div>
          </div>

          <Separator orientation="vertical" className="h-64 w-px bg-gray-300" />

          <div className="flex-shrink-0">
            <h2 className="text-right font-bold text-black text-[60.2px] tracking-[-1.86px] leading-[62px]">
               Verified <br/>Sustainability, <br/> Every Step.
            </h2>
          </div>
        </div>

        {/* Mobile and Tablet Layout */}
        <div className="lg:hidden text-center space-y-8">
          <h2 className="font-bold text-black text-5xl md:text-5xl xl:text-5xl tracking-tight leading-tight">
            Verified <br/>Sustainability, <br/> Every Step.
          </h2>
          
          <Separator className="w-20 h-px bg-gray-300 mx-auto" />
          
          <p className="font-normal text-[#575757] text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            We prioritize transparency in every transaction, ensuring that all carbon
            credits are backed by verified projects. Our platform allows users to trace the
            journey of each credit, fostering trust and accountability.
          </p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-7xl mx-auto mt-16 md:mt-20 lg:mt-24">
        <h3 className="text-center font-bold text-black text-3xl md:text-4xl lg:text-4xl mb-8 md:mb-12">
          How It Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="hover:shadow-md rounded transition-shadow duration-300">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                  {/* Step Number Badge */}
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-700 rounded-full font-bold text-lg">
                    {index + 1}
                  </div>
                  
                  {/* Step Title */}
                  <h4 className="font-bold text-black text-lg md:text-xl leading-tight">
                    {step.title}
                  </h4>
                  
                  {/* Step Description */}
                  <p className="text-[#575757] text-sm md:text-base leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Action Button */}
                  <div className="pt-2">
                    <button className="inline-flex items-center justify-center px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm md:text-base">
                      {step.action}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};