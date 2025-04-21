import { z } from "zod";

export const zWritePoint = z.object({
  measurement: z.string(),
  tags: z.record(z.string()),
  fields: z.record(z.union([z.number(), z.string(), z.boolean()])),
  bucketName: z.string(),
  // number から UTC 形式の文字列に変換する
  timestamp: z
    .number()
    .optional()
    .transform((value) => {
      if (value) {
        return new Date(value).toISOString();
      }
      return undefined;
    }),
});

export type ZWritePoint = z.infer<typeof zWritePoint>;
