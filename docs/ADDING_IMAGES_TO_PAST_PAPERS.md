# Adding Images to Past Papers

This guide explains how to add images from the "Past Paper Images" directory to past papers stored in Firestore.

## Overview

The CAPS Tutor application supports adding visual content (diagrams, photographs, charts, etc.) to past paper questions. Images are stored as base64 data URIs within the Firestore document.

## Architecture

### How Images Work

1. **Past Paper Images Directory**: Physical image files (JPG format) are stored in the `Past Paper Images/` directory, organized by subject and year.
2. **Firestore Storage**: Images are converted to base64 data URIs and stored in the `generatedQuestions` array within each past paper document.
3. **Question Model**: Each question can have:
   - `hasImage: boolean` - Whether the question should display an image
   - `imageDataUri: string` - Base64 data URI of the image

## API Endpoint

### POST /api/add-images-to-paper

Adds images to a past paper from the "Past Paper Images" directory.

#### Request Body

```typescript
{
  paperId: string;  // Required: Firestore document ID of the past paper
  imageMapping?: Array<{
    questionIndex?: number;      // Index of question in array (0-based)
    questionNumber?: string;     // Question number (e.g., "1.1", "2.3.1")
    imageIndex: number;          // Index of image in found images (0-based)
  }>;              // Optional: Manual mapping of images to questions
}
```

#### Response

```typescript
{
  success: boolean;
  message: string;
  imagesAvailable?: number;    // Total images found
  imagesAdded?: number;        // Images successfully added
  questionsUpdated?: number;   // Questions updated with images
}
```

#### Usage Examples

**Automatic Assignment** (for papers where images align with questions in order):

```bash
curl -X POST http://localhost:3000/api/add-images-to-paper \
  -H "Content-Type: application/json" \
  -d '{"paperId": "your-paper-id-here"}'
```

**Manual Mapping** (when you need to specify which image goes with which question):

```bash
curl -X POST http://localhost:3000/api/add-images-to-paper \
  -H "Content-Type: application/json" \
  -d '{
    "paperId": "your-paper-id-here",
    "imageMapping": [
      {"questionNumber": "1.1", "imageIndex": 0},
      {"questionNumber": "2.3", "imageIndex": 2},
      {"questionNumber": "4.1", "imageIndex": 5}
    ]
  }'
```

## How It Works

### Image Discovery

The endpoint searches for images by:

1. Extracting the paper name from Firestore (from `paperName` or `subject` field)
2. Normalizing the name (removing PDF extension, cleaning whitespace)
3. Searching in `Past Paper Images/` for:
   - Directories whose names start with the paper name
   - JPG files whose names start with the paper name
4. Excluding memo/answer files (names containing "memo", "answer", etc.)

### Image Assignment

**Without mapping**: Images are assigned to questions that have `hasImage: true` but no `imageDataUri`. Images are assigned sequentially based on sorted filename.

**With mapping**: Images are assigned according to the provided `imageMapping` array.

## Past Paper Image Directory Structure

Images should be organized in the `Past Paper Images/` directory as follows:

```
Past Paper Images/
├── Mathematics P1 Nov 2020 Eng/
│   ├── Mathematics P1 Nov 2020 Eng-0000.jpg
│   ├── Mathematics P1 Nov 2020 Eng-0009.jpg
│   └── ...
├── Physical Sciences P1 Nov 2020 Eng/
│   └── ...
├── Dance Studies Nov 2020 Eng/
│   ├── Dance Studies Nov 2020 Eng-0001.jpg
│   ├── Dance Studies Nov 2020 Eng-0002.jpg
│   └── ...
└── ...
```

### Naming Convention

- **Directory/File names** should match or closely resemble the paper name
- **Exclude "Memo"** from directory/file names (they're filtered out)
- Use **JPG format** for images
- Include **year** in the name (e.g., "2020")
- Include **paper number** if applicable (e.g., "P1", "P2")

## Subject-Specific Considerations

### Mathematics
- Geometry questions often need diagrams
- Some questions already have SVG inline diagrams
- Focus on adding images where diagrams are referenced but not present

### Physical Sciences
- Circuit diagrams for electricity questions
- Ray diagrams for optics questions
- Molecular structures for chemistry questions
- Graphs and data charts

### Life Sciences
- Cell diagrams (organelles labeled X, Y, etc.)
- Biological structures and organs
- Process diagrams (photosynthesis, respiration, etc.)
- Micrographs and histological slides

### Visual Arts & Dance Studies
- Photographs of artworks or performances
- Diagrams of choreography
- Style examples and references

### Geography
- Maps (topographic, climatic, etc.)
- Satellite imagery
- Graphs and charts
- Case study photographs

## Best Practices

### When to Add Images

1. **Questions reference diagrams**: "Refer to the diagram below", "Study the photograph showing..."
2. **Questions ask about labeled structures**: "Identify structure X", "Name part Y"
3. **Visual questions**: Art analysis, map interpretation, chart reading
4. **Process questions**: Scientific processes with labeled steps

### When NOT to Add Images

1. **Pure text questions**: No visual content needed
2. **Algebraic questions**: Unless showing coordinate geometry graphs
3. **Simple recall**: "Define term X" doesn't need an image
4. **Questions already have inline SVG**: The `past-paper-questions.ts` file has many SVG diagrams

### Image Quality

- Use **high resolution** (at least 800x600 pixels for clarity)
- Ensure **proper labeling**: If the question references "point X" or "structure Y", the image should have those labels
- **Remove page numbers and headers** when possible
- **Crop to focus** on relevant content
- Use **JPG format** for compressed images

### Manual Mapping Process

For complex papers, you may need to manually map images to questions:

1. **Review the PDF**: Look at the original past paper PDF
2. **Identify image locations**: Note which images belong to which questions
3. **Extract images**: Save images with descriptive filenames
4. **Create mapping**: Build the `imageMapping` array based on your review
5. **Test**: Call the API with the mapping and verify results

## Troubleshooting

### No Images Found

**Problem**: `"No images found for paper: ..."`

**Solutions**:
- Check that the paper name in Firestore matches the directory/file names
- Verify images are in JPG format
- Ensure directory/file names don't include "memo"
- Check that files are actually in `Past Paper Images/`

### Wrong Images Assigned

**Problem**: Images don't match the questions

**Solutions**:
- Use manual `imageMapping` to specify exact assignments
- Rename images to reflect question numbers (e.g., `q1-1.jpg`, `q2-3.jpg`)
- Review the order of images in the directory (they're sorted alphabetically)

### Images Not Displaying

**Problem**: Questions have `hasImage: true` but no image shown

**Solutions**:
- Check that `imageDataUri` field exists on the question
- Verify the base64 data URI format is correct: `data:image/jpeg;base64,...`
- Check browser console for image loading errors
- Ensure the data URI isn't truncated (very long fields may have issues)

## Example Workflow

Let's say you want to add images to "Mathematics P1 Nov 2020 Eng":

1. **Locate images**: 
   ```
   Past Paper Images/Mathematics P1 Nov 2020 Eng/
   ```

2. **Review the PDF** to determine which images belong to which questions

3. **Call the API**:
   ```bash
   curl -X POST http://localhost:3000/api/add-images-to-paper \
     -H "Content-Type: application/json" \
     -d '{"paperId": "math-p1-2020-doc-id"}'
   ```

4. **Verify** in Firestore that questions now have `imageDataUri` fields

5. **Test** in the UI to ensure images display correctly

## Future Enhancements

Potential improvements to the image system:

- **AI-powered image extraction**: Use vision models to automatically identify and extract diagrams from PDFs
- **Image labeling detection**: Automatically identify and label structures (X, Y, etc.) in images
- **Bulk processing**: Process multiple papers at once
- **Image compression**: Automatically optimize images for web display
- **Version control**: Track changes to image assignments

## Related Files

- `src/app/api/add-images-to-paper/route.ts` - API endpoint implementation
- `src/app/dashboard/past-paper-practice/[id]/page.tsx` - UI that displays images
- `src/lib/past-paper-questions.ts` - Static question definitions with inline SVGs
- `src/ai/flows/past-paper-processing.ts` - AI processing that marks questions with `hasImage: true`

## Support

For issues or questions about adding images to past papers, contact the development team or open an issue in the repository.



