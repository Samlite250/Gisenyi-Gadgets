# Development Environment Setup

**Last Updated:** May 23, 2026  
**Project:** Gisenyi Gadgets (React Native + React Dashboard + Supabase)

---

## Core Development Tools

### Runtime & Package Managers
| Tool | Version | Status | Purpose |
|------|---------|--------|---------|
| **Node.js** | v24.15.0 | ✅ Installed | JavaScript runtime |
| **npm** | 11.12.1 | ✅ Installed | Package manager |
| **Git** | 2.54.0 | ✅ Installed | Version control |

### Mobile Development
| Tool | Version | Status | Purpose |
|------|---------|--------|---------|
| **EAS CLI** | 19.0.8 | ✅ Installed | Expo Application Services |
| **Android SDK** | Latest | ✅ Installed | Android app development |
| **ADB** | 1.0.41 (v37.0.0) | ✅ Installed | Android Debug Bridge |
| **Java** | 21.0.5 (JBR) | ✅ Installed | Android Studio bundled JRE |
| **Gradle** | 8.10.2 | ✅ Configured | Android build tool |

**Android SDK Location:** `C:\Users\Administrator\AppData\Local\Android\Sdk`  
**Java Home:** `C:\Program Files\Android\Android Studio\jbr`

### Code Quality & Linting
| Tool | Version | Status | Purpose |
|------|---------|--------|---------|
| **ESLint** | 10.4.0 | ✅ Installed | JavaScript linter |
| **Prettier** | 3.8.3 | ✅ Installed | Code formatter |
| **npm-check-updates** | Latest | ✅ Installed | Dependency updates |

### Backend & Database
| Tool | Version | Status | Purpose |
|------|---------|--------|---------|
| **Supabase CLI** | 2.100.1 | ✅ Installed | Supabase management |
| **Supabase JS** | 2.106.1 | ✅ Installed | Supabase client library |
| **Firebase Tools** | 15.18.0 | ✅ Installed | Firebase CLI |

**Supabase Project ID:** `cysejrutcrfvopqjqknv`  
**Supabase URL:** `https://cysejrutcrfvopqjqknv.supabase.co`

### Deployment & Hosting
| Tool | Version | Status | Purpose |
|------|---------|--------|---------|
| **Vercel CLI** | 54.2.0 | ✅ Installed | Deploy to Vercel |
| **Netlify CLI** | Latest | ✅ Installed | Deploy to Netlify |
| **GitHub CLI** | 2.92.0 | ✅ Installed | GitHub operations |

**Vercel Account:** `samlite250`  
**Deployed Dashboard:** `https://gisenyicpanel.vercel.app`

### Development Servers & Utilities
| Tool | Status | Purpose |
|------|--------|---------|
| **serve** | ✅ Installed | Static file server |
| **http-server** | ✅ Installed | Simple HTTP server |
| **nodemon** | ✅ Installed | Auto-restart on file changes |
| **pm2** | ✅ Installed | Process manager |
| **dotenv-cli** | ✅ Installed | Load .env files |
| **cross-env** | ✅ Installed | Cross-platform env variables |

---

## Project Structure

```
Gisenyi-Gadgets/
├── mobile-app/              # React Native (Expo) - v1.1.0
│   ├── android/            # Native Android build files
│   ├── src/               # React Native source code
│   └── .env               # Supabase credentials
├── admin-dashboard/         # React + Vite admin panel
│   ├── src/               # React source code
│   └── .env               # Supabase credentials
└── supabase/
    └── schema.sql          # Database schema
```

---

## Environment Variables

### Mobile App (.env)
```bash
EXPO_PUBLIC_SUPABASE_URL=https://cysejrutcrfvopqjqknv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Admin Dashboard (.env)
```bash
VITE_SUPABASE_URL=https://cysejrutcrfvopqjqknv.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## Common Development Commands

### Mobile App
```bash
cd mobile-app

# Start development server
npm start
# or
npx expo start

# Build APK locally
cd android && ./gradlew assembleDebug

# Build APK with EAS (requires login)
eas build -p android --profile preview

# Run on Android device/emulator
npm run android
```

### Admin Dashboard
```bash
cd admin-dashboard

# Start development server
npm run dev
# or
node .\node_modules\vite\bin\vite.js

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

### Database (Supabase)
```bash
# Link to project
supabase link --project-ref cysejrutcrfvopqjqknv

# Push schema changes
supabase db push

# Pull remote changes
supabase db pull

# Generate types
supabase gen types typescript --local > types/supabase.ts
```

---

## Quick Start Guide

### 1. Clone & Setup
```bash
git clone https://github.com/Samlite250/Gisenyi-Gadgets.git
cd Gisenyi-Gadgets
```

### 2. Mobile App Setup
```bash
cd mobile-app
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npx expo start
```

### 3. Admin Dashboard Setup
```bash
cd admin-dashboard
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm run dev
```

---

## Build Configuration

### Gradle Configuration
- **Version:** 8.10.2
- **Java:** 21.0.5 (Android Studio JBR)
- **Build Types:** debug, release
- **Location:** `mobile-app/android/gradle/wrapper/gradle-wrapper.properties`

### EAS Build Configuration
- **Project ID:** `b0f6dd7c-493a-43bb-80f9-720966be95f4`
- **Profiles:**
  - `preview` → APK for testing
  - `production` → AAB for Play Store
- **Location:** `mobile-app/eas.json`

---

## Troubleshooting

### APK Build Issues
1. **Gradle/Java version mismatch:**
   ```bash
   export JAVA_HOME="/c/Program Files/Android/Android Studio/jbr"
   ```

2. **Disk space full:**
   ```bash
   # Clean npm cache
   npm cache clean --force
   
   # Clean Gradle cache
   rm -rf ~/.gradle/caches
   ```

3. **Build fails:**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleDebug
   ```

### Development Server Issues
1. **Port already in use:**
   ```bash
   # Kill process on port 5173 (Vite)
   npx kill-port 5173
   
   # Kill process on port 8081 (Metro)
   npx kill-port 8081
   ```

2. **Metro bundler cache:**
   ```bash
   npx expo start -c
   ```

---

## Useful Resources

- **Expo Docs:** https://docs.expo.dev
- **React Native Docs:** https://reactnative.dev
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/

---

## Next Steps

- [ ] Complete APK build (in progress)
- [ ] Test APK on physical device
- [ ] Set up CI/CD pipeline
- [ ] Configure production signing keys
- [ ] Submit to Google Play Store (if ready)

---

**Maintained by:** Claude Code  
**Project Repository:** https://github.com/Samlite250/Gisenyi-Gadgets
