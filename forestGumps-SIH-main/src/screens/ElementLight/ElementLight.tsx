import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ContactFormSection } from "./sections/ContactFormSection/ContactFormSection";
import { ContentBlockSection } from "./sections/ContentBlockSection/ContentBlockSection";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { ImageCarouselSection } from "./sections/ImageCarouselSection/ImageCarouselSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { OverviewSection } from "./sections/OverviewSection/OverviewSection";
import { SiteFooterSection } from "./sections/SiteFooterSection/SiteFooterSection";
import LoginTypeSelector from "./sections/LognCards/LoginTyleSelector";
import ContributorLogin from "./sections/LognCards/ContributorLogin";
import CompanyLogin from "./sections/LognCards/CompanyLogin";
import AdminLogin from "./sections/LognCards/AdminLogin";
import { InfoCardsStack } from "./sections/InfoCardStacks/InfoCardStack";

export const ElementLight = (): JSX.Element => {
  const navigate = useNavigate();

  const handleSelectType = (type: string) => {
    console.log(`Selected login type: ${type}`);
    // TODO: Navigate to the appropriate login page based on type
  };

  const handleBack = () => {
    // Navigate back to login type selector
    navigate('/login-type-selector');
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="relative w-full bg-white">
          <div className="relative w-full">
            <div className="relative w-full bg-white">
              <div className="relative w-full  mx-auto">
                <HeroSection />
                <OverviewSection />
                <MainContentSection />
                <InfoCardsStack/>
                <ContentBlockSection />
                <ImageCarouselSection />
                <ContactFormSection />
                <SiteFooterSection />
              </div>
            </div>
          </div>
        </div>
      } />
      <Route path="/login-type-selector" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <LoginTypeSelector />
        </div>
      } />
      <Route path="/contributor-login" element={<ContributorLogin onBack={handleBack} />} />
      <Route path="/company-login" element={<CompanyLogin onBack={handleBack} />} />
      <Route path="/admin-login" element={<AdminLogin onBack={handleBack} />} />
    </Routes>
  );
};
