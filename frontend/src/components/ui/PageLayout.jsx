export default function PageLayout({ title, children }) {
  return (
    <section className="min-h-screen bg-neutral-950 text-neutral-100 px-6 sm:px-10 py-20">
      <div className="max-w-3xl mx-auto bg-neutral-900/50 backdrop-blur-sm border border-neutral-800/60 rounded-2xl shadow-lg p-8 sm:p-12">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
          {title}
        </h1>
        <div className="space-y-6 text-neutral-300 leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
}
