const getPages = (page, total) => {
  if (total <= 1) return [1];

  const set = new Set([1, total, page - 1, page, page + 1]);

  const sorted = [...set]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    if (sorted[i + 1] && sorted[i + 1] - sorted[i] > 1) {
      result.push("...");
    }
  }

  return result;
};

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getPages(page, totalPages);

  return (
    <div className="flex items-center gap-2 justify-center mt-2 md:mt-6">
      <button
        name="prev"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-event-none"
      >
        Prev
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={`page-${p}`}
            name={`page-${p}`}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 border rounded ${
              p === page
                ? "bg-foreground text-background"
                : "hover:bg-muted-foreground"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        name="next"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 border rounded disabled:opacity-40 disabled:pointer-events-none "
      >
        Next
      </button>
    </div>
  );
}
