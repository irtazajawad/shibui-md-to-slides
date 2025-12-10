"use client"

interface TOCProps {
  slides: Array<{ title: string; content: string; isHeadingSlide?: boolean }>
  currentIndex: number
  onSelectSlide: (index: number) => void
}

export default function TableOfContents({ slides, currentIndex, onSelectSlide }: TOCProps) {
  return (
    <div className="p-6 pt-20 bg-card h-full">
      <nav className="space-y-2">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => onSelectSlide(index)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${currentIndex === index
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-foreground hover:bg-muted"
              }`}
          >
            <span className="text-sm">{index + 1}.</span>
            <span className="ml-2 text-sm font-serif line-clamp-2">{slide.title || "Untitled"}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
