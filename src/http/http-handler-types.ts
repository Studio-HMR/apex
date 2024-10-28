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
