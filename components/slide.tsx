"use client"

import type React from "react"

import { useEffect } from "react"

interface SlideProps {
  slide: { title: string; content: string; isHeadingSlide?: boolean }
  isHeadingSlide?: boolean
}

function parseMarkdownToJSX(content: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  const lines = content.split("\n")
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Check if this is the start of a table - look for pipe-delimited row followed by separator
    if (
      line.trim().startsWith("|") &&
      line.trim().endsWith("|") &&
      i + 1 < lines.length &&
      lines[i + 1]?.trim().match(/^\|[-:\s|]+\|$/)
    ) {
      const tableRows: string[][] = []

      // Parse header row
      const headerCells = line
        .split("|")
        .filter((cell) => cell.trim() !== "")
        .map((cell) => cell.trim())
      tableRows.push(headerCells)

      i++ // Move to separator row
      i++ // Skip separator row

      // Parse body rows
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        const cells = lines[i]
          .split("|")
          .filter((cell) => cell.trim() !== "")
          .map((cell) => cell.trim())
        if (cells.length > 0) {
          tableRows.push(cells)
        }
        i++
      }

      elements.push(
        <div key={key++} className="overflow-x-auto my-6">
          <table>
            <thead>
              <tr>
                {tableRows[0].map((cell, idx) => (
                  <th key={idx}>{parseInlineMarkdown(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx}>{parseInlineMarkdown(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    // Check for code blocks
    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3) || "plaintext"
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      i++ // Skip closing \`\`\`

      elements.push(
        <pre key={key++} className="bg-muted p-4 rounded-lg my-4 overflow-x-auto">
          <code className={`language-${language} hljs`}>{codeLines.join("\n")}</code>
        </pre>,
      )
      continue
    }

    // Check for headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-2xl font-bold mt-4 mb-2 text-foreground">
          {parseInlineMarkdown(line.slice(4))}
        </h3>,
      )
      i++
      continue
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-4xl font-bold mt-6 mb-3 text-foreground">
          {parseInlineMarkdown(line.slice(3))}
        </h2>,
      )
      i++
      continue
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="text-5xl font-bold mt-8 mb-4 text-foreground">
          {parseInlineMarkdown(line.slice(2))}
        </h1>,
      )
      i++
      continue
    }

    // Check for blockquotes
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={key++} className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
          {parseInlineMarkdown(line.slice(2))}
        </blockquote>,
      )
      i++
      continue
    }

    // Check for unordered list items
    if (line.trim().startsWith("- ")) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        listItems.push(lines[i].trim().slice(2))
        i++
      }
      elements.push(
        <ul key={key++} className="list-disc pl-6 my-3 space-y-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-lg text-foreground">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ul>,
      )
      continue
    }

    // Check for ordered list items
    if (line.trim().match(/^\d+\.\s/)) {
      const listItems: string[] = []
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ""))
        i++
      }
      elements.push(
        <ol key={key++} className="list-decimal pl-6 my-3 space-y-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-lg text-foreground">
              {parseInlineMarkdown(item)}
            </li>
          ))}
        </ol>,
      )
      continue
    }

    // Regular paragraph (skip empty lines)
    if (line.trim()) {
      elements.push(
        <p key={key++} className="text-lg leading-relaxed my-3 text-foreground">
          {parseInlineMarkdown(line)}
        </p>,
      )
    }
    i++
  }

  return elements
}

// Parse inline markdown (bold, italic, code, links)
function parseInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold with **
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-bold" style={{ color: "#DC7B5D" }}>
          {boldMatch[1]}
        </strong>,
      )
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Italic with *
    const italicMatch = remaining.match(/^\*([^*]+)\*/)
    if (italicMatch) {
      parts.push(
        <em key={key++} className="italic">
          {italicMatch[1]}
        </em>,
      )
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Inline code with `
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      parts.push(
        <code key={key++} className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground">
          {codeMatch[1]}
        </code>,
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Emoji stars ⭐
    const emojiMatch = remaining.match(/^(⭐+)/)
    if (emojiMatch) {
      parts.push(<span key={key++}>{emojiMatch[1]}</span>)
      remaining = remaining.slice(emojiMatch[0].length)
      continue
    }

    // Regular text until next special character
    const textMatch = remaining.match(/^[^*`⭐]+/)
    if (textMatch) {
      parts.push(textMatch[0])
      remaining = remaining.slice(textMatch[0].length)
      continue
    }

    // If nothing matched, move one character forward
    parts.push(remaining[0])
    remaining = remaining.slice(1)
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>
}

export default function Slide({ slide, isHeadingSlide }: SlideProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).hljs) {
      document.querySelectorAll("pre code").forEach((el) => {
        ;(window as any).hljs.highlightElement(el)
      })
    }
  }, [slide])

  if (isHeadingSlide) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center space-y-8 py-20">
        <h1 className="presentation-serif text-6xl font-bold text-foreground leading-tight">{slide.title}</h1>
        <div className="presentation-serif text-xl text-muted-foreground max-w-2xl leading-relaxed">
          {slide.content}
        </div>
      </div>
    )
  }

  return (
    <div className="presentation-serif space-y-6 py-12">
      {slide.title && <h2 className="text-5xl font-bold text-foreground mb-8">{slide.title}</h2>}
      <div className="max-w-none text-foreground">{parseMarkdownToJSX(slide.content)}</div>
    </div>
  )
}
