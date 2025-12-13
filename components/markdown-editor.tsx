"use client"

import { useState, useEffect, useRef } from "react"

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
  onSave: (markdown: string) => void
  onColorChange: (color: string) => void
  onTextColorChange: (color: string) => void
  onClose: () => void
}

export default function MarkdownEditor({
  markdown,
  highlightColor,
  textColor,
  onSave,
  onColorChange,
  onTextColorChange,
  onClose,
}: MarkdownEditorProps) {
  const [content, setContent] = useState(markdown)
  const [color, setColor] = useState(highlightColor)
  const [txtColor, setTxtColor] = useState(textColor)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [hexInput, setHexInput] = useState(highlightColor)
  const [textHexInput, setTextHexInput] = useState(textColor)
  const [visibleSlide, setVisibleSlide] = useState(1)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(markdown)
  }, [markdown])

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
              // Recalculate visible slide after content changes
              setTimeout(handleScroll, 0)
            }}
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
