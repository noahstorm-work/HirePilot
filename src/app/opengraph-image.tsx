import { ImageResponse } from "next/og"

export const runtime = "edge"

export default function ImageResponseHandler() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0a1a 0%, #1a1030 40%, #0d1117 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "500px",
            height: "350px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            right: "10%",
            width: "300px",
            height: "250px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "72px",
            height: "72px",
            borderRadius: "18px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            boxShadow: "0 0 40px rgba(124,58,237,0.4)",
            marginBottom: "28px",
            position: "relative",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: "800",
            color: "white",
            letterSpacing: "-2px",
            lineHeight: "1.1",
            textAlign: "center",
            position: "relative",
          }}
        >
          HirePilot AI
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "22px",
            color: "#a1a1aa",
            marginTop: "16px",
            textAlign: "center",
            position: "relative",
          }}
        >
          Your AI Co-Pilot For Getting Hired
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "36px",
            position: "relative",
          }}
        >
          {["Career Analysis", "Job Matching", "Interview Coach", "ATS Checker"].map(
            (feature) => (
              <div
                key={feature}
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  border: "1px solid rgba(124,58,237,0.3)",
                  background: "rgba(124,58,237,0.1)",
                  color: "#c4b5fd",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {feature}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
