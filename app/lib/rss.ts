import Parser from "rss-parser";

const parser = new Parser({
  timeout: 20000,
  headers: {
    "User-Agent": "Triangulate/1.0 (news-aggregation-research)",
  },
});

export interface ParsedArticle {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
}

// Throws on fetch/parse failure — callers handle isolation
export async function fetchFeed(rssFeedUrl: string): Promise<ParsedArticle[]> {
  const feed = await parser.parseURL(rssFeedUrl);
  return (feed.items || []).map((item) => ({
    title: item.title || "Untitled",
    link: item.link || "",
    pubDate: item.pubDate || new Date().toISOString(),
    contentSnippet: item.contentSnippet || item.content || "",
  }));
}

export default parser;
