# Student Progress Collection - AI Setup Prompt

Copy and paste this entire prompt to the Appwrite onboard AI:

---

## Create Collection: studentProgress

**Collection ID:** `studentProgress`
**Collection Name:** `Student Progress`
**Database:** `capstutor`

## Attributes to Create:

1. **userId** (String)
   - Size: 255
   - Required: Yes
   - Array: No
   - Indexed: Yes

2. **learningObjectiveId** (String)
   - Size: 255
   - Required: Yes
   - Array: No
   - Indexed: No

3. **masteryLevel** (Integer)
   - Required: Yes
   - Array: No
   - Min: 0
   - Max: 100
   - Default: 0
   - Indexed: No

4. **completed** (Boolean)
   - Required: Yes
   - Array: No
   - Default: false
   - Indexed: Yes

5. **lastAccessed** (String)
   - Size: 100
   - Required: Yes
   - Array: No
   - Indexed: Yes

6. **topic** (String)
   - Size: 255
   - Required: No
   - Array: No
   - Indexed: Yes

7. **subject** (String)
   - Size: 100
   - Required: No
   - Array: No
   - Indexed: Yes

8. **gradeLevel** (Integer)
   - Required: No
   - Array: No
   - Min: 1
   - Max: 12
   - Indexed: Yes

9. **type** (String)
   - Size: 100
   - Required: No
   - Array: No
   - Indexed: No

10. **score** (Integer)
    - Required: No
    - Array: No
    - Min: 0
    - Indexed: No

11. **totalQuestions** (Integer)
    - Required: No
    - Array: No
    - Min: 0
    - Indexed: No

## Permissions:

**Role: Users**
- Create: ✅ Yes
- Read: ✅ Yes
- Update: ✅ Yes
- Delete: ❌ No

## Indexes to Create:

1. **idx_userId**
   - Type: Key
   - Attributes: userId (Ascending)

2. **idx_userId_subject**
   - Type: Key
   - Attributes: userId (Ascending), subject (Ascending)

3. **idx_userId_completed**
   - Type: Key
   - Attributes: userId (Ascending), completed (Ascending)

4. **idx_lastAccessed**
   - Type: Key
   - Attributes: lastAccessed (Descending)

5. **idx_userId_topic** (Optional but recommended)
   - Type: Key
   - Attributes: userId (Ascending), topic (Ascending)

6. **idx_userId_gradeLevel** (Optional but recommended)
   - Type: Key
   - Attributes: userId (Ascending), gradeLevel (Ascending)

---

## Alternative: Simple Copy-Paste Format

If the AI needs a simpler format, use this:

```
Collection ID: studentProgress
Collection Name: Student Progress

Attributes:
- userId: String (255, required, indexed)
- learningObjectiveId: String (255, required)
- masteryLevel: Integer (0-100, required, default: 0)
- completed: Boolean (required, default: false, indexed)
- lastAccessed: String (100, required, indexed)
- topic: String (255, optional, indexed)
- subject: String (100, optional, indexed)
- gradeLevel: Integer (1-12, optional, indexed)
- type: String (100, optional)
- score: Integer (min: 0, optional)
- totalQuestions: Integer (min: 0, optional)

Permissions: Users role - Create, Read, Update (yes), Delete (no)

Indexes:
1. idx_userId: Key index on userId (Ascending)
2. idx_userId_subject: Key index on userId + subject (both Ascending)
3. idx_userId_completed: Key index on userId + completed (both Ascending)
4. idx_lastAccessed: Key index on lastAccessed (Descending)
5. idx_userId_topic: Key index on userId + topic (both Ascending)
6. idx_userId_gradeLevel: Key index on userId + gradeLevel (both Ascending)
```

