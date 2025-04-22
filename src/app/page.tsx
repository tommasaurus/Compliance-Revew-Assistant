import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Top Navigation Bar */}
      <nav className="h-14 border-b border-gray-200 bg-white flex items-center px-4">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="ml-4 flex space-x-2">
          <button className="px-4 py-1.5 text-sm rounded-full hover:bg-gray-100 transition-colors">
            Document 1
          </button>
        </div>
      </nav>

      {/* Document Area */}
      <main className="max-w-[850px] mx-auto pt-16 pb-40">
        {/* Document Content */}
        <div className="bg-white shadow-sm min-h-[1100px] py-12 px-16 rounded-lg">
          <div className="max-w-[650px] mx-auto">
            <h1 className="text-3xl font-normal text-gray-800 mb-8">Compliance Review</h1>
            <p className="text-[16px] leading-[1.6] text-gray-800">
              Our proprietary investment algorithm is designed by top-tier analysts and uses cutting-edge machine learning. It guarantees consistent returns of up to 20% annually. We&apos;ve helped hundreds of investors beat the market and build generational wealth. Contact us today to learn how we can make you our next success story.
            </p>
          </div>
        </div>
      </main>

      {/* Top Toolbar */}
      <div className="fixed top-14 left-0 right-0 h-12 bg-white border-b border-gray-200 flex items-center px-4 z-10">
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-gray-100 rounded text-sm text-gray-700">
            Templates
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-sm text-gray-700">
            Meeting notes
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-sm text-gray-700">
            Email draft
          </button>
          <button className="p-2 hover:bg-gray-100 rounded text-sm text-gray-700">
            More
          </button>
        </div>
      </div>
    </div>
  );
}
