import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon for iOS / Android, drawn from the same shapes as icon.svg
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b6e99",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 48 48">
          <path
            d="M24 9c-6.1 0-11 4.8-11 10.8 0 7.9 9.3 17.3 10.2 18.2.5.5 1.1.5 1.6 0C25.7 37.1 35 27.7 35 19.8 35 13.8 30.1 9 24 9z"
            fill="#fff"
          />
          <circle cx="24" cy="19.8" r="4.6" fill="#0b6e99" />
          <circle cx="36" cy="36" r="4.2" fill="#f2a65a" stroke="#0b6e99" strokeWidth="2" />
        </svg>
      </div>
    ),
    size
  );
}
