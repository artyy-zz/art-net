import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#ffffff",
          color: "#061723",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "54px",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg,#f8fcfe 0%,#e8f6fb 100%)",
            border: "1px solid rgba(6,23,35,0.1)",
            borderRadius: "40px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            overflow: "hidden",
            padding: "58px",
            position: "relative",
            width: "100%",
          }}
        >
          <div
            style={{
              background: "#006b96",
              height: "12px",
              left: "58px",
              position: "absolute",
              right: "58px",
              top: "0",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div
              style={{
                color: "#005073",
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: "5px",
                textTransform: "uppercase",
              }}
            >
              Artnet
            </div>
            <div
              style={{
                fontSize: 82,
                fontWeight: 800,
                lineHeight: 0.98,
                maxWidth: "920px",
              }}
            >
              Networks, security and smart systems.
            </div>
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ color: "#061723", fontSize: 34, fontWeight: 800 }}>
                Premium technology infrastructure
              </div>
              <div style={{ color: "#61717c", fontSize: 26 }}>
                cabling | CCTV | smart spaces | support
              </div>
            </div>
            <div
              style={{
                alignItems: "center",
                background: "#006b96",
                borderRadius: "999px",
                color: "white",
                display: "flex",
                fontSize: 28,
                fontWeight: 800,
                height: "92px",
                justifyContent: "center",
                width: "92px",
              }}
            >
              AN
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
