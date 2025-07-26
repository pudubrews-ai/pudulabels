# Coffee Label Generator - Web Application

Generate professional PDF labels for your vacuum-sealed coffee bags with a user-friendly web interface. Designed to match your existing label format perfectly.

## System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher  
- **Browser**: Any modern web browser (Chrome, Firefox, Safari, Edge)
- **Memory**: 512MB RAM minimum
- **Storage**: 100MB free disk space

## Prerequisites

Before getting started, you'll need to install Node.js and npm on your system.

### Installing Node.js and npm

#### Option 1: Download from Official Website (Recommended)
1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS (Long Term Support) version
3. Run the installer and follow the setup wizard
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Option 2: Using Package Managers

**macOS (with Homebrew):**
```bash
brew install node
```

**Windows (with Chocolatey):**
```bash
choco install nodejs
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Linux (CentOS/RHEL/Fedora):**
```bash
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

## Quick Start

1. **Clone or download this repository**:
   ```bash
   git clone <repository-url>
   cd Pudulabels
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   ```
   http://localhost:3000
   ```

### Troubleshooting Installation

**If you get permission errors on macOS/Linux:**
```bash
sudo npm install -g npm@latest
```

**If npm install fails:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Check your Node.js version:**
- This project requires Node.js 16+ and npm 8+
- Run `node --version` and `npm --version` to check
- If your version is too old, please update Node.js from [nodejs.org](https://nodejs.org/)

## Features

- **Web-based interface** - Works on any device with a browser
- **Configurable label sizes** - Support for multiple thermal printer sizes
- **Exact design replication** - Matches your existing label layout
- **PDF generation** - Creates print-ready PDFs for any printer
- **Live preview** - See your label before generating with size preview
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

1. Select your preferred label size from the dropdown
2. Fill out the web form with your coffee details
3. Click "Preview Label" to see how it will look
4. Click "Generate PDF Label" to download the printable PDF
5. Print the PDF on your thermal printer or any standard printer

## Label Sizes & Configuration

### Available Sizes
- **Standard (3" × 2")** - Default size, optimized for Phomemo M221
- **Large (4" × 3")** - For bigger thermal printers  
- **Small (2" × 1.5")** - For compact label applications

### Customizing Label Sizes

Label dimensions and styling are fully configurable through `config/label-sizes.json`. You can:

- **Add new sizes** - Create custom dimensions for your specific printer
- **Adjust fonts** - Modify text sizes for better readability
- **Fine-tune spacing** - Control margins and element positioning
- **Scale QR codes** - Set appropriate QR code sizes for scanning

#### Example: Adding a Custom Size

```json
"custom": {
  "name": "Custom (2.5\" x 1.8\")",
  "width": 2.5,
  "height": 1.8,
  "margins": {"top": 0.1, "bottom": 0.1, "left": 0.15, "right": 0.1},
  "fonts": {"origin": 12, "flavorNotes": 7, "details": 6},
  "qrSize": 0.4,
  "spacing": {"roasterMargin": 0.45, "contentTop": 0.14}
}
```

#### Configuration Details

- **Measurements**: All dimensions in inches (automatically converted to points)
- **Dynamic scaling**: Roaster text size adjusts based on character count
- **Proportional fonts**: Text sizes scale appropriately with label dimensions
- **Thermal optimized**: Black and white design for thermal printers

### Label Specifications

- **Format**: PDF with exact layout matching your design
- **Typography**: Clean, professional fonts with proper hierarchy  
- **Layout**: Left-aligned content with vertical brand placement
- **QR codes**: Optional QR codes with configurable sizing

## Printing

The generated PDFs work with:
- ✅ **Thermal printers** - Phomemo M221, Brother QL series, DYMO, etc.
- ✅ **Standard printers** - Inkjet, laser, any PDF-capable printer
- ✅ **Print services** - Online print shops, local services
- ✅ **Mobile printing** - AirPrint, Google Cloud Print, printing apps

### Printer Setup Tips
- Select the correct label size in your printer driver
- Use the highest quality/slowest speed setting for thermal printers
- Test print on regular paper first to verify sizing
- For thermal printers, ensure labels are loaded correctly

## Development

```bash
# Start development server
npm run dev

# Project structure
├── server.js              # Express server and PDF generation
├── config/
│   └── label-sizes.json   # Label size configurations
├── public/
│   ├── index.html         # Web interface
│   ├── style.css          # Styling and responsive design
│   └── script.js          # Form handling and preview
└── package.json           # Dependencies and scripts
```

## Legacy Python Version

The original Python/Bluetooth version is still available in the repository but the web-based approach is recommended for ease of use and compatibility.