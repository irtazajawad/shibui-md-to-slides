"use client"

import { useState, useEffect } from "react"

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
  backgroundColor: string
  onSave: (markdown: string) => void
  onColorChange: (color: string) => void
  onBackgroundColorChange: (color: string) => void
  onClose: () => void
}

export default function MarkdownEditor({
  markdown,
  highlightColor,
  backgroundColor,
  onSave,
  onColorChange,
  onBackgroundColorChange,
  onClose,
}: MarkdownEditorProps) {
  const [content, setContent] = useState(markdown)
  const [color, setColor] = useState(highlightColor)
  const [bgColor, setBgColor] = useState(backgroundColor)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [hexInput, setHexInput] = useState(highlightColor)
  const [bgHexInput, setBgHexInput] = useState(backgroundColor)

  useEffect(() => {
    setContent(markdown)
  }, [markdown])

  useEffect(() => {
    setColor(highlightColor)
    setHexInput(highlightColor)
  }, [highlightColor])

  useEffect(() => {
    setBgColor(backgroundColor)
    setBgHexInput(backgroundColor)
  }, [backgroundColor])

  const handleSave = () => {
    onSave(content)
    onClose()
  }

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    setHexInput(newColor)
    onColorChange(newColor)
  }

  const handleBgColorChange = (newColor: string) => {
    setBgColor(newColor)
    setBgHexInput(newColor)
    onBackgroundColorChange(newColor)
  }

  const handleHexSubmit = () => {
    // Validate hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (hexRegex.test(hexInput)) {
      handleColorChange(hexInput)
    }
  }

  const handleBgHexSubmit = () => {
    // Validate hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (hexRegex.test(bgHexInput)) {
      handleBgColorChange(bgHexInput)
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
            <div className="relative">
              <button
                onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: bgColor }} />
                <span>Background</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Background color picker dropdown */}
              {showBgColorPicker && (
                <div className="absolute right-0 top-full mt-2 p-4 bg-card border border-border rounded-lg shadow-xl z-10 w-64">
                  <div className="space-y-4">
                    {/* Color wheel input */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Choose Color</label>
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => handleBgColorChange(e.target.value)}
                        className="w-full h-10 rounded cursor-pointer border border-border"
                      />
                    </div>

                    {/* Hex input */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Hex Value</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={bgHexInput}
                          onChange={(e) => setBgHexInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleBgHexSubmit()}
                          placeholder="#FFFDFB"
                          className="w-24 px-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                          onClick={handleBgHexSubmit}
                          className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="p-3 rounded border border-border" style={{ backgroundColor: bgColor }}>
                      <p className="text-sm">Background preview</p>
                    </div>

                    {/* Reset to default */}
                    <button
                      onClick={() => handleBgColorChange("#FFFDFB")}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      Reset to Default (#FFFDFB)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Original highlight color picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
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
                        <input
                          type="text"
                          value={hexInput}
                          onChange={(e) => setHexInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleHexSubmit()}
                          placeholder="#000000"
                          className="w-24 px-3 py-1.5 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                          onClick={handleHexSubmit}
                          className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Preview</label>
                      <p className="text-sm">
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
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full resize-none bg-background border border-border rounded-lg p-4 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 leading-relaxed"
            placeholder="Enter your markdown presentation here..."
            spellCheck={false}
          />
        </div>

        {/* Footer with stats */}
        <div className="px-6 py-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
          <span>{countSlides(content)} slides</span>
          <span>{content.length} characters</span>
        </div>
      </div>
    </div>
  )
}
