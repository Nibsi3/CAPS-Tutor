# Adding photoURL Attribute to User Collection

The `photoURL` attribute is used to store user profile picture URLs. This allows users who log in with Google to have their profile picture displayed, and allows all users to set a custom profile picture.

## Add the Attribute in Appwrite

1. **Go to Appwrite Console**
   - Navigate to: https://cloud.appwrite.io/console
   - Select project: **CAPS Tutor**

2. **Navigate to User Collection**
   - Go to: **Databases** → **capstutor** → **user** collection
   - Click on **Attributes** tab

3. **Create photoURL Attribute**
   - Click **+ Create Attribute**
   - **Attribute Key**: `photoURL`
   - **Type**: Select **String**
   - **Size**: 500 (to accommodate full URLs)
   - **Required**: ❌ Unchecked (optional)
   - **Array**: ❌ Unchecked
   - **Default**: Leave empty
   - Click **Create**

## Attribute Details

- **Type**: String
- **Size**: 500 characters (enough for most image URLs)
- **Required**: No (optional)
- **Purpose**: Stores the URL to the user's profile picture
  - For Google OAuth users: Automatically populated from Google account photo
  - For all users: Can be set in Settings page

## After Adding the Attribute

Once you've added the `photoURL` attribute:

1. **Refresh your browser** - The app will automatically start using it
2. **Existing Google users**: Their profile pictures will be saved on next login
3. **All users**: Can set a custom profile picture in Settings → Profile Picture

## Troubleshooting

**Images still not showing?**
- Check browser console for errors (F12 → Console)
- Verify the photoURL value is a valid image URL
- Check that the image URL is accessible (no CORS restrictions)
- Ensure the image URL starts with `http://` or `https://`

**"Attribute not found" errors?**
- Make sure the attribute key is exactly `photoURL` (case-sensitive)
- Verify the attribute exists in the Appwrite Console
- Refresh the page after adding the attribute

