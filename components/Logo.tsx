import Link from "next/link";

interface LogoProps {
  href?: string;
}

export default function Logo({ href = "/" }: LogoProps) {
  return (
    <Link href={href} className="flex items-center gap-2 shrink-0" style={{ textDecoration: "none" }}>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#1D9E75]"
      >
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight">
        <span className="text-gray-900">ATS</span>
        <span className="text-[#1D9E75]">BYOK</span>
      </span>
    </Link>
  );
}
