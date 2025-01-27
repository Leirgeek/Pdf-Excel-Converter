import { z } from "zod";

// Schema for individual items in a document
export const ItemSchema = z.object({
  item: z.string(),
  unit_price: z.string(),
  quantity: z.string(),
  sum: z.string()
});

// Schema for the entire document
export const DocumentSchema = z.object({
  company: z.string(),
  address: z.string(),
  total_sum: z.string(),
  items: z.array(ItemSchema)
});

export type DocumentData = z.infer<typeof DocumentSchema>;
export type ItemData = z.infer<typeof ItemSchema>;
