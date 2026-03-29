import {
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { getUser } from "~/lib/auth";
import AppShell from "~/components/shell/AppShell";
import "./app.css";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  return {
    user: user
      ? { id: user.id, email: user.email, tier: user.tier, isFounder: user.isFounder }
      : null,
  };
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com", crossOrigin: "anonymous" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap",
  },
];

export const meta: Route.MetaFunction = () => [
  { title: "Triangulate | For those who make, report, research, and consume news" },
  {
    name: "description",
    content:
      "See where news sources agree. Triangulate clusters coverage from across the political spectrum and shows you where the facts converge.",
  },
  {
    name: "keywords",
    content:
      "news, triangulation, media bias, convergence, trust, fact checking, primary sources",
  },
  {
    property: "og:title",
    content: "Triangulate | For those who make, report, research, and consume news",
  },
  {
    property: "og:description",
    content: "See where news sources agree. Find the signal in the noise.",
  },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
  {
    name: "twitter:title",
    content: "Triangulate | For those who make, report, research, and consume news",
  },
  {
    name: "twitter:description",
    content: "See where news sources agree. Find the signal in the noise.",
  },
];

// Inline script to prevent flash of wrong theme on page load
const themeScript = `
  (function() {
    var t = localStorage.getItem('triangulate-theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body className="h-screen overflow-hidden bg-paper text-ink font-body antialiased transition-colors duration-300">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <a href="#feed" className="skip-link">Skip to feed</a>
        <a href="#filters" className="skip-link">Skip to filters</a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const user = loaderData?.user || null;

  return <AppShell user={user} />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 — Page Not Found" : `${error.status}`;
    details =
      error.status === 404
        ? "The page you're looking for doesn't exist."
        : error.statusText || details;
  } else if (error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h1 className="text-4xl font-headline font-bold text-ink mb-4">
          {message}
        </h1>
        <p className="text-ink-muted mb-6">{details}</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-brand-green text-ink rounded-sm hover:opacity-90 transition-opacity"
        >
          Back to Feed
        </a>
        {import.meta.env.DEV && stack && (
          <pre className="mt-8 w-full p-4 overflow-x-auto text-left text-sm bg-surface rounded-sm border border-border">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
