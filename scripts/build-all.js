const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const MOBILE_APP_DIR = path.join(ROOT_DIR, 'mobile-app');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin-dashboard');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ADMIN_DIST_TARGET = path.join(DIST_DIR, 'admin');

const SUPABASE_ENV = {
  ...process.env,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://cysejrutcrfvopqjqknv.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8',
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://cysejrutcrfvopqjqknv.supabase.co',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5c2VqcnV0Y3Jmdm9wcWpxa252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTkwNzcsImV4cCI6MjA5NDA3NTA3N30.-VrulGgskYKK8czPk1vMl7rsjGmYNeo9hdWDKW4GeZ8',
};

function run(command, cwd) {
  console.log(`\n🚀 Executing: ${command} in ${cwd}`);
  execSync(command, { cwd, stdio: 'inherit', env: SUPABASE_ENV, shell: true });
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('==================================================');
  console.log('📦 Gisenyi Gadgets Unified Web Build');
  console.log('==================================================');

  // 1. Build Mobile App Expo Web
  console.log('\n[1/3] Building Mobile Customer Store App (Expo Web)...');
  run('npm run build:web', MOBILE_APP_DIR);

  // 2. Build Admin Dashboard Vite App
  console.log('\n[2/3] Building Admin Dashboard App (Vite)...');
  run('npm run build', ADMIN_DIR);

  // 3. Assemble Unified Dist Directory
  console.log('\n[3/3] Assembling Unified Output Directory...');

  // Clean target dist folder
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy mobile-app dist to root dist (Customer Website at /)
  const mobileDist = path.join(MOBILE_APP_DIR, 'dist');
  console.log(`Copying customer website from ${mobileDist} -> ${DIST_DIR}`);
  copyDirSync(mobileDist, DIST_DIR);

  // Patch index.html: inject comprehensive full-width CSS reset so mobile web fills screen
  const indexHtmlPath = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    const FULL_WIDTH_CSS = `<style id="expo-reset">
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      #root {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        flex: 1;
      }
    </style>`;
    // Replace the entire expo-reset style block
    html = html.replace(/<style id="expo-reset">[\s\S]*?<\/style>/, FULL_WIDTH_CSS);
    fs.writeFileSync(indexHtmlPath, html, 'utf8');
    console.log('✅ Patched index.html with comprehensive full-width CSS reset.');
  }

  // Copy admin-dashboard dist to root dist/admin (Admin Dashboard at /admin)
  const adminDist = path.join(ADMIN_DIR, 'dist');
  console.log(`Copying admin dashboard from ${adminDist} -> ${ADMIN_DIST_TARGET}`);
  copyDirSync(adminDist, ADMIN_DIST_TARGET);

  console.log('\n✅ Unified Build Complete Successfully!');
  console.log(`   Customer Store Web App: /  -> ${DIST_DIR}`);
  console.log(`   Admin Dashboard Web App: /admin -> ${ADMIN_DIST_TARGET}`);
  console.log('==================================================\n');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
