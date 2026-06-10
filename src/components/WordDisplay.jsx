import React from 'react'

export default function WordDisplay({ word, theme, font }) {
  if (!word) return null

  const orpIndex = Math.max(0, Math.floor(word.length * 0.3) - 1)
  const before = word.slice(0, orpIndex)
  const focus  = word[orpIndex]
  const after  = word.slice(orpIndex + 1)

  return (
    <div className="flex items-center justify-center w-full px-6">
      <div
        className="flex items-baseline tracking-tight"
        style={{
          fontFamily: font.family,
          fontSize:   'clamp(2rem, 5vw, 3.5rem)',
        }}
      >
        <span
          className="text-right inline-block"
          style={{ width: '220px', color: theme.textPrimary }}
        >
          {before}
        </span>
        <span style={{ color: '#f87171', fontWeight: 'bold' }}>
          {focus}
        </span>
        <span
          className="text-left inline-block"
          style={{ width: '220px', color: theme.textPrimary }}
        >
          {after}
        </span>
      </div>
    </div>
  )
}