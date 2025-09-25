import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CountUp from 'react-countup';
import { TrendingUp, TrendingDown, Users, DollarSign, ChartBar as BarChart3, Grid3x2 as Grid3X3, List } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Seller {
  id: string;
  name: string;
  type: 'individual' | 'government' | 'organization';
  credits: number;
  pricePerCredit: number;
  totalValue: number;
  change24h: number;
  verified: boolean;
  location: string;
  avatar: string;
  description: string;
}

export const MarketplaceSection = (): JSX.Element => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const sellersRef = useRef<HTMLDivElement>(null);

  // Dummy data for sellers
  useEffect(() => {
    const dummySellers: Seller[] = [
      {
        id: '1',
        name: 'Amazon Rainforest Initiative',
        type: 'government',
        credits: 50000,
        pricePerCredit: 15.50,
        totalValue: 775000,
        change24h: 2.5,
        verified: true,
        location: 'Brazil',
        avatar: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        description: 'Large-scale reforestation project in the Amazon basin'
      },
      {
        id: '2',
        name: 'GreenTech Solutions',
        type: 'organization',
        credits: 25000,
        pricePerCredit: 12.75,
        totalValue: 318750,
        change24h: -1.2,
        verified: true,
        location: 'California, USA',
        avatar: 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        description: 'Renewable energy and carbon capture technology'
      },
      {
        id: '3',
        name: 'Nordic Forest Alliance',
        type: 'government',
        credits: 75000,
        pricePerCredit: 18.25,
        totalValue: 1368750,
        change24h: 4.8,
        verified: true,
        location: 'Norway',
        avatar: 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        description: 'Sustainable forestry and conservation programs'
      },
      {
        id: '4',
        name: 'John Smith',
        type: 'individual',
        credits: 500,
        pricePerCredit: 10.00,
        totalValue: 5000,
        change24h: 0.5,
        verified: true,
        location: 'Oregon, USA',
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        description: 'Small-scale tree planting on private land'
      },
      {
        id: '5',
        name: 'Australian Carbon Fund',
        type: 'government',
        credits: 100000,
        pricePerCredit: 20.00,
        totalValue: 2000000,
        change24h: 3.2,
        verified: true,
        location: 'Australia',
        avatar: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        description: 'National carbon offset and conservation initiative'
      },
      {
        id: '6',
        name: 'EcoVentures Ltd',
        type: 'organization',
        credits: 15000,
        pricePerCredit: 14.30,
        totalValue: 214500,
        change24h: -0.8,
        verified: false,
        location: 'London, UK',
        avatar: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1',
        description: 'Urban reforestation and green infrastructure'
      }
    ];
    setSellers(dummySellers);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.from(headerRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headerRef.current,
          start: "top 90%",
        }
      });

      // Stats animation
      gsap.from(statsRef.current?.children || [], {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
        }
      });

      // Sellers animation
      gsap.from(sellersRef.current?.children || [], {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sellersRef.current,
          start: "top 80%",
        }
      });
    });

    return () => ctx.revert();
  }, [sellers, viewMode]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'government':
        return '🏛️';
      case 'organization':
        return '🏢';
      case 'individual':
        return '👤';
      default:
        return '🌱';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'government':
        return 'bg-blue-100 text-blue-800';
      case 'organization':
        return 'bg-purple-100 text-purple-800';
      case 'individual':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMarketCap = sellers.reduce((sum, seller) => sum + seller.totalValue, 0);
  const totalCredits = sellers.reduce((sum, seller) => sum + seller.credits, 0);
  const avgPrice = totalCredits > 0 ? totalMarketCap / totalCredits : 0;
  const verifiedSellers = sellers.filter(s => s.verified).length;

  return (
    <section className="w-full bg-gradient-to-b from-white to-green-50/20 py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <h1 className="[font-family:'Inter',Helvetica] font-bold text-black text-4xl md:text-6xl lg:text-7xl tracking-tight leading-tight mb-4">
            Carbon Credit <span className="text-[#1DBF73]">Marketplace</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Trade verified carbon credits from trusted sellers worldwide
          </p>
        </div>

        {/* Market Statistics */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-[#1DBF73]" />
              <span className="text-sm text-gray-500">Market Cap</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-black">
              $<CountUp end={totalMarketCap / 1000000} duration={2} decimals={1} suffix="M" enableScrollSpy scrollSpyOnce />
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">+5.2%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-[#1DBF73]" />
              <span className="text-sm text-gray-500">Total Credits</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-black">
              <CountUp end={totalCredits / 1000} duration={2} decimals={0} suffix="K" enableScrollSpy scrollSpyOnce />
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">+12.8%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-[#1DBF73]" />
              <span className="text-sm text-gray-500">Avg Price</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-black">
              $<CountUp end={avgPrice} duration={2} decimals={2} enableScrollSpy scrollSpyOnce />
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-500">-2.1%</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-[#1DBF73]" />
              <span className="text-sm text-gray-500">Verified Sellers</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-black">
              <CountUp end={verifiedSellers} duration={2} enableScrollSpy scrollSpyOnce />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className="bg-[#1DBF73] h-1 rounded-full transition-all duration-1000"
                style={{ width: `${(verifiedSellers / sellers.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* View Toggle and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-black">Active Sellers</h2>
            <span className="text-sm text-gray-500">({sellers.length} sellers)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white shadow-sm text-[#1DBF73]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white shadow-sm text-[#1DBF73]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sellers List/Grid */}
        <div ref={sellersRef}>
          {viewMode === 'list' ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-medium text-gray-600">
                <div className="col-span-4">Seller</div>
                <div className="col-span-2 text-center">Type</div>
                <div className="col-span-2 text-right">Credits</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">24h Change</div>
              </div>

              {/* Table Rows */}
              {sellers.map((seller, index) => (
                <div 
                  key={seller.id}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={seller.avatar} 
                        alt={seller.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {seller.verified && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1DBF73] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-black group-hover:text-[#1DBF73] transition-colors">
                        {seller.name}
                      </div>
                      <div className="text-sm text-gray-500">{seller.location}</div>
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-center items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(seller.type)}`}>
                      {getTypeIcon(seller.type)} {seller.type}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <div className="font-semibold text-black">
                      <CountUp end={seller.credits} duration={1.5} separator="," enableScrollSpy scrollSpyOnce />
                    </div>
                    <div className="text-sm text-gray-500">credits</div>
                  </div>

                  <div className="col-span-2 text-right">
                    <div className="font-semibold text-black">
                      $<CountUp end={seller.pricePerCredit} duration={1.5} decimals={2} enableScrollSpy scrollSpyOnce />
                    </div>
                    <div className="text-sm text-gray-500">per credit</div>
                  </div>

                  <div className="col-span-2 text-right">
                    <div className={`font-semibold flex items-center justify-end gap-1 ${
                      seller.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {seller.change24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <CountUp 
                        end={Math.abs(seller.change24h)} 
                        duration={1.5} 
                        decimals={1} 
                        suffix="%" 
                        prefix={seller.change24h >= 0 ? '+' : '-'}
                        enableScrollSpy 
                        scrollSpyOnce 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((seller) => (
                <div 
                  key={seller.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={seller.avatar} 
                          alt={seller.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {seller.verified && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1DBF73] rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-black group-hover:text-[#1DBF73] transition-colors">
                          {seller.name}
                        </h3>
                        <p className="text-sm text-gray-500">{seller.location}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(seller.type)}`}>
                      {getTypeIcon(seller.type)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{seller.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Available Credits</span>
                      <span className="font-semibold text-black">
                        <CountUp end={seller.credits} duration={1.5} separator="," enableScrollSpy scrollSpyOnce />
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Price per Credit</span>
                      <span className="font-semibold text-black">
                        $<CountUp end={seller.pricePerCredit} duration={1.5} decimals={2} enableScrollSpy scrollSpyOnce />
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">24h Change</span>
                      <span className={`font-semibold flex items-center gap-1 ${
                        seller.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {seller.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <CountUp 
                          end={Math.abs(seller.change24h)} 
                          duration={1.5} 
                          decimals={1} 
                          suffix="%" 
                          prefix={seller.change24h >= 0 ? '+' : '-'}
                          enableScrollSpy 
                          scrollSpyOnce 
                        />
                      </span>
                    </div>

                    {/* Progress bar for credits availability */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Availability</span>
                        <span>{Math.min(100, (seller.credits / 100000) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#1DBF73] h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (seller.credits / 100000) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-[#1DBF73] text-white py-2 px-4 rounded-lg hover:bg-[#17a665] transition-colors font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Market Insights */}
        <div className="mt-16 bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl md:text-2xl font-bold text-black mb-6">Market Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#1DBF73] mb-2">
                <CountUp end={85} duration={2} suffix="%" enableScrollSpy scrollSpyOnce />
              </div>
              <p className="text-gray-600">Verified Projects</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-[#1DBF73] h-2 rounded-full w-[85%] transition-all duration-1000"></div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#1DBF73] mb-2">
                <CountUp end={42} duration={2} enableScrollSpy scrollSpyOnce />
              </div>
              <p className="text-gray-600">Countries Represented</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-[#1DBF73] h-2 rounded-full w-[70%] transition-all duration-1000"></div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#1DBF73] mb-2">
                $<CountUp end={2.4} duration={2} decimals={1} suffix="B" enableScrollSpy scrollSpyOnce />
              </div>
              <p className="text-gray-600">Total Volume Traded</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-[#1DBF73] h-2 rounded-full w-[95%] transition-all duration-1000"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-[#1DBF73] {
          color: #1DBF73;
        }
        .bg-[#1DBF73] {
          background-color: #1DBF73;
        }
        .hover\\:bg-[#17a665]:hover {
          background-color: #17a665;
        }
        .group-hover\\:text-[#1DBF73]:hover {
          color: #1DBF73;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};