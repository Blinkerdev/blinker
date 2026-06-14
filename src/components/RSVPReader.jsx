import React, { useState, useEffect, useRef } from 'react'
import WordDisplay from './WordDisplay'
import Controls from './Controls'

function tokenize(text) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 0)
}

function getPauseMultiplier(word) {
  const trimmed = word.trimEnd()
  if (/[.!?…]$/.test(trimmed)) return 2.5
  if (/[,;:\-—–]$/.test(trimmed)) return 1.6
  return 1
}

const FONTS = [
  { label: 'JetBrains',    family: 'JetBrains Mono',  category: 'Mono'  },
  { label: 'DM Mono',      family: 'DM Mono',          category: 'Mono'  },
  { label: 'Inter',        family: 'Inter',            category: 'Sans'  },
  { label: 'Satoshi',      family: 'Satoshi',          category: 'Sans'  },
  { label: 'Epilogue',     family: 'Epilogue',         category: 'Sans'  },
  { label: 'Merriweather', family: 'Merriweather',     category: 'Serif' },
]

export default function RSVPReader({ text, onReset, dark, setDark, theme }) {
  const [words]               = useState(() => tokenize(text))
  const [index, setIndex]     = useState(0)
  const [playing, setPlaying] = useState(false)
  const [wpm, setWpm]         = useState(250)
  const [font, setFont]       = useState(FONTS[0])

  const timeoutRef  = useRef(null)
  const indexRef    = useRef(0)
  const playingRef  = useRef(false)
  const wpmRef      = useRef(wpm)

  const currentWord = words[index] ?? ''
  const progress    = words.length > 1 ? index / (words.length - 1) : 0
  const finished    = index >= words.length - 1

  const beforeWords = words.slice(Math.max(0, index - 20), index)
  const afterWords  = words.slice(index + 1, index + 21)

  useEffect(() => {
    wpmRef.current = wpm
  }, [wpm])

  const scheduleNext = useRef(null)
  scheduleNext.current = () => {
    if (!playingRef.current) return
    const nextIndex = indexRef.current + 1
    if (nextIndex >= words.length) {
      setPlaying(false)
      playingRef.current = false
      return
    }
    const wordOnScreen = words[indexRef.current]
    const baseDelay    = 60000 / wpmRef.current
    const delay        = baseDelay * getPauseMultiplier(wordOnScreen)
    timeoutRef.current = setTimeout(() => {
      indexRef.current = nextIndex
      setIndex(nextIndex)
      scheduleNext.current()
    }, delay)
  }

  useEffect(() => {
    playingRef.current = playing
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (playing && !finished) {
      scheduleNext.current()
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [playing])

  useEffect(() => {
    const handler = e => {
      if (e.code === 'Space') {
        e.preventDefault()
        setPlaying(p => !p)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleRestart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    playingRef.current = false
    indexRef.current = 0
    setIndex(0)
    setPlaying(false)
  }

  const handleSeek = (newIndex) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    playingRef.current = false
    indexRef.current = newIndex
    setIndex(newIndex)
    setPlaying(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-6"
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

      <h1 className="text-2xl font-bold tracking-tight" style={{ color: theme.textPrimary }}>
        blink<span style={{ color: theme.accent }}>er</span>
      </h1>

      {/* Font selector */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-widest" style={{ color: theme.textFaint }}>Font</p>
        <div className="flex gap-2 flex-wrap justify-center">
          {FONTS.map(f => {
            const isActive = font.family === f.family
            return (
              <button
                key={f.family}
                onClick={() => setFont(f)}
                className="px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                style={{
                  fontFamily: f.family,
                  background: isActive ? theme.accent : theme.bgCard,
                  border:     `1px solid ${isActive ? theme.accent : theme.border}`,
                  color:      isActive ? '#ffffff' : theme.textMuted,
                  boxShadow:  isActive ? `0 0 12px ${theme.accent}44` : 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = theme.accent
                    e.currentTarget.style.color       = theme.accent
                    e.currentTarget.style.transform   = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow   = `0 0 8px ${theme.accent}33`
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = theme.border
                    e.currentTarget.style.color       = theme.textMuted
                    e.currentTarget.style.transform   = 'translateY(0)'
                    e.currentTarget.style.boxShadow   = 'none'
                  }
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)' }}
                onMouseUp={e =>   { e.currentTarget.style.transform = isActive ? 'translateY(0)' : 'translateY(-1px)' }}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Ticker row */}
      <div className="relative w-full" style={{ height: '140px' }}>

        {/* Fade left */}
        <div
          className="absolute left-0 top-0 bottom-0 z-20 pointer-events-none"
          style={{
            width:      '15%',
            background: `linear-gradient(to right, ${theme.bg} 0%, transparent 100%)`,
          }}
        />
        {/* Fade right */}
        <div
          className="absolute right-0 top-0 bottom-0 z-20 pointer-events-none"
          style={{
            width:      '15%',
            background: `linear-gradient(to left, ${theme.bg} 0%, transparent 100%)`,
          }}
        />

        {/* Flowing text layer */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div className="flex items-center gap-3 whitespace-nowrap">

            {/* Past words */}
            <div
              className="flex items-center gap-3 justify-end"
              style={{ width: '380px', overflow: 'hidden' }}
            >
              {beforeWords.map((word, i) => {
                const distanceFromBox = beforeWords.length - 1 - i
                const opacity = Math.max(0.08, 0.65 - distanceFromBox * 0.04)
                return (
                  <span
                    key={`before-${index - beforeWords.length + i}`}
                    className="text-sm flex-shrink-0 transition-all duration-200"
                    style={{
                      opacity,
                      color:      theme.textMuted,
                      fontFamily: font.family,
                    }}
                  >
                    {word}
                  </span>
                )
              })}
            </div>

            {/* Spacer matching box width */}
            <div style={{ width: '520px', flexShrink: 0 }} />

            {/* Upcoming words */}
            <div
              className="flex items-center gap-3 justify-start"
              style={{ width: '380px', overflow: 'hidden' }}
            >
              {afterWords.map((word, i) => {
                const opacity = Math.max(0.08, 0.65 - i * 0.04)
                return (
                  <span
                    key={`after-${index + 1 + i}`}
                    className="text-sm flex-shrink-0 transition-all duration-200"
                    style={{
                      opacity,
                      color:      theme.textMuted,
                      fontFamily: font.family,
                    }}
                  >
                    {word}
                  </span>
                )
              })}
            </div>

          </div>
        </div>

        {/* Box — always centred, always on top */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{
              width:      '520px',
              minWidth:   '520px',
              height:     '130px',
              background: theme.bgCard,
              border:     `1px solid ${theme.border}`,
              transition: 'background 0.3s, border-color 0.3s',
            }}
          >
            {finished
              ? <p className="text-lg" style={{ color: theme.textMuted }}>Finished ✓</p>
              : <WordDisplay word={currentWord} theme={theme} font={font} />
            }
          </div>
        </div>

      </div>

      <p className="text-xs" style={{ color: theme.textFaint }}>
        {index + 1} / {words.length}
      </p>

      <Controls
        playing={playing}
        onToggle={() => setPlaying(p => !p)}
        onRestart={handleRestart}
        onReset={onReset}
        wpm={wpm}
        onWpmChange={setWpm}
        progress={progress}
        theme={theme}
        words={words}
        onSeek={handleSeek}
      />
    </div>
  )
}