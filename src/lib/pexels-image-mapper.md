# Pexels API Configuration

## API Key
The Pexels API key is stored in `src/lib/pexels-config.ts` for use in future blog post image management.

## Image URL Format
Pexels image URLs follow this format:
```
https://images.pexels.com/photos/{photo-id}/pexels-photo-{photo-id}.jpeg?auto=compress&cs=tinysrgb&w=2070&dpr=2
```

## Current Status
All blog post images are being migrated from Unsplash to Pexels format. Each blog post should have a unique Pexels photo ID to avoid duplicates.

## For Future Blogs
When adding new blog posts:
1. Use the Pexels API (key in `src/lib/pexels-config.ts`) to search for relevant images
2. Use the `getPexelsImageUrl()` helper function from `src/lib/pexels-config.ts`
3. Ensure each blog post uses a unique photo ID
4. Example:
```typescript
import { getPexelsImageUrl } from '@/lib/pexels-config';

imageUrl: getPexelsImageUrl(1234567), // Use unique photo ID
```








