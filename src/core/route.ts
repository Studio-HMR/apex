import {
  DefaultSchema,
  MaybePromise,
  Overwrite,
  Simplify,
} from "../utils/types";
import { PathParams, QueryParams, ValidPath } from "./http-path";
import { HTTPMethod } from "./http-types";

type RouteContext = Record<string, unknown>;

export interface RouteOpts {
  context?: RouteContext;
  signal?: AbortSignal;
}

interface BuiltRouteBaseDef {
  input: unknown;
  output: unknown;
}

export interface RouteCallOptions<$Context> {
  context: $Context;
  path: ValidPath;
  method: HTTPMethod;
  input?: unknown;
  signal: AbortSignal | undefined;
}

export interface Route<
  $Path extends ValidPath,
  $Method extends HTTPMethod,
  $Def extends BuiltRouteBaseDef,
> {
  _def: {
    $types: {
      path: $Path;
      method: $Method;
      params: {
        path: PathParams<$Path>;
        query: QueryParams<$Path>;
      };
      input: $Def["input"];
      output: $Def["output"];
    };
    meta: unknown;
  };
  (opts: RouteCallOptions<unknown>): Promise<$Def["output"]>;
}

export type AnyRoute = Route<ValidPath, HTTPMethod, any>;

export type inferRouteTypes<$Route> = $Route extends AnyRoute
  ? $Route["_def"]["$types"]
  : never;
export type inferRouteInput<$Route extends AnyRoute> =
  undefined extends $Route["_def"]["$types"]["input"]
    ? void | inferRouteTypes<$Route>["input"]
    : inferRouteTypes<$Route>["input"];
export type inferRouteOutput<$Route extends AnyRoute> =
  inferRouteTypes<$Route>["output"];

export type HandlerFn<
  Context,
  ContextOverrides,
  Meta,
  Method extends HTTPMethod,
  Path extends ValidPath,
  Input,
  Output,
> = {
  (args: {
    ctx: Simplify<Overwrite<Context, ContextOverrides>>;
  }): MaybePromise<Output>;
};
