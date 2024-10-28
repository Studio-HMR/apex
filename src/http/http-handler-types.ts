import { type Static, type TSchema, TString } from "@sinclair/typebox";
import { MaybePromise } from "@trpc/server/unstable-core-do-not-import";

import type { PathParams, ToValidPath, ValidPath } from "./http-path-types";
import type {
  HTTPDelete,
  HTTPGet,
  HTTPMethod,
  HTTPPost,
  HTTPPut,
  SwitchHTTPMethod,
} from "./http-types";

/**
 * @internal
 */
export interface HTTPMethodOptions {
  context?: Record<string, unknown>;
  signal?: AbortSignal;
}

interface BuiltMethodDef {
  controllerInput: unknown;
  input: unknown;
  output: unknown;
}

interface MethodCallOptions<Path extends ValidPath, InCtx> {
  ctx: InCtx;
  input?: unknown;
  path: Path;
  method: HTTPMethod;
  signal: AbortSignal | undefined;
}

export interface HTTPHandler<
  Method extends HTTPMethod,
  HTTPDef extends BuiltMethodDef,
> {
  _def: {
    $types: {
      controllerInput: HTTPDef["controllerInput"];
      input: HTTPDef["input"];
      output: HTTPDef["output"];
    };
    handler: true;
    type: Method;
    meta: unknown;
  };
  (
    opts: MethodCallOptions<ValidPath, unknown>,
  ): MaybePromise<HTTPDef["output"]>;
}

export interface HTTPErrorHandlerOptions<InCtx> {
  error: Error;
  method: HTTPMethod;
  path: string | unknown;
  input: unknown;
  controllerInput: unknown;
  ctx: InCtx | undefined;
}

export interface HTTPGetHandler<HTTPDef extends BuiltMethodDef>
  extends HTTPHandler<HTTPGet, HTTPDef> {}
export interface HTTPPostHandler<HTTPDef extends BuiltMethodDef>
  extends HTTPHandler<HTTPPost, HTTPDef> {}
export interface HTTPPutHandler<HTTPDef extends BuiltMethodDef>
  extends HTTPHandler<HTTPPut, HTTPDef> {}
export interface HTTPDeleteHandler<HTTPDef extends BuiltMethodDef>
  extends HTTPHandler<HTTPDelete, HTTPDef> {}

export type AnyGetHandler = HTTPGetHandler<any>;
export type AnyPostHandler = HTTPPostHandler<any>;
export type AnyPutHandler = HTTPPutHandler<any>;
export type AnyDeleteHandler = HTTPDeleteHandler<any>;

export type AnyHTTPHandler =
  | AnyGetHandler
  | AnyPostHandler
  | AnyPutHandler
  | AnyDeleteHandler;

export type inferHandlerParams<Handler> = Handler extends AnyHTTPHandler
  ? Handler["_def"]
  : never;
export type inferHandlerIO<Handler> = inferHandlerParams<Handler>["$types"];
export type inferHandlerInput<Handler> = inferHandlerIO<Handler>["input"];
export type inferHandlerOutput<Handler> = inferHandlerIO<Handler>["output"];
export type inferHandlerControllerInput<Handler> =
  inferHandlerIO<Handler>["controllerInput"];

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
  Handler extends ((params: any) => any) | never = never,
> = {
  // do not use these. they are used at runtime to assemble stuff
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
          typeof fn
        >["_types"];
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
