/**
 * TextWarden Icon Generator
 * 
 * This script converts the SVG icon to PNG files of different sizes.
 * 
 * @author Chirag Singhal (chirag127)
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Sizes to generate
const sizes = [16, 48, 128];

// Read the SVG file
const svgPath = path.join(__dirname, 'icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Create a data URL from the SVG content
const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;

// Generate PNG files for each size
async function generateIcons() {
  try {
    // Load the SVG image
    const image = await loadImage(svgDataUrl);
    
    // Generate each size
    for (const size of sizes) {
      // Create a canvas with the desired size
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Draw the image on the canvas
      ctx.drawImage(image, 0, 0, size, size);
      
      // Convert canvas to PNG buffer
      const buffer = canvas.toBuffer('image/png');
      
      // Save the PNG file
      const outputPath = path.join(__dirname, `icon${size}.png`);
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`Generated ${outputPath}`);
    }
    
    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

// Run the generator
generateIcons();
