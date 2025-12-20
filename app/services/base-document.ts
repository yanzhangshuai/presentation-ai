export interface BaseDocument {
  id          : string
  title       : string
  type        : DocumentType
  isPublic    : boolean
  thumbnailUrl: string | null
  userId      : string
  createdAt   : Date
  updatedAt   : Date
}

export const DocumentType = {
  NOTE          : 'NOTE',
  DOCUMENT      : 'DOCUMENT',
  DRAWING       : 'DRAWING',
  DESIGN        : 'DESIGN',
  STICKY_NOTES  : 'STICKY_NOTES',
  MIND_MAP      : 'MIND_MAP',
  RAG           : 'RAG',
  RESEARCH_PAPER: 'RESEARCH_PAPER',
  FLIPBOOK      : 'FLIPBOOK',
  PRESENTATION  : 'PRESENTATION',
}
