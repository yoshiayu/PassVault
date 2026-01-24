import { z } from "zod";

export const systemSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().max(40)).optional().default([])
});

export const organizationSchema = z.object({
  name: z.string().min(1).max(120)
});

export const credentialSchema = z.object({
  systemId: z.string().cuid(),
  label: z.string().min(1).max(120),
  notes: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string().max(40)).optional().default([]),
  expiresAt: z.string().datetime(),
  mode: z.enum(["generate", "manual"]).default("generate"),
  length: z.number().min(6).max(15).optional(),
  secret: z.string().min(6).max(200).optional()
});

export const credentialUpdateSchema = z.object({
  systemId: z.string().cuid().optional(),
  label: z.string().min(1).max(120).optional(),
  notes: z.string().max(1000).optional().nullable(),
  tags: z.array(z.string().max(40)).optional(),
  expiresAt: z.string().datetime().optional()
});

export const batchSchema = z.object({
  systemId: z.string().cuid(),
  labelPrefix: z.string().min(1).max(60),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  expiresInDays: z.number().min(1).max(30).optional(),
  length: z.number().min(6).max(15).optional()
});

export const resolveQrSchema = z.object({
  token: z.string().min(10)
});
