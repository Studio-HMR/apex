import { initTRPC } from "@trpc/server";
import { z } from "zod";

const trpc = initTRPC
  .context<{ auth: boolean }>()
  .meta<{ rbac: {} }>()
  .create();

const p = trpc.procedure;

const f = p
  .output(
    z.object({
      f: z.string(),
    }),
  )
  .output(z.string())
  .query(({ input }) => {
    input;
    return {
      f: "",
    } as { f: string } & string;
  });
