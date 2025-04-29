const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create directory if it doesn't exist
const assetsDir = path.join(__dirname);
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate a simple gradient icon
function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Create gradient background (blue to purple like FinBox)
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3B82F6');  // Blue
  gradient.addColorStop(1, '#8B5CF6');  // Purple
  
  // Fill background
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Add a white "F" letter in the center
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('F', size / 2, size / 2);
  
  // Save the file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, filename), buffer);
  
  console.log(`Generated ${filename} (${size}x${size})`);
}

// Generate all required icons
generateIcon(512, 'icon.png');       // Main app icon
generateIcon(16, 'tray-icon.png');   // System tray icon
generateIcon(80, 'logo.png');        // Logo for the app

console.log('All icons generated successfully!');
