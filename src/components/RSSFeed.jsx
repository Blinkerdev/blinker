import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const FEEDS = [
  { label: 'Hacker News'  },
  { label: 'Ars Technica' },
  { label: 'NPR News'     },
]

export default function RSSFeed({ theme, onTextReady }) {
  const [activeFeed,     setActiveFeed]     = useState(FEEDS[0])
  const [headlines,      setHeadlines]      = useState([])
  const [loadingFeed,    setLoadingFeed]    = useState(false)
  const [loadingArticle, setLoadingArticle] = useState(null)
  const [error,          setError]          = useState('')

  useEffect(() => {
    let cancelled = false
    setLoadingFeed(true)
    setHeadlines([])
    setError('')

    supabase
      .from('headlines')
      .select('*')
      .eq('feed', activeFeed.label)
      .order('pub_date', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setError('Could not load headlines.')
        } else {
          setHeadlines(data ?? [])
        }
        setLoadingFeed(false)
      })

    return () => { cancelled = true }
  }, [activeFeed])

  const handleHeadlineClick = async (item) => {
    if (!item.link) return
    setLoadingArticle(item.link)
    setError('')

    // Use the description from the database — no external fetch needed
    try {
      const parser  = new DOMParser()
      const doc     = parser.parseFromString(item.description ?? '', 'text/html')
      const text    = doc.body.textContent ?? ''
      const cleaned = text.replace(/\s+/g, ' ').trim()

      if (cleaned.length > 30) {
        onTextReady(item.title + '. ' + cleaned)
      } else {
        setError('Article preview not available for this headline.')
      }
    } catch {
      setError('Could not load this article.')
    }

    setLoadingArticle(null)
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-3">

      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 text-xs uppercase tracking-widest" style={{ color: theme.textFaint }}>
          📰 News
        </div>
        <div className="flex-1 h-px" style={{ background: theme.border }} />
      </div>

      {/* Feed tabs */}
      <div className="flex gap-2 flex-wrap">
        {FEEDS.map(feed => {
          const isActive = activeFeed.label === feed.label
          return (
            <button
              key={feed.label}
              onClick={() => setActiveFeed(feed)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: isActive ? theme.accent : theme.bgCard,
                border:     `1px solid ${isActive ? theme.accent : theme.border}`,
                color:      isActive ? '#ffffff' : theme.textMuted,
                boxShadow:  isActive ? `0 0 10px ${theme.accent}44` : 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = theme.accent
                  e.currentTarget.style.color       = theme.accent
                  e.currentTarget.style.boxShadow   = `0 0 8px ${theme.accent}33`
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = theme.border
                  e.currentTarget.style.color       = theme.textMuted
                  e.currentTarget.style.boxShadow   = 'none'
                }
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)' }}
              onMouseUp={e =>   { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {feed.label}
            </button>
          )
        })}
      </div>

      {/* Headlines list */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col divide-y"
        style={{
          background: theme.bgCard,
          border:     `1px solid ${theme.border}`,
        }}
      >
        {loadingFeed && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm animate-pulse" style={{ color: theme.textMuted }}>
              Loading headlines...
            </p>
          </div>
        )}

        {!loadingFeed && headlines.map((item, i) => {
          const isLoading = loadingArticle === item.link
          return (
            <button
              key={i}
              onClick={() => handleHeadlineClick(item)}
              disabled={!!loadingArticle}
              className="w-full text-left px-4 py-3 transition-all duration-150 flex items-center justify-between gap-3"
              style={{
                background: 'transparent',
                opacity:    loadingArticle && !isLoading ? 0.4 : 1,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background  = theme.bg
                e.currentTarget.style.paddingLeft = '20px'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background  = 'transparent'
                e.currentTarget.style.paddingLeft = '16px'
              }}
            >
              <span className="text-sm leading-snug" style={{ color: theme.textPrimary }}>
                {item.title}
              </span>
              <span className="flex-shrink-0 text-xs" style={{ color: theme.accent }}>
                {isLoading ? 'Loading...' : '▶'}
              </span>
            </button>
          )
        })}

        {!loadingFeed && headlines.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm" style={{ color: theme.textMuted }}>
              No headlines found.
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-xs px-1">{error}</p>}

    </div>
  )
}