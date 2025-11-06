# Adding Literature Attribute to User Collection

The `literature` attribute is used to store user's selected literature (novels, dramas, poems) for their language subjects. This is an **optional** feature.

## If You Want to Use Literature Selection Feature

### Add the Attribute in Appwrite:

1. **Go to Appwrite Console**
   - Navigate to: https://cloud.appwrite.io/console
   - Select project: **CAPS Tutor**

2. **Navigate to User Collection**
   - Go to: **Databases** → **capstutor** → **user** collection
   - Click on **Attributes** tab

3. **Create Literature Attribute**
   - Click **+ Create Attribute**
   - **Attribute Key**: `literature`
   - **Type**: Select **JSON** (or **String** if JSON is not available)
   - **Size**: Leave default or set to 2000 (for JSON string)
   - **Required**: ❌ Unchecked (optional)
   - **Array**: ❌ Unchecked
   - **Default**: Leave empty
   - Click **Create**

### Attribute Structure

The `literature` attribute stores a JSON object with this structure:

```json
{
  "english-hl": {
    "novel": "Selected novel name",
    "drama": "Selected drama name",
    "poems": ["Poem 1", "Poem 2"]
  },
  "english-fal": {
    "novel": "Selected novel name",
    "drama": "Selected drama name",
    "poems": []
  },
  "afrikaans-ht": {
    "novel": "Selected novel name",
    "drama": "Selected drama name",
    "poems": []
  },
  "afrikaans-eat": {
    "novel": "Selected novel name",
    "drama": "Selected drama name",
    "poems": []
  }
}
```

## If You Don't Need Literature Selection

The code is currently set to **skip saving** the `literature` field if the attribute doesn't exist. The app will work fine without it - users just won't be able to save their literature selections.

## After Adding the Attribute

Once you've added the `literature` attribute to the `user` collection:

1. Update the code in `src/app/dashboard/settings/page.tsx` to uncomment the line:
   ```typescript
   dataToSave.literature = data.literature;
   ```

2. Refresh your browser
3. The literature selection feature will work

## Current Status

- ✅ Code is ready to use literature feature
- ⚠️ Attribute doesn't exist in Appwrite (currently skipped to avoid errors)
- 📝 Add the attribute in Appwrite to enable the feature

