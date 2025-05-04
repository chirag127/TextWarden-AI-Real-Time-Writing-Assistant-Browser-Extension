// Script to generate PNG icons from SVG
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Sizes for the icons
const sizes = [16, 48, 128];

// Path to the SVG icon
const svgPath = path.join(__dirname, '../icons/icon.svg');

// Function to convert SVG to PNG
async function convertSvgToPng(svgPath, size) {
  try {
    // Create canvas with the specified size
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Load the SVG image
    const image = await loadImage(svgPath);
    
    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0, size, size);
    
    // Get the PNG buffer
    const buffer = canvas.toBuffer('image/png');
    
    // Save the PNG file
    const outputPath = path.join(__dirname, `../icons/icon${size}.png`);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Generated icon${size}.png`);
  } catch (error) {
    console.error(`Error generating icon${size}.png:`, error);
  }
}

// Generate icons for all sizes
async function generateIcons() {
  console.log('Generating icons from SVG...');
  
  for (const size of sizes) {
    await convertSvgToPng(svgPath, size);
  }
  
  console.log('Icon generation complete!');
}

// Run the icon generation
generateIcons();
