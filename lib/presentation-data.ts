export interface Slide {
  title: string
  content: string
  isHeadingSlide?: boolean
}

/**
 * Splits markdown by slide separators (---) while ignoring --- inside code blocks
 */
function splitBySlides(markdown: string): string[] {
  const lines = markdown.split("\n")
  const parts: string[] = []
  let currentPart: string[] = []
  let inFencedCodeBlock = false

  for (const line of lines) {
    // Check for fenced code block start/end (``` or ~~~)
    if (/^```|^~~~/.test(line.trim())) {
      inFencedCodeBlock = !inFencedCodeBlock
      currentPart.push(line)
      continue
    }

    // Check if line is a slide separator (--- on its own line, not in code block)
    // Must be exactly --- (with optional whitespace) and not inside code
    if (!inFencedCodeBlock && /^\s*---\s*$/.test(line)) {
      parts.push(currentPart.join("\n"))
      currentPart = []
    } else {
      currentPart.push(line)
    }
  }

  // Don't forget the last part
  if (currentPart.length > 0) {
    parts.push(currentPart.join("\n"))
  }

  return parts.map((part) => part.trim()).filter((part) => part.length > 0)
}

export function parsePresentation(markdown: string): Slide[] {
  const slides: Slide[] = []
  const parts = splitBySlides(markdown)

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
