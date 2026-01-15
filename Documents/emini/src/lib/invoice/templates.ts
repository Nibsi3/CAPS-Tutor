export type TemplateId = 'classic' | 'modern' | 'minimal' | 'noir'

export interface TemplateMetadata {
    id: TemplateId
    name: string
    description: string
    previewImage?: string
}

export const INVOICE_TEMPLATES: TemplateMetadata[] = [
    {
        id: 'noir',
        name: 'Emini Noir',
        description: 'The signature high-contrast dark aesthetic for premium brands.',
    },
    {
        id: 'classic',
        name: 'Classic Corporate',
        description: 'Traditional layout optimized for clear information hierarchy.',
    },
    {
        id: 'modern',
        name: 'Modern Startup',
        description: 'Clean, spacious design with vibrant accents.',
    },
    {
        id: 'minimal',
        name: 'Architect Minimal',
        description: 'Ultra-clean design focusing on essential details.',
    },
]
