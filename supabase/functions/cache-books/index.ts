import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? ''
    )

    const res  = await fetch('https://gutendex.com/books/?languages=en&topic=fiction')
    const data = await res.json()

    let successCount = 0
    let failCount    = 0
    const errors: string[] = []

    for (const book of data.results.slice(0, 20)) {
      const textUrl =
        book.formats['text/plain; charset=us-ascii'] ||
        book.formats['text/plain; charset=utf-8']    ||
        book.formats['text/plain']

      if (!textUrl) {
        console.log(`No plain text for: ${book.title}`)
        failCount++
        continue
      }

      try {
        const textRes = await fetch(textUrl)
        let text      = await textRes.text()

        // Strip Gutenberg header
        const startMarkers = [
          '*** START OF THE PROJECT GUTENBERG',
          '***START OF THE PROJECT GUTENBERG',
          '*** START OF THIS PROJECT GUTENBERG',
        ]
        const endMarkers = [
          '*** END OF THE PROJECT GUTENBERG',
          '***END OF THE PROJECT GUTENBERG',
          '*** END OF THIS PROJECT GUTENBERG',
        ]

        for (const marker of startMarkers) {
          const idx = text.indexOf(marker)
          if (idx !== -1) {
            text = text.slice(text.indexOf('\n', idx) + 1)
            break
          }
        }
        for (const marker of endMarkers) {
          const idx = text.indexOf(marker)
          if (idx !== -1) {
            text = text.slice(0, idx)
            break
          }
        }

        text = text.replace(/\s+/g, ' ').trim()

        const { error } = await supabase.from('books').upsert({
          gutenberg_id: book.id,
          title:        book.title,
          author:       book.authors?.[0]?.name ?? 'Unknown',
          text,
          cached_at:    new Date().toISOString(),
        }, { onConflict: 'gutenberg_id' })

        if (error) {
          console.error(`DB error for ${book.title}:`, error)
          errors.push(`${book.title}: ${error.message}`)
          failCount++
        } else {
          console.log(`Cached: ${book.title}`)
          successCount++
        }

      } catch (e) {
        console.error(`Failed to fetch text for ${book.title}:`, e)
        errors.push(`${book.title}: ${String(e)}`)
        failCount++
      }
    }

    return new Response(
      JSON.stringify({ success: true, cached: successCount, failed: failCount, errors }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: String(e) }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})