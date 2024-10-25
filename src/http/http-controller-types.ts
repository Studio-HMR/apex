import { TNever, TSchema } from "@sinclair/typebox";

import { AnyHTTPMethodDef, HTTPMethodDef } from "./http-handler-types";
import { ValidPath } from "./http-path-types";
import { HTTPMethod } from "./http-types";

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
} & {
  [Method in Lowercase<HTTPMethod>]: HTTPMethodDef<
    Uppercase<Method>,
    Path,
    InCtx,
    BaseSchema extends undefined ? TNever : BaseSchema,
    BaseSchema extends undefined ? TNever : BaseSchema
  >;
};

export type HTTPControllerDef<Path extends ValidPath, InCtx extends object> = {
  <RouteDefs extends Record<string, AnyHTTPMethodDef>>(
    path: Path,
    routeDefiner: (
      controller: _HTTPControllerDef<Path, InCtx, undefined>,
    ) => RouteDefs,
  ): void;
  <
    RouteDefs extends Record<string, AnyHTTPMethodDef>,
    BaseSchema extends TSchema,
  >(
    path: Path,
    baseSchema: BaseSchema,
    routeDefiner: (
      controller: _HTTPControllerDef<Path, InCtx, BaseSchema>,
    ) => RouteDefs,
  ): void;
};
