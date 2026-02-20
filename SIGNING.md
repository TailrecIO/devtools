# Code Signing Guide for DevTools

This guide explains how to set up code signing for your Tauri desktop app so users don't see security warnings when downloading and installing.

## 📥 Yes, Users Can Download Directly from GitHub!

### Option 1: GitHub Releases (Public - Recommended)
When you push a version tag (e.g., `v1.0.0`), the workflow creates a **public GitHub Release**:
- URL: `https://github.com/YOUR_USERNAME/devtools/releases`
- Anyone can download without logging in
- Installers appear as downloadable assets

### Option 2: GitHub Actions Artifacts
For manual builds, artifacts are in the Actions tab (requires GitHub login).

---

## 🍎 macOS Code Signing

### Why Sign?
Without signing, users see: **"DevTools.app can't be opened because it is from an unidentified developer"**

### Requirements
1. **Apple Developer Account** ($99/year) - Sign up at https://developer.apple.com
2. **Developer ID Application Certificate**
3. **App-Specific Password** for notarization

### Step 1: Create Developer ID Certificate

1. Go to https://developer.apple.com/account/resources/certificates/list
2. Click **+** to create a new certificate
3. Select **Developer ID Application**
4. Follow the prompts to create a Certificate Signing Request (CSR)
5. Download the certificate (`.cer` file)

### Step 2: Export Certificate as P12

1. Open **Keychain Access** on your Mac
2. Import the downloaded certificate
3. Find it under "My Certificates"
4. Right-click → **Export**
5. Save as `.p12` format with a password
6. Convert to base64:
   ```bash
   base64 -i ~/Downloads/certificate.p12 | pbcopy
   ```

### Step 3: Create App-Specific Password

1. Go to https://appleid.apple.com/account/manage
2. Sign in with your Apple ID
3. **App-Specific Passwords** → Generate password
4. Save this password (you'll use it once)

### Step 4: Add GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `APPLE_CERTIFICATE` | Base64-encoded `.p12` file (from Step 2) |
| `APPLE_CERTIFICATE_PASSWORD` | Password you set for the `.p12` file |
| `APPLE_ID` | Your Apple ID email (e.g., you@example.com) |
| `APPLE_PASSWORD` | App-specific password (from Step 3) |
| `APPLE_TEAM_ID` | Your Team ID (found at https://developer.apple.com/account) |

### Finding Your Team ID
1. Go to https://developer.apple.com/account
2. Click **Membership** in the sidebar
3. Your **Team ID** is shown (10 characters, e.g., `A1B2C3D4E5`)

---

## 🪟 Windows Code Signing

### Why Sign?
Without signing, users see: **"Windows protected your PC" SmartScreen warning**

### Requirements
1. **Code Signing Certificate** from a trusted CA:
   - DigiCert (~$400/year)
   - Sectigo (~$200/year)
   - SignPath (free for open source)

### Option 1: Traditional Certificate (Paid)

1. Purchase certificate from DigiCert, Sectigo, etc.
2. Download as `.pfx` or `.p12` file
3. Convert to base64:
   ```bash
   base64 -i certificate.pfx | pbcopy
   ```

### Option 2: SignPath (Free for Open Source)

If your project is open source, apply for free signing at https://about.signpath.io/product/open-source

### Add GitHub Secrets

| Secret Name | Value |
|-------------|-------|
| `TAURI_SIGNING_PRIVATE_KEY` | Base64-encoded `.pfx` certificate |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | Certificate password |

---

## 🐧 Linux Code Signing

Linux doesn't require code signing in the same way. AppImages and `.deb` packages work without it.

---

## 🚀 Testing the Workflow

### Without Code Signing (Works Fine!)
The workflow will build unsigned apps if secrets aren't set. Users will see warnings but apps work.

### With Code Signing
1. Add all the secrets above
2. Push a tag:
   ```bash
   git tag v0.0.1
   git push origin v0.0.1
   ```
3. Check GitHub Actions → Workflow runs
4. Download from the created Release

---

## 💰 Cost Summary

| Platform | Required? | Cost | Alternative |
|----------|-----------|------|-------------|
| **macOS** | Highly recommended | $99/year (Apple Developer) | Users can bypass warning |
| **Windows** | Highly recommended | $200-400/year | SignPath (free for OSS) |
| **Linux** | No | Free | N/A |

---

## 🔒 Security Notes

- **Never commit certificates** to your repository
- Use GitHub Secrets (encrypted, never visible in logs)
- `.p12` files should be password-protected
- App-specific passwords are safer than your main Apple password

---

## ✅ What Happens After Setup

**With code signing:**
- ✅ macOS: No warnings, installs smoothly
- ✅ Windows: SmartScreen trusts the app
- ✅ Users trust your app more

**Without code signing (still works!):**
- ⚠️ macOS: Users right-click → Open to bypass warning
- ⚠️ Windows: Users click "More info" → Run anyway
- ✅ App functions perfectly either way

---

## 🎯 Recommendation

**Start without code signing:**
1. Test the GitHub Actions workflow first
2. Share with trusted users who can bypass warnings
3. Add code signing later when you have more users

**Add code signing when:**
- You have 100+ downloads
- Users complain about warnings
- You want a professional image
