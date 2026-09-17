import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "#10120f", color: "#f5f5ed", fontFamily: "sans-serif", padding: 80 }}>
        <div style={{ display: "flex", alignItems: "center", fontSize: 26, color: "#5ec4b4", fontWeight: 800, letterSpacing: 6, marginBottom: 24 }}>DON&apos;T PAY. JUST PLAY.</div>
        <div style={{ display: "flex", fontSize: 150, fontWeight: 900, lineHeight: 1 }}>DROPS<span style={{ color: "#5ec4b4" }}>.</span></div>
        <div style={{ display: "flex", fontSize: 30, color: "#999f94", marginTop: 34, maxWidth: 820 }}>{siteConfig.description}</div>
      </div>
    ),
    { ...size },
  );
}
