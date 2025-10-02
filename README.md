# EpicUXTools

A collection of useful web-based tools for UX designers with retro pixel 8-bit ASCII aesthetics. All tools work directly in your browser with no setup required.

<img width="1280" height="1995" alt="image" src="https://github.com/user-attachments/assets/3e82d556-1b92-492c-bcb0-52bf36f3fb1c" />
<img width="1280" height="1130" alt="image" src="https://github.com/user-attachments/assets/e9c46c95-9a1b-4a0a-aea5-aa086f32d9cc" />

## Tools Collection

### 1. Image to PDF Converter
Convert multiple images (PNG, JPG, JPEG, GIF, BMP) into a single PDF file.
- **Features:**
  - Batch processing support
  - Multiple page sizes (A4, Letter, Legal, A3)
  - Portrait/Landscape orientation
  - 1, 2, or 4 images per page layout
  - Drag and drop interface
- **Location:** `/image-to-pdf/index.html`

### 2. Background Remover
Remove backgrounds from images instantly using AI technology.
- **Features:**
  - AI-powered background removal
  - Batch processing support
  - Live preview comparison (original vs processed)
  - Download individual images or all as ZIP
  - Supports PNG, JPG, JPEG formats
- **Location:** `/background-remover/index.html`

### 3. Image Color Inverter
Invert colors in images to create negative effects.
- **Features:**
  - Instant color inversion
  - Batch processing support
  - Live preview comparison
  - Download as PNG format
  - Navigate through multiple images
- **Location:** `/image-inverter/index.html`

### 4. Image Format Converter
Convert images between different formats (PNG, JPEG, WEBP).
- **Features:**
  - Batch conversion support
  - Quality control for JPEG/WEBP
  - Convert to PNG, JPEG, or WEBP
  - Automatic ZIP for multiple files
  - Preserves image dimensions
- **Location:** `/format-converter/index.html`

### 5. Image Resizer
Resize images to preset or custom dimensions.
- **Features:**
  - Preset sizes (4K, Full HD, Instagram, etc.)
  - Custom dimensions with aspect ratio control
  - Percentage-based scaling
  - Batch processing support
  - Multiple output formats
  - Automatic ZIP for batch downloads
- **Location:** `/image-resizer/index.html`

### 6. Text Analyzer
Analyze text for word count, readability, and statistics.
- **Features:**
  - Comprehensive text statistics
  - Readability scores
  - Word frequency analysis
  - Supports TXT, PDF, DOC, DOCX files
  - Dark retro theme
- **Location:** `/text-analyzer/index.html`

### 7. Color Palette Generator
Generate harmonious color schemes from a base color using different algorithms.
- **Features:**
  - Monochromatic, analogous, complementary schemes
  - Triadic and tetradic color harmonies
  - Random color generation
  - Export as CSS variables
  - Copy individual or all hex codes
- **Location:** `/color-palette-generator/index.html`

### 8. Grid Layout Generator
Create CSS Grid layouts visually with real-time preview.
- **Features:**
  - Customizable columns and rows
  - Multiple sizing options (equal, auto, minmax)
  - Adjustable gap spacing
  - Live CSS code generation
  - Download or copy CSS
- **Location:** `/grid-layout-generator/index.html`

### 9. Typography Tester
Preview and test font combinations with adjustable properties.
- **Features:**
  - Multiple web-safe and Google Fonts
  - Adjustable font size, weight, line height
  - Letter spacing control
  - Custom text preview
  - Export CSS properties
- **Location:** `/typography-tester/index.html`

### 10. Spacing Calculator
Calculate consistent spacing scales for design systems.
- **Features:**
  - Linear, Fibonacci, Golden Ratio scales
  - Modular and custom multiplier options
  - Visual spacing preview
  - CSS variables generation
  - Configurable base value and steps
- **Location:** `/spacing-calculator/index.html`

### 11. Contrast Checker
Check WCAG color contrast ratios for accessibility compliance.
- **Features:**
  - Real-time contrast ratio calculation
  - WCAG AA and AAA compliance checking
  - Both normal and large text standards
  - Visual preview with actual colors
  - Color swap functionality
- **Location:** `/contrast-checker/index.html`

### 12. Video Editor
Edit videos with multiple tools and live preview capabilities.
- **Features:**
  - **Trim:** Cut videos from start to end time with timeline markers
  - **Crop:** Crop video dimensions with preset aspect ratios (16:9, 9:16, 1:1, 4:3) or custom sizes
  - **Speed Control:** Adjust playback speed from 0.25x to 4.0x with live preview
  - **Reverse:** Reverse video playback direction
  - **Merge:** Combine multiple video files into one
  - Live preview with video info (duration, resolution, size, format)
  - Supports MP4, WEBM, OGG, MOV formats
  - Tab-based interface for easy tool switching
- **Location:** `/video-tools/index.html`

### 13. Audio Editor
Edit audio files with comprehensive tools and waveform visualization.
- **Features:**
  - **Trim:** Cut audio from start to end time with interactive timeline
  - **Crop:** Remove portions from beginning and/or end
  - **Speed Control:** Adjust playback speed (0.1x-4.0x) with pitch preservation option
  - **Reverse:** Reverse audio playback with Web Audio API processing
  - **Merge:** Concatenate multiple audio files
  - **Volume:** Adjust volume level (0-200%) with fade in/out effects
  - Live waveform visualization
  - Audio info display (duration, size, format, bitrate)
  - Supports MP3, WAV, OGG, M4A, AAC formats
  - Real-time preview of all edits
- **Location:** `/audio-tools/index.html`

## Design Theme

Tools feature a **retro pixel aesthetic** with VT323 monospace font and two available color themes:

### PixelOS Theme (Default)
- Background: #283238
- Text: #B6C2BF
- Card: #38454C
- Accent: #6AB0A2
- Accent Hover: #548C7F

### Ocean Theme (Alternative)
- Background: #1a3a4a
- Text: #a6c3d1
- Card: #2a5b74
- Accent: #4aa9d5
- Accent Hover: #3b87ab

### Font
- **Primary Font:** VT323 monospace
- **Source:** Google Fonts or local asset (assets/VT323-Regular.ttf)
- **Aesthetic:** Retro terminal and 8-bit style
- Dashed borders for classic pixel look
- ASCII art decorative elements

## Usage

Simply open any tool's `index.html` file in a modern web browser. All tools work client-side with:
- **No server required** - everything runs in your browser
- **No installation needed** - just open and use
- **Privacy-friendly** - your files never leave your computer
- **Works offline** - after the first load (CDN dependencies cached)

## Technology Stack

- Pure HTML5, CSS3, and JavaScript
- Canvas API for image processing
- Web Audio API for audio processing and waveform visualization
- HTML5 Video API for video playback and control
- Various libraries for specific features:
  - jsPDF for PDF generation
  - JSZip for creating ZIP archives
  - Background removal AI library
  - PDF.js for PDF reading

## Browser Support

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## License

Open source - feel free to use and modify!

## Credit

Authored by [Navaneeth Sankar K P](https://www.linkedin.com/in/navaneeth-sankar-k-p)
Code assist by Claude Sonnet 4.5 
