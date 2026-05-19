import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATSBYOK — ATS Resume Optimizer",
  description: "Optimize your resume for any ATS. Bring your own free API key for unlimited optimizations. Works with Groq, OpenRouter, Gemini free tiers.",
  keywords: "ATS resume, resume optimizer, Naukri, LinkedIn, job application, ATSBYOK",
  openGraph: {
    title: "ATSBYOK — ATS Resume Optimizer",
    description: "Optimize your resume for any ATS. Bring your own free API key for unlimited optimizations.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
