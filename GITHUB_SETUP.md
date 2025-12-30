# GitHub Setup Guide - Patient Order Form

This guide will walk you through connecting your project to GitHub and deploying it.

## Step 1: Create a GitHub Account (if you don't have one)

1. Go to https://github.com
2. Click "Sign up" in the top right
3. Enter your email, create a password, and choose a username
4. Verify your email address

## Step 2: Create a New Repository

1. **Log in to GitHub**
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the repository details:
   - **Repository name**: `patient-order-form` (or any name you prefer)
   - **Description**: "Clinic Visit Order Form - Patient Intake and After Visit Summary Generator"
   - **Visibility**: Choose **Public** (required for free GitHub Pages) or **Private** (if you want to keep it private, you'll need a paid GitHub account for Pages)
   - **DO NOT** check "Initialize this repository with a README" (we'll upload files manually)
5. Click **"Create repository"**

## Step 3: Upload Your Files

### Option A: Using GitHub Web Interface (Easiest)

1. After creating the repository, you'll see a page with instructions
2. Click **"uploading an existing file"** link
3. Drag and drop these files into the upload area:
   - `index.html`
   - `PatientOrderForm.html` (optional, but good to keep)
   - `DEPLOYMENT_GUIDE.md` (optional)
   - `GITHUB_SETUP.md` (this file, optional)
4. Scroll down and enter a commit message: "Initial commit - Patient Order Form"
5. Click **"Commit changes"**

### Option B: Using GitHub Desktop (Recommended for future updates)

1. Download GitHub Desktop: https://desktop.github.com
2. Install and sign in with your GitHub account
3. Click **"File" → "Add Local Repository"**
4. Click **"Choose"** and navigate to: `C:\Users\humay\OneDrive\Documents\coding`
5. Click **"Publish repository"**
6. Choose your repository name and click **"Publish repository"**

### Option C: Using Git Command Line (Advanced)

If you have Git installed, open PowerShell in your coding folder and run:

```powershell
git init
git add index.html
git commit -m "Initial commit - Patient Order Form"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

Replace `YOUR-USERNAME` and `YOUR-REPO-NAME` with your actual GitHub username and repository name.

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **"Settings"** (top menu bar)
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select:
   - Branch: **main** (or **master** if that's your branch name)
   - Folder: **/ (root)**
5. Click **"Save"**
6. Wait a minute or two for GitHub to build your site
7. Your site will be available at:
   - `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`
   - For example: `https://johndoe.github.io/patient-order-form/`

## Step 5: Access Your Live Site

1. After enabling Pages, GitHub will show you the URL
2. It may take 1-2 minutes for the site to be live
3. You can also find the URL in: **Settings → Pages**

## Updating Your Site

### Using GitHub Web Interface:
1. Go to your repository
2. Click on `index.html`
3. Click the pencil icon (✏️) to edit
4. Make your changes
5. Scroll down, enter a commit message, and click **"Commit changes"**
6. Your site will automatically update in 1-2 minutes

### Using GitHub Desktop:
1. Make changes to your local files
2. Open GitHub Desktop
3. You'll see your changes listed
4. Enter a commit message
5. Click **"Commit to main"**
6. Click **"Push origin"** to upload to GitHub
7. Your site will update automatically

## Custom Domain (Optional)

If you want to use your own domain (e.g., `patientform.yourclinic.com`):

1. Go to **Settings → Pages**
2. Under **"Custom domain"**, enter your domain
3. Follow GitHub's instructions to configure DNS
4. Your site will be available at your custom domain

## Troubleshooting

**Site not loading?**
- Wait 2-3 minutes after enabling Pages
- Check that `index.html` is in the root folder
- Make sure the repository is set to Public (for free accounts)

**Changes not showing?**
- Clear your browser cache (Ctrl+F5)
- Wait 1-2 minutes for GitHub to rebuild
- Check that you committed and pushed your changes

**Need help?**
- GitHub Docs: https://docs.github.com/en/pages
- GitHub Community: https://github.community

## Security Note

Since this is a client-side only application (no server-side code), it's safe to host publicly. All processing happens in the user's browser, and no sensitive data is stored or transmitted.


