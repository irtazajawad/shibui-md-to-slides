"use client"

import { useState } from "react"
import PresentationSlides from "@/components/presentation-slides"
import TableOfContents from "@/components/table-of-contents"
import presentationContent from "@/lib/presentation-data"

export default function Home() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSlideChange = (index: number) => {
    setCurrentSlideIndex(index)
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="w-64 border-r border-border overflow-y-auto">
          <TableOfContents
            slides={presentationContent}
            currentIndex={currentSlideIndex}
            onSelectSlide={handleSlideChange}
          />
        </div>
      )}

      {/* Main slide area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Header with controls */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title={sidebarOpen ? "Hide TOC" : "Show TOC"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm text-muted-foreground">
            Slide {currentSlideIndex + 1} of {presentationContent.length}
          </div>
        </div>

        {/* Slides container */}
        <div className="flex-1 overflow-y-auto">
          <PresentationSlides
            slides={presentationContent}
            currentIndex={currentSlideIndex}
            onNext={() => setCurrentSlideIndex((i) => Math.min(i + 1, presentationContent.length - 1))}
            onPrev={() => setCurrentSlideIndex((i) => Math.max(i - 1, 0))}
          />
        </div>

        {/* Navigation controls */}
        <div className="h-16 border-t border-border flex items-center justify-center gap-4 px-6 bg-card">
          <button
            onClick={() => setCurrentSlideIndex((i) => Math.max(i - 1, 0))}
            disabled={currentSlideIndex === 0}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            ← Previous
          </button>
          <button
            onClick={() => setCurrentSlideIndex((i) => Math.min(i + 1, presentationContent.length - 1))}
            disabled={currentSlideIndex === presentationContent.length - 1}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
