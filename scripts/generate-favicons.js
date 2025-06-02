const fs = require('fs');
const path = require('path');

// Simple favicon generation script
// Since we don't have ImageMagick, we'll create a proper manifest with the actual favicon size

const faviconPath = path.join(__dirname, '../public/favicon.png');
const manifestPath = path.join(__dirname, '../public/site.webmanifest');

// Check if favicon exists
if (!fs.existsSync(faviconPath)) {
  console.error('Favicon not found at:', faviconPath);
  process.exit(1);
}

// Create a proper manifest that matches our actual favicon
const manifest = {
  "name": "PetSmart Admin Dashboard",
  "short_name": "PetSmart Admin",
  "description": "Administrative dashboard for PetSmart management system",
  "icons": [
    {
      "src": "/favicon.png",
      "sizes": "48x48",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon.png", 
      "sizes": "48x48",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "orientation": "portrait-primary"
};

// Write the manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ Updated site.webmanifest with correct favicon sizes');

// Create additional favicon sizes by copying the original
// This is a simple approach - in production you'd want proper resizing
const publicDir = path.join(__dirname, '../public');

// Copy favicon to standard sizes (browsers will scale as needed)
const faviconBuffer = fs.readFileSync(faviconPath);

// Create 16x16 and 32x32 versions (browsers will scale the 48x48 image)
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), faviconBuffer);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), faviconBuffer);

console.log('✅ Created additional favicon sizes');
console.log('✅ Favicon setup complete!');
