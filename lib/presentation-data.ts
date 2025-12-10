export interface Slide {
  title: string
  content: string
  isHeadingSlide?: boolean
}

export function parsePresentation(markdown: string): Slide[] {
  const slides: Slide[] = []
  const parts = markdown.split("---").map((part) => part.trim())

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue

    const lines = part.split("\n")
    let title = ""
    let content = ""
    let isHeadingSlide = false

    // Find title (first heading)
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j]
      if (line.startsWith("# ") || line.startsWith("## ")) {
        title = line.replace(/^#+\s+/, "")
        content = lines
          .slice(j + 1)
          .join("\n")
          .trim()
        isHeadingSlide = line.startsWith("# ")
        break
      }
    }

    if (title) {
      slides.push({
        title,
        content,
        isHeadingSlide,
      })
    }
  }

  return slides
}
