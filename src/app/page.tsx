import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">Compliance Review</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-lg leading-relaxed text-gray-800">
            Our proprietary investment algorithm is designed by top-tier analysts and uses cutting-edge machine learning. It guarantees consistent returns of up to 20% annually. We&apos;ve helped hundreds of investors beat the market and build generational wealth. Contact us today to learn how we can make you our next success story.
          </p>
        </div>
      </div>
    </main>
  );
}
