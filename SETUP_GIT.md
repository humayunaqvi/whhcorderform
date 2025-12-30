# Quick Git Setup Guide

## Step 1: Configure Git (One-time setup)

Open PowerShell in this folder and run these commands (replace with your info):

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Example:**
```powershell
git config --global user.name "John Doe"
git config --global user.email "john@example.com"
```

## Step 2: Connect to Your GitHub Repository

### If you ALREADY have a GitHub repository:

1. Get your repository URL from GitHub (it looks like: `https://github.com/yourusername/repo-name.git`)
2. Run this command (replace with your URL):
```powershell
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
```

### If you DON'T have a GitHub repository yet:

1. Go to https://github.com and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Name it (e.g., `patient-order-form`)
4. **DO NOT** initialize with README, .gitignore, or license (we already have files)
5. Click **"Create repository"**
6. Copy the repository URL (it will show on the next page)
7. Run this command (replace with your URL):
```powershell
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
```

## Step 3: Make Your First Commit

```powershell
git commit -m "Initial commit - Patient Order Form"
```

## Step 4: Push to GitHub

```powershell
git push -u origin main
```

You'll be prompted for your GitHub username and password (use a Personal Access Token, not your password - see below).

## Step 5: Set Up Netlify Auto-Deployment

1. Go to https://www.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify
5. Select your repository
6. Click **"Deploy site"** (no build command needed)

## GitHub Authentication Note

GitHub no longer accepts passwords. You need a **Personal Access Token**:

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token (classic)"**
3. Name it (e.g., "Netlify Deployment")
4. Select scope: **`repo`** (full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)
7. When Git asks for password, paste the token instead

---

**Need help with any step? Let me know!**


