# Coffee Label Generator - Web Application

Generate professional PDF labels for your vacuum-sealed coffee bags with a user-friendly web interface. Designed to match your existing label format perfectly.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Open your browser**:
   ```
   http://localhost:3000
   ```

## Features

- **Web-based interface** - Works on any device with a browser
- **Exact design replication** - Matches your existing label layout
- **PDF generation** - Creates print-ready PDFs for any printer
- **Live preview** - See your label before generating
- **Auto-calculations** - Storage date calculated automatically
- **Responsive design** - Works on desktop and mobile

## Label Information

The generated labels include:
- **Brand/Logo** (configurable, defaults to "Ilse")
- **Coffee Origin** (prominently displayed)
- **Flavor Notes** (detailed tasting profile)
- **Processing Method** (Washed, Natural, Honey, etc.)
- **Region/Farm** (specific location info)
- **Roast Date** (with date picker)
- **Storage Date** (auto-calculated from roast date)
- **Weight** (with unit selection)

## Usage

1. Fill out the web form with your coffee details
2. Click "Preview Label" to see how it will look
3. Click "Generate PDF Label" to download the printable PDF
4. Print the PDF on your Phomemo M221 or any printer

## Label Specifications

- **Dimensions**: 3" × 2" (optimized for M221 printer)
- **Format**: PDF with exact layout matching your existing labels
- **Typography**: Clean, professional fonts with proper hierarchy
- **Layout**: Left-aligned content with vertical brand placement

## Printing

The generated PDFs work with:
- ✅ Phomemo M221 thermal printer
- ✅ Any standard printer (inkjet, laser)
- ✅ Print shops and services
- ✅ Mobile printing apps

## Development

```bash
# Start development server
npm run dev

# Project structure
├── server.js          # Express server and PDF generation
├── public/
│   ├── index.html     # Web interface
│   ├── style.css      # Styling and responsive design
│   └── script.js      # Form handling and preview
└── package.json       # Dependencies and scripts
```

## Legacy Python Version

The original Python/Bluetooth version is still available in the repository but the web-based approach is recommended for ease of use and compatibility.