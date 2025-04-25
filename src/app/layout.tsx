import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Compliance Review",
  description: "Compliance Review Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-[#F5F2EB]">
        {/* 
          This wrapper grows to fit ALL content,
          so the grid always covers the full scroll height 
        */}
        <div className="relative">
          {/* grid behind everything, but inside the same container */}
          <AnimatedGridPattern
            numSquares={100}
            maxOpacity={0.1}
            duration={2}
            repeatDelay={1}
            height={50}
            width={50}
            className="absolute inset-0 z-0 pointer-events-none"
            x={0}
            y={0}
          />

          {/* page has higher z-index to be on top of the grid */}
          <div className="relative z-10">{children}</div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
