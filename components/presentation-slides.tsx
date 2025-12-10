"use client"

import { useEffect } from "react"
import Slide from "./slide"

interface PresentationSlidesProps {
  slides: Array<{ title: string; content: string; isHeadingSlide?: boolean }>
  currentIndex: number
  onNext: () => void
  onPrev: () => void
  highlightColor: string // Added highlightColor prop
}

export default function PresentationSlides({
  slides,
  currentIndex,
  onNext,
  onPrev,
  highlightColor,
}: PresentationSlidesProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onNext()
      if (e.key === "ArrowLeft") onPrev()
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [onNext, onPrev])

  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <Slide
          slide={slides[currentIndex]}
          isHeadingSlide={slides[currentIndex].isHeadingSlide}
          highlightColor={highlightColor}
        />
      </div>
    </div>
  )
}
