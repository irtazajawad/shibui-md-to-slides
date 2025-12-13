"use client"

import type React from "react"

import { useRef } from "react"
import { zenMaruGothic } from "@/lib/fonts"

interface WelcomeScreenProps {
  onUpload: (markdown: string) => void
  onCreate: () => void
  onRestore: () => void
  hasSavedPresentation: boolean
}

export default function WelcomeScreen({ onUpload, onCreate, onRestore, hasSavedPresentation }: WelcomeScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith(".md")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onUpload(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFB]">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-xl px-6">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-foreground/5 flex items-center justify-center">
              <svg className="w-10 h-10 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 9h1M9 13h6M9 17h6" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl text-foreground mb-3">
            <span className="font-serif font-bold">Shibui</span>
            <span className={`${zenMaruGothic.className} ml-2`}>(渋い)</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-5">Create minimal presentations from your markdown files</p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload Markdown
            </button>

            {/* Create button */}
            <button
              onClick={onCreate}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-2 border-foreground/20 text-foreground font-medium hover:bg-foreground/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New
            </button>
          </div>

          {/* Restore button - shown only if there's a saved presentation */}
          {hasSavedPresentation && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={onRestore}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-orange-500/40 bg-orange-50/50 text-orange-700 text-sm font-medium hover:bg-orange-100/70 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                Restore Previous Presentation
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept=".md" onChange={handleFileUpload} className="hidden" />

          {/* Helper text */}
          <p className="mt-8 text-sm text-muted-foreground">
            Supported format: <code className="px-1.5 py-0.5 bg-foreground/5 rounded text-xs">.md</code> files
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center">
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span>Created by <a href="https://www.linkedin.com/in/irtaza-ahmed-958202249/" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:underline">Irtaza Ahmed</a></span>
          <span className="text-foreground/20">•</span>
          <a
            href="https://github.com/irtazajawad/markdown-to-slides.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
