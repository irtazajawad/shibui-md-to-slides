"use client"

import { useEffect } from "react"
import Slide from "./slide"

interface PresentationSlidesProps {
  slides: Array<{ title: string; content: string; isHeadingSlide?: boolean }>
  currentIndex: number
  onNext: () => void
  onPrev: () => void
  highlightColor: string
  textColor: string
  editorOpen?: boolean
  fontFamily?: 'libre' | 'eb' | 'ibm'
}

export default function PresentationSlides({
  slides,
  currentIndex,
  onNext,
  onPrev,
  highlightColor,
  textColor,
  editorOpen = false,
  fontFamily = 'libre',
}: PresentationSlidesProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't handle arrow keys when editor is open
      if (editorOpen) return

      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [onNext, onPrev, editorOpen])

  // Safety check for empty slides
  const currentSlide = slides[currentIndex] || { title: "", content: "", isHeadingSlide: false }

  const fontClass = fontFamily === 'eb' ? 'presentation-font-eb' : fontFamily === 'ibm' ? 'presentation-font-ibm' : 'presentation-font-libre'

  return (
    <div className={`h-full w-full flex items-center justify-center p-4 md:p-8 lg:p-12 slide-capture-area presentation-serif ${fontClass}`}>
      <div className="w-full max-w-6xl">
        <Slide
          slide={currentSlide}
          isHeadingSlide={currentSlide.isHeadingSlide}
          highlightColor={highlightColor}
          textColor={textColor}
        />
      </div>
    </div>
  )
}
