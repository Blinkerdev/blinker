import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const FEEDS = [
  { label: 'Hacker News',  url: 'https://hnrss.org/frontpage' },
  { label: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { label: 'NPR News',     url: 'https://feeds.npr.org/1001/rss.xml' },
]

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))
  return (match?.[1] ?? match?.[2] ?? '').trim()
}

function extractItems(xml: string): any[] {
  const items: any[] = []
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)
  for (const match of itemMatches) {
    const item = match[1]
    items.push({
      title:       extractTag(item, 'title'),
      link:        extractTag(item, 'link') || extractTag(item, 'guid'),
      description: extractTag(item, 'description'),
      pub_date:    extractTag(item, 'pubDate'),
    })
  }
  return items.slice(0, 10)
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const results = []

    for (const feed of FEEDS) {
      try {
        const res  = await fetch(feed.url)
        const text = await res.text()
        const items = extractItems(text)

        const rows = items.map(item => ({
          feed:        feed.label,
          title:       item.title,
          link:        item.link,
          description: item.description,
          pub_date:    item.pub_date ? new Date(item.pub_date).toISOString() : null,
          fetched_at:  new Date().toISOString(),
        }))

        await supabase.from('headlines').delete().eq('feed', feed.label)
        await supabase.from('headlines').insert(rows)

        results.push({ feed: feed.label, count: rows.length })
        console.log(`Refreshed ${feed.label}: ${rows.length} items`)

      } catch (e) {
        console.error(`Failed ${feed.label}:`, e)
        results.push({ feed: feed.label, error: String(e) })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: String(e) }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})