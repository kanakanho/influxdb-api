// {
//   "name": "influxdb",
//   "message": "ready for queries and writes",
//   "status": "pass",
//   "checks": [],
//   "version": "2.7.11",
//   "commit": "xx00x0x000"
// }

import { z } from "zod";

export const zHealth = z.object({
  name: z.string(),
  message: z.string(),
  status: z.string(),
  checks: z
    .array(
      z.object({
        code: z.string(),
        err: z.string(),
        message: z.string(),
        op: z.string(),
      })
    )
    .optional(),
  version: z.string(),
  commit: z.string(),
});

export type ZHealth = z.infer<typeof zHealth>;
