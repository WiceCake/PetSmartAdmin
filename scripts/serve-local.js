#!/usr/bin/env node

/**
 * Simple local server for testing the built application
 * Uses Node.js built-in http module to avoid dependency issues
 */

const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = process.env.PORT || 8080
const DIST_DIR = path.join(__dirname, '..', 'dist')

// Check if dist folder exists
if (!fs.existsSync(DIST_DIR)) {
  console.log('❌ dist folder not found. Please run "npm run build" first.')
  process.exit(1)
}

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.woff2': 'application/font-woff2',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.ico': 'image/x-icon'
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url)
  let pathname = parsedUrl.pathname

  // Remove leading slash
  if (pathname === '/') {
    pathname = '/index.html'
  }

  const filePath = path.join(DIST_DIR, pathname)
  const ext = path.parse(filePath).ext
  const mimeType = mimeTypes[ext] || 'text/plain'

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, serve index.html for SPA routing
      const indexPath = path.join(DIST_DIR, 'index.html')
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          res.statusCode = 500
          res.end('Error loading index.html')
          return
        }
        res.setHeader('Content-Type', 'text/html')
        res.end(data)
      })
    } else {
      // File exists, serve it
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 500
          res.end('Error loading file')
          return
        }
        res.setHeader('Content-Type', mimeType)
        res.end(data)
      })
    }
  })
})

server.listen(PORT, () => {
  console.log('🚀 Local server started!')
  console.log(`📱 Application: http://localhost:${PORT}`)
  console.log('📁 Serving from:', DIST_DIR)
  console.log('\n💡 This server properly handles SPA routing')
  console.log('💡 Press Ctrl+C to stop')
})
