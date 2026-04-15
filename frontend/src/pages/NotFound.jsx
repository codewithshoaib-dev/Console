import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative text-center max-w-md"
      >
        <p className="text-4xl font-medium text-muted-foreground mb-2">404</p>

        <h1 className="text-5xl font-semibold text-primary tracking-tight mb-4">
          Lost in space
        </h1>

        <p className="text-muted-foreground mb-8">
          This page drifted away or never existed in the first place.
        </p>

        <div className="flex items-center justify-center gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium bg-primary text-heading hover:opacity-90 transition"
          >
            Back to home
          </a>

          <button
            name="go-back"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center text-foreground rounded-xl px-5 py-2.5 text-sm font-medium border border-border hover:bg-muted transition"
          >
            Go back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
