export default function SignInPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
      <h1 className="font-headline text-2xl font-bold text-brand-navy mb-2">
        Sign In
      </h1>
      <p className="text-brand-navy/50 text-sm mb-8">
        Join Triangulate — see where the sources agree.
      </p>

      {/* Founder badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-medium mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green signal-pulse" />
        Signing up as a Founder Member — free Standard access for life
      </div>

      <div className="bg-white rounded-lg border border-brand-navy/8 p-6">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full px-4 py-3 rounded-lg border border-brand-navy/15 bg-white text-brand-navy placeholder:text-brand-navy/30 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 text-sm mb-4"
          disabled
        />
        <button
          className="w-full px-4 py-3 bg-brand-navy text-brand-warm rounded-lg font-medium text-sm opacity-50 cursor-not-allowed"
          disabled
        >
          Send Magic Link
        </button>
        <p className="text-xs text-brand-navy/30 mt-4">
          Authentication coming in Chunk 9.
        </p>
      </div>
    </div>
  );
}
