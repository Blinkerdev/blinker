import RSSFeed from './components/RSSFeed'
import BookBrowser from './components/BookBrowser'
import React, { useState } from 'react'
import RSVPReader from './components/RSVPReader'

const SAMPLE_TEXT = `The human brain is a remarkable reading machine. Given the right conditions, it can process written language at speeds that seem almost impossible. Most people read at around 200 to 250 words per minute in their daily lives, scanning newspapers, emails, and social media without giving much thought to the mechanics involved. But the upper limits of reading speed are far higher than most of us ever reach.

Rapid serial visual presentation, or RSVP, is a technique that exploits a simple insight: most of the time we spend reading is wasted on moving our eyes. Every time your gaze jumps from one word to the next, your brain effectively shuts off for a fraction of a second. These tiny interruptions, called saccades, add up. By keeping your eyes fixed on a single point and bringing the words to you instead, RSVP eliminates that wasted movement entirely.

The red letter you see highlighted in each word is called the optimal recognition point. Research into how the eye processes text found that we do not actually read from the first letter of a word to the last. Instead, the brain locks onto a specific anchor point, usually positioned slightly left of centre, and uses that as the key to unlocking the whole word in a single moment of recognition. By aligning every word to that point, RSVP gives your brain exactly what it needs, exactly where it expects it.

Speed reading has a long and somewhat controversial history. In the 1950s and 60s, courses promising to multiply reading speed tenfold became enormously popular. Politicians, executives, and students paid handsomely to learn techniques that seemed almost like a superpower. John F. Kennedy was said to read at over a thousand words per minute. Whether that figure was accurate or simply good marketing is hard to say, but the promise was intoxicating.

Modern research has complicated the picture. Studies suggest that comprehension tends to fall off significantly above around 500 words per minute for most readers. The brain needs time not just to recognise words but to construct meaning from them, to hold earlier sentences in working memory while later ones add context and nuance. Reading is not just decoding. It is understanding.

That said, there is genuine room for improvement beyond where most people currently read. The 200 to 250 words per minute average reflects habit as much as biology. Readers who practise consistently report that comprehension at 350 or even 400 words per minute becomes natural over time. The key is building up gradually rather than jumping straight to the highest speed and hoping for the best.

Think of it like running. A beginning runner who tries to sprint immediately will struggle and give up. One who builds pace slowly over weeks finds that speeds which once felt impossible begin to feel comfortable, even easy. The same principle applies here. Start at a speed where you understand everything comfortably. Nudge it up only when that level feels almost boring.

The content you choose also matters. Dense academic writing, legal documents, or anything requiring careful analysis benefits from slower, more deliberate reading. News articles, novels, and narrative non-fiction tend to flow well at higher speeds once you have some practice. Your brain already knows the patterns of how stories and arguments are structured, which means it can predict and fill in gaps faster than you might expect.

There is something meditative about reading this way once you get used to it. With nothing to look at but the single word appearing before you, distractions fade. You cannot skim ahead, cannot lose your place, cannot let your eyes drift to a footnote. The text demands your full attention, and in return it moves at whatever pace you set. That balance of control and focus is, for many people, surprisingly enjoyable.

Give yourself a few sessions before forming a firm opinion. The first time often feels mechanical and slightly strange. By the third or fourth session, most readers find it clicks. The words start to feel less like individual units and more like a continuous stream of meaning flowing directly into thought. That is the experience worth working towards, and it is closer than you might think.`

export default function App() {
  const [text, setText]       = useState('')
  const [url, setUrl]         = useState('')
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [dark, setDark]       = useState(true)

  const theme = {
    bg:          dark ? '#0f172a' : '#f8fafc',
    bgCard:      dark ? '#1e293b' : '#ffffff',
    bgCardHover: dark ? '#263548' : '#f1f5f9',
    border:      dark ? '#334155' : '#cbd5e1',
    borderHover: dark ? '#60a5fa' : '#3b82f6',
    textPrimary: dark ? '#f1f5f9' : '#0f172a',
    textMuted:   dark ? '#94a3b8' : '#64748b',
    textFaint:   dark ? '#334155' : '#cbd5e1',
    accent:      '#60a5fa',
    accentHover: dark ? '#93c5fd' : '#3b82f6',
  }

  const handleStart = () => {
    if (text.trim()) setStarted(true)
  }

  const handleReset = () => {
    setStarted(false)
    setText('')
    setUrl('')
    setError('')
  }

  const handleFetchUrl = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      )
      const data = await response.json()
      const parser = new DOMParser()
      const doc = parser.parseFromString(data.contents, 'text/html')
      doc.querySelectorAll('script, style, nav, header, footer, aside, iframe, img').forEach(el => el.remove())
      const article =
        doc.querySelector('article') ||
        doc.querySelector('main')    ||
        doc.querySelector('.article-body') ||
        doc.querySelector('.post-content') ||
        doc.body
      const extracted = article.innerText || article.textContent || ''
      const cleaned   = extracted.replace(/\s+/g, ' ').trim()
      if (cleaned.length < 100) {
        setError('Could not extract article text. Try pasting the text directly.')
      } else {
        setText(cleaned)
      }
    } catch (e) {
      setError('Could not fetch that URL. Try pasting the article text directly.')
    }
    setLoading(false)
  }

  if (started) {
    return <RSVPReader text={text} onReset={handleReset} dark={dark} setDark={setDark} theme={theme} />
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 gap-8"
      style={{ background: theme.bg, transition: 'background 0.3s' }}
    >

      {/* Theme toggle */}
      <button
        className="fixed top-4 right-4 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        style={{
          background: theme.bgCard,
          border:     `1px solid ${theme.border}`,
          color:      theme.textMuted,
        }}
        onClick={() => setDark(d => !d)}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = theme.accent
          e.currentTarget.style.color       = theme.accent
          e.currentTarget.style.transform   = 'translateY(-1px)'
          e.currentTarget.style.boxShadow   = `0 0 10px ${theme.accent}33`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = theme.border
          e.currentTarget.style.color       = theme.textMuted
          e.currentTarget.style.transform   = 'translateY(0)'
          e.currentTarget.style.boxShadow   = 'none'
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)' }}
        onMouseUp={e =>   { e.currentTarget.style.transform = 'translateY(-1px)' }}
      >
        {dark ? '☀ Light' : '☾ Dark'}
      </button>

      {/* Logo */}
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
          blink<span style={{ color: theme.accent }}>er</span>
        </h1>
        <p className="mt-2 text-sm tracking-widest uppercase" style={{ color: theme.textMuted }}>
          Read at the speed of thought
        </p>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-4">

        {/* URL fetcher */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200"
            style={{
              background: theme.bgCard,
              border:     `1px solid ${theme.border}`,
              color:      theme.textPrimary,
            }}
            placeholder="Paste an article URL here..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFetchUrl()}
            onFocus={e => {
              e.currentTarget.style.borderColor = theme.accent
              e.currentTarget.style.boxShadow   = `0 0 0 3px ${theme.accent}22`
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = theme.border
              e.currentTarget.style.boxShadow   = 'none'
            }}
          />
          <button
            onClick={handleFetchUrl}
            disabled={!url.trim() || loading}
            className="px-4 rounded-xl text-sm font-bold text-white transition-all duration-200"
            style={{
              background: url.trim() && !loading ? theme.accent : theme.textFaint,
              boxShadow:  url.trim() && !loading ? `0 0 14px ${theme.accent}55` : 'none',
            }}
            onMouseEnter={e => {
              if (url.trim() && !loading) {
                e.currentTarget.style.boxShadow = `0 0 22px ${theme.accent}88`
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = url.trim() && !loading ? `0 0 14px ${theme.accent}55` : 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)' }}
            onMouseUp={e =>   { e.currentTarget.style.transform = 'translateY(-1px)' }}
          >
            {loading ? '...' : 'Fetch'}
          </button>
        </div>

        {error && <p className="text-red-400 text-xs px-1">{error}</p>}

        {/* RSS Feed */}
<RSSFeed
  theme={theme}
  onTextReady={text => {
    setText(text)
    setStarted(true)
  }}
/>

<BookBrowser
  theme={theme}
  onTextReady={(text, title) => {
    setText(text)
    setStarted(true)
  }}
/>

<div className="flex items-center gap-3 text-xs" style={{ color: theme.textFaint }}>
  <div className="flex-1 h-px" style={{ background: theme.border }} />
  <span>or paste text directly</span>
  <div className="flex-1 h-px" style={{ background: theme.border }} />
</div>

        {/* Textarea */}
        <textarea
          className="w-full h-48 rounded-xl p-4 text-sm resize-none focus:outline-none transition-all duration-200"
          style={{
            background: theme.bgCard,
            border:     `1px solid ${theme.border}`,
            color:      theme.textPrimary,
          }}
          placeholder="...or paste any article or text here"
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={e => {
            e.currentTarget.style.borderColor = theme.accent
            e.currentTarget.style.boxShadow   = `0 0 0 3px ${theme.accent}22`
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = theme.border
            e.currentTarget.style.boxShadow   = 'none'
          }}
        />

        <div className="flex gap-3">

          {/* Start Reading */}
          <button
            onClick={handleStart}
            disabled={!text.trim()}
            className="flex-1 font-bold py-3 rounded-xl transition-all duration-200 text-white"
            style={{
              background: text.trim() ? theme.accent : theme.textFaint,
              boxShadow:  text.trim() ? `0 0 20px ${theme.accent}55` : 'none',
            }}
            onMouseEnter={e => {
              if (text.trim()) {
                e.currentTarget.style.boxShadow = `0 0 32px ${theme.accent}88`
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = text.trim() ? `0 0 20px ${theme.accent}55` : 'none'
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
            }}
            onMouseDown={e => {
              if (text.trim()) {
                e.currentTarget.style.transform = 'translateY(1px) scale(0.99)'
                e.currentTarget.style.boxShadow = `0 0 10px ${theme.accent}33`
              }
            }}
            onMouseUp={e => {
              if (text.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)'
                e.currentTarget.style.boxShadow = `0 0 32px ${theme.accent}88`
              }
            }}
          >
            Start Reading
          </button>

          {/* Try Sample */}
          <button
            onClick={() => setText(SAMPLE_TEXT)}
            className="px-4 rounded-xl transition-all duration-200 text-sm"
            style={{
              background: theme.bgCard,
              border:     `1px solid ${theme.border}`,
              color:      theme.textMuted,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = theme.accent
              e.currentTarget.style.color       = theme.accent
              e.currentTarget.style.transform   = 'translateY(-1px)'
              e.currentTarget.style.boxShadow   = `0 0 10px ${theme.accent}33`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = theme.border
              e.currentTarget.style.color       = theme.textMuted
              e.currentTarget.style.transform   = 'translateY(0)'
              e.currentTarget.style.boxShadow   = 'none'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)' }}
            onMouseUp={e =>   { e.currentTarget.style.transform = 'translateY(-1px)' }}
          >
            Try Sample
          </button>

        </div>
      </div>
    </div>
  )
}