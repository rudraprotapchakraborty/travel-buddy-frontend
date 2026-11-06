import Link from "next/link";

/** Pin with a second dot: a place, and the buddy you share it with. */
export function LogoMark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="48" height="48" rx="13" fill="#0b6e99" />
      <path
        d="M24 9c-6.1 0-11 4.8-11 10.8 0 7.9 9.3 17.3 10.2 18.2.5.5 1.1.5 1.6 0C25.7 37.1 35 27.7 35 19.8 35 13.8 30.1 9 24 9z"
        fill="#fff"
      />
      <circle cx="24" cy="19.8" r="4.6" fill="#0b6e99" />
      <circle cx="36" cy="36" r="4.2" fill="#f2a65a" stroke="#0b6e99" strokeWidth="2" />
    </svg>
  );
}

export default function Brand({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Travel Buddy home"
      className={`inline-flex w-fit items-center gap-2.5 ${className}`}
    >
      <LogoMark />
      <span className="whitespace-nowrap text-[20px] font-bold leading-none tracking-[-0.045em] text-ink sm:text-[22px]">
        Travel <span className="accent text-[26px]">Buddy</span>
      </span>
    </Link>
  );
}
