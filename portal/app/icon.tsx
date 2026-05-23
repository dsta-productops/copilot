import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
          <circle
            cx="10"
            cy="10"
            r="7.5"
            stroke="#2563eb"
            strokeWidth="1.5"
          />
          <circle cx="10" cy="10" r="2" fill="#2563eb" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
