export default function StoryPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-headline text-3xl font-bold text-brand-navy mb-4">
        Story View
      </h1>
      <p className="text-brand-navy/50">
        Story ID: {params.id}
      </p>
      <p className="text-brand-navy/50 mt-2">
        Full convergence panel, claims tracker, and primary sources coming in Chunk 7.
      </p>
    </div>
  );
}
