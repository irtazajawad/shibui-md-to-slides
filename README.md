<div align="center">
  <img src="public/logo.png" alt="Shibui Logo" width="200"/>
  
  # Shibui (渋い)
  
  ### An extremely minimal markdown presentation app
  
  *Vibe coded over a weekend, born out of mild frustration and a free weekend.*

  [![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/irtazas-projects-4e638e3d/markdown-to-slides)
  
</div>



## What is Shibui?

[Shibui](https://v0-shibui.vercel.app/) is a minimal markdown-to-slides presentation app that lets you focus on your ideas, not your tooling. Write in markdown, present instantly. No templates, no distractions, no BS.



## 🚀 Features

### Core Functionality
- **📝 Markdown Editor** - Built-in editor with live preview
- **📤 File Upload** - Drop in your `.md` files and start presenting
- **🎨 Syntax Highlighting** - Beautiful code blocks with highlight.js
- **🧮 LaTeX Math** - Full KaTeX support for equations
- **📊 Tables** - Clean, readable table rendering
- **🎯 Slide Navigation** - Keyboard shortcuts (←/→) and visual controls

### Text Formatting
- **Bold** for emphasis
- *Italic* for tone
- `Inline code` with backticks
- Lists (both `*` and `-` bullets)
- Blockquotes

### Advanced Features
- **LaTeX Math Support**
  - Inline equations 
  - Display equations
  - Complex formulas and matrices
- **Code Blocks** with syntax highlighting
- **Tables** with automatic formatting
- **Fullscreen Mode** for distraction-free presenting
- **Zoom Controls** for better visibility
- **Table of Contents** for easy navigation
- **Restore Previous Presentation** - Accidentally hit the new button? No worries.


## 📖 How to Use

### Getting Started

1. **Visit the app** at your deployment URL
2. **Choose your starting point:**
   - Click **Upload Markdown** to import an existing `.md` file
   - Click **Create New** to start with a sample presentation

### Creating Slides

Each slide is separated by `---` (three hyphens):

\`\`\``markdown
# Main Title
## Subtitle

---

## Slide Title

- Bullet point 1
- Bullet point 2

---

## Another Slide

Your content here...
\`\`\``

### Slide Structure

- Use `#` for main title slides (centered, large)
- Use `##` for regular slide titles
- Add content below headings

### Keyboard Shortcuts

- `→` or `Right Arrow` - Next slide
- `←` or `Left Arrow` - Previous slide



## 🛠️ Local Development

### Prerequisites

- Node.js 18+ or later
- pnpm or npm

### Setup

\`\`\`bash
# Clone the repository
git https://github.com/irtazajawad/shibui-md-to-slides.git

# Navigate to the project
cd shibui-md-to-slides

# Install dependencies
pnpm install
# or
npm install

# Run development server
pnpm dev
# or
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.




## 🏗️ Built With

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **KaTeX** - Math rendering
- **Highlight.js** - Code syntax highlighting



## 🤝 Contributing

Contributions are welcome! This project was built over a weekend, so there's plenty of room for improvement.

**To contribute:**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## 🙏 Acknowledgments

Built with frustration from existing tools and a weekend of coding. If you find this useful, star the repo ⭐



<div align="center">
  Made with ☕ and minimal design principles
</div>
