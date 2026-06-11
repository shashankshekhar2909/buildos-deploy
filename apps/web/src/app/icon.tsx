import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#4f46e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Rocket shape via simple polygon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2C12 2 7 7 7 13c0 2.76 2.24 5 5 5s5-2.24 5-5c0-6-5-11-5-11z"
            fill="white"
            opacity="0.9"
          />
          <path
            d="M9 17.5C9 17.5 7.5 19 6 20.5L8 21.5 9 20z"
            fill="white"
            opacity="0.7"
          />
          <path
            d="M15 17.5C15 17.5 16.5 19 18 20.5L16 21.5 15 20z"
            fill="white"
            opacity="0.7"
          />
          <circle cx="12" cy="12" r="2" fill="#4f46e5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
