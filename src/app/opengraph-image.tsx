import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { ImageResponse } from "next/og";

export const alt = `${SITE_NAME}, ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Link preview card shown when the site is shared on LinkedIn, WhatsApp, X, etc.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: 96,
          background: "#FDFDFE",
          color: "#0e1015",
        }}
      >
        <div style={{ fontSize: 30, color: "#5f6470" }}>raoufrezouali.com</div>
        <div style={{ fontSize: 104, fontWeight: 700, marginTop: 24, letterSpacing: -3 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", fontSize: 42, marginTop: 20, color: "#0099FF" }}>
          <span style={{ background: "#E0F354", color: "#0e1015", padding: "2px 14px" }}>
            {SITE_TAGLINE}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            height: 8,
            width: 180,
            background: "#0099FF",
          }}
        />
      </div>
    ),
    size,
  );
}
