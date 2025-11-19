# Firebase to Appwrite Migration Guide

This document outlines the migration from Firebase to Appwrite that has been completed and what still needs to be done.

## Completed ✅

1. **Package Dependencies**: Updated `package.json` to use Appwrite SDK instead of Firebase
2. **Core Infrastructure**: Created Appwrite client, provider, and configuration
3. **Authentication**: Migrated auth hooks and functions (email/password, Google OAuth)
4. **Database Hooks**: Created Appwrite equivalents for `useDoc` and `useCollection`
5. **Layout & Auth Pages**: Updated main layout, login, and register pages
6. **UserNav Component**: Updated to use Appwrite

## Files Updated

- `package.json` - Dependencies
- `src/app/layout.tsx` - Provider
- `src/app/login/page.tsx` - Login page
- `src/app/register/page.tsx` - Register page
- `src/components/layout/UserNav.tsx` - User navigation

## New Appwrite Files Created

- `src/appwrite/config.ts` - Configuration
- `src/appwrite/index.ts` - Main exports
- `src/appwrite/provider.tsx` - React context provider
- `src/appwrite/client-provider.tsx` - Client-side provider wrapper
- `src/appwrite/auth/use-user.tsx` - User hook
- `src/appwrite/auth/email-auth.ts` - Email/password auth
- `src/appwrite/auth/social-auth.ts` - OAuth auth
- `src/appwrite/database/use-doc.tsx` - Document hook
- `src/appwrite/database/use-collection.tsx` - Collection hook

## Remaining Work ⚠️

### 1. Update All Components Using Firebase

The following files still need to be updated to use Appwrite:

**Dashboard Pages:**
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/progress/page.tsx`
- `src/app/dashboard/past-papers/page.tsx`
- `src/app/dashboard/past-paper-practice/[id]/page.tsx`
- `src/app/dashboard/tutor/page.tsx`
- `src/app/dashboard/practice/page.tsx`
- `src/app/dashboard/games/page.tsx`
- `src/app/dashboard/lessons/page.tsx`
- `src/app/dashboard/settings/page.tsx`
- `src/app/dashboard/achievements/page.tsx`

**Other Pages:**
- `src/app/onboarding/page.tsx`
- `src/app/admin/past-papers/page.tsx`
- `src/app/admin/process-papers/page.tsx`

**Components:**
- `src/components/layout/DashboardHeader.tsx`
- `src/components/achievements/GlobalLeaderboard.tsx`
- `src/components/home/AllSubjectsSection.tsx`
- `src/components/language-provider.tsx`

### 2. Update API Routes

All API routes using Firebase Admin SDK need to be updated to use Appwrite Server SDK:

- `src/app/api/add-all-past-papers/route.ts`
- `src/app/api/add-images-to-paper/route.ts`
- `src/app/api/add-images-to-all-papers/route.ts`
- `src/app/api/clear-all-past-paper-questions/route.ts`
- `src/app/api/auto-add-all-papers/route.ts`
- `src/app/api/past-papers-status/route.ts`
- `src/app/api/process-past-papers/route.ts`

### 3. Update Scripts

All scripts using Firebase need to be updated:

- `scripts/upload_to_firebase_with_metadata.mjs`
- `scripts/check-firestore.mjs`
- `scripts/clear-life-sciences-p1.mjs`
- `scripts/clear-all-past-paper-questions.mjs`
- `scripts/add-all-papers-now.mjs`
- `scripts/add-all-papers-direct.mjs`
- `scripts/run_full_workflow.mjs`

### 4. Migration Patterns

#### Replace Firebase Imports

```typescript
// OLD
import { useUser, useAuth, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, getDoc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// NEW
import { useUser, useAccount, useDatabases, useDoc, useCollection, useMemoAppwrite } from '@/appwrite';
import { appwriteConfig } from '@/appwrite/config';
import { Query } from 'appwrite';
```

#### Replace Firestore Document References

```typescript
// OLD
const docRef = doc(firestore, 'users', user.uid);
const { data } = useDoc(docRef);

// NEW
const docRef = useMemoAppwrite(() => {
  if (!user) return null;
  return {
    databaseId: appwriteConfig.databaseId,
    collectionId: 'users',
    documentId: user.$id,
  };
}, [user]);
const { data } = useDoc(docRef);
```

#### Replace Firestore Collection Queries

```typescript
// OLD
const collectionRef = collection(firestore, 'pastPapers');
const q = query(collectionRef, where('subject', '==', 'Mathematics'));
const { data } = useCollection(q);

// NEW
const collectionRef = useMemoAppwrite(() => {
  return {
    databaseId: appwriteConfig.databaseId,
    collectionId: 'pastPapers',
    queries: [
      Query.equal('subject', 'Mathematics'),
    ],
  };
}, []);
const { data } = useCollection(collectionRef);
```

#### Replace Document Operations

```typescript
// OLD
await setDoc(doc(firestore, 'users', userId), data);
await updateDoc(doc(firestore, 'users', userId), data);
await deleteDoc(doc(firestore, 'users', userId));

// NEW
const databases = useDatabases();
await databases.createDocument(appwriteConfig.databaseId, 'users', userId, data);
await databases.updateDocument(appwriteConfig.databaseId, 'users', userId, data);
await databases.deleteDocument(appwriteConfig.databaseId, 'users', userId);
```

#### Replace User Properties

```typescript
// OLD
user.uid
user.displayName
user.photoURL
user.emailVerified

// NEW
user.$id
user.name
// photoURL would need to be stored in user document or preferences
// emailVerification status is in user.emailVerification
```

### 5. Environment Variables

Add the following to your `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_VERIFICATION_URL=http://localhost:9002/verify-email
```

For server-side (API routes):
```env
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=your_database_id
```

### 6. Database Structure

Appwrite uses databases and collections. You'll need to:

1. Create a database in Appwrite console
2. Create collections (users, pastPapers, etc.)
3. Set up permissions for each collection
4. Migrate data from Firestore to Appwrite (if needed)

### 7. Real-time Subscriptions

Appwrite supports real-time subscriptions, but the current hooks use simple fetching. To add real-time updates, you'll need to use Appwrite Realtime SDK.

### 8. OAuth Callback Handling

After OAuth sign-in, Appwrite redirects back. You may need to create a callback handler page or update the OAuth redirect URLs.

## Testing Checklist

- [ ] User registration
- [ ] User login (email/password)
- [ ] Google OAuth sign-in
- [ ] User profile creation/updates
- [ ] Document reading/writing
- [ ] Collection queries
- [ ] Real-time updates (if implemented)
- [ ] API routes
- [ ] Script execution

## Notes

- Appwrite user IDs are different from Firebase UIDs (they use `$id` instead of `uid`)
- Appwrite uses `$` prefix for some system fields
- Query syntax is different (Query builder instead of Firestore query functions)
- Real-time subscriptions need to be set up separately if needed
- Error codes are different (numeric codes instead of string codes)

