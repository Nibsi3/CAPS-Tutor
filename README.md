# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## News API Setup

To enable real-time educational news from South Africa, you need to set up a NewsAPI.org account:

1. Visit [https://newsapi.org/](https://newsapi.org/) and sign up for a free account
2. Get your API key from the dashboard
3. Add the following to your `.env.local` file:

```
NEWS_API_KEY=your_api_key_here
```

The application will automatically:
- Fetch educational news from South African sources
- Automatically detect which province each article is from
- Cache results for 15 minutes to respect API rate limits
- Fall back to mock data if the API key is not set or if the API call fails

**Note:** The free tier of NewsAPI.org has rate limits. For production use, consider upgrading to a paid plan.

## Past Paper Image Extraction

The system now supports image extraction from Grade 12 past papers, particularly for subjects like Dance Studies, Visual Arts, and Geography that contain visual content.

### Current Implementation

**Infrastructure:**
- Questions can be flagged with `hasImage: true`
- Images can be stored as base64 data URIs in `imageDataUri`
- The UI automatically displays images when available
- Vision-based processing uses Groq's `llama-3.2-90b-vision-preview` model for subjects with images
- **Automatic PDF-to-image conversion** is now integrated via Node.js calling Python scripts

**Image Extraction Tools:**
- `scripts/extract-pdf-images.py` - Extracts embedded images from PDFs as base64 JPEGs (standalone)
- `scripts/pdf-to-images.py` - Converts PDF pages to images (standalone)
- `scripts/pdf-to-images-stdin.py` - Reads base64 PDF from stdin, outputs JSON array of image data URIs (integrated)
- `src/lib/pdf-utils.ts` - Node.js utility to call the Python conversion script

**Integration:**
The `processPastPaperWithVision` function in `src/ai/flows/past-paper-processing.ts` now:
1. Automatically converts PDF base64 data URIs to arrays of page image data URIs using `pdfToImages()`
2. Passes the converted images to the Groq vision model
3. Falls back to standard text-based processing if PDF conversion fails

**Testing:**
- For Dance Studies Nov 2020, 3 JPEG images were successfully extracted on page 1
- The conversion pipeline is ready for end-to-end testing with actual paper uploads
