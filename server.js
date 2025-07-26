const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');

// Load label size configuration
const labelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'label-sizes.json'), 'utf8'));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get available label sizes
app.get('/api/label-sizes', (req, res) => {
    res.json(labelConfig);
});

app.post('/generate-label', async (req, res) => {
    try {
        const {
            origin,
            roaster,
            flavorNotes,
            processing,
            region,
            varietal,
            roastDate,
            storageDate,
            weightAmount,
            weightUnit,
            altitudeAmount,
            altitudeUnit,
            qrUrl,
            labelSize = 'standard'
        } = req.body;
        
        const weight = `${weightAmount}${weightUnit}`;
        const altitude = altitudeAmount ? `${altitudeAmount} ${altitudeUnit}` : null;

        // Get label size configuration
        const sizeConfig = labelConfig.sizes[labelSize] || labelConfig.sizes[labelConfig.default];
        
        // Convert inches to points (72 points per inch)
        const configInPoints = {
            ...sizeConfig,
            width: sizeConfig.width * 72,
            height: sizeConfig.height * 72,
            margins: {
                top: sizeConfig.margins.top * 72,
                bottom: sizeConfig.margins.bottom * 72,
                left: sizeConfig.margins.left * 72,
                right: sizeConfig.margins.right * 72
            },
            qrSize: sizeConfig.qrSize * 72,
            spacing: {
                roasterMargin: sizeConfig.spacing.roasterMargin * 72,
                contentTop: sizeConfig.spacing.contentTop * 72,
                flavorNotesGap: sizeConfig.spacing.flavorNotesGap * 72,
                detailsGap: sizeConfig.spacing.detailsGap * 72
            }
        };
        
        // Format dates to match your existing label format
        const roast = new Date(roastDate);
        const storage = new Date(storageDate);
        const roastFormatted = `${roast.getMonth() + 1}/${roast.getDate()}/${roast.getFullYear()}`;
        const storageFormatted = `${storage.getMonth() + 1}/${storage.getDate()}/${storage.getFullYear()}`;

        // Generate PDF with configurable label dimensions
        const doc = new PDFDocument({
            size: [configInPoints.width, configInPoints.height],
            margins: configInPoints.margins,
            autoFirstPage: true,
            bufferPages: true
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="coffee-label-${origin.replace(/\s+/g, '-').toLowerCase()}.pdf"`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Create the label layout with configurable sizing
        await generateLabel(doc, {
            origin,
            roaster,
            flavorNotes,
            processing,
            region,
            varietal,
            roastFormatted,
            storageFormatted,
            weight,
            altitude,
            qrUrl
        }, configInPoints);

        doc.end();

    } catch (error) {
        console.error('Error generating label:', error);
        res.status(500).json({ error: 'Failed to generate label' });
    }
});

async function generateLabel(doc, data, config) {
    // Thermal printer optimization - pure black and white, no gradients or colors
    
    // Simple black border for thermal printing
    doc.rect(2, 2, config.width - 4, config.height - 4)
       .stroke('#000000', 1);

    // QR Code placement (if URL provided)
    let qrSize = 0;
    if (data.qrUrl) {
        qrSize = config.qrSize;
        try {
            const qrBuffer = await QRCode.toBuffer(data.qrUrl, {
                type: 'png',
                width: qrSize,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            // Place QR code in top right corner
            doc.image(qrBuffer, config.width - qrSize - config.margins.right, config.margins.top, {
                width: qrSize,
                height: qrSize
            });
        } catch (error) {
            console.error('QR Code generation failed:', error);
        }
    }

    // Roaster/Brand text (vertical, left side) - bottom justified
    doc.save();
    
    // Calculate font size based on character count using config
    const roasterText = data.roaster.toUpperCase();
    const textLength = roasterText.length;
    let fontSize = config.roasterFontSizes.default;
    
    // Font size based on length from config
    for (const [maxLength, size] of Object.entries(config.roasterFontSizes)) {
        if (maxLength !== 'default' && textLength <= parseInt(maxLength)) {
            fontSize = size;
            break;
        }
    }
    
    console.log(`Roaster: "${roasterText}" (${textLength} chars) -> ${fontSize}pt, bottom justified`);
    
    // Position at bottom of available space and rotate
    doc.translate(config.margins.left, config.height - config.margins.bottom - 10);
    doc.rotate(-90);
    
    // Simple bottom positioning - text starts at bottom and grows up
    doc.fontSize(fontSize)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(roasterText, 0, 0); // Simple positioning at bottom
    doc.restore();

    // Main content area - adjusted for configurable roaster name and QR code space
    const leftMargin = config.spacing.roasterMargin;
    const rightMargin = qrSize > 0 ? qrSize + 15 : config.margins.right;
    const contentWidth = config.width - leftMargin - rightMargin;
    let yPos = config.spacing.contentTop;

    // Coffee origin - bold and prominent for thermal
    doc.fontSize(config.fonts.origin)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(data.origin.toUpperCase(), leftMargin, yPos);
    
    // Simple underline for thermal printing
    doc.moveTo(leftMargin, yPos + 16)
       .lineTo(leftMargin + Math.min(doc.widthOfString(data.origin.toUpperCase()), contentWidth - 10), yPos + 16)
       .stroke('#000000', 0.5);
    
    yPos += 22;

    // Flavor notes with configurable spacing
    doc.fontSize(config.fonts.flavorNotesLabel)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('TASTING NOTES', leftMargin, yPos);
    
    yPos += config.spacing.flavorNotesGap;

    doc.fontSize(config.fonts.flavorNotes)
       .font('Helvetica')
       .fillColor('#000000')
       .text(data.flavorNotes, leftMargin, yPos, {
           width: contentWidth - 10,
           lineGap: 1,
           align: 'left'
       });
    
    // Calculate dynamic spacing based on config
    const flavorHeight = Math.ceil(data.flavorNotes.length / 40) * config.spacing.flavorNotesGap;
    yPos += Math.max(flavorHeight, 16);

    // Details in two columns - optimized for thermal printing
    const col1 = leftMargin;
    const col2 = leftMargin + (contentWidth / 2);
    
    // Left column with configurable fonts
    doc.fontSize(config.fonts.detailLabels)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('PROCESS', col1, yPos);
    
    doc.fontSize(config.fonts.details)
       .font('Helvetica')
       .text(data.processing, col1, yPos + config.spacing.detailsGap);

    doc.fontSize(config.fonts.detailLabels)
       .font('Helvetica-Bold')
       .text('REGION', col1, yPos + 20);
    
    doc.fontSize(config.fonts.details)
       .font('Helvetica')
       .text(data.region, col1, yPos + 28);

    doc.fontSize(config.fonts.detailLabels)
       .font('Helvetica-Bold')
       .text('VARIETAL', col1, yPos + 40);
    
    doc.fontSize(config.fonts.details)
       .font('Helvetica')
       .text(data.varietal, col1, yPos + 48);

    // Right column
    doc.fontSize(config.fonts.detailLabels)
       .font('Helvetica-Bold')
       .text('ROASTED', col2, yPos);
    
    doc.fontSize(config.fonts.details)
       .font('Helvetica')
       .text(data.roastFormatted, col2, yPos + config.spacing.detailsGap);

    doc.fontSize(config.fonts.detailLabels)
       .font('Helvetica-Bold')
       .text('STORED', col2, yPos + 20);
    
    doc.fontSize(config.fonts.details)
       .font('Helvetica')
       .text(data.storageFormatted, col2, yPos + 28);

    // Weight - same formatting as other details
    doc.fontSize(config.fonts.detailLabels)
       .font('Helvetica-Bold')
       .text('WEIGHT', col2, yPos + 40);
    
    doc.fontSize(config.fonts.details)
       .font('Helvetica')
       .text(data.weight, col2, yPos + 48);

    // Altitude (if provided)
    if (data.altitude) {
        doc.fontSize(config.fonts.detailLabels)
           .font('Helvetica-Bold')
           .text('ALTITUDE', col2, yPos + 60);
        
        doc.fontSize(config.fonts.details)
           .font('Helvetica')
           .text(data.altitude, col2, yPos + 68);
    }

    // Simple bottom line for thermal printing
    doc.moveTo(leftMargin, config.height - config.margins.bottom - 5)
       .lineTo(config.width - rightMargin, config.height - config.margins.bottom - 5)
       .stroke('#000000', 0.3);
}

app.listen(PORT, () => {
    console.log(`Coffee Label Generator running at http://localhost:${PORT}`);
});