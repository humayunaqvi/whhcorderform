# Netlify + GitHub Continuous Deployment Setup

This guide will help you set up automatic deployment from GitHub to Netlify, so you can code in Cursor and have changes automatically deploy.

## Prerequisites

- ✅ GitHub repository already created and files uploaded
- ✅ Netlify account (free)

## Step 1: Connect Netlify to GitHub

1. **Go to Netlify**: https://www.netlify.com
2. **Sign in** (or create a free account)
3. Click **"Add new site"** → **"Import an existing project"**
4. Click **"Deploy with GitHub"**
5. **Authorize Netlify** to access your GitHub account
   - You may need to enter your GitHub password
   - Click "Authorize netlify"
6. **Select your repository**: Choose `patient-order-form` (or whatever you named it)
7. **Configure build settings**:
   - **Branch to deploy**: `main` (or `master`)
   - **Build command**: Leave **empty** (no build needed for static HTML)
   - **Publish directory**: Leave as `/` or enter `.` (root directory)
8. Click **"Deploy site"**

## Step 2: Your Site is Now Live!

- Netlify will automatically deploy your site
- You'll get a URL like: `https://random-name-123.netlify.app`
- You can customize this URL in **Site settings → Change site name**

## Step 3: Set Up Your Local Workflow

### Option A: Using GitHub Desktop (Easiest)

1. **Download GitHub Desktop**: https://desktop.github.com
2. **Install and sign in** with your GitHub account
3. **Clone your repository**:
   - Click "File" → "Clone repository"
   - Select your `patient-order-form` repository
   - Choose local path: `C:\Users\humay\OneDrive\Documents\coding`
   - Click "Clone"

4. **Now your workflow is**:
   - Edit files in Cursor (your current folder)
   - Open GitHub Desktop
   - You'll see your changes listed
   - Enter a commit message (e.g., "Updated form layout")
   - Click **"Commit to main"**
   - Click **"Push origin"**
   - Netlify will automatically detect the change and redeploy (takes ~30 seconds)

### Option B: Using Git Command Line

1. **Install Git** (if not already installed): https://git-scm.com/download/win

2. **Initialize Git in your folder** (if not already done):
   ```powershell
   cd "C:\Users\humay\OneDrive\Documents\coding"
   git init
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git branch -M main
   ```

3. **Your workflow**:
   ```powershell
   # Make changes in Cursor, then:
   git add .
   git commit -m "Description of your changes"
   git push origin main
   ```
   - Netlify will automatically redeploy

### Option C: Using VS Code / Cursor Git Integration

1. **Open your folder in Cursor**
2. **Make your changes**
3. **Use Cursor's built-in Git**:
   - Click the Source Control icon (left sidebar) or press `Ctrl+Shift+G`
   - Stage your changes (click the `+` next to files)
   - Enter commit message
   - Click the checkmark to commit
   - Click the sync/upload icon to push to GitHub
   - Netlify will automatically redeploy

## Step 4: Verify Auto-Deployment is Working

1. **Make a small test change** in `index.html` (e.g., add a comment)
2. **Commit and push** to GitHub
3. **Go to Netlify dashboard**
4. You should see a new deployment starting automatically
5. Wait ~30 seconds
6. **Check your site** - the change should be live!

## Netlify Dashboard Features

### View Deployments
- Go to your site in Netlify
- Click **"Deploys"** tab
- See all your deployments with status (Published, Building, Failed)

### Deploy Preview
- Every commit gets a preview URL
- You can test changes before they go live
- Share preview URLs with team members

### Rollback
- If something breaks, click on a previous deployment
- Click **"Publish deploy"** to rollback instantly

## Custom Domain Setup (Optional)

1. Go to **Site settings → Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `patientform.yourclinic.com`)
4. Follow Netlify's DNS instructions
5. Your site will be available at your custom domain

## Environment Variables (If Needed Later)

If you ever need to add API keys or secrets:
1. Go to **Site settings → Environment variables**
2. Add your variables
3. They'll be available in your site

## Build Settings (Advanced)

If you need to customize build settings later:
1. Go to **Site settings → Build & deploy**
2. **Build settings**:
   - Build command: Leave empty (no build needed)
   - Publish directory: `/` or `.`
3. **Deploy settings**:
   - Production branch: `main`
   - Branch deploys: Enable for preview deployments

## Troubleshooting

**Changes not deploying?**
- Check that you pushed to the correct branch (`main`)
- Check Netlify dashboard for error messages
- Verify your GitHub repository is connected in Netlify settings

**Deployment failed?**
- Check the deploy log in Netlify
- Make sure `index.html` is in the root of your repository
- Verify there are no syntax errors in your HTML

**Site not updating?**
- Clear browser cache (Ctrl+F5)
- Wait 30-60 seconds after pushing
- Check Netlify deploy status

## Workflow Summary

```
1. Code in Cursor → Edit files locally
2. Commit changes → Save to Git
3. Push to GitHub → Upload to repository
4. Netlify auto-deploys → Site updates automatically
5. Changes live in ~30 seconds!
```

## Pro Tips

- **Commit often**: Small, frequent commits are better than large ones
- **Use descriptive commit messages**: "Fixed checkbox alignment" is better than "Update"
- **Test locally first**: Open `index.html` in your browser before pushing
- **Use preview deployments**: Test changes on preview URLs before merging to main

Your continuous deployment is now set up! 🚀


