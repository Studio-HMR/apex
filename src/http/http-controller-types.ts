import { TSchema } from "@sinclair/typebox";

import { ValidPath } from "./http-path-types";

type _HTTPControllerDef<
  Path extends ValidPath,
  InCtx extends object,
  BaseSchema extends TSchema | undefined = undefined,
> = {
  _types: {
    path: Path;
    ctx: InCtx;
    baseSchema: BaseSchema;
  };
};
