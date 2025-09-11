import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";

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
    <section className="w-full bg-white py-[100px] px-5">
      <div className="max-w-[1163px] mx-auto flex items-startflex justify-between">
        <div className="flex justify-end items-end pt-[89px]">
          <div className="text-left space-y-[1px]">
            <p className="w-[300px] [font-family:'Inter',Helvetica] font-normal text-[#575757] text-[15px] tracking-[0] leading-[19.2px] ">
              We prioritize transparency in every
              transaction, ensuring that all carbon
              credits are backed by verified projects.
              Our platform allows users to trace the
              journey of each credit, fostering trust and
              accountability.
            </p>
          </div>
        </div>

        <Separator orientation="vertical" className="h-64 w-px bg-gray-300" />

        <div className="flex-shrink-0">
          <h2 className="text-right [font-family:'Inter',Helvetica] font-bold text-black text-[60.2px] tracking-[-1.86px] leading-[62px]">
            Our Commitment <br />
            to a Sustainable <br />
            Future
          </h2>
        </div>
      </div>
    </section>
  );
};
