export default function SearchInput({
  search,
  setSearch,
  searchName,
  placeholder,
  width = "w-full"
}) {
  return (
    <input
      name={searchName}
      type="text"
      placeholder={placeholder}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className={`
        ${width}
        px-4 py-2.5
        rounded-xl
        border border-border
        bg-card text-foreground placeholder:text-muted-foreground
        focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50
        transition-all duration-200
        text-sm
      `}
    />
  );
}
