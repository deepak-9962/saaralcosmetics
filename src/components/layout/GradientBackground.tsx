export default function GradientBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        zIndex: -10,
        pointerEvents: "none",
      }}
    >
      {/* Top-left — antique rose bloom */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[65%] h-[65%] rounded-full bg-[radial-gradient(circle,rgba(176,96,128,0.30)_0%,transparent_70%)] blur-[110px]"
        style={{
          animation: "drift-1 14s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Bottom-right — lavender/purple */}
      <div
        className="absolute bottom-[5%] right-[-8%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(126,107,154,0.35)_0%,transparent_70%)] blur-[120px]"
        style={{
          animation: "drift-2 18s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Centre — quartz blush pink */}
      <div
        className="absolute top-[28%] left-[35%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(232,189,208,0.26)_0%,transparent_60%)] blur-[100px]"
        style={{
          animation: "drift-3 20s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Left-mid — wisteria purple pastel */}
      <div
        className="absolute top-[50%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[radial-gradient(circle,rgba(180,165,220,0.32)_0%,transparent_70%)] blur-[110px]"
        style={{
          animation: "drift-2 22s ease-in-out infinite reverse",
          willChange: "transform",
        }}
      />
      {/* Top-right corner — lilac touch */}
      <div
        className="absolute top-[2%] right-[5%] w-[35%] h-[35%] rounded-full bg-[radial-gradient(circle,rgba(200,185,235,0.24)_0%,transparent_65%)] blur-[100px]"
        style={{
          animation: "drift-1 25s ease-in-out infinite reverse",
          willChange: "transform",
        }}
      />
    </div>
  );
}
