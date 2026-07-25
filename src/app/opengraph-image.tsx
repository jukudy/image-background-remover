import { ImageResponse } from "next/og";

export const alt = "Clearcut image background remover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", background: "#eaf1e9", color: "#102f28", padding: 72, alignItems: "center", justifyContent: "space-between", fontFamily: "sans-serif" }}><div style={{ display: "flex", flexDirection: "column", width: 720 }}><div style={{ display: "flex", fontSize: 28, fontWeight: 700, marginBottom: 50 }}>clearcut</div><div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>Remove image backgrounds in seconds.</div><div style={{ display: "flex", fontSize: 27, color: "#49675c", marginTop: 30 }}>No signup · No watermark · Transparent PNG</div></div><div style={{ width: 310, height: 390, borderRadius: 42, background: "#143c32", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 35px 70px rgba(16,47,40,.18)" }}><div style={{ width: 130, height: 130, borderRadius: 28, border: "15px solid #b8f36b", display: "flex" }} /></div></div>, size);
}
