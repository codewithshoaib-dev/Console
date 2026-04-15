export default function Loader() {
  return (
    <div className="flex items-center justify-center h-screen bg-black p-10">
      <div className="relative size-16">
        {/* Outer Ring - Large segments */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-[spin_1.5s_linear_infinite]" />

        {/* Middle Ring - Faster, dashed */}
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-l-cyan-400 border-dotted animate-[spin_0.8s_linear_infinite_reverse]" />

        {/* Center Core - The "Heartbeat" */}
        <div className="absolute inset-5 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <div className="size-2 rounded-full bg-indigo-500 animate-ping" />
        </div>

        {/* Accent Glow */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-md" />
      </div>
    </div>
  );
}
