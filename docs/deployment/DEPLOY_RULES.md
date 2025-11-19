# Deploy Firestore Rules

The Firestore rules have been updated and need to be deployed to fix the permission error.

## Quick Deploy (Recommended)

1. **Login to Firebase:**
   ```powershell
   npx firebase-tools login
   ```
   This will open a browser window for you to authenticate.

2. **Deploy the rules:**
   ```powershell
   npx firebase-tools deploy --only firestore:rules --project studio-3238820292-69b8f
   ```

## Alternative: Deploy via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `studio-3238820292-69b8f`
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

## Verify Deployment

After deploying, the permission error should be resolved. The rules now allow authenticated users to list their own `pastPaperProgress` subcollection.

