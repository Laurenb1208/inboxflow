import { z } from 'zod'

const PRIORITY = z.enum(['High', 'Medium', 'Low'])

export const folderSchema = z.object({
  name: z.string().min(1).max(60),
  color: z.string().min(1).max(20),
  priority: PRIORITY,
})

export const filterSchema = z.object({
  name: z.string().min(1).max(60),
  keywords: z.string().min(1).max(500),
  folderId: z.string().uuid(),
  priority: PRIORITY,
  rank: z.number().int().min(0).max(1000).optional(),
})

export const settingsSchema = z.object({
  autoSort: z.boolean(),
})
