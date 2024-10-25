import { type Static, type TNever, type TSchema } from "@sinclair/typebox";
import { MaybePromise } from "@trpc/server/unstable-core-do-not-import";

import type { PathParams, ToValidPath, ValidPath } from "./http-path-types";
import type { HTTPMethod, SwitchHTTPMethod } from "./http-types";

type HandlerParams<
  Method extends HTTPMethod,
  Path extends string,
  InCtx extends object,
  InSchema extends TSchema,
> = {
  ctx: InCtx;
  path: Path;
  schema: InSchema;
  params: PathParams<Path>["params"] extends false
    ? never
    : PathParams<Path>["params"];
} & SwitchHTTPMethod<
  Method,
  // GET
  {
    filter: Record<keyof Static<TSchema>, string | number | boolean>;
    sort: Record<keyof Static<TSchema>, "ascending" | "descending">;
  },
  // POST
  {
    input: Static<InSchema>;
  },
  // PUT
  {
    params: PathParams<Path>["params"] extends false
      ? never
      : PathParams<Path>["params"];
    input: Static<InSchema>;
  },
  // DELETE
  {
    filter: Record<keyof Static<TSchema>, string | number | boolean>;
    sort: Record<keyof Static<TSchema>, "ascending" | "descending">;
  }
>;

type HTTPOutputType<
  Method extends HTTPMethod,
  Schema extends TSchema,
> = SwitchHTTPMethod<
  Method,
  // GET
  Static<Schema> | Array<Static<Schema>>,
  // POST
  Static<Schema>,
  // PUT
  Static<Schema>,
  // DELETE
  boolean
>;

type _HTTPMethodDef<
  Method extends HTTPMethod,
  Path extends ValidPath,
  InCtx extends object,
  InSchema extends TSchema,
  OutSchema extends TSchema,
  InSchemaOverriden extends boolean = false,
  OutSchemaOverriden extends boolean = false,
  Handler extends ((params: any) => void) | never = never,
> = {
  // do not use these. they are used at runtime
  _types: {
    method: Method;
    path: Path;
    ctx: InCtx;
    inSchema: InSchema;
    outSchema: OutSchema;
    inSchemaOverriden: InSchemaOverriden;
    outSchemaOverriden: OutSchemaOverriden;
    handler: Handler;
  };
} & (InSchemaOverriden extends true
  ? {}
  : {
      input: (
        schema: TSchema,
      ) => _HTTPMethodDef<
        Method,
        Path,
        InCtx,
        TSchema,
        OutSchema,
        true,
        OutSchemaOverriden,
        Handler
      >;
    }) &
  (OutSchemaOverriden extends true
    ? {}
    : {
        output: (
          schema: TSchema,
        ) => _HTTPMethodDef<
          Method,
          Path,
          InCtx,
          InSchema,
          TSchema,
          InSchemaOverriden,
          true,
          Handler
        >;
      }) &
  (Handler extends never
    ? {}
    : {
        handler: (
          fn: (
            params: HandlerParams<Method, Path, InCtx, InSchema>,
          ) => MaybePromise<HTTPOutputType<Method, OutSchema>>,
        ) => _HTTPMethodDef<
          Method,
          Path,
          InCtx,
          InSchema,
          TSchema,
          true,
          true,
          (params: HandlerParams<Method, Path, InCtx, InSchema>) => void
        >;
      });

export type HTTPMethodDef<
  Method extends HTTPMethod,
  BasePath extends ValidPath,
  InCtx extends object,
  InSchema extends TSchema,
  OutSchema extends TSchema,
> = {
  <Path extends ValidPath>(
    path: Path,
  ): _HTTPMethodDef<
    Method,
    ToValidPath<`${BasePath}${Path}`>,
    InCtx,
    InSchema,
    OutSchema
  >;
  (): _HTTPMethodDef<Method, BasePath, InCtx, InSchema, OutSchema>;
};

export type AnyHTTPMethodDef = HTTPMethodDef<
  HTTPMethod,
  ValidPath,
  object,
  TSchema,
  TSchema
>;
