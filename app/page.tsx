"use client"

import { useState, useEffect } from "react"
import PresentationSlides from "@/components/presentation-slides"
import TableOfContents from "@/components/table-of-contents"
import MarkdownEditor from "@/components/markdown-editor"
import WelcomeScreen from "@/components/welcome-screen"
import { parsePresentation, type Slide } from "@/lib/presentation-data"

const defaultNewMarkdown = `# Markdown → Slides
## Write once. Present instantly. 🚀

---
## How Slides Work
- Each slide is written in **Markdown**
- Add a new slide with \`---\`
- Use headings to structure content
  - \`#\` for big titles (h1)
  - \`##\` for slide titles (h2)
  - \`###\` through \`######\` for smaller headings

You focus on ideas. The app handles layout.

---
## All Heading Levels
# Heading 1 (Largest)
## Heading 2 (Main Titles)
### Heading 3 (Sections)
#### Heading 4 (Subsections)
##### Heading 5 (Small)
###### Heading 6 (Smallest)

Choose the right hierarchy for your content.

---
## Text Formatting Made Simple
- **Bold** for emphasis
- *Italic* for tone
- ***Bold and italic*** combined
- ~~Strikethrough~~ for corrections
- \`Inline code\` with backticks
- Links: [Shibui](https://v0-shibui.vercel.app/)
> Blockquotes with \`>\`

Everything stays readable and distraction free.

---
## More Text Formatting
- Subscript: H<sub>2</sub>O
- Superscript: x<sup>2</sup>
- <u>Underline</u> text (HTML)
- Lists with \`-\` or \`*\` bullets
- Ordered lists with \`1.\`, \`2.\`, etc.

Mix and match to express your ideas.

---
## Tables Just Work
| Feature        | Syntax | Result |
|---------------|--------|--------|
| R1C1       | R1C2    | R1C3  |
| R2C1       | R2C2  | R2C3  |
| R3C1          | R3C2   | R3C3 |

Perfect for comparisons, data, or summaries.

---
## LaTeX Math Support
### Inline Equations
Write math inline like $E = mc^2$ or the quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

### Display Equations
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

$$\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}$$
---
## Advanced Mathematics
**Schrödinger Equation:**
$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\vec{r},t) = \\left[-\\frac{\\hbar^2}{2m}\\nabla^2 + V(\\vec{r},t)\\right]\\Psi(\\vec{r},t)$$

**Matrix Operations:**
$$\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix}$$
---
## Code Highlighting
\`\`\`javascript
function createSlide(markdown) {
  const slides = markdown.split('---');
  return slides.map(slide => 
    renderMarkdown(slide)
  );
}
\`\`\`

---
## Start Presenting
- Replace this file with your own Markdown
- Add slides as you write
- Preview instantly

Your content, your flow, your slides.
Happy presenting ✨
---
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
  const [hasSavedPresentation, setHasSavedPresentation] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Check for saved presentation on client-side only
  useEffect(() => {
    try {
      const saved = localStorage.getItem('previousPresentation')
      setHasSavedPresentation(saved !== null)
    } catch {
      setHasSavedPresentation(false)
    }
  }, [markdown])

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

  const handleReset = () => {
    // Save current presentation to localStorage before resetting
    if (markdown && slides.length > 0) {
      try {
        localStorage.setItem('previousPresentation', JSON.stringify({
          markdown,
          slideIndex: currentSlideIndex,
          timestamp: Date.now()
        }))
        setHasSavedPresentation(true)
      } catch (error) {
        console.error('Failed to save presentation:', error)
      }
    }
    setMarkdown(null)
  }

  const handleRestore = () => {
    try {
      const saved = localStorage.getItem('previousPresentation')
      if (saved) {
        const { markdown: savedMarkdown, slideIndex } = JSON.parse(saved)
        setMarkdown(savedMarkdown)
        const restoredSlides = parsePresentation(savedMarkdown)
        setSlides(restoredSlides)
        setCurrentSlideIndex(Math.min(slideIndex, restoredSlides.length - 1))
        localStorage.removeItem('previousPresentation')
        setHasSavedPresentation(false)
      }
    } catch (error) {
      console.error('Failed to restore presentation:', error)
    }
  }

  if (!markdown) {
    return <WelcomeScreen onUpload={handleUpload} onCreate={handleCreate} onRestore={handleRestore} hasSavedPresentation={hasSavedPresentation} />
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
              onClick={handleReset}
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
                editorOpen={editorOpen}
              />
            </div>
          </div>

        </div>

        {/* Navigation controls */}
        <div className="h-16 border-t border-border flex items-center justify-between px-6 bg-card">
          <div className="w-32"></div>
          {!isFullscreen && (
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
          )}
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
          currentSlideIndex={currentSlideIndex}
          onSave={handleSaveMarkdown}
          onColorChange={setHighlightColor}
          onTextColorChange={setTextColor}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  )
}
