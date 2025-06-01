#!/usr/bin/env node

/**
 * Pre-deployment check script for Vercel
 * Validates environment variables and build configuration
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 Running pre-deployment checks...\n')

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'vercel.json',
  'src/config/supabase.ts',
  'src/config/database-types.ts'
]

console.log('📁 Checking required files...')
let filesOk = true
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING`)
    filesOk = false
  }
})

if (!filesOk) {
  console.log('\n❌ Some required files are missing!')
  process.exit(1)
}

// Check environment variables
console.log('\n🔧 Checking environment variables...')
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_SERVICE_ROLE_KEY'
]

let envOk = true
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`)
  } else {
    console.log(`⚠️  ${envVar} - NOT SET (should be set in Vercel)`)
  }
})

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const requiredScripts = ['build', 'dev', 'preview']

requiredScripts.forEach(script => {
  if (packageJson.scripts && packageJson.scripts[script]) {
    console.log(`✅ ${script}: ${packageJson.scripts[script]}`)
  } else {
    console.log(`❌ ${script} - MISSING`)
    envOk = false
  }
})

// Check Vercel configuration
console.log('\n⚡ Checking Vercel configuration...')
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
  
  if (vercelConfig.buildCommand) {
    console.log(`✅ Build command: ${vercelConfig.buildCommand}`)
  }
  
  if (vercelConfig.outputDirectory) {
    console.log(`✅ Output directory: ${vercelConfig.outputDirectory}`)
  }
  
  if (vercelConfig.framework) {
    console.log(`✅ Framework: ${vercelConfig.framework}`)
  }
  
} catch (error) {
  console.log('❌ Error reading vercel.json:', error.message)
  envOk = false
}

// Final status
console.log('\n' + '='.repeat(50))
if (filesOk && envOk) {
  console.log('✅ All checks passed! Ready for deployment.')
  console.log('\n📋 Next steps:')
  console.log('1. Push your code to GitHub')
  console.log('2. Connect repository to Vercel')
  console.log('3. Add environment variables in Vercel dashboard')
  console.log('4. Deploy!')
} else {
  console.log('❌ Some checks failed. Please fix the issues above.')
  process.exit(1)
}
