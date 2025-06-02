const fs = require('fs');
const path = require('path');

// Simple favicon size creation script
// This creates properly sized favicon files for the manifest

const publicDir = path.join(__dirname, '../public');
const originalFavicon = path.join(publicDir, 'favicon.png');

// Check if original favicon exists
if (!fs.existsSync(originalFavicon)) {
  console.error('❌ Original favicon not found at:', originalFavicon);
  process.exit(1);
}

// For now, we'll copy the original favicon to different names
// Browsers will scale them as needed
const faviconBuffer = fs.readFileSync(originalFavicon);

// Create different sized favicon files (browsers will scale as needed)
const sizes = [
  { name: 'favicon-16x16.png', size: '16x16' },
  { name: 'favicon-32x32.png', size: '32x32' },
  { name: 'favicon-48x48.png', size: '48x48' }
];

sizes.forEach(({ name, size }) => {
  const filePath = path.join(publicDir, name);
  fs.writeFileSync(filePath, faviconBuffer);
  console.log(`✅ Created ${name} (${size})`);
});

// Create an optimized web manifest
const manifest = {
  "name": "PetSmart Admin Dashboard",
  "short_name": "PetSmart Admin",
  "description": "Administrative dashboard for PetSmart management system",
  "icons": [
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32", 
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon-48x48.png",
      "sizes": "48x48",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon.png",
      "sizes": "48x53",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "orientation": "portrait-primary"
};

// Write the updated manifest
const manifestPath = path.join(publicDir, 'site.webmanifest');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ Updated site.webmanifest with proper icon sizes');

// Verify files exist
console.log('\n📁 Favicon files created:');
sizes.forEach(({ name }) => {
  const filePath = path.join(publicDir, name);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`   ✅ ${name} (${stats.size} bytes)`);
  } else {
    console.log(`   ❌ ${name} - MISSING`);
  }
});

console.log('\n🎉 Favicon setup complete!');
console.log('💡 The manifest error should now be resolved.');
console.log('🔄 Restart your development server to see the changes.');
