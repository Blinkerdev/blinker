import React, { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function BookBrowser({ theme, onTextReady }) {
  const [query,       setQuery]       = useState('')
  const [books,       setBooks]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingBook, setLoadingBook] = useState(null)
  const [error,       setError]       = useState('')

  const loadBooks = async (searchQuery = '') => {
    setLoading(true)
    setError('')

    let q = supabase
      .from('books')
      .select('gutenberg_id, title, author')
      .limit(8)

    if (searchQuery.trim()) {
      q = q.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
    }

    const { data, error } = await q

    if (error) {
      setError('Could not load books.')
    } else {
      setBooks(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadBooks()
  }, [])

  const handleSearch = e => {
    e.preventDefault()
    loadBooks(query)
  }

  const handleBookClick = async (book) => {
    setLoadingBook(book.gutenberg_id)
    setError('')

    const { data, error } = await supabase
      .from('books')
      .select('text')
      .eq('gutenberg_id', book.gutenberg_id)
      .single()

    if (error || !data?.text) {
      setError('Could not load this book. Try another.')
    } else {
      onTextReady(data.text, book.title)
    }

    setLoadingBook(null)
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-3">

      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 text-xs uppercase tracking-widest" style={{ color: theme.textFaint }}>
          📚 Classic Books
        </div>
        <div className="flex-1 h-px" style={{ background: theme.border }} />
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          className="flex-1 rounded-xl px-4 py-2 text-sm focus:outline-none transition-all duration-200"
          style={{
            background: theme.bgCard,
            border:     `1px solid ${theme.border}`,
            color:      theme.textPrimary,
          }}
          placeholder="Search by title or author..."
          value={query}
          onChange={e => setQuery(e.target.value)}
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
          type="submit"
          className="px-4 rounded-xl text-sm font-bold text-white transition-all duration-200"
          style={{
            background: theme.accent,
            boxShadow:  `0 0 14px ${theme.accent}55`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 0 22px ${theme.accent}88`
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = `0 0 14px ${theme.accent}55`
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)' }}
          onMouseUp={e =>   { e.currentTarget.style.transform = 'translateY(-1px)' }}
        >
          Search
        </button>
      </form>

      {/* Book list */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col divide-y"
        style={{
          background: theme.bgCard,
          border:     `1px solid ${theme.border}`,
        }}
      >
        {loading && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm animate-pulse" style={{ color: theme.textMuted }}>
              Loading books...
            </p>
          </div>
        )}

        {!loading && books.map(book => {
          const isLoading = loadingBook === book.gutenberg_id
          return (
            <button
              key={book.gutenberg_id}
              onClick={() => handleBookClick(book)}
              disabled={!!loadingBook}
              className="w-full text-left px-4 py-3 transition-all duration-150 flex items-center justify-between gap-3"
              style={{
                background: 'transparent',
                opacity:    loadingBook && !isLoading ? 0.4 : 1,
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
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
                  {book.title}
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>
                  {book.author}
                </span>
              </div>
              <span className="flex-shrink-0 text-xs" style={{ color: theme.accent }}>
                {isLoading ? 'Loading...' : '▶'}
              </span>
            </button>
          )
        })}

        {!loading && books.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm" style={{ color: theme.textMuted }}>
              No books found. Try a different search.
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-xs px-1">{error}</p>}

    </div>
  )
}