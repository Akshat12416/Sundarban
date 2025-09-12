import React, { Suspense } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ContactFormSection } from "./sections/ContactFormSection/ContactFormSection";
import { ContentBlockSection } from "./sections/ContentBlockSection/ContentBlockSection";
import { MainContentSection } from "./sections/MainContentSection/MainContentSection";
import { OverviewSection } from "./sections/OverviewSection/OverviewSection";
import LoginTypeSelector from "./sections/LognCards/LoginTyleSelector";
import ContributorLogin from "./sections/LognCards/ContributorLogin";
import CompanyLogin from "./sections/LognCards/CompanyLogin";
import AdminLogin from "./sections/LognCards/AdminLogin";

// Lazy load the specified components
const HeroSection = React.lazy(() => import("./sections/HeroSection/HeroSection").then(module => ({ default: module.HeroSection })));
const ImageCarouselSection = React.lazy(() => import("./sections/ImageCarouselSection/ImageCarouselSection").then(module => ({ default: module.ImageCarouselSection })));
const InfoCardsStack = React.lazy(() => import("./sections/InfoCardStacks/InfoCardStack").then(module => ({ default: module.InfoCardsStack })));
const SiteFooterSection = React.lazy(() => import("./sections/SiteFooterSection/SiteFooterSection").then(module => ({ default: module.SiteFooterSection })));

export const ElementLight = (): JSX.Element => {
  const navigate = useNavigate();
  const [isHeroLoaded, setIsHeroLoaded] = React.useState(false);

  const handleSelectType = (type: string) => {
    console.log(`Selected login type: ${type}`);
    // TODO: Navigate to the appropriate login page based on type
  };

  const handleBack = () => {
    // Navigate back to login type selector
    navigate('/login-type-selector');
  };

  React.useEffect(() => {
    const handleHeroLoad = () => {
      setIsHeroLoaded(true);
    };

    window.addEventListener('heroLoaded', handleHeroLoad);

    return () => {
      window.removeEventListener('heroLoaded', handleHeroLoad);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={
        <div className="relative w-full bg-white">
          {/* Preloading Overlay */}
          {!isHeroLoaded && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-forest-green border-t-transparent"></div>
                <p className="text-forest-green font-medium text-lg">Loading CarbonChain...</p>
              </div>
            </div>
          )}

          <div className="relative w-full">
            <div className="relative w-full bg-white">
              <div className="relative w-full mx-auto">
                <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-forest-green"></div></div>}>
                  <HeroSection />
                </Suspense>
                <OverviewSection />
                <MainContentSection />
                <Suspense fallback={<div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-forest-green"></div></div>}>
                  <InfoCardsStack/>
                </Suspense>
                <ContentBlockSection />
                <Suspense fallback={<div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-forest-green"></div></div>}>
                  <ImageCarouselSection />
                </Suspense>
                <ContactFormSection />
                <Suspense fallback={<div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div></div>}>
                  <SiteFooterSection />
                </Suspense>
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
