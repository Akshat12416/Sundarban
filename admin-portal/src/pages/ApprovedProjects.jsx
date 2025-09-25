// src/pages/ApprovedProjects.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { collectImgs, getImageSrc } from "../utils/projectUtils";
import SplitText from "../components/animations/SplitText";
import countdownImg from "../photos/countdown.png";
import natureImg from "../photos/nature.png";
import placeholderImg from "../photos/placeholder.png";

const styles = `
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes smoothHover {
    from {
      transform: scale(1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    to {
      transform: scale(1.05);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
  }

  @keyframes filterSlideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .filter-counter-enter {
    animation: filterSlideInRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .filter-controls-enter {
    animation: filterSlideInRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  }

  .touch-button {
    min-height: 30px;
    min-width: 44px;
    touch-action: manipulation;
  }

  @keyframes cardsSlideUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .cards-enter {
    animation: cardsSlideUp 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 0.5s;
    animation-fill-mode: both;
  }

  /* Responsive image gallery styles */
  .image-gallery {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(auto-fit, minmax(4rem, 1fr));
  }

  @media (min-width: 640px) {
    .image-gallery {
      grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
      gap: 0.75rem;
    }
  }

  @media (min-width: 768px) {
    .image-gallery {
      grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
    }
  }

  /* Responsive container styles */
  .responsive-container {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  @media (min-width: 640px) {
    .responsive-container {
      max-width: 640px;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }

  @media (min-width: 768px) {
    .responsive-container {
      max-width: 768px;
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }

  @media (min-width: 1024px) {
    .responsive-container {
      max-width: 1024px;
    }
  }

  @media (min-width: 1200px) {
    .responsive-container {
      max-width: 1200px;
    }
  }
`;

export default function ApprovedProjects() {
  const [projects, setProjects] = useState([]);
  const [cardsPerPage, setCardsPerPage] = useState(10);

  useEffect(() => {
    const projectsRef = ref(db, "Projects");
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const flat = [];
      Object.entries(data).forEach(([ownerKey, ownerNode]) => {
        Object.entries(ownerNode || {}).forEach(([projId, projData]) => {
          if (projData.status === "Approved") {
            flat.push({
              id: projId,
              ownerKey,
              ...projData,
              beforeImages: collectImgs(projData, "bImg").map(getImageSrc),
              afterImages: collectImgs(projData, "aImg").map(getImageSrc),
            });
          }
        });
      });
      setProjects(flat);
    });
    return () => unsubscribe();
  }, []);

  // Reset cards per page if it exceeds available projects
  useEffect(() => {
    if (cardsPerPage > projects.length && projects.length > 0) {
      setCardsPerPage(projects.length);
    }
  }, [projects.length, cardsPerPage]);

  return (
    <div className="min-h-screen text-white bg-gray-100">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="responsive-container py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <SplitText
            text="Approved Projects"
            tag="h1"
            className="[font-family:'Inter',Helvetica] font-bold text-[#1DBF73] text-6xl sm:text-6xl md:text-8xl lg:text-8xl xl:text-8xl 2xl:text-8xl tracking-[-0.5px] leading-tight"
            delay={50}
            duration={0.6}
            ease="power3.out"
            splitType="lines"
            from={{ opacity: 0, x: -40 }}
            to={{ opacity: 1, x: 0 }}
            threshold={0.1}
            rootMargin="0px"
            textAlign="left"
          />
        </div>

        {/* Cards per page selector */}
        <div className="mb-4 sm:mb-6 lg:mb-8 flex justify-center sm:justify-end overflow-hidden">
          <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
            <div
              className="filter-counter-enter"
              style={{
                animationDelay: '0.1s',
                animationFillMode: 'both'
              }}
            >
              <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                Showing {Math.min(cardsPerPage, projects.length)} of {projects.length} projects
              </span>
            </div>
            <div
              className="filter-controls-enter flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto"
              style={{
                animationDelay: '0.3s',
                animationFillMode: 'both'
              }}
            >
              <label className="text-xs sm:text-sm font-medium text-gray-700">Show:</label>
              <select
                value={cardsPerPage}
                onChange={(e) => setCardsPerPage(Number(e.target.value))}
                className="w-full sm:w-auto px-1 py-0.5 text-xs border border-[#1DBF73] rounded-full bg-white text-[#1DBF73] focus:outline-none shadow-sm hover:border-[#17a665] transition-colors duration-200 touch-button"
              >
                <option value={10}>10 cards</option>
                <option value={25}>25 cards</option>
                <option value={50}>50 cards</option>
                <option value={100}>100 cards</option>
                <option value={projects.length}>All cards ({projects.length})</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-3 sm:p-4 lg:p-6">
          <div className="grid gap-3 sm:gap-4 lg:gap-6 cards-enter">
            {projects.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="text-gray-400 text-base sm:text-lg">No approved projects found.</div>
              </div>
            )}

            {projects.slice(0, cardsPerPage).map((p) => (
              <div
                key={`${p.ownerKey}-${p.id}`}
                className="bg-gray-50 rounded-lg shadow-xl p-3 sm:p-4 lg:p-6"
              >
                {/* Header with name and status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-black truncate">
                      {p.orgName || p.userName}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      ({p.ownerKey})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border bg-[#aceec7] text-[#1DBF73]">
                      Approved
                    </span>
                  </div>
                </div>

                {/* Project details */}
                <div className="mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    {/* Tree Type and Category Section */}
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <img src={natureImg} alt="nature" className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-gray-700">Tree Type & Category</p>
                        <p className="text-sm sm:text-base text-gray-600 truncate">
                          <strong>{p.treeType}</strong> | <strong>{p.treeCategory}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Count Section */}
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <img src={countdownImg} alt="countdown" className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-gray-700">Count</p>
                        <p className="text-sm sm:text-base text-gray-600">
                          <strong>{p.noTree}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Location Section */}
                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 sm:col-span-2 lg:col-span-1">
                      <img src={placeholderImg} alt="location" className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-medium text-gray-700">Location</p>
                        <p className="text-sm sm:text-base text-gray-600 truncate">
                          {p.region}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="lg:col-span-1">
                      <h3 className="text-sm sm:text-base font-bold text-black mb-2 sm:mb-3">
                        Before Images
                      </h3>
                      <div className="image-gallery">
                        {p.beforeImages.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`before-${i}`}
                            className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg sm:rounded-xl border border-green-600 cursor-pointer hover:border-green-400 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center items-center">
                      <div className="w-px h-24 sm:h-32 bg-gray-300"></div>
                    </div>
                    <div className="lg:col-span-1">
                      <h3 className="text-sm sm:text-base font-bold text-black mb-2 sm:mb-3">
                        After Images
                      </h3>
                      <div className="image-gallery">
                        {p.afterImages.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`after-${i}`}
                            className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-lg sm:rounded-xl border border-green-600 cursor-pointer hover:border-green-400 hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <p className="text-xs sm:text-sm text-gray-600 break-all">
                      <strong>Project ID:</strong> <span className="font-mono">{p.id}</span> | <strong>Phone:</strong> {p.phone} | <strong>Email:</strong> {p.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
