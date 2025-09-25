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
import PreloaderPage from "./sections/Preloader/PreloaderPage"; // Import the preloader component

// Lazy load the specified components
const HeroSection = React.lazy(() => import("./sections/HeroSection/HeroSection").then(module => ({ default: module.HeroSection })));
const ImageCarouselSection = React.lazy(() => import("./sections/ImageCarouselSection/ImageCarouselSection").then(module => ({ default: module.ImageCarouselSection })));
const InfoCardsStack = React.lazy(() => import("./sections/InfoCardStacks/InfoCardStack").then(module => ({ default: module.InfoCardsStack })));
const SiteFooterSection = React.lazy(() => import("./sections/SiteFooterSection/SiteFooterSection").then(module => ({ default: module.SiteFooterSection })));
const MarketplaceSection = React.lazy(() => import("./sections/MarketplaceSection/MarketplaceSection").then(module => ({ default: module.MarketplaceSection })));

export const ElementLight = (): JSX.Element => {
  const navigate = useNavigate();
  const [isHeroLoaded, setIsHeroLoaded] = React.useState(false);
  const [showPreloader, setShowPreloader] = React.useState(true);
  const [preloaderFinished, setPreloaderFinished] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  const handleSelectType = (type: string) => {
    console.log(`Selected login type: ${type}`);
    // TODO: Navigate to the appropriate login page based on type
  };

  const handleBack = () => {
    // Navigate back to login type selector
    navigate('/login-type-selector');
  };

  const handleLoadComplete = () => {
    setShowPreloader(false);
    setPreloaderFinished(true);
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

  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Routes>
      <Route path="/" element={
        <div className="relative w-full bg-white">
          {/* Beautiful animated preloader */}
          {showPreloader && (
            <PreloaderPage 
              onLoadComplete={handleLoadComplete}
              isLoaded={isHeroLoaded}
            />
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
                <div id="marketplace">
                  <Suspense fallback={<div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-forest-green"></div></div>}>
                    <MarketplaceSection />
                  </Suspense>
                </div>
                <ContactFormSection />
                <Suspense fallback={<div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div></div>}>
                  <SiteFooterSection />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Floating Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-forest-green text-white shadow-lg hover:bg-forest-green/80 focus:outline-none focus:ring-2 focus:ring-forest-green focus:ring-offset-2 transition"
              title="Back to top"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
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
      <Route path="/marketplace" element={<Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-forest-green"></div></div>}><MarketplaceSection /></Suspense>} />
    </Routes>
  );
};