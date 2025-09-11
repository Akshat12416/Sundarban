import React from "react";
import { Input } from "../../../../components/ui/input";
import { AnimatedButton } from "../../../../components/animations/AnimatedButton";

export const ContactFormSection = (): JSX.Element => {
  return (
    <section className="w-full bg-white py-10 md:py-16">
      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="[font-family:'Inter',Helvetica] font-bold text-black text-xl md:text-[29.8px] tracking-[-0.29px] leading-8">
            Newsletter
          </h2>
          <p className="[font-family:'Inter',Helvetica] font-bold text-[#999999] text-xl md:text-[29.8px] tracking-[-0.29px] leading-8">
            Sign up
          </p>
        </div>

        <div className="w-[280px] space-y-[10px]">
          <Input
            type="email"
            placeholder="name@framer.com"
            className="h-10 bg-[#eeeeee] border-0 rounded-[10px] px-3 [font-family:'Inter',Helvetica] font-normal text-sm text-[#999999] placeholder:text-[#999999] w-full"
          />

          <AnimatedButton 
            variant="secondary" 
            size="md"
            className="w-full rounded-[10px] [font-family:'Inter',Helvetica] font-normal text-[13.7px] leading-[16.8px]"
          >
            Submit
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
};
