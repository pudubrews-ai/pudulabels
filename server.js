const express = require('express');
const path = require('path');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');

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
            qrUrl
        } = req.body;
        
        const weight = `${weightAmount}${weightUnit}`;
        const altitude = altitudeAmount ? `${altitudeAmount} ${altitudeUnit}` : null;

        // Format dates to match your existing label format
        const roast = new Date(roastDate);
        const storage = new Date(storageDate);
        const roastFormatted = `${roast.getMonth() + 1}/${roast.getDate()}/${roast.getFullYear()}`;
        const storageFormatted = `${storage.getMonth() + 1}/${storage.getDate()}/${storage.getFullYear()}`;

        // Generate PDF with proper label dimensions
        const doc = new PDFDocument({
            size: [216, 144], // 3" x 2" at 72 DPI (exact label size)
            margins: { top: 8, bottom: 8, left: 12, right: 8 },
            autoFirstPage: true,
            bufferPages: true
        });

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="coffee-label-${origin.replace(/\s+/g, '-').toLowerCase()}.pdf"`);

        // Pipe the PDF to the response
        doc.pipe(res);

        // Create the label layout matching your existing design
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
        });

        doc.end();

    } catch (error) {
        console.error('Error generating label:', error);
        res.status(500).json({ error: 'Failed to generate label' });
    }
});

async function generateLabel(doc, data) {
    // Thermal printer optimization - pure black and white, no gradients or colors
    
    // Simple black border for thermal printing
    doc.rect(2, 2, 212, 140)
       .stroke('#000000', 1);

    // QR Code placement (if URL provided)
    let qrSize = 0;
    if (data.qrUrl) {
        qrSize = 35; // QR code size
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
            doc.image(qrBuffer, 216 - qrSize - 8, 8, {
                width: qrSize,
                height: qrSize
            });
        } catch (error) {
            console.error('QR Code generation failed:', error);
        }
    }

    // Roaster/Brand text (vertical, left side) - bottom justified
    doc.save();
    
    // Calculate font size based on character count
    const roasterText = data.roaster.toUpperCase();
    const textLength = roasterText.length;
    let fontSize;
    
    // Font size based on length
    if (textLength <= 4) {
        fontSize = 20; // Very short names like "ILSE"
    } else if (textLength <= 8) {
        fontSize = 16; // Short names
    } else if (textLength <= 12) {
        fontSize = 14; // Medium names
    } else if (textLength <= 16) {
        fontSize = 12; // Long names
    } else if (textLength <= 20) {
        fontSize = 10; // Very long names like "The Picky Chemist"
    } else {
        fontSize = 8; // Extremely long names
    }
    
    console.log(`Roaster: "${roasterText}" (${textLength} chars) -> ${fontSize}pt, bottom justified`);
    
    // Position at bottom of available space and rotate
    doc.translate(12, 130); // Bottom position
    doc.rotate(-90);
    
    // Simple bottom positioning - text starts at bottom and grows up
    doc.fontSize(fontSize)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(roasterText, 0, 0); // Simple positioning at bottom
    doc.restore();

    // Main content area - adjusted for much bigger roaster name and QR code space
    const leftMargin = 40;
    const rightMargin = qrSize > 0 ? qrSize + 15 : 8;
    const contentWidth = 216 - leftMargin - rightMargin;
    let yPos = 12;

    // Coffee origin - bold and prominent for thermal
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text(data.origin.toUpperCase(), leftMargin, yPos);
    
    // Simple underline for thermal printing
    doc.moveTo(leftMargin, yPos + 16)
       .lineTo(leftMargin + Math.min(doc.widthOfString(data.origin.toUpperCase()), contentWidth - 10), yPos + 16)
       .stroke('#000000', 0.5);
    
    yPos += 22;

    // Flavor notes with thermal-optimized spacing
    doc.fontSize(7)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('TASTING NOTES', leftMargin, yPos);
    
    yPos += 9;

    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#000000')
       .text(data.flavorNotes, leftMargin, yPos, {
           width: contentWidth - 10,
           lineGap: 1,
           align: 'left'
       });
    
    // Calculate dynamic spacing
    const flavorHeight = Math.ceil(data.flavorNotes.length / 40) * 9;
    yPos += Math.max(flavorHeight, 16);

    // Details in two columns - optimized for thermal printing
    const col1 = leftMargin;
    const col2 = leftMargin + (contentWidth / 2);
    
    // Left column
    doc.fontSize(6)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('PROCESS', col1, yPos);
    
    doc.fontSize(7)
       .font('Helvetica')
       .text(data.processing, col1, yPos + 8);

    doc.fontSize(6)
       .font('Helvetica-Bold')
       .text('REGION', col1, yPos + 20);
    
    doc.fontSize(7)
       .font('Helvetica')
       .text(data.region, col1, yPos + 28);

    doc.fontSize(6)
       .font('Helvetica-Bold')
       .text('VARIETAL', col1, yPos + 40);
    
    doc.fontSize(7)
       .font('Helvetica')
       .text(data.varietal, col1, yPos + 48);

    // Right column
    doc.fontSize(6)
       .font('Helvetica-Bold')
       .text('ROASTED', col2, yPos);
    
    doc.fontSize(7)
       .font('Helvetica')
       .text(data.roastFormatted, col2, yPos + 8);

    doc.fontSize(6)
       .font('Helvetica-Bold')
       .text('STORED', col2, yPos + 20);
    
    doc.fontSize(7)
       .font('Helvetica')
       .text(data.storageFormatted, col2, yPos + 28);

    // Weight - same formatting as other details
    doc.fontSize(6)
       .font('Helvetica-Bold')
       .text('WEIGHT', col2, yPos + 40);
    
    doc.fontSize(7)
       .font('Helvetica')
       .text(data.weight, col2, yPos + 48);

    // Altitude (if provided)
    if (data.altitude) {
        doc.fontSize(6)
           .font('Helvetica-Bold')
           .text('ALTITUDE', col2, yPos + 60);
        
        doc.fontSize(7)
           .font('Helvetica')
           .text(data.altitude, col2, yPos + 68);
    }

    // Simple bottom line for thermal printing
    doc.moveTo(leftMargin, 135)
       .lineTo(216 - rightMargin, 135)
       .stroke('#000000', 0.3);
}

app.listen(PORT, () => {
    console.log(`Coffee Label Generator running at http://localhost:${PORT}`);
});