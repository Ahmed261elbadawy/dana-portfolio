import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#4A1226",
          color: "#F7F1E6",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#F7D3E0",
            marginBottom: 24,
          }}
        >
          Content Creator · Social Media Marketing · Brand Strategy
        </div>
        <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1 }}>
          Dana Badawy
        </div>
      </div>
    ),
    { ...size },
  );
}
