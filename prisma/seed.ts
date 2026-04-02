// prisma/seed.ts
// Triangulate — News Convergence Engine
// Chunk 2: Source seeding — 75+ outlets across full political spectrum and global regions

import { PrismaClient, BiasCategory, BiasTier, Region } from '@prisma/client'

const prisma = new PrismaClient()

const sources = [
  // ═══════════════════════════════════════════════════════════════════
  // US SOURCES (30)
  // Bias calibrated to US Overton window
  // ═══════════════════════════════════════════════════════════════════

  // ─────────────────────────── FAR LEFT ───────────────────────────
  {
    name: 'AlterNet',
    url: 'https://www.alternet.org',
    rssFeedUrl: 'https://www.alternet.org/feeds/feed.rss',
    biasCategory: BiasCategory.LEFT,
    biasTier: BiasTier.FAR_LEFT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'Jacobin',
    url: 'https://jacobin.com',
    rssFeedUrl: 'https://jacobin.com/feed/',
    biasCategory: BiasCategory.LEFT,
    biasTier: BiasTier.FAR_LEFT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'The Intercept',
    url: 'https://theintercept.com',
    rssFeedUrl: 'https://theintercept.com/feed/?rss',
    biasCategory: BiasCategory.LEFT,
    biasTier: BiasTier.FAR_LEFT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'Democracy Now!',
    url: 'https://www.democracynow.org',
    rssFeedUrl: 'https://www.democracynow.org/democracynow.rss',
    biasCategory: BiasCategory.LEFT,
    biasTier: BiasTier.FAR_LEFT,
    region: Region.US,
    affiliateUrl: null,
  },

  // ─────────────────────────── LEFT ───────────────────────────────
  {
    name: 'MSNBC',
    url: 'https://www.msnbc.com',
    rssFeedUrl: 'https://feeds.nbcnews.com/nbcnews/public/news',
    biasCategory: BiasCategory.LEFT,
    biasTier: BiasTier.LEFT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'The Guardian US',
    url: 'https://www.theguardian.com/us',
    rssFeedUrl: 'https://www.theguardian.com/us/rss',
    biasCategory: BiasCategory.LEFT,
    biasTier: BiasTier.LEFT,
    region: Region.US,
    affiliateUrl: 'https://support.theguardian.com/subscribe',
  },
  {
    name: 'Vox',
    url: 'https://www.vox.com',
    rssFeedUrl: 'https://www.vox.com/rss/index.xml',
    biasCategory: BiasCategory.LEFT,
    biasTier: BiasTier.LEFT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'HuffPost',
    url: 'https://www.huffpost.com',
    rssFeedUrl: 'https://www.huffpost.com/section/front-page/feed',
    biasCategory: BiasCategory.LEFT,
    biasTier: BiasTier.LEFT,
    region: Region.US,
    affiliateUrl: null,
  },

  // ─────────────────────────── CENTER LEFT ────────────────────────
  {
    name: 'New York Times',
    url: 'https://www.nytimes.com',
    rssFeedUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.US,
    affiliateUrl: 'https://www.nytimes.com/subscription',
  },
  {
    name: 'Washington Post',
    url: 'https://www.washingtonpost.com',
    rssFeedUrl: 'https://feeds.washingtonpost.com/rss/national',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.US,
    affiliateUrl: 'https://subscribe.washingtonpost.com',
  },
  {
    name: 'CNN',
    url: 'https://www.cnn.com',
    rssFeedUrl: 'http://rss.cnn.com/rss/cnn_topstories.rss',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'NPR',
    url: 'https://www.npr.org',
    rssFeedUrl: 'https://feeds.npr.org/1001/rss.xml',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.US,
    affiliateUrl: null,
  },

  // ─────────────────────────── CENTER ─────────────────────────────
  {
    name: 'Associated Press',
    url: 'https://apnews.com',
    rssFeedUrl: 'https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.US,
    affiliateUrl: null,
    isWireService: true,
    // AP killed their native RSS; Google News RSS filtered by site is the fallback
  },
  {
    name: 'Reuters',
    url: 'https://www.reuters.com',
    rssFeedUrl: 'https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.US,
    affiliateUrl: null,
    isWireService: true,
    // Reuters blocks direct RSS; Google News RSS filtered by site is the fallback
  },
  {
    name: 'BBC News',
    url: 'https://www.bbc.com/news',
    rssFeedUrl: 'https://feeds.bbci.co.uk/news/rss.xml',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'PBS NewsHour',
    url: 'https://www.pbs.org/newshour',
    rssFeedUrl: 'https://www.pbs.org/newshour/feeds/rss/headlines',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'C-SPAN',
    url: 'https://www.c-span.org',
    rssFeedUrl: 'https://news.google.com/rss/search?q=site:c-span.org&hl=en-US&gl=US&ceid=US:en',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.US,
    affiliateUrl: null,
    // C-SPAN killed their podcast RSS; Google News RSS is the fallback
  },

  // ─────────────────────────── CENTER RIGHT ───────────────────────
  {
    name: 'Wall Street Journal',
    url: 'https://www.wsj.com',
    rssFeedUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    biasCategory: BiasCategory.CENTER_RIGHT,
    biasTier: BiasTier.CENTER_RIGHT,
    region: Region.US,
    affiliateUrl: 'https://subscribe.wsj.com',
  },
  {
    name: 'The Economist',
    url: 'https://www.economist.com',
    rssFeedUrl: 'https://www.economist.com/united-states/rss.xml',
    biasCategory: BiasCategory.CENTER_RIGHT,
    biasTier: BiasTier.CENTER_RIGHT,
    region: Region.US,
    affiliateUrl: 'https://www.economist.com/subscribe',
  },
  {
    name: 'Forbes',
    url: 'https://www.forbes.com',
    rssFeedUrl: 'https://www.forbes.com/most-popular/feed/',
    biasCategory: BiasCategory.CENTER_RIGHT,
    biasTier: BiasTier.CENTER_RIGHT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'The Hill',
    url: 'https://thehill.com',
    rssFeedUrl: 'https://thehill.com/feed/',
    biasCategory: BiasCategory.CENTER_RIGHT,
    biasTier: BiasTier.CENTER_RIGHT,
    region: Region.US,
    affiliateUrl: null,
  },

  // ─────────────────────────── RIGHT ──────────────────────────────
  {
    name: 'Fox News',
    url: 'https://www.foxnews.com',
    rssFeedUrl: 'https://moxie.foxnews.com/google-publisher/latest.xml',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.RIGHT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'Daily Wire',
    url: 'https://www.dailywire.com',
    rssFeedUrl: 'https://news.google.com/rss/search?q=site:dailywire.com&hl=en-US&gl=US&ceid=US:en',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.RIGHT,
    region: Region.US,
    affiliateUrl: 'https://www.dailywire.com/subscribe',
    // Native feed was malformed XML; using Google News RSS fallback
  },
  {
    name: 'New York Post',
    url: 'https://nypost.com',
    rssFeedUrl: 'https://nypost.com/feed/',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.RIGHT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'National Review',
    url: 'https://www.nationalreview.com',
    rssFeedUrl: 'https://www.nationalreview.com/feed/',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.RIGHT,
    region: Region.US,
    affiliateUrl: 'https://www.nationalreview.com/subscribe',
  },

  // ─────────────────────────── FAR RIGHT ──────────────────────────
  {
    name: 'Breitbart',
    url: 'https://www.breitbart.com',
    rssFeedUrl: 'https://feeds.feedburner.com/breitbart',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.FAR_RIGHT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'Newsmax',
    url: 'https://www.newsmax.com',
    rssFeedUrl: 'https://www.newsmax.com/rss/Newsfront/1/',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.FAR_RIGHT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'The Epoch Times',
    url: 'https://www.theepochtimes.com',
    rssFeedUrl: 'https://news.google.com/rss/search?q=site:theepochtimes.com&hl=en-US&gl=US&ceid=US:en',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.FAR_RIGHT,
    region: Region.US,
    affiliateUrl: 'https://www.theepochtimes.com/subscribe',
    // Native RSS was 404; using Google News RSS fallback
  },
  {
    name: 'OANN',
    url: 'https://www.oann.com',
    rssFeedUrl: 'https://www.oann.com/feed/',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.FAR_RIGHT,
    region: Region.US,
    affiliateUrl: null,
  },
  {
    name: 'Gateway Pundit',
    url: 'https://www.thegatewaypundit.com',
    rssFeedUrl: 'https://news.google.com/rss/search?q=site:thegatewaypundit.com&hl=en-US&gl=US&ceid=US:en',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.FAR_RIGHT,
    region: Region.US,
    affiliateUrl: null,
    // Native feed returned 403; using Google News RSS fallback
  },

  // ═══════════════════════════════════════════════════════════════════
  // UK SOURCES (5)
  // Bias calibrated to UK political center
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com',
    rssFeedUrl: 'https://www.theguardian.com/world/rss',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.LEFT,
    region: Region.UK,
    affiliateUrl: null,
    // Left of UK center; editorially progressive
  },
  {
    name: 'BBC World',
    url: 'https://www.bbc.com/news/world',
    rssFeedUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.UK,
    affiliateUrl: null,
  },
  {
    name: 'The Telegraph',
    url: 'https://www.telegraph.co.uk',
    rssFeedUrl: 'https://www.telegraph.co.uk/rss.xml',
    biasCategory: BiasCategory.CENTER_RIGHT,
    biasTier: BiasTier.CENTER_RIGHT,
    region: Region.UK,
    affiliateUrl: 'https://www.telegraph.co.uk/all-sections/',
  },
  {
    name: 'Sky News',
    url: 'https://news.sky.com',
    rssFeedUrl: 'https://feeds.skynews.com/feeds/rss/home.xml',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.UK,
    affiliateUrl: null,
  },
  {
    name: 'Daily Mail',
    url: 'https://www.dailymail.co.uk',
    rssFeedUrl: 'https://www.dailymail.co.uk/articles.rss',
    biasCategory: BiasCategory.RIGHT,
    biasTier: BiasTier.RIGHT,
    region: Region.UK,
    affiliateUrl: null,
    // Right-populist in UK context
  },

  // ═══════════════════════════════════════════════════════════════════
  // EUROPE SOURCES (6)
  // Bias calibrated to each country's center
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'Der Spiegel',
    url: 'https://www.spiegel.de',
    rssFeedUrl: 'https://www.spiegel.de/international/index.rss',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.EUROPE,
    affiliateUrl: null,
    // Germany — centre-left editorially
  },
  {
    name: 'Deutsche Welle',
    url: 'https://www.dw.com',
    rssFeedUrl: 'https://rss.dw.com/rdf/rss-en-all',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.EUROPE,
    affiliateUrl: null,
    // Germany — public broadcaster, center
  },
  {
    name: 'France 24',
    url: 'https://www.france24.com/en/',
    rssFeedUrl: 'https://www.france24.com/en/rss',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.EUROPE,
    affiliateUrl: null,
    // France — state-funded international, center
  },
  {
    name: 'EuroNews',
    url: 'https://www.euronews.com',
    rssFeedUrl: 'https://www.euronews.com/rss',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.EUROPE,
    affiliateUrl: null,
  },
  {
    name: 'Irish Times',
    url: 'https://www.irishtimes.com',
    rssFeedUrl: 'https://www.irishtimes.com/cmlink/news-1.1319192',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.EUROPE,
    affiliateUrl: 'https://www.irishtimes.com/subscribe',
    // Ireland — centrist paper of record
  },
  {
    name: 'The Local',
    url: 'https://www.thelocal.com',
    rssFeedUrl: 'https://feeds.thelocal.com/rss/se',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.EUROPE,
    affiliateUrl: null,
    // Pan-European English-language news
    isActive: false, // Feed URL uncertain — verify before enabling
  },

  // ═══════════════════════════════════════════════════════════════════
  // MIDDLE EAST SOURCES (4)
  // Bias calibrated to regional center
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com',
    rssFeedUrl: 'https://www.aljazeera.com/xml/rss/all.xml',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.MIDDLE_EAST,
    affiliateUrl: null,
    // Qatar-funded; progressive-leaning relative to regional center
  },
  {
    name: 'Al-Monitor',
    url: 'https://www.al-monitor.com',
    rssFeedUrl: 'https://www.al-monitor.com/rss',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.MIDDLE_EAST,
    affiliateUrl: null,
    isActive: false, // RSS URL uncertain — verify before enabling
  },
  {
    name: 'Times of Israel',
    url: 'https://www.timesofisrael.com',
    rssFeedUrl: 'https://www.timesofisrael.com/feed/',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.MIDDLE_EAST,
    affiliateUrl: null,
  },
  {
    name: 'Arab News',
    url: 'https://www.arabnews.com',
    rssFeedUrl: 'https://www.arabnews.com/rss.xml',
    biasCategory: BiasCategory.CENTER_RIGHT,
    biasTier: BiasTier.CENTER_RIGHT,
    region: Region.MIDDLE_EAST,
    affiliateUrl: null,
    // Saudi-owned; center-right relative to regional center
  },

  // ═══════════════════════════════════════════════════════════════════
  // ASIA-PACIFIC SOURCES (5)
  // Bias calibrated to each country/region's center
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'South China Morning Post',
    url: 'https://www.scmp.com',
    rssFeedUrl: 'https://www.scmp.com/rss/91/feed',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.ASIA_PACIFIC,
    affiliateUrl: null,
    // Hong Kong — broad coverage, centrist framing
  },
  {
    name: 'The Japan Times',
    url: 'https://www.japantimes.co.jp',
    rssFeedUrl: 'https://www.japantimes.co.jp/feed/',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.ASIA_PACIFIC,
    affiliateUrl: null,
  },
  {
    name: 'The Hindu',
    url: 'https://www.thehindu.com',
    rssFeedUrl: 'https://www.thehindu.com/feeder/default.rss',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.ASIA_PACIFIC,
    affiliateUrl: null,
    // India — centre-left by Indian standards
  },
  {
    name: 'ABC News Australia',
    url: 'https://www.abc.net.au/news',
    rssFeedUrl: 'https://www.abc.net.au/news/feed/2942460/rss.xml',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.ASIA_PACIFIC,
    affiliateUrl: null,
    // Australia — public broadcaster
  },
  {
    name: 'Channel News Asia',
    url: 'https://www.channelnewsasia.com',
    rssFeedUrl: 'https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.ASIA_PACIFIC,
    affiliateUrl: null,
    // Singapore — state-linked but factually reliable
  },

  // ═══════════════════════════════════════════════════════════════════
  // CANADA SOURCES (3)
  // Bias calibrated to Canadian political center
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'CBC News',
    url: 'https://www.cbc.ca/news',
    rssFeedUrl: 'https://www.cbc.ca/webfeed/rss/rss-topstories',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.CANADA,
    affiliateUrl: null,
    // Public broadcaster — center in Canadian context
  },
  {
    name: 'Globe and Mail',
    url: 'https://www.theglobeandmail.com',
    rssFeedUrl: 'https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/world/',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.CANADA,
    affiliateUrl: 'https://www.theglobeandmail.com/subscribe/',
    isActive: false, // RSS URL uncertain — verify before enabling
  },
  {
    name: 'National Post',
    url: 'https://nationalpost.com',
    rssFeedUrl: 'https://nationalpost.com/feed/',
    biasCategory: BiasCategory.CENTER_RIGHT,
    biasTier: BiasTier.CENTER_RIGHT,
    region: Region.CANADA,
    affiliateUrl: null,
    // Right-of-center in Canadian context
  },

  // ═══════════════════════════════════════════════════════════════════
  // GLOBAL / WIRE SERVICES (2)
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'AFP',
    url: 'https://www.afp.com',
    rssFeedUrl: 'https://news.google.com/rss/search?q=source:AFP&hl=en-US&gl=US&ceid=US:en',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.GLOBAL,
    affiliateUrl: null,
    isWireService: true,
    // Agence France-Presse — wire service, no native public RSS
  },
  {
    name: 'UN News',
    url: 'https://news.un.org',
    rssFeedUrl: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.GLOBAL,
    affiliateUrl: null,
  },

  // ═══════════════════════════════════════════════════════════════════
  // LATIN AMERICA SOURCES (5)
  // Bias calibrated to regional center
  // English-language outlets covering LatAm
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'Buenos Aires Herald',
    url: 'https://buenosairesherald.com',
    rssFeedUrl: 'https://buenosairesherald.com/feed/',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.LATIN_AMERICA,
    affiliateUrl: null,
    // Argentina — English-language, centrist
  },
  {
    name: 'Mexico News Daily',
    url: 'https://mexiconewsdaily.com',
    rssFeedUrl: 'https://mexiconewsdaily.com/feed/',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.LATIN_AMERICA,
    affiliateUrl: null,
    // Mexico — English-language news
  },
  {
    name: 'Brazil Reports',
    url: 'https://brazilreports.com',
    rssFeedUrl: 'https://news.google.com/rss/search?q=site:brazilreports.com&hl=en-US&gl=US&ceid=US:en',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.LATIN_AMERICA,
    affiliateUrl: null,
    // Brazil — English-language coverage
  },
  {
    name: 'Merco Press',
    url: 'https://en.mercopress.com',
    rssFeedUrl: 'https://en.mercopress.com/rss',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.LATIN_AMERICA,
    affiliateUrl: null,
    // South American news agency — Montevideo-based
  },
  {
    name: 'TeleSUR English',
    url: 'https://www.telesurenglish.net',
    rssFeedUrl: 'https://www.telesurenglish.net/rss/all.xml',
    biasCategory: BiasCategory.LEFT,
    biasTier: BiasTier.LEFT,
    region: Region.LATIN_AMERICA,
    affiliateUrl: null,
    // Venezuela-based; left-leaning pan-Latin American
  },

  // ═══════════════════════════════════════════════════════════════════
  // AFRICA SOURCES (5)
  // Bias calibrated to regional center
  // English-language outlets covering Africa
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'Mail & Guardian',
    url: 'https://mg.co.za',
    rssFeedUrl: 'https://mg.co.za/feed/',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.AFRICA,
    affiliateUrl: null,
    // South Africa — progressive investigative journalism
  },
  {
    name: 'Daily Nation',
    url: 'https://nation.africa',
    rssFeedUrl: 'https://nation.africa/rss.xml',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.AFRICA,
    affiliateUrl: null,
    // Kenya — largest daily in East Africa
    isActive: false, // RSS URL uncertain — verify before enabling
  },
  {
    name: 'The East African',
    url: 'https://www.theeastafrican.co.ke',
    rssFeedUrl: 'https://www.theeastafrican.co.ke/rss.xml',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.AFRICA,
    affiliateUrl: null,
    // Pan-East African weekly — Nairobi-based
    isActive: false, // RSS URL uncertain — verify before enabling
  },
  {
    name: 'AllAfrica',
    url: 'https://allafrica.com',
    rssFeedUrl: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.AFRICA,
    affiliateUrl: null,
    // Pan-African aggregator — 100+ African news sources
  },
  {
    name: 'Premium Times',
    url: 'https://www.premiumtimesng.com',
    rssFeedUrl: 'https://www.premiumtimesng.com/feed',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.AFRICA,
    affiliateUrl: null,
    // Nigeria — investigative, independent
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADDITIONAL MIDDLE EAST SOURCES (3)
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'Haaretz',
    url: 'https://www.haaretz.com',
    rssFeedUrl: 'https://www.haaretz.com/cmlink/1.4614869',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.MIDDLE_EAST,
    affiliateUrl: 'https://www.haaretz.com/misc/subscribe-page',
    // Israel — centre-left, critical of government
  },
  {
    name: 'Middle East Eye',
    url: 'https://www.middleeasteye.net',
    rssFeedUrl: 'https://www.middleeasteye.net/rss',
    biasCategory: BiasCategory.CENTER_LEFT,
    biasTier: BiasTier.LEFT,
    region: Region.MIDDLE_EAST,
    affiliateUrl: null,
    // London-based; progressive-leaning on Middle East affairs
  },
  {
    name: 'The National',
    url: 'https://www.thenationalnews.com',
    rssFeedUrl: 'https://www.thenationalnews.com/rss',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.MIDDLE_EAST,
    affiliateUrl: null,
    // UAE — Abu Dhabi-based, English-language
    isActive: false, // RSS URL uncertain — verify before enabling
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADDITIONAL EUROPE SOURCES (3)
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'Politico Europe',
    url: 'https://www.politico.eu',
    rssFeedUrl: 'https://www.politico.eu/feed/',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.EUROPE,
    affiliateUrl: null,
    // Brussels-based — EU politics and policy
  },
  {
    name: 'The Moscow Times',
    url: 'https://www.themoscowtimes.com',
    rssFeedUrl: 'https://www.themoscowtimes.com/rss/news',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER_LEFT,
    region: Region.EUROPE,
    affiliateUrl: null,
    // Russia — independent English-language (now exiled from Moscow)
  },
  {
    name: 'Kyiv Independent',
    url: 'https://kyivindependent.com',
    rssFeedUrl: 'https://kyivindependent.com/feed/',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.EUROPE,
    affiliateUrl: null,
    // Ukraine — independent English-language
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADDITIONAL ASIA-PACIFIC SOURCES (3)
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'Nikkei Asia',
    url: 'https://asia.nikkei.com',
    rssFeedUrl: 'https://asia.nikkei.com/rss/feed/nar',
    biasCategory: BiasCategory.CENTER_RIGHT,
    biasTier: BiasTier.CENTER_RIGHT,
    region: Region.ASIA_PACIFIC,
    affiliateUrl: null,
    // Japan — business-focused, center-right
  },
  {
    name: 'The Straits Times',
    url: 'https://www.straitstimes.com',
    rssFeedUrl: 'https://www.straitstimes.com/news/asia/rss.xml',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.ASIA_PACIFIC,
    affiliateUrl: null,
    // Singapore — paper of record
    isActive: false, // RSS URL uncertain — verify before enabling
  },
  {
    name: 'Taipei Times',
    url: 'https://www.taipeitimes.com',
    rssFeedUrl: 'https://www.taipeitimes.com/xml/index.rss',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.ASIA_PACIFIC,
    affiliateUrl: null,
    // Taiwan — English-language daily
  },

  // ═══════════════════════════════════════════════════════════════════
  // ADDITIONAL US SOURCES (2)
  // Filling spectrum gaps
  // ═══════════════════════════════════════════════════════════════════

  {
    name: 'Reason',
    url: 'https://reason.com',
    rssFeedUrl: 'https://reason.com/feed/',
    biasCategory: BiasCategory.CENTER_RIGHT,
    biasTier: BiasTier.RIGHT,
    region: Region.US,
    affiliateUrl: null,
    // Libertarian — right on economics, cross-spectrum on civil liberties
  },
  {
    name: 'Bloomberg',
    url: 'https://www.bloomberg.com',
    rssFeedUrl: 'https://news.google.com/rss/search?q=site:bloomberg.com&hl=en-US&gl=US&ceid=US:en',
    biasCategory: BiasCategory.CENTER,
    biasTier: BiasTier.CENTER,
    region: Region.US,
    affiliateUrl: 'https://www.bloomberg.com/subscriptions',
    // Business-center — slightly right on economics, center on politics
  },
]

async function main() {
  console.log('🌱 Seeding Triangulate source database...')
  console.log(`   Total outlets to seed: ${sources.length}`)

  let created = 0
  let skipped = 0

  for (const source of sources) {
    try {
      await prisma.source.upsert({
        where: { name: source.name },
        update: {
          url: source.url,
          rssFeedUrl: source.rssFeedUrl,
          biasCategory: source.biasCategory,
          biasTier: source.biasTier,
          region: source.region,
          affiliateUrl: source.affiliateUrl,
          isActive: (source as any).isActive ?? true,
          isWireService: (source as any).isWireService ?? false,
        },
        create: {
          name: source.name,
          url: source.url,
          rssFeedUrl: source.rssFeedUrl,
          biasCategory: source.biasCategory,
          biasTier: source.biasTier,
          region: source.region,
          affiliateUrl: source.affiliateUrl,
          isActive: (source as any).isActive ?? true,
          isWireService: (source as any).isWireService ?? false,
        },
      })
      created++
      const regionTag = source.region.padEnd(12)
      const tierTag = source.biasTier.padEnd(15)
      console.log(`   ✓ [${regionTag}] ${tierTag} ${source.name}`)
    } catch (err) {
      skipped++
      console.error(`   ✗ Failed: ${source.name}`, err)
    }
  }

  console.log(`\n✅ Seed complete — ${created} upserted, ${skipped} failed`)

  // Print spectrum summary by region
  const regions = [
    'US', 'UK', 'EUROPE', 'MIDDLE_EAST', 'ASIA_PACIFIC',
    'CANADA', 'LATIN_AMERICA', 'AFRICA', 'GLOBAL',
  ] as Region[]

  const tiers = [
    'FAR_LEFT', 'LEFT', 'CENTER_LEFT', 'CENTER',
    'CENTER_RIGHT', 'RIGHT', 'FAR_RIGHT',
  ] as BiasTier[]

  console.log('\n📊 Spectrum distribution by region:')
  for (const region of regions) {
    const regionCount = await prisma.source.count({ where: { region } })
    if (regionCount === 0) continue
    console.log(`\n   ${region} (${regionCount} sources):`)
    for (const tier of tiers) {
      const count = await prisma.source.count({ where: { biasTier: tier, region } })
      if (count === 0) continue
      const bar = '█'.repeat(count)
      console.log(`     ${tier.padEnd(15)} ${bar} (${count})`)
    }
  }

  console.log('\n📊 Overall spectrum:')
  for (const tier of tiers) {
    const count = await prisma.source.count({ where: { biasTier: tier } })
    const bar = '█'.repeat(count)
    console.log(`   ${tier.padEnd(15)} ${bar} (${count})`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
