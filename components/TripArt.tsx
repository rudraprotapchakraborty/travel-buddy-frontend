import { CalendarDays, MapPin, Plane, Users } from "lucide-react";

/**
 * Decorative "boarding pass" illustration. Sized with container units so it
 * scales from a phone to the hero without media queries.
 */
export default function TripArt({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid-panel relative isolate overflow-hidden rounded-[28px] border border-line ${className}`}
      style={{ containerType: "inline-size", aspectRatio: "1.15" }}
      aria-hidden="true"
    >
      <div className="eyeline absolute left-[6%] top-[6%]" style={{ fontSize: "clamp(8px,1.9cqw,11px)" }}>
        Live trips
      </div>

      {/* back card */}
      <div
        className="absolute left-[34%] top-[13%] w-[58%] animate-float rounded-[4cqw] bg-gradient-to-br from-[#f7c58f] to-[#f2a65a] p-[4.5cqw] text-[#4a2a0c] shadow-[0_4cqw_5cqw_-2.5cqw_rgba(74,42,12,0.45)]"
        style={{ ["--r" as string]: "8deg", transform: "rotate(8deg)", animationDelay: "-3s" }}
      >
        <div className="flex items-center justify-between" style={{ fontSize: "3.2cqw" }}>
          <span className="font-bold">Kyoto</span>
          <Plane style={{ width: "4cqw", height: "4cqw" }} />
        </div>
        <div className="mt-[2cqw] opacity-80" style={{ fontSize: "2.6cqw" }}>
          9 days · Couple
        </div>
      </div>

      {/* front card */}
      <div
        className="absolute left-[6%] top-[30%] w-[66%] animate-float rounded-[4cqw] bg-gradient-to-br from-[#0b5f84] to-[#0b7aa6] p-[4.5cqw] text-on-brand shadow-[0_5cqw_6cqw_-3cqw_rgba(6,60,87,0.7)]"
        style={{ ["--r" as string]: "-6deg", transform: "rotate(-6deg)" }}
      >
        <div className="flex items-center justify-between" style={{ fontSize: "3.4cqw" }}>
          <span className="font-bold">Lisbon, Portugal</span>
          <Plane style={{ width: "4.2cqw", height: "4.2cqw" }} />
        </div>
        <div className="mt-[3cqw] flex items-center gap-[2cqw] opacity-90" style={{ fontSize: "2.6cqw" }}>
          <CalendarDays style={{ width: "3.2cqw", height: "3.2cqw" }} /> 12 – 19 Dec
          <MapPin style={{ width: "3.2cqw", height: "3.2cqw", marginLeft: "2cqw" }} /> Friends trip
        </div>
        <svg viewBox="0 0 100 12" className="mt-[3.5cqw] w-full" preserveAspectRatio="none" fill="none">
          <path d="M2 8 C 25 -2, 45 14, 98 3" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 2.4" opacity="0.7" />
          <circle cx="2" cy="8" r="2" fill="currentColor" />
          <circle cx="98" cy="3" r="2" fill="#f2a65a" />
        </svg>
        <div className="mt-[3.5cqw] flex items-center gap-[2.5cqw]">
          <div className="flex">
            {["M", "T", "P"].map((l, i) => (
              <span
                key={l}
                className="grid place-items-center rounded-full border-2 border-[#0b6e99] bg-[#d3eef9] font-bold text-[#0b5f84]"
                style={{ width: "6.4cqw", height: "6.4cqw", fontSize: "2.6cqw", marginLeft: i ? "-1.8cqw" : 0 }}
              >
                {l}
              </span>
            ))}
          </div>
          <span style={{ fontSize: "2.5cqw" }} className="opacity-90">
            3 buddies joined
          </span>
        </div>
      </div>

      {/* chip */}
      <div
        className="absolute bottom-[6%] right-[6%] flex items-center gap-[2cqw] rounded-[2.6cqw] bg-surface px-[3cqw] py-[2.2cqw] text-ink shadow-[0_2cqw_4cqw_-1cqw_rgba(0,0,0,0.25)]"
        style={{ transform: "rotate(2deg)" }}
      >
        <span className="tile-mint grid place-items-center rounded-full" style={{ width: "6cqw", height: "6cqw" }}>
          <Users style={{ width: "3.2cqw", height: "3.2cqw" }} />
        </span>
        <span>
          <b className="block" style={{ fontSize: "2.4cqw" }}>
            Request accepted
          </b>
          <small className="block text-muted" style={{ fontSize: "2cqw" }}>
            Maya added you to the trip
          </small>
        </span>
      </div>
    </div>
  );
}
