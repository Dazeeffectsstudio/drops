import { ImageResponse } from "next/og";
import { formatPrice } from "@/lib/offers";
import { getOfferById } from "@/lib/offers-repository";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOfferById(id);

  const title = offer?.title ?? "Offre gratuite";
  const store = offer?.store ?? "DROPS";
  const originalPrice = offer?.originalPrice != null ? formatPrice(offer.originalPrice) : null;
  const expiresLabel = offer
    ? new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "long" }).format(new Date(offer.expiresAt))
    : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#10120f", color: "#f5f5ed", fontFamily: "sans-serif", padding: 70 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 900 }}>DROPS<span style={{ color: "#4df0e0" }}>.</span></div>
          <div style={{ display: "flex", fontSize: 24, color: "#4df0e0", fontWeight: 800, background: "#1b1e1a", padding: "10px 26px", borderRadius: 999 }}>{store}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 900, lineHeight: 1.08, maxWidth: 1000 }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 36 }}>
            {originalPrice && <div style={{ display: "flex", fontSize: 32, color: "#999f94", textDecoration: "line-through" }}>{originalPrice}</div>}
            <div style={{ display: "flex", fontSize: 46, color: "#4df0e0", fontWeight: 900 }}>GRATUIT</div>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#999f94" }}>{expiresLabel ? `Jusqu'au ${expiresLabel}` : "DROPS — Don't pay. Just play."}</div>
      </div>
    ),
    { ...size },
  );
}
