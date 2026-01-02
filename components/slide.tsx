"use client"

import type React from "react"

import { useEffect } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

// KaTeX options with common macros for blackboard bold and other symbols
const katexOptions = {
  throwOnError: false,
  strict: false,
  trust: true,
  macros: {
    "\\R": "\\mathbb{R}",
    "\\N": "\\mathbb{N}",
    "\\Z": "\\mathbb{Z}",
    "\\Q": "\\mathbb{Q}",
    "\\C": "\\mathbb{C}",
    "\\P": "\\mathbb{P}",
    "\\F": "\\mathbb{F}",
  },
}

interface SlideProps {
  slide: { title: string; content: string; isHeadingSlide?: boolean }
  isHeadingSlide?: boolean
  highlightColor: string
  textColor: string
}

function parseMarkdownToJSX(content: string, highlightColor: string): React.ReactNode[] {
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
                  <th key={idx}>{parseInlineMarkdown(cell, highlightColor)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx}>{parseInlineMarkdown(cell, highlightColor)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    // Check for block math equations ($$...$$)
    if (line.trim().startsWith("$$")) {
      // Check if it's a single-line block math
      if (line.trim().endsWith("$$") && line.trim().length > 4) {
        const mathContent = line.trim().slice(2, -2)
        try {
          const html = katex.renderToString(mathContent, {
            ...katexOptions,
            displayMode: true,
          })
          elements.push(
            <div
              key={key++}
              className="katex-block my-4 text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        } catch {
          elements.push(<div key={key++} className="my-4 text-center">{line}</div>)
        }
        i++
        continue
      }
      // Multi-line block math
      const mathLines: string[] = []
      const firstLine = line.trim().slice(2) // Remove opening $$
      if (firstLine) mathLines.push(firstLine)
      i++
      while (i < lines.length && !lines[i].trim().endsWith("$$")) {
        mathLines.push(lines[i])
        i++
      }
      if (i < lines.length) {
        const lastLine = lines[i].trim().slice(0, -2) // Remove closing $$
        if (lastLine) mathLines.push(lastLine)
      }
      i++

      const mathContent = mathLines.join("\n")
      try {
        const html = katex.renderToString(mathContent, {
          ...katexOptions,
          displayMode: true,
        })
        elements.push(
          <div
            key={key++}
            className="katex-block my-4 text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      } catch {
        elements.push(<div key={key++} className="my-4 text-center">{mathContent}</div>)
      }
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

    // Check for headings (h1-h6)
    if (line.startsWith("###### ")) {
      elements.push(
        <h6 key={key++} className="text-sm md:text-base font-bold mt-2 mb-1 opacity-90">
          {parseInlineMarkdown(line.slice(7), highlightColor)}
        </h6>,
      )
      i++
      continue
    }
    if (line.startsWith("##### ")) {
      elements.push(
        <h5 key={key++} className="text-base md:text-lg font-bold mt-2 mb-1 opacity-90">
          {parseInlineMarkdown(line.slice(6), highlightColor)}
        </h5>,
      )
      i++
      continue
    }
    if (line.startsWith("#### ")) {
      elements.push(
        <h4 key={key++} className="text-lg md:text-xl font-bold mt-3 mb-2">
          {parseInlineMarkdown(line.slice(5), highlightColor)}
        </h4>,
      )
      i++
      continue
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={key++} className="text-2xl md:text-3xl font-bold mt-4 mb-2">
          {parseInlineMarkdown(line.slice(4), highlightColor)}
        </h3>,
      )
      i++
      continue
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={key++} className="text-3xl md:text-4xl font-bold mt-6 mb-3">
          {parseInlineMarkdown(line.slice(3), highlightColor)}
        </h2>,
      )
      i++
      continue
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={key++} className="text-4xl md:text-5xl font-bold mt-8 mb-4">
          {parseInlineMarkdown(line.slice(2), highlightColor)}
        </h1>,
      )
      i++
      continue
    }

    // Check for blockquotes
    if (line.startsWith("> ")) {
      const quoteLines: string[] = []

      // Collect all lines that are part of the blockquote
      while (i < lines.length) {
        const currentLine = lines[i]

        // If line starts with >, add its content
        if (currentLine.startsWith("> ")) {
          quoteLines.push(currentLine.slice(2))
          i++
        }
        // If line doesn't start with > but is not empty and previous line had content,
        // it's a continuation (like attribution lines)
        else if (currentLine.trim() && quoteLines.length > 0) {
          quoteLines.push(currentLine)
          i++
        }
        // Empty line or start of new block - end blockquote
        else {
          break
        }
      }

      // Join lines with line breaks
      const quoteContent = quoteLines.join("\n")

      elements.push(
        <blockquote key={key++} className="border-l-4 border-primary pl-6 italic my-4 text-lg md:text-xl opacity-80 whitespace-pre-line">
          {parseInlineMarkdown(quoteContent, highlightColor)}
        </blockquote>,
      )
      continue
    }

    // Check for unordered list items (both - and * bullets, with nesting support)
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const listLines: { indent: number; text: string }[] = []

      while (i < lines.length) {
        const currentLine = lines[i]
        const trimmed = currentLine.trim()

        if (!trimmed.startsWith("- ") && !trimmed.startsWith("* ")) {
          if (!trimmed) {
            i++
            continue
          }
          break
        }

        const indent = currentLine.search(/\S/)
        const text = trimmed.slice(2)
        listLines.push({ indent, text })
        i++
      }

      const renderNestedList = (items: { indent: number; text: string }[], baseIndent: number): React.ReactNode[] => {
        const result: React.ReactNode[] = []
        let subKey = 0
        let j = 0

        while (j < items.length) {
          const item = items[j]

          if (item.indent === baseIndent) {
            const children: { indent: number; text: string }[] = []
            let k = j + 1

            while (k < items.length && items[k].indent > baseIndent) {
              children.push(items[k])
              k++
            }

            result.push(
              <li key={subKey++} className="text-lg md:text-xl">
                {parseInlineMarkdown(item.text, highlightColor)}
                {children.length > 0 && (
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    {renderNestedList(children, Math.min(...children.map(c => c.indent)))}
                  </ul>
                )}
              </li>
            )

            j = k
          } else {
            j++
          }
        }

        return result
      }

      const minIndent = Math.min(...listLines.map(item => item.indent))

      elements.push(
        <ul key={key++} className="list-disc pl-8 my-4 space-y-3">
          {renderNestedList(listLines, minIndent)}
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
        <ol key={key++} className="list-decimal pl-8 my-4 space-y-3">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-lg md:text-xl">
              {parseInlineMarkdown(item, highlightColor)}
            </li>
          ))}
        </ol>,
      )
      continue
    }

    // Regular paragraph (skip empty lines)
    if (line.trim()) {
      elements.push(
        <p key={key++} className="text-lg md:text-xl leading-relaxed my-4">
          {parseInlineMarkdown(line, highlightColor)}
        </p>,
      )
    }
    i++
  }

  return elements
}

function parseInlineMarkdown(text: string, highlightColor: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Handle escaped characters (backslash escapes)
    if (remaining.startsWith("\\")) {
      const nextChar = remaining[1]
      if (nextChar && /[\\`*_{}[\]()#+\-.!|$~<>]/.test(nextChar)) {
        parts.push(nextChar)
        remaining = remaining.slice(2)
        continue
      }
    }

    // Bold and italic with ***
    const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/)
    if (boldItalicMatch) {
      parts.push(
        <strong key={key++} className="font-bold italic" style={{ color: highlightColor }}>
          {parseInlineMarkdown(boldItalicMatch[1], highlightColor)}
        </strong>,
      )
      remaining = remaining.slice(boldItalicMatch[0].length)
      continue
    }

    // Bold with **
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-bold" style={{ color: highlightColor }}>
          {parseInlineMarkdown(boldMatch[1], highlightColor)}
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
          {parseInlineMarkdown(italicMatch[1], highlightColor)}
        </em>,
      )
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }

    // Strikethrough with ~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/)
    if (strikeMatch) {
      parts.push(
        <span key={key++} className="line-through">
          {parseInlineMarkdown(strikeMatch[1], highlightColor)}
        </span>,
      )
      remaining = remaining.slice(strikeMatch[0].length)
      continue
    }

    // Underline with <u>
    const underlineMatch = remaining.match(/^<u>(.+?)<\/u>/)
    if (underlineMatch) {
      parts.push(
        <u key={key++}>
          {parseInlineMarkdown(underlineMatch[1], highlightColor)}
        </u>,
      )
      remaining = remaining.slice(underlineMatch[0].length)
      continue
    }

    // Subscript with <sub>
    const subscriptMatch = remaining.match(/^<sub>(.+?)<\/sub>/)
    if (subscriptMatch) {
      parts.push(
        <sub key={key++}>
          {parseInlineMarkdown(subscriptMatch[1], highlightColor)}
        </sub>,
      )
      remaining = remaining.slice(subscriptMatch[0].length)
      continue
    }

    // Superscript with <sup>
    const superscriptMatch = remaining.match(/^<sup>(.+?)<\/sup>/)
    if (superscriptMatch) {
      parts.push(
        <sup key={key++}>
          {parseInlineMarkdown(superscriptMatch[1], highlightColor)}
        </sup>,
      )
      remaining = remaining.slice(superscriptMatch[0].length)
      continue
    }

    // Inline code with `
    const codeMatch = remaining.match(/^`([^`]+)`/)
    if (codeMatch) {
      parts.push(
        <code key={key++} className="bg-muted px-2 py-1 rounded text-sm font-mono">
          {codeMatch[1]}
        </code>,
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // Inline links with [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition-opacity"
          style={{ color: highlightColor }}
        >
          {parseInlineMarkdown(linkMatch[1], highlightColor)}
        </a>,
      )
      remaining = remaining.slice(linkMatch[0].length)
      continue
    }

    // Emoji stars ⭐
    const emojiMatch = remaining.match(/^(⭐+)/)
    if (emojiMatch) {
      parts.push(<span key={key++}>{emojiMatch[1]}</span>)
      remaining = remaining.slice(emojiMatch[0].length)
      continue
    }

    // Math equations with $ (inline math)
    const mathMatch = remaining.match(/^\$([^$]+)\$/)
    if (mathMatch) {
      try {
        const html = katex.renderToString(mathMatch[1], {
          ...katexOptions,
          displayMode: false,
        })
        parts.push(
          <span
            key={key++}
            className="katex-inline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      } catch {
        // If KaTeX fails, just show the raw text
        parts.push(<span key={key++}>${mathMatch[1]}$</span>)
      }
      remaining = remaining.slice(mathMatch[0].length)
      continue
    }

    // Regular text until next special character
    const textMatch = remaining.match(/^[^*`⭐$\\~<\[]+/)
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

export default function Slide({ slide, isHeadingSlide, highlightColor, textColor }: SlideProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).hljs) {
      // Remove previous highlighting to allow re-highlighting with new language
      document.querySelectorAll("pre code.hljs").forEach((el) => {
        el.removeAttribute("data-highlighted")
        el.className = el.className.replace(/\bhljs-[^\s]*/g, "").replace(/\bhljs\b/, "").trim()
      })

      // Apply highlighting to all code blocks
      document.querySelectorAll("pre code").forEach((el) => {
        ; (window as any).hljs.highlightElement(el)
      })
    }
  }, [slide.title, slide.content])

  if (isHeadingSlide) {
    // Check if content starts with ## (subtitle) and extract it cleanly
    const contentLines = slide.content.split("\n")
    let subtitle = ""
    let remainingContent = slide.content

    if (contentLines[0]?.startsWith("## ")) {
      subtitle = contentLines[0].slice(3) // Remove "## "
      remainingContent = contentLines.slice(1).join("\n").trim()
    }

    return (
      <div className="h-full flex flex-col justify-center items-center text-center space-y-8 py-12" style={{ color: textColor }}>
        <h1 className="presentation-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">{parseInlineMarkdown(slide.title, highlightColor)}</h1>
        {subtitle && (
          <h2 className="presentation-serif text-xl md:text-2xl lg:text-3xl font-normal opacity-70 max-w-4xl leading-relaxed">
            {parseInlineMarkdown(subtitle, highlightColor)}
          </h2>
        )}
        {remainingContent && (
          <div className="presentation-serif text-lg md:text-xl opacity-70 max-w-3xl leading-relaxed">
            {parseMarkdownToJSX(remainingContent, highlightColor)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="presentation-serif space-y-6 py-8" style={{ color: textColor }}>
      {slide.title && <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">{parseInlineMarkdown(slide.title, highlightColor)}</h2>}
      <div className="max-w-none text-lg md:text-xl">{parseMarkdownToJSX(slide.content, highlightColor)}</div>
    </div>
  )
}
