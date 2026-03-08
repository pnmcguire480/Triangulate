export default function SearchPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
      <h1 className="font-headline text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
        Triangulate a Story
      </h1>
      <p className="text-brand-navy/50 mb-8">
        Paste a headline, URL, or topic to see how it looks from every angle.
      </p>
      <div className="max-w-xl mx-auto">
        <input
          type="text"
          placeholder="Paste a headline, URL, or topic..."
          className="w-full px-4 py-3 rounded-lg border border-brand-navy/15 bg-white text-brand-navy placeholder:text-brand-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy/30 text-sm"
          disabled
        />
        <p className="text-xs text-brand-navy/30 mt-4">
          Full search & triangulation coming in Chunk 8.
        </p>
      </div>
    </div>
  );
}
