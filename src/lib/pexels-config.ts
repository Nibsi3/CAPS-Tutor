/**
 * Pexels API Configuration
 * 
 * API Key for accessing Pexels image library.
 * Used for fetching unique, high-quality images for blog posts.
 * 
 * Documentation: https://www.pexels.com/api/documentation/
 */
export const PEXELS_API_KEY = 'kCRXA1eqe8XOPmgA8tLJxF3c9Iv4LvsULhc3S62sD1MqMxgfAY2A4oWj';

/**
 * Helper function to generate Pexels image URL
 * 
 * @param photoId - Unique Pexels photo ID
 * @param width - Image width (default: 2070)
 * @param height - Image height (default: auto)
 * @returns Formatted Pexels image URL
 */
export function getPexelsImageUrl(photoId: number | string, width: number = 2070, height?: number): string {
  const sizeParam = height ? `&w=${width}&h=${height}` : `&w=${width}`;
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb${sizeParam}&dpr=2`;
}

/**
 * Helper function to search Pexels for images (requires API key)
 * This can be used server-side to find relevant images programmatically
 */
export async function searchPexelsImages(query: string, perPage: number = 10) {
  const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}`, {
    headers: {
      'Authorization': PEXELS_API_KEY,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Pexels API error: ${response.status}`);
  }
  
  return response.json();
}








