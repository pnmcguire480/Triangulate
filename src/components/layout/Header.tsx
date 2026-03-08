"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-brand-warm/95 backdrop-blur-sm border-b border-brand-navy/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col">
            <span className="font-headline text-xl sm:text-2xl font-bold tracking-wider text-brand-navy">
              TRIANGULATE
            </span>
            <span className="text-[10px] tracking-[0.2em] text-brand-navy/50 uppercase -mt-1 hidden sm:block">
              Trust Through Convergence
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-brand-navy/70 hover:text-brand-navy transition-colors"
            >
              Feed
            </Link>
            <Link
              href="/search"
              className="text-sm font-medium text-brand-navy/70 hover:text-brand-navy transition-colors"
            >
              Search
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-brand-navy/70 hover:text-brand-navy transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/auth/signin"
              className="text-sm font-medium px-4 py-2 bg-brand-navy text-brand-warm rounded-md hover:bg-brand-accent transition-colors"
            >
              Sign In
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-brand-navy/70 hover:text-brand-navy"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-brand-navy/10 pt-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm font-medium text-brand-navy/70 hover:text-brand-navy py-1"
                onClick={() => setMenuOpen(false)}
              >
                Feed
              </Link>
              <Link
                href="/search"
                className="text-sm font-medium text-brand-navy/70 hover:text-brand-navy py-1"
                onClick={() => setMenuOpen(false)}
              >
                Search
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-brand-navy/70 hover:text-brand-navy py-1"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/auth/signin"
                className="text-sm font-medium px-4 py-2 bg-brand-navy text-brand-warm rounded-md text-center hover:bg-brand-accent transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
