"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"

/**
 * Counts slides by counting --- separators (ignoring those in code blocks)
 */
function countSlides(markdown: string): number {
  const lines = markdown.split("\n")
  let count = 1 // Start with 1 since first content is slide 1
  let inFencedCodeBlock = false
  let hasContent = false

  for (const line of lines) {
    // Check for fenced code block start/end
    if (/^```|^~~~/.test(line.trim())) {
      inFencedCodeBlock = !inFencedCodeBlock
      hasContent = true
      continue
    }

    // Check if line is a slide separator
    if (!inFencedCodeBlock && /^\s*---\s*$/.test(line)) {
      if (hasContent) {
        count++
        hasContent = false
      }
    } else if (line.trim()) {
      hasContent = true
    }
  }

  return count
}

interface MarkdownEditorProps {
  markdown: string
  highlightColor: string
  textColor: string
  currentSlideIndex: number
  onSave: (markdown: string) => void
  onColorChange: (color: string) => void
  onTextColorChange: (color: string) => void
  onClose: () => void
  fontFamily: 'libre' | 'eb'
  onFontChange: (font: 'libre' | 'eb') => void
}

export default function MarkdownEditor({
  markdown,
  highlightColor,
  textColor,
  currentSlideIndex,
  onSave,
  onColorChange,
  onTextColorChange,
  onClose,
  fontFamily,
  onFontChange,
}: MarkdownEditorProps) {
  const [content, setContent] = useState(markdown)
  const [color, setColor] = useState(highlightColor)
  const [txtColor, setTxtColor] = useState(textColor)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showFontPicker, setShowFontPicker] = useState(false)
  const [hexInput, setHexInput] = useState(highlightColor)
  const [textHexInput, setTextHexInput] = useState(textColor)
  const [visibleSlide, setVisibleSlide] = useState(currentSlideIndex + 1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Simple undo/redo history
  const historyRef = useRef<Array<{ value: string; start: number; end: number }>>([])
  const historyIndexRef = useRef<number>(-1)
  // Selection to apply after programmatic content changes (undo/redo)
  const pendingSelectionRef = useRef<{ start: number; end: number } | null>(null)

  useEffect(() => {
    setContent(markdown)
    // Reset history when incoming markdown changes
    historyRef.current = [{ value: markdown, start: 0, end: 0 }]
    historyIndexRef.current = 0
  }, [markdown])

  // Scroll to current slide when editor opens
  useEffect(() => {
    if (!textareaRef.current) return

    const lines = markdown.split("\n")
    let targetLine = 0
    let slideCount = 0
    let inCodeBlock = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (/^```|^~~~/.test(line.trim())) {
        inCodeBlock = !inCodeBlock
        continue
      }
      if (!inCodeBlock && /^\s*---\s*$/.test(line)) {
        slideCount++
        if (slideCount === currentSlideIndex) {
          targetLine = i
          break
        }
      }
    }

    // Scroll to the target line
    const textarea = textareaRef.current
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
    textarea.scrollTop = targetLine * lineHeight
  }, [])

  useEffect(() => {
    setColor(highlightColor)
    setHexInput(highlightColor.replace(/^#/, ""))
  }, [highlightColor])

  useEffect(() => {
    setTxtColor(textColor)
    setTextHexInput(textColor.replace(/^#/, ""))
  }, [textColor])

  const handleSave = () => {
    onSave(content)
    onClose()
  }

  const pushHistory = (snapshot: { value: string; start: number; end: number }) => {
    const stack = historyRef.current
    const idx = historyIndexRef.current
    // If we have undone some steps and then type, drop redo branch
    if (idx < stack.length - 1) {
      stack.splice(idx + 1)
    }
    const last = stack[stack.length - 1]
    if (!last || last.value !== snapshot.value || last.start !== snapshot.start || last.end !== snapshot.end) {
      stack.push(snapshot)
      // Cap history size
      if (stack.length > 500) stack.shift()
      historyIndexRef.current = stack.length - 1
    }
  }

  const restoreSelection = (start: number, end: number) => {
    const ta = textareaRef.current
    if (!ta) return
    try {
      ta.selectionStart = start
      ta.selectionEnd = end
    } catch { }
    ta.focus()
    // Ensure visible slide recalculates after undo/redo
    setTimeout(handleScroll, 0)
  }

  // Apply any pending selection right after React commits content changes
  useLayoutEffect(() => {
    if (pendingSelectionRef.current) {
      const { start, end } = pendingSelectionRef.current
      pendingSelectionRef.current = null
      restoreSelection(start, end)
    }
  }, [content])

  const undo = () => {
    const idx = historyIndexRef.current
    if (idx <= 0) return
    const prev = historyRef.current[idx - 1]
    historyIndexRef.current = idx - 1
    pendingSelectionRef.current = { start: prev.start, end: prev.end }
    setContent(prev.value)
  }

  const redo = () => {
    const idx = historyIndexRef.current
    const stack = historyRef.current
    if (idx >= stack.length - 1) return
    const next = stack[idx + 1]
    historyIndexRef.current = idx + 1
    pendingSelectionRef.current = { start: next.start, end: next.end }
    setContent(next.value)
  }

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    setHexInput(newColor.replace(/^#/, ""))
    onColorChange(newColor)
  }

  const handleTextColorChange = (newColor: string) => {
    setTxtColor(newColor)
    setTextHexInput(newColor.replace(/^#/, ""))
    onTextColorChange(newColor)
  }

  // Keep the latest caret/selection paired with the current history entry.
  const updateCurrentSnapshotSelection = (start: number, end: number) => {
    const idx = historyIndexRef.current
    if (idx < 0) return
    const snap = historyRef.current[idx]
    if (!snap) return
    snap.start = start
    snap.end = end
  }

  // When user changes selection (mouse or keyboard), update snapshot selection.
  const handleSelect: React.ReactEventHandler<HTMLTextAreaElement> = (e) => {
    const ta = e.currentTarget
    updateCurrentSnapshotSelection(ta.selectionStart, ta.selectionEnd)
  }

  // Calculate which slide is visible based on scroll position
  const handleScroll = () => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
    const scrollTop = textarea.scrollTop
    const visibleLineIndex = Math.floor(scrollTop / lineHeight)

    const lines = content.split("\n")
    let slideCount = 1
    let inCodeBlock = false

    for (let i = 0; i <= Math.min(visibleLineIndex, lines.length - 1); i++) {
      const line = lines[i]
      if (/^```|^~~~/.test(line.trim())) {
        inCodeBlock = !inCodeBlock
        continue
      }
      if (!inCodeBlock && /^\s*---\s*$/.test(line)) {
        slideCount++
      }
    }

    setVisibleSlide(slideCount)
  }

  // Strip # if user pastes/types it, and validate
  const sanitizeHexInput = (value: string) => {
    return value.replace(/^#/, "").toUpperCase()
  }

  const handleHexSubmit = () => {
    // Validate hex color (without #)
    const hexRegex = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const sanitized = sanitizeHexInput(hexInput)
    if (hexRegex.test(sanitized)) {
      handleColorChange(`#${sanitized}`)
    }
  }

  const handleTextHexSubmit = () => {
    // Validate hex color (without #)
    const hexRegex = /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const sanitized = sanitizeHexInput(textHexInput)
    if (hexRegex.test(sanitized)) {
      handleTextColorChange(`#${sanitized}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const meta = e.metaKey || e.ctrlKey
    // Undo / Redo shortcuts
    if (meta && e.key.toLowerCase() === "z") {
      e.preventDefault()
      if (e.shiftKey) {
        redo()
      } else {
        undo()
      }
      return
    }
    if (meta && e.key.toLowerCase() === "y") {
      e.preventDefault()
      redo()
      return
    }

    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      // Insert tab character at cursor position
      const newContent = content.substring(0, start) + "\t" + content.substring(end)
      setContent(newContent)

      // Move cursor after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1
      }, 0)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-[90vw] max-w-4xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold text-foreground">Edit Presentation</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </div>

        <div className="px-6 py-3 bg-muted/50 border-b border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Use <code className="px-1.5 py-0.5 bg-muted rounded text-xs">---</code> to separate slides. Start slide
            titles with <code className="px-1.5 py-0.5 bg-muted rounded text-xs">#</code> or{" "}
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs">##</code> for headings.
          </p>

          <div className="flex items-center gap-3">
            {/* Font selector (dropdown) */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                onClick={() => {
                  setShowFontPicker(!showFontPicker)
                  setShowTextColorPicker(false)
                  setShowColorPicker(false)
                }}
                title="Choose slide font"
              >
                <span>Font</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showFontPicker && (
                <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-xl z-10 w-48">
                  <button
                    className={`w-full text-left px-3 py-2 hover:bg-muted ${fontFamily === 'eb' ? 'font-semibold' : ''}`}
                    style={{ fontFamily: 'var(--font-eb-garamond)', fontSize: '15px' }}
                    onClick={() => {
                      onFontChange('eb')
                      setShowFontPicker(false)
                    }}
                  >
                    EB Garamond
                  </button>
                  <button
                    className={`w-full text-left px-3 py-2 hover:bg-muted ${fontFamily === 'libre' ? 'font-semibold' : ''}`}
                    style={{ fontFamily: 'var(--font-libre-baskerville)', fontSize: '15px' }}
                    onClick={() => {
                      onFontChange('libre')
                      setShowFontPicker(false)
                    }}
                  >
                    Libre Baskerville
                  </button>
                </div>
              )}
            </div>
            {/* Text color picker */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTextColorPicker(!showTextColorPicker)
                  setShowColorPicker(false)
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: txtColor }} />
                <span>Text</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Text color picker dropdown */}
              {showTextColorPicker && (
                <div className="absolute right-0 top-full mt-2 p-4 bg-card border border-border rounded-lg shadow-xl z-10 w-64">
                  <div className="space-y-4">
                    {/* Color wheel input */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Choose Color</label>
                      <input
                        type="color"
                        value={txtColor}
                        onChange={(e) => handleTextColorChange(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border border-border"
                      />
                    </div>

                    {/* Hex input */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Hex Value</label>
                      <div className="flex gap-2">
                        <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/50">
                          <span className="px-2 py-1.5 text-sm text-muted-foreground bg-muted border-r border-border select-none">#</span>
                          <input
                            type="text"
                            value={textHexInput}
                            onChange={(e) => setTextHexInput(sanitizeHexInput(e.target.value))}
                            onKeyDown={(e) => e.key === "Enter" && handleTextHexSubmit()}
                            placeholder="1A1A1A"
                            maxLength={6}
                            className="w-20 px-2 py-1.5 text-sm bg-background text-foreground focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={handleTextHexSubmit}
                          className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-3 rounded border border-border bg-background">
                      <p className="text-sm font-serif font-medium" style={{ color: txtColor }}>Text color preview</p>
                    </div>

                    {/* Reset to default */}
                    <button
                      onClick={() => handleTextColorChange("#1a1a1a")}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      Reset to Default (#1A1A1A)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Highlight color picker */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowColorPicker(!showColorPicker)
                  setShowTextColorPicker(false)
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: color }} />
                <span>Highlight</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Color picker dropdown */}
              {showColorPicker && (
                <div className="absolute right-0 top-full mt-2 p-4 bg-card border border-border rounded-lg shadow-xl z-10 w-64">
                  <div className="space-y-4">
                    {/* Color wheel input */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Choose Color</label>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border border-border"
                      />
                    </div>

                    {/* Hex input */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Hex Value</label>
                      <div className="flex gap-2">
                        <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/50">
                          <span className="px-2 py-1.5 text-sm text-muted-foreground bg-muted border-r border-border select-none">#</span>
                          <input
                            type="text"
                            value={hexInput}
                            onChange={(e) => setHexInput(sanitizeHexInput(e.target.value))}
                            onKeyDown={(e) => e.key === "Enter" && handleHexSubmit()}
                            placeholder="000000"
                            maxLength={6}
                            className="w-20 px-2 py-1.5 text-sm bg-background text-foreground focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={handleHexSubmit}
                          className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-3 rounded border border-border bg-background">
                      <p className="text-sm font-serif font-medium">
                        Normal text with <strong style={{ color: color }}>highlighted text</strong> example.
                      </p>
                    </div>

                    {/* Reset to default */}
                    <button
                      onClick={() => handleColorChange("#000000")}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      Reset to Default (Black)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-hidden p-6">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              // Record snapshot for undo/redo
              pushHistory({
                value: e.target.value,
                start: e.currentTarget.selectionStart,
                end: e.currentTarget.selectionEnd,
              })
              // Recalculate visible slide after content changes
              setTimeout(handleScroll, 0)
            }}
            onSelect={handleSelect}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            className="w-full h-full resize-none bg-background border border-border rounded-lg p-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 leading-relaxed"
            placeholder="Enter your markdown presentation here..."
            spellCheck={false}
          />
        </div>

        {/* Footer with stats */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>Slide {visibleSlide} of {countSlides(content)}</span>
          <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
        </div>
      </div>
    </div>
  )
}
