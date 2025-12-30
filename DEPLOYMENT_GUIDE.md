# Deployment Guide - Patient Order Form

This guide will help you deploy the Patient Order Form application so it can be accessed from anywhere via a URL.

## Quick Deployment Options

### Option 1: GitHub Pages (Recommended - Free & Easy)

1. **Create a GitHub account** (if you don't have one): https://github.com
2. **Create a new repository**:
   - Go to GitHub and click "New repository"
   - Name it something like "patient-order-form"
   - Make it public (required for free GitHub Pages)
   - Click "Create repository"

3. **Upload your file**:
   - Click "uploading an existing file"
   - Drag and drop `PatientOrderForm.html`
   - Rename it to `index.html` (this makes it the default page)
   - Commit the changes

4. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Under "Source", select "main" branch and "/ (root)" folder
   - Click "Save"
   - Your site will be available at: `https://[your-username].github.io/patient-order-form/`

### Option 2: Netlify (Free & Very Easy)

1. **Go to**: https://www.netlify.com
2. **Sign up** for a free account
3. **Drag and drop** your `PatientOrderForm.html` file onto the Netlify dashboard
4. **Rename** the file to `index.html` in Netlify's file manager
5. **Your site** will be live immediately with a URL like: `https://random-name-123.netlify.app`
6. **Customize the URL** in Site settings → Change site name

### Option 3: Vercel (Free & Easy)

1. **Go to**: https://vercel.com
2. **Sign up** for a free account
3. **Create a new project**
4. **Upload** your `PatientOrderForm.html` file
5. **Rename** to `index.html`
6. **Deploy** - your site will be live immediately

### Option 4: Simple Web Server (For Local Network)

If you want to host it on your own computer/server:

1. **Install Python** (if not already installed)
2. **Navigate** to the folder containing `PatientOrderForm.html`
3. **Run**:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Or Python 2
   python -m SimpleHTTPServer 8000
   ```
4. **Access** at: `http://localhost:8000/PatientOrderForm.html`
5. **For remote access**, you'll need to:
   - Configure your router/firewall
   - Use your public IP address
   - Consider using a service like ngrok for secure tunneling

## File Preparation

The application is already a single HTML file, so it's ready to deploy. Just make sure:
- The file is named `index.html` for automatic loading, OR
- Users access it directly as `PatientOrderForm.html`

## Security Considerations

Since this is a client-side only application:
- ✅ No server-side data storage
- ✅ All processing happens in the browser
- ✅ No sensitive data is transmitted
- ⚠️ Consider adding HTTPS for production use (most hosting services provide this automatically)

## Custom Domain (Optional)

Most hosting services allow you to connect a custom domain:
- GitHub Pages: Settings → Pages → Custom domain
- Netlify: Domain settings → Add custom domain
- Vercel: Settings → Domains → Add domain

## Need Help?

If you need assistance with deployment, the easiest option is **Netlify** - just drag and drop the file!


