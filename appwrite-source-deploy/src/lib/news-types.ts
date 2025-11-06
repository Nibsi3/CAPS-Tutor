export type Province = 
  | "Eastern Cape"
  | "Free State"
  | "Gauteng"
  | "KwaZulu-Natal"
  | "Limpopo"
  | "Mpumalanga"
  | "Northern Cape"
  | "North West"
  | "Western Cape";

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  province: Province;
  source: string;
  sourceUrl?: string;
  publishedAt: string; // ISO date string
  imageUrl?: string;
  category: "school" | "university" | "general";
  tags?: string[];
}

export const PROVINCES: Province[] = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
];

// Province abbreviations for display in tabs
export const PROVINCE_ABBREVIATIONS: Record<Province, string> = {
  "Eastern Cape": "EC",
  "Free State": "FS",
  "Gauteng": "Gauteng",
  "KwaZulu-Natal": "KZN",
  "Limpopo": "Limpopo",
  "Mpumalanga": "Mpumalanga",
  "Northern Cape": "NC",
  "North West": "NW",
  "Western Cape": "WC",
};

// Helper function to get province abbreviation or full name for tabs
export function getProvinceTabLabel(province: Province): string {
  return PROVINCE_ABBREVIATIONS[province];
}

