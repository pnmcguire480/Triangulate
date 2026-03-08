import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000, // 10 second timeout per feed
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

export async function fetchFeed(rssFeedUrl: string): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(rssFeedUrl);
    return (feed.items || []).map((item) => ({
      title: item.title || "Untitled",
      link: item.link || "",
      pubDate: item.pubDate || new Date().toISOString(),
      contentSnippet: item.contentSnippet || item.content || "",
    }));
  } catch (error) {
    console.error(`Failed to fetch feed: ${rssFeedUrl}`, error);
    return [];
  }
}

export default parser;
