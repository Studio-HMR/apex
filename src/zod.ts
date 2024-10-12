import { z as baseZod } from "zod";
import { extendZodWithOpenApi } from "zod-openapi";

export const z = extendZodWithOpenApi(baseZod);
