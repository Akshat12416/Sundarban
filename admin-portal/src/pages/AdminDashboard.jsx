import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, update, set, push } from "firebase/database"; // use set instead of push
import { collectImgs, getImageSrc, parseLocationField } from "../utils/projectUtils";
import { ethers } from "ethers";
import CONTRACT_ABI from "../abi/CarbonCreditToken.json";
import { keccak256, toUtf8Bytes } from "ethers";
import SplitText from "../components/animations/SplitText";
import CountUp from 'react-countup';
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

  /* Touch-friendly button styles */
  .touch-button {
    min-height: 30px;
    min-width: 44px;
    touch-action: manipulation;
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

const CONTRACT_ADDRESS = "0x5714709ae8821F23a9B250559dec6d47ff3785B8";

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState(null);
  const [hoverPreview, setHoverPreview] = useState({ show: false, src: '', x: 0, y: 0 });
  const [walletConnected, setWalletConnected] = useState(false);
  const [showPendingProjects, setShowPendingProjects] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [cardsPerPage, setCardsPerPage] = useState(10);

  // Delay the appearance of "Pending projects" text
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPendingProjects(true);
    }, 2000); // 2 second delay after dashboard appears

    return () => clearTimeout(timer);
  }, []);

  // Reset cards per page if it exceeds available projects
  useEffect(() => {
    if (cardsPerPage > projects.length && projects.length > 0) {
      setCardsPerPage(projects.length);
    }
  }, [projects.length, cardsPerPage]);

  useEffect(() => {
    const projectsRef = ref(db, "Projects");
    const unsubscribe = onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const flat = [];
      Object.entries(data).forEach(([ownerKey, ownerNode]) => {
        Object.entries(ownerNode || {}).forEach(([projId, projData]) => {
          const beforeRaw = collectImgs(projData, "bImg");
          const afterRaw = collectImgs(projData, "aImg");

          const beforeImages = beforeRaw.map(getImageSrc).filter(Boolean);
          const afterImages = afterRaw.map(getImageSrc).filter(Boolean);

          flat.push({
            id: projId,
            ownerKey,
            ...projData,
            beforeImages,
            afterImages,
            parsedBeforeLocation: parseLocationField(projData.bLocation),
            parsedAfterLocation: parseLocationField(projData.aLocation),
          });
        });
      });

      const filtered = flat.filter(
        (p) => String(p.status).toLowerCase() === "pending" && p.afterImages.length > 0
      );

      setProjects(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask required!");
      return;
    }
    await window.ethereum.request({ method: "eth_requestAccounts" });
    setWalletConnected(true);
  };

  const hashProjectData = (proj) => {
    const str = JSON.stringify({
      id: proj.id,
      owner: proj.ownerKey,
      type: proj.treeType,
      count: proj.noTree,
      category: proj.treeCategory,
    });
    return keccak256(toUtf8Bytes(str));
  };

const approveProject = async (proj) => {
  try {
    const path = `Projects/${proj.ownerKey}/${proj.id}`;
    const credits = parseInt(proj.noTree) || 0;
    const upiMetamask = proj.upiMetamask;

    if (!upiMetamask) {
      alert("No payout details provided by user");
      return;
    }

    // generate unique transaction id using push()
    const transfersRef = ref(db, `Transfers/${proj.ownerKey}`);
    const newTransferRef = push(transfersRef);
    const transactionId = newTransferRef.key;

    // Case 1: Bank / UPI payout
    if (upiMetamask.includes("@")) {
      await set(newTransferRef, {
        transactionId,
        projectId: proj.id,
        ownerKey: proj.ownerKey,
        upiId: upiMetamask,
        credits,
        payoutMode: "bank",
        timestamp: Date.now(),
      });

      await update(ref(db, path), { status: "Approved" });
      alert("Project approved and bank payout recorded!");
      return;
    }

    // Case 2: Blockchain payout
    if (upiMetamask.startsWith("0x")) {
      if (!window.ethereum) {
        alert("MetaMask not detected");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const userWallet = upiMetamask;
      const dataHash = hashProjectData(proj);

      const tx = await contract.registerProject(userWallet, dataHash, credits);
      await tx.wait();

      await update(ref(db, path), {
        status: "Approved",
        blockchainTx: tx.hash,
      });

      await set(newTransferRef, {
        transactionId,
        projectId: proj.id,
        ownerKey: proj.ownerKey,
        userWallet,
        credits,
        blockchainTx: tx.hash,
        payoutMode: "crypto",
        timestamp: Date.now(),
      });

      alert("Project approved and credits issued!");
      return;
    }

    alert("Invalid payout details. Please check user input.");
  } catch (err) {
    console.error("Approval failed:", err);
    alert("Approval failed: " + err.message);
  }
};

  const rejectProject = async (proj) => {
    const path = `Projects/${proj.ownerKey}/${proj.id}`;
    await update(ref(db, path), { status: "Rejected" });
  };

  const toggleCardExpansion = (cardId) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(cardId)) {
      newExpandedCards.delete(cardId);
    } else {
      newExpandedCards.add(cardId);
    }
    setExpandedCards(newExpandedCards);
  };

  if (loading) return (
    <div className="responsive-container min-h-screen text-white bg-gray-100 flex items-center justify-center">
      <p className="text-lg sm:text-xl text-black">Loading projects...</p>
    </div>
  );

  return (
    <div className="min-h-screen text-white bg-gray-100">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="responsive-container py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
        <SplitText
          text="Dashboard"
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

      <div className="mb-4 sm:mb-6 lg:mb-8">
        <SplitText
          text="Pending projects"
          tag="h1"
          className="[font-family:'Inter',Helvetica] font-bold text-black/70 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl tracking-[-0.5px] leading-tight"
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
              className="w-full sm:w-auto px-1 py-0.5 text-xs border border-green-500 rounded-full bg-white text-[#1DBF73] focus:outline-none shadow-sm hover:border-[#17a665] transition-colors duration-200 touch-button"
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

      <div className="bg-white rounded-lg shadow-xl p-2 sm:p-2 lg:p-2">
        <div className="grid gap-2 sm:gap-2 lg:gap-2 cards-enter">
          {projects.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-base sm:text-lg">No pending projects found.</div>
            </div>
          )}

          {projects.slice(0, cardsPerPage).map((p) => {
          const cardId = `${p.ownerKey}-${p.id}`;
          const isExpanded = expandedCards.has(cardId);

          return (
            <div
              key={cardId}
              className="bg-gray-100 rounded-lg cursor-pointer p-3 sm:p-4 lg:p-6"
              onClick={() => toggleCardExpansion(cardId)}
            >
              {/* Always visible header with name and status */}
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-black truncate">
                    {p.orgName || p.userName}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    ({p.ownerKey})
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                        <CountUp end={50} duration={2} suffix="%" className="text-sm sm:text-base font-bold text-gray-700" />
                    <div className="w-8 h-1 bg-gray-300 rounded-full">
                      <div className="w-1/2 h-full bg-[#1DBF73] rounded-full"></div>
                    </div>
                  </div>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border bg-[#aceec7] text-[#1DBF73]">
                    Pending
                  </span>
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transform transition-transform duration-300 ease-out hover:scale-110 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expandable content */}
              <div
                className={`overflow-hidden transition-all duration-1000 ease-out ${
                  isExpanded ? 'max-h-[2000px] opacity-100 mt-4 sm:mt-6' : 'max-h-0 opacity-0'
                }`}
              >
                {/* Three horizontal sections with images and info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  {/* Tree Type and Category Section */}
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-[#ACEEC7] transition-colors duration-200">
                    <img src={natureImg} alt="nature" className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-700">Tree Type & Category</p>
                      <p className="text-sm sm:text-base text-gray-600 truncate">
                        <strong>{p.treeType}</strong> | <strong>{p.treeCategory}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Count Section */}
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-[#ACEEC7] transition-colors duration-200">
                    <img src={countdownImg} alt="countdown" className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-700">Count</p>
                      <p className="text-sm sm:text-base text-gray-600">
                        <strong>{p.noTree}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-[#ACEEC7] transition-colors duration-200 sm:col-span-2 lg:col-span-1">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImg(src);
                          }}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoverPreview({ show: true, src, x: e.clientX, y: e.clientY });
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation();
                            setHoverPreview({ show: false, src: '', x: 0, y: 0 });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <div className="w-px h-24 sm:h-32 lg:w-full lg:h-px bg-gray-300"></div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImg(src);
                          }}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            setHoverPreview({ show: true, src, x: e.clientX, y: e.clientY });
                          }}
                          onMouseLeave={(e) => {
                            e.stopPropagation();
                            setHoverPreview({ show: false, src: '', x: 0, y: 0 });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom section with buttons and contact info */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                    <button
                      className="touch-button bg-[#1DBF73] px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-[#17a665] text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        approveProject(p);
                      }}
                    >
                      Approve & Pay
                    </button>
                    <button
                      className="touch-button bg-[#FF5247] px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-[#e6453a] text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        rejectProject(p);
                      }}
                    >
                      Reject
                    </button>
                  </div>

                  {/* Contact Information moved to the right */}
                  <div className="p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 w-full lg:w-auto">
                    <p className="text-xs sm:text-sm text-gray-600 break-all">
                      <strong>Project ID:</strong> <span className="font-mono">{p.id}</span> | <strong>Phone:</strong> {p.phone} | <strong>Email:</strong> {p.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {hoverPreview.show && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: Math.min(hoverPreview.x + 10, window.innerWidth - 200),
            top: hoverPreview.y + 10,
            animation: 'fadeInScale 0.2s ease-out forwards'
          }}
        >
          <img
            src={hoverPreview.src}
            alt="hover-preview"
            className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-2xl shadow-2xl border-2 border-green-500 transform transition-all duration-300 ease-out hover:scale-105"
          />
        </div>
      )}

      {previewImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 sm:p-6 z-50"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="preview"
            className="max-h-full max-w-full rounded shadow-lg border border-green-500"
          />
        </div>
      )}
      </div>
    </div>
  );
}
