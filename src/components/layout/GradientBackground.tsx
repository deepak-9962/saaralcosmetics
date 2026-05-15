export default function GradientBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(207,188,255,0.3)_0%,transparent_70%)] blur-[100px]" style={{ animation: 'pulse-soft 8s ease-in-out infinite' }} />
      <div className="absolute bottom-[10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(103,80,164,0.15)_0%,transparent_70%)] blur-[120px]" />
      <div className="absolute top-[20%] left-[40%] w-[45%] h-[45%] rounded-full bg-[radial-gradient(circle,rgba(225,212,253,0.4)_0%,transparent_60%)] blur-[80px]" />
      <div className="absolute top-[50%] left-[-15%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,rgba(103,80,164,0.1)_0%,transparent_70%)] blur-[100px]" />
    </div>
  );
}
