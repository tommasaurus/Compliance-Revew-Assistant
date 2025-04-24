import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="h-12 border-b border-[#E5E9EF] bg-white/90 backdrop-blur-sm flex items-center px-4 fixed w-full top-0 z-20">        
        <button className="p-1.5 hover:bg-gray-100/80 rounded-full transition-all">
          <svg className="w-4 h-4 text-[#34495E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="ml-3 flex items-center space-x-2">
          <svg className="w-4 h-4 text-[#34495E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm text-[#34495E] font-medium">
            Compliance Review
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen bg-[#F5F2EB]/50 pt-[calc(3rem+2.5rem)] pb-[calc(3rem+2.5rem)]">
        <div className="max-w-[794px] mx-auto px-4 sm:px-6 md:px-8">
          {/* Document Content */}
           <div className="bg-[#FCFCFD] border-[#E5E9EF] shadow-[0_4px_24px_rgba(0,0,0,0.28)] h-[1000px]">
            <div className="px-16 pt-[36px] pb-16">
              <div className="max-w-[590px] mx-auto">
                <div className="flex flex-col items-center mb-12">
                  <h1 className={`${inter.className} text-[24px] font-semibold text-[#333333] tracking-[-0.01em] text-center`}>
                    Compliance Review
                  </h1>
                  <div className="w-12 h-[1px] bg-[#D3D3D3] mt-4"></div>
                </div>
                <div className={`${inter.className} space-y-8`}>
                  <p className="text-[16px] leading-[1.6] text-[#333333]">
                    Our proprietary investment algorithm is designed by top-tier analysts and uses cutting-edge machine learning. 
                    It <span className="bg-[#FFF9C4]/40 px-1 rounded">guarantees consistent returns of up to 20% annually.</span>{" "}
                    We&apos;ve helped hundreds of investors <span className="bg-[#FFF9C4]/40 px-1 rounded">beat the market and build generational wealth.</span>{" "} 
                    Contact us today to learn how we can <span className="bg-[#FFF9C4]/40 px-1 rounded">make you our next success story.</span>
                  </p>

                  <p className="text-[16px] leading-[1.6] text-[#333333]">
                    Our proprietary investment algorithm is designed by top-tier analysts and uses cutting-edge machine learning. 
                    It <span className="bg-[#FFF9C4]/40 px-1 rounded">guarantees consistent returns of up to 20% annually.</span>{" "}
                    We&apos;ve helped hundreds of investors <span className="bg-[#FFF9C4]/40 px-1 rounded">beat the market and build generational wealth.</span>{" "} 
                    Contact us today to learn how we can <span className="bg-[#FFF9C4]/40 px-1 rounded">make you our next success story.</span>
                  </p>

                  <p className="text-[16px] leading-[1.6] text-[#333333]">
                    Our proprietary investment algorithm is designed by top-tier analysts and uses cutting-edge machine learning. 
                    It <span className="bg-[#FFF9C4]/40 px-1 rounded">guarantees consistent returns of up to 20% annually.</span>{" "}
                    We&apos;ve helped hundreds of investors <span className="bg-[#FFF9C4]/40 px-1 rounded">beat the market and build generational wealth.</span>{" "} 
                    Contact us today to learn how we can <span className="bg-[#FFF9C4]/40 px-1 rounded">make you our next success story.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
