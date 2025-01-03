import type { TSchema } from "@sinclair/typebox";
import { Simplify } from "@trpc/server/unstable-core-do-not-import";

import { IsUnset } from "../utils/symbol";
import { DefaultSchema, MaybePromise, Overwrite } from "../utils/types";
import { ValidPath } from "./http-path";
import { HTTPMethod } from "./http-types";
import { AnyMiddleware } from "./middleware";
import { AnyRoute, Route, RouteCallOptions } from "./route";

export type CallerOverride<$Context> = (opts: {
  args: unknown[];
  invoke: (opts: RouteCallOptions<$Context>) => Promise<unknown>;
  _def: AnyRoute["_def"];
}) => Promise<unknown>;

interface RouteBuilderDef<$Meta> {
  route: true;
  inputs: TSchema[];
  outputs?: TSchema[];
  inputSet: boolean;
  outputSet: boolean;
  meta?: $Meta;
  middlewares: AnyMiddleware[];
  path?: ValidPath;
  method?: HTTPMethod;
  caller?: CallerOverride<unknown>;
}

type AnyRouteBuilderDef = RouteBuilderDef<any>;

export interface RouteResolverOptions<
  $Context,
  $Meta,
  $ContextOverrides,
  $MetaOverrides,
  $Input,
> {
  ctx: Simplify<Overwrite<$Context, $ContextOverrides>>;
  input: $Input extends IsUnset ? undefined : $Input;
  signal: AbortSignal | undefined;
}

type RouteResolver<
  $Context,
  $Meta,
  $ContextOverrides,
  $MetaOverrides,
  $Input,
  $Output,
  Output,
> = (
  opts: RouteResolverOptions<
    $Context,
    $Meta,
    $ContextOverrides,
    $MetaOverrides,
    $Input
  >,
) => MaybePromise<DefaultSchema<$Output, Output>>;

type AnyResolver = RouteResolver<any, any, any, any, any, any, any>;
export type AnyRouteBuilder = RouteBuilder<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

export type inferRouteBuilderResolverOptions<
  $RouteBuilder extends AnyRouteBuilder,
> =
  $RouteBuilder extends RouteBuilder<
    infer $Path,
    infer $Method,
    infer $Context,
    infer $Meta,
    infer $ContextOverrides,
    infer $Input,
    infer $Output,
    infer $Caller
  >
    ? RouteResolverOptions<
        $Context,
        $Meta,
        $ContextOverrides,
        {},
        $Input extends IsUnset ? unknown : $Input
      >
    : never;

export interface RouteBuilder<
  $Path extends ValidPath,
  $Method extends HTTPMethod,
  $Context,
  $Meta,
  $ContextOverrides,
  $Input,
  $Output,
  $Caller extends boolean,
> {
  input: $Input extends IsUnset
    ? <Schema extends TSchema>(
        schema: Schema,
      ) => RouteBuilder<
        $Path,
        $Method,
        $Context,
        $Meta,
        $ContextOverrides,
        $Input | Schema,
        $Output,
        $Caller
      >
    : undefined;
  output: $Output extends IsUnset
    ? <Schema extends TSchema>(
        schema: Schema,
      ) => RouteBuilder<
        $Path,
        $Method,
        $Context,
        $Meta,
        $ContextOverrides,
        $Input,
        $Output | Schema,
        $Caller
      >
    : undefined;
  meta(
    meta: $Meta,
  ): RouteBuilder<
    $Path,
    $Method,
    $Context,
    $Meta,
    $ContextOverrides,
    $Input,
    $Output,
    $Caller
  >;
  use<NewContext>(middleware: AnyMiddleware): RouteBuilder<
    $Path,
    $Method,
    $Context,
    $Meta,
    // TODO: FIX THIS
    $ContextOverrides & NewContext,
    $Input,
    $Output,
    $Caller
  >;
  route<Output>(
    resolver: RouteResolver<
      $Context,
      $Meta,
      $ContextOverrides,
      {},
      $Input,
      $Output,
      Output
    >,
  ): $Caller extends true
    ? (
        input: DefaultSchema<$Input, void>,
      ) => Promise<DefaultSchema<$Output, Output>>
    : Route<
        $Path,
        $Method,
        {
          input: DefaultSchema<$Input, void>;
          output: DefaultSchema<$Output, Output>;
        }
      >;
  _def: RouteBuilderDef<$Meta>;
}

type RouteBuilderResolver = (
  opts: RouteResolverOptions<any, any, any, any, any>,
) => Promise<unknown>;

function createNewRouteBuilder(
  def1: AnyRouteBuilderDef,
  def2: Partial<AnyRouteBuilderDef>,
): AnyRouteBuilder {
  const { middlewares = [], inputs, meta, ...rest } = def2;

  return createRouteBuilder({
    ...def1,
    ...rest,
    inputs: [...def1.inputs, ...(inputs ?? [])],
    middlewares: [...def1.middlewares, ...(middlewares ?? [])],
    meta: meta ?? def1.meta,
  });
}

export function createRouteBuilder<
  $Path extends ValidPath,
  $Method extends HTTPMethod,
  $Context,
  $Meta,
>(
  initDef: Partial<AnyRouteBuilderDef> = {},
): RouteBuilder<
  $Path,
  $Method,
  $Context,
  $Meta,
  object,
  IsUnset,
  IsUnset,
  false
> {
  const _def: AnyRouteBuilderDef = {
    route: true,
    inputs: [],
    middlewares: [],
    inputSet: initDef.inputs !== undefined,
    outputSet: initDef.outputs !== undefined,
    ...initDef,
  };

  const builder: AnyRouteBuilder = {
    _def,
    input: _def.inputSet
      ? undefined
      : (schema) => {
          return createNewRouteBuilder(_def, {
            inputs: [..._def.inputs, schema],
            middlewares: [
              // add input validation middleware
            ],
          });
        },
    output: _def.outputSet
      ? undefined
      : (schema) => {
          return createNewRouteBuilder(_def, {
            outputs: [...(_def.outputs ?? []), schema],
          });
        },
    meta: (meta) => {
      return createNewRouteBuilder(_def, { meta });
    },
    use: (middleware) => {
      return createNewRouteBuilder(_def, {
        middlewares: [middleware],
      });
    },
    route: (resolver) => {
      return createResolver({ ..._def }, resolver);
    },
  };

  return builder;
}

function createResolver(_def: AnyRouteBuilderDef, resolver: AnyResolver) {
  // const finalBuilder = createNewRouteBuilder(_def, {});

  const wrapper = async (...args: unknown[]) => {
    return resolver({
      ctx: {},
      // TODO: this
      input: undefined,
      signal: undefined,
    });
  };

  wrapper._def = _def;
  return wrapper;
}
