# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "whhc-order-form")
4. Follow the setup wizard (you can disable Google Analytics if you want)

## Step 2: Enable Realtime Database

1. In your Firebase project, go to "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a location (select closest to your users)
4. Start in **test mode** (we'll update security rules later)
5. Click "Enable"

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register app with a nickname (e.g., "WHHC Order Form")
6. Copy the `firebaseConfig` object

## Step 4: Update index.html

1. Open `index.html` in your editor
2. Find the `firebaseConfig` object (around line 190)
3. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 5: Set Up Database Security Rules

1. In Firebase Console, go to "Realtime Database" > "Rules"
2. Replace the rules with:

```json
{
  "rules": {
    "tasks": {
      ".read": true,
      ".write": true
    },
    "users": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Note:** These rules allow read/write access to everyone. For production, you should implement proper authentication and security rules.

## Step 6: Test the Integration

1. Open your app in a browser
2. Log in as admin (hnaqvi)
3. Create a test order
4. Check Firebase Console > Realtime Database to see if data appears
5. Open the app in a different browser/device and log in as staff
6. You should see the tasks created by admin

## Troubleshooting

- **"Firebase is not defined"**: Make sure Firebase SDK scripts are loaded before your code
- **"Permission denied"**: Check your database security rules
- **Data not syncing**: Check browser console for errors, verify Firebase config is correct

## Free Tier Limits

Firebase Realtime Database free tier includes:
- 1 GB storage
- 10 GB/month bandwidth
- 100 concurrent connections

This should be sufficient for a small clinic's daily operations.

