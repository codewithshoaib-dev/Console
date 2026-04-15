export default function Avatar({ name, large }) {
  return (
    <div
      className={`rounded-full flex items-center justify-center bg-primary/15 text-primary font-semibold ${
        large ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs"
      }`}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}