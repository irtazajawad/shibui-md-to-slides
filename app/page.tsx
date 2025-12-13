"use client"

import { useState, useEffect } from "react"
import PresentationSlides from "@/components/presentation-slides"
import TableOfContents from "@/components/table-of-contents"
import MarkdownEditor from "@/components/markdown-editor"
import WelcomeScreen from "@/components/welcome-screen"
import { parsePresentation, type Slide } from "@/lib/presentation-data"

const defaultNewMarkdown = `# Welcome to Your Presentation
## Start creating your slides

---

## Getting Started

- Use **bold text** for emphasis
- Create new slides by adding \`---\` between content
- Use \`#\` for main headings and \`##\` for slide titles

---

## Introduction to Tables

| Column 1      | Column 2      | Column 3      |
|---------------|---------------|---------------|
| Row 1, Cell 1 | Row 1, Cell 2 | Row 1, Cell 3 |
| Row 2, Cell 1 | Row 2, Cell 2 | Row 2, Cell 3 |
| Row 3, Cell 1 | Row 3, Cell 2 | Row 3, Cell 3 |

- Use \`|\` to separate columns
- Use \`---\` to create the header separator

---

## Add Your Content

Replace this template with your own markdown content.

Happy presenting!
`

export default function Home() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [highlightColor, setHighlightColor] = useState("#000000")
  const [textColor, setTextColor] = useState("#1a1a1a")
  const [zoomLevel, setZoomLevel] = useState(100)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleSlideChange = (index: number) => {
    setCurrentSlideIndex(index)
  }

  const handleSaveMarkdown = (newMarkdown: string) => {
    setMarkdown(newMarkdown)
    const newSlides = parsePresentation(newMarkdown)
    setSlides(newSlides)
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(Math.max(0, newSlides.length - 1))
    }
  }

  const handleUpload = (content: string) => {
    setMarkdown(content)
    const newSlides = parsePresentation(content)
    setSlides(newSlides)
    setCurrentSlideIndex(0)
  }

  const handleCreate = () => {
    setMarkdown(defaultNewMarkdown)
    setSlides(parsePresentation(defaultNewMarkdown))
    setCurrentSlideIndex(0)
    setEditorOpen(true) // Open editor immediately for new presentations
  }

  if (!markdown) {
    return <WelcomeScreen onUpload={handleUpload} onCreate={handleCreate} />
  }

  return (
    <div className="flex h-screen bg-background relative">
      {/* Fixed hamburger button with Content label */}
      <div className="fixed top-0 left-0 z-50 flex items-center gap-3 px-4 h-16 bg-card w-64 border-b border-border">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-muted rounded-lg transition-colors bg-card border border-border"
          title={sidebarOpen ? "Hide TOC" : "Show TOC"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className={`font-serif text-xl font-bold text-foreground transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}>
          Content
        </span>
      </div>

      {/* Sidebar - always rendered but width controlled */}
      <div
        className={`border-r border-border overflow-y-auto overflow-x-hidden transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 border-r-0"
          }`}
      >
        <div className={`w-64 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <TableOfContents slides={slides} currentIndex={currentSlideIndex} onSelectSlide={handleSlideChange} />
        </div>
      </div>

      {/* Main slide area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header with controls */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          {/* Spacer for hamburger */}
          <div className="w-9"></div>
          <div className="text-sm text-muted-foreground">
            Slide {currentSlideIndex + 1} of {slides.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMarkdown(null)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="New Presentation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setEditorOpen(true)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Edit Presentation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 9L4 4m0 0v5m0-5h5M15 9l5-5m0 0v5m0-5h-5M9 15l-5 5m0 0v-5m0 5h5M15 15l5 5m0 0v-5m0 5h-5"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Slides container */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="min-h-full flex items-center justify-center" style={{ zoom: zoomLevel / 100 }}>
            <div className="w-full">
              <PresentationSlides
                slides={slides}
                currentIndex={currentSlideIndex}
                onNext={() => setCurrentSlideIndex((i) => Math.min(i + 1, slides.length - 1))}
                onPrev={() => setCurrentSlideIndex((i) => Math.max(i - 1, 0))}
                highlightColor={highlightColor}
                textColor={textColor}
              />
            </div>
          </div>

        </div>

        {/* Navigation controls */}
        <div className="h-16 border-t border-border flex items-center justify-between px-6 bg-card">
          <div className="w-32"></div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentSlideIndex((i) => Math.max(i - 1, 0))}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentSlideIndex((i) => Math.min(i + 1, slides.length - 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Next →
            </button>
          </div>
          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-sm text-muted-foreground w-12 text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      {editorOpen && (
        <MarkdownEditor
          markdown={markdown}
          highlightColor={highlightColor}
          textColor={textColor}
          onSave={handleSaveMarkdown}
          onColorChange={setHighlightColor}
          onTextColorChange={setTextColor}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  )
}
