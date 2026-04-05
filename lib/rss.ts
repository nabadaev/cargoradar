const RSS_FEEDS = [
  { url: 'https://www.maritime-executive.com/rss', name: 'Maritime Executive' },
  { url: 'https://www.tradewindsnews.com/rss', name: 'TradeWinds' },
  { url: 'https://splash247.com/feed/', name: 'Splash247' },
]

const ZONE_KEYWORDS: Record<string, string[]> = {
  'Red Sea / Bab-el-Mandeb': ['red sea', 'houthi', 'bab-el-mandeb', 'yemen'],
  'Strait of Hormuz': ['hormuz', 'iran', 'persian gulf'],
  'Suez Canal': ['suez', 'canal authority'],
  'Strait of Malacca': ['malacca', 'singapore strait'],
  'Cape of Good Hope': ['cape of good hope', 'cape route', 'south africa diversion'],
  'Gulf of Guinea': ['gulf of guinea', 'nigeria piracy', 'west africa piracy'],
  'Strait of Gibraltar': ['gibraltar', 'algeciras'],
  'Port of Rotterdam': ['rotterdam', 'maasvlakte'],
  'Port of Antwerp': ['antwerp', 'port of antwerp'],
  'Port of Hamburg': ['hamburg port', 'hhla'],
  'Port of Piraeus': ['piraeus', 'cosco shipping'],
  'Port of Felixstowe': ['felixstowe'],
}

export interface RssItem {
  title: string
  description: string
  source: string
  publishedAt: string
}

function extractTagContent(xml: string, tag: string): string {
  const openTag = `<${tag}`
  const closeTag = `</${tag}>`
  const start = xml.indexOf(openTag)
  if (start === -1) return ''
  const contentStart = xml.indexOf('>', start) + 1
  const end = xml.indexOf(closeTag, contentStart)
  if (end === -1) return ''
  return xml.slice(contentStart, end).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim()
}

function extractItems(feedXml: string): { title: string; description: string; pubDate: string }[] {
  const items: { title: string; description: string; pubDate: string }[] = []
  let remaining = feedXml
  const itemOpenTag = '<item'
  const itemCloseTag = '</item>'

  while (true) {
    const start = remaining.indexOf(itemOpenTag)
    if (start === -1) break
    const end = remaining.indexOf(itemCloseTag, start)
    if (end === -1) break
    const itemXml = remaining.slice(start, end + itemCloseTag.length)
    items.push({
      title: extractTagContent(itemXml, 'title'),
      description: extractTagContent(itemXml, 'description'),
      pubDate: extractTagContent(itemXml, 'pubDate'),
    })
    remaining = remaining.slice(end + itemCloseTag.length)
  }

  return items
}

export async function fetchMaritimeNews(zoneName: string): Promise<RssItem[]> {
  const keywords = ZONE_KEYWORDS[zoneName] ?? [zoneName.toLowerCase()]
  const allMatches: RssItem[] = []

  for (const feed of RSS_FEEDS) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      let xml: string
      try {
        const response = await fetch(feed.url, { signal: controller.signal })
        if (!response.ok) continue
        xml = await response.text()
      } finally {
        clearTimeout(timeoutId)
      }

      const items = extractItems(xml)

      for (const item of items) {
        const titleLower = item.title.toLowerCase()
        const descLower = item.description.toLowerCase()
        const matches = keywords.some(
          (kw) => titleLower.includes(kw) || descLower.includes(kw),
        )
        if (matches) {
          allMatches.push({
            title: item.title,
            description: item.description,
            source: feed.name,
            publishedAt: item.pubDate
              ? new Date(item.pubDate).toISOString()
              : new Date().toISOString(),
          })
        }
      }
    } catch {
      // Continue to next feed on error (includes AbortError from timeout)
      continue
    }
  }

  // Sort by publishedAt descending, return max 5
  allMatches.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )

  return allMatches.slice(0, 5)
}
