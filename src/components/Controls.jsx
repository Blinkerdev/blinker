import React from 'react'

const PRESETS = [
  { label: 'Chilled', wpm: 150 },
  { label: 'Casual',  wpm: 250 },
  { label: 'Brisk',   wpm: 350 },
  { label: 'Focused', wpm: 450 },
  { label: 'Turbo',   wpm: 550 },
  { label: 'Matrix',  wpm: 700 },
]

export default function Controls({ playing, onToggle, onRestart, onReset, wpm, onWpmChange, progress, theme, words, onSeek }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">

      {/* Scrubbable progress bar */}
      <div
        className="w-full rounded-full cursor-pointer relative"
        style={{ background: theme.border, height: '12px' }}
        onMouseDown={e => {
          e.preventDefault()
          const bar = e.currentTarget

          const seek = (clientX) => {
            const rect     = bar.getBoundingClientRect()
            const clickX   = Math.max(0, Math.min(clientX - rect.left, rect.width))
            const percent  = clickX / rect.width
            const newIndex = Math.round(percent * (words.length - 1))
            onSeek(newIndex)
          }

          seek(e.clientX)

          const onMouseMove = (e) => {
            e.preventDefault()
            seek(e.clientX)
          }

          const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
          }

          window.addEventListener('mousemove', onMouseMove)
          window.addEventListener('mouseup', onMouseUp)
        }}
      >
        <div
          className="rounded-full pointer-events-none"
          style={{
            width:      `${progress * 100}%`,
            height:     '12px',
            background: theme.accent,
          }}
        />
      </div>

      {/* Slider */}
      <div className="flex items-center gap-4 w-full">
        <span className="text-sm w-10" style={{ color: theme.textMuted }}>Slow</span>
        <input
          type="range"
          min="100"
          max="700"
          step="25"
          value={wpm}
          onChange={e => onWpmChange(Number(e.target.value))}
          className="flex-1 accent-blue-400"
        />
        <span className="text-sm w-10 text-right" style={{ color: theme.textMuted }}>Fast</span>
        <span className="font-bold text-sm w-16 text-right" style={{ color: theme.accent }}>
          {wpm} wpm
        </span>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2 w-full justify-center flex-wrap">
        {PRESETS.map(preset => {
          const isActive = wpm === preset.wpm
          return (
            <button
              key={preset.label}
              onClick={() => onWpmChange(preset.wpm)}
              className="group relative flex flex-col items-center px-4 py-2 rounded-xl
                         overflow-hidden transition-all duration-200"
              style={{
                background: isActive ? theme.accent : theme.bgCard,
                border:     `1px solid ${isActive ? theme.accent : theme.border}`,
                color:      isActive ? '#ffffff' : theme.textMuted,
                minWidth:   '80px',
                boxShadow:  isActive ? `0 0 16px ${theme.accent}55` : 'none',
                transform:  'translateY(0)',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = theme.accent
                  e.currentTarget.style.color       = theme.accent
                  e.currentTarget.style.boxShadow   = `0 0 12px ${theme.accent}33`
                  e.currentTarget.style.transform   = 'translateY(-2px)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = theme.border
                  e.currentTarget.style.color       = theme.textMuted
                  e.currentTarget.style.boxShadow   = 'none'
                  e.currentTarget.style.transform   = 'translateY(0)'
                }
              }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'translateY(1px)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = isActive ? 'translateY(0)' : 'translateY(-2px)'
              }}
            >
              <span className="font-bold text-sm">{preset.label}</span>
              <span className="text-xs opacity-60">{preset.wpm} wpm</span>
            </button>
          )
        })}
      </div>

      {/* Playback buttons */}
      <div className="flex gap-4 items-center">

        {/* Restart */}
        <button
          onClick={onRestart}
          className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: theme.bgCard,
            border:     `1px solid ${theme.border}`,
            color:      theme.textMuted,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = theme.textMuted
            e.currentTarget.style.color       = theme.textPrimary
            e.currentTarget.style.transform   = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = theme.border
            e.currentTarget.style.color       = theme.textMuted
            e.currentTarget.style.transform   = 'translateY(0)'
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)' }}
          onMouseUp={e =>   { e.currentTarget.style.transform = 'translateY(-1px)' }}
        >
          ↩ Restart
        </button>

        {/* Play / Pause */}
        <button
          onClick={onToggle}
          className="px-12 py-3 font-bold rounded-xl text-xl text-white transition-all duration-200"
          style={{
            background: theme.accent,
            boxShadow:  `0 0 20px ${theme.accent}66`,
            border:     '1px solid transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 0 32px ${theme.accent}99`
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = `0 0 20px ${theme.accent}66`
            e.currentTarget.style.transform = 'translateY(0) scale(1)'
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'translateY(1px) scale(0.98)'
            e.currentTarget.style.boxShadow = `0 0 10px ${theme.accent}44`
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'
            e.currentTarget.style.boxShadow = `0 0 32px ${theme.accent}99`
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* Exit */}
        <button
          onClick={onReset}
          className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: theme.bgCard,
            border:     `1px solid ${theme.border}`,
            color:      theme.textMuted,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#f87171'
            e.currentTarget.style.color       = '#f87171'
            e.currentTarget.style.transform   = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = theme.border
            e.currentTarget.style.color       = theme.textMuted
            e.currentTarget.style.transform   = 'translateY(0)'
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px)' }}
          onMouseUp={e =>   { e.currentTarget.style.transform = 'translateY(-1px)' }}
        >
          ✕ Exit
        </button>

      </div>

      <p className="text-xs" style={{ color: theme.textFaint }}>Space to play / pause</p>
    </div>
  )
}