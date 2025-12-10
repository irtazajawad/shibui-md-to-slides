"use client"

import type React from "react"

import { useRef } from "react"

interface WelcomeScreenProps {
  onUpload: (markdown: string) => void
  onCreate: () => void
}

export default function WelcomeScreen({ onUpload, onCreate }: WelcomeScreenProps) {
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
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDFB]">
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
        <h1 className="font-serif text-4xl font-medium text-foreground mb-3">Markdown Slides</h1>
        <p className="text-muted-foreground text-lg mb-12">Create minimal presentations from your markdown files</p>

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

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept=".md" onChange={handleFileUpload} className="hidden" />

        {/* Helper text */}
        <p className="mt-8 text-sm text-muted-foreground">
          Supported format: <code className="px-1.5 py-0.5 bg-foreground/5 rounded text-xs">.md</code> files
        </p>
      </div>
    </div>
  )
}
