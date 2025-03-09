import type { Static, TObject, TSchema } from "@sinclair/typebox";

import type { IfUnset, UnsetMarker } from "../utils/symbol";
import type { MaybePromise, Overwrite, Simplify } from "../utils/types";
import type { PathParams, QueryParams, ValidPath } from "./http-path";
import type { HTTPMethod } from "./http-types";
import { mergeWithoutOverrides } from "../utils/types";

export interface BuiltHandlerDef {
  input: unknown;
  output: unknown;
}

export interface Handler<Path extends ValidPath, Def extends BuiltHandlerDef> {
  handler: true;
  _def: {
    path: Path;
    $types: {
      input: Def["input"];
      output: Def["output"];
    };
  };
}

export type AnyHandler = Handler<any, any>;

export interface HandlerOptions<
  Path extends ValidPath,
  Method extends HTTPMethod,
  Context,
  Meta,
  ContextOverrides,
  Input,
  Output,
> {
  path: Path;
  method: Method;
  params: PathParams<Path>;
  query: QueryParams<Path>;
  ctx: Simplify<Overwrite<Context, ContextOverrides>>;
  input: IfUnset<
    Input,
    undefined,
    Input extends TSchema ? Static<Input> : Input
  >;
  inputModel: IfUnset<Input>;
  outputModel: IfUnset<Output>;
  meta: Meta;
  signal: AbortSignal | undefined;
}

export type HandlerFn<
  Path extends ValidPath,
  Method extends HTTPMethod,
  Context,
  Meta,
  ContextOverrides,
  Input,
  Output,
  $Output,
> = (
  opts: HandlerOptions<
    Path,
    Method,
    Context,
    Meta,
    ContextOverrides,
    Input,
    Output
  >,
) => MaybePromise<
  IfUnset<Output, $Output, Output extends TSchema ? Static<Output> : Output>
>;

export type AnyHandlerFn = HandlerFn<any, any, any, any, any, any, any, any>;

export type HandlerBuilderDef<
  Path extends ValidPath,
  Method extends HTTPMethod,
  Meta,
> = {
  path: Path;
  method: Method;
  middlewares: any[];
  inputModel?: TSchema;
  pathParamsModel?: TSchema;
  outputModel?: TSchema;
  meta?: Meta;
};
type AnyHandlerBuilderDef = HandlerBuilderDef<any, any, any>;

export interface HandlerBuilder<
  Path extends ValidPath,
  Method extends HTTPMethod,
  Context,
  Meta,
  ContextOverrides,
  Input,
  PathParamInput,
  Output,
  THandler extends boolean,
> {
  input: IfUnset<
    Input,
    <$InputSchema extends TSchema>(
      schema: $InputSchema,
    ) => HandlerBuilder<
      Path,
      Method,
      Context,
      Meta,
      ContextOverrides,
      $InputSchema,
      PathParamInput,
      Output,
      THandler
    >,
    never
  >;
  pathParams: IfUnset<
    PathParamInput,
    <
      $PathParamSchema extends TObject<{
        [k in keyof PathParams<Path>]: TSchema;
      }>,
    >(
      schema: $PathParamSchema,
    ) => HandlerBuilder<
      Path,
      Method,
      Context,
      Meta,
      ContextOverrides,
      Input,
      $PathParamSchema,
      Output,
      THandler
    >,
    never
  >;
  output: IfUnset<
    Output,
    <$OutputSchema extends TSchema>(
      schema: $OutputSchema,
    ) => HandlerBuilder<
      Path,
      Method,
      Context,
      Meta,
      ContextOverrides,
      Input,
      PathParamInput,
      $OutputSchema,
      THandler
    >,
    never
  >;
  meta(
    meta: Meta,
  ): HandlerBuilder<
    Path,
    Method,
    Context,
    Meta,
    ContextOverrides,
    Input,
    PathParamInput,
    Output,
    THandler
  >;
  use<$NewContextOverrides>(
    fn: any,
  ): HandlerBuilder<
    Path,
    Method,
    Context,
    Meta,
    Overwrite<ContextOverrides, $NewContextOverrides>,
    Input,
    PathParamInput,
    Output,
    THandler
  >;
  handler<$Output>(
    fn: HandlerFn<
      Path,
      Method,
      Context,
      Meta,
      ContextOverrides,
      Input,
      Output,
      $Output
    >,
  ): Handler<Path, { input: Input; output: IfUnset<Output, $Output> }>;
  _def: HandlerBuilderDef<Path, Method, Meta>;
}

export type AnyHandlerBuilder = HandlerBuilder<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

export function createNewHandlerBuilder(
  def1: AnyHandlerBuilderDef,
  def2: Partial<AnyHandlerBuilderDef>,
): AnyHandlerBuilder {
  const { middlewares = [], meta, ...rest } = def2;

  return createHandlerBuilder(def1.path, def1.method, {
    ...mergeWithoutOverrides(def1, rest),
    middlewares: [...def1.middlewares, ...middlewares],
    meta: def1.meta && meta ? { ...def1.meta, ...meta } : (meta ?? def1.meta),
  });
}

export function createHandlerBuilder<
  $Path extends ValidPath,
  $Method extends HTTPMethod,
  Context,
  Meta,
>(
  path: $Path,
  method: $Method,
  initDef: Partial<AnyHandlerBuilderDef>,
): HandlerBuilder<
  $Path,
  $Method,
  Context,
  Meta,
  object,
  UnsetMarker,
  UnsetMarker,
  UnsetMarker,
  false
> {
  const handler: AnyHandlerBuilderDef = {
    path,
    method,
    middlewares: [],
    ...initDef,
  };

  const builder: AnyHandlerBuilder = {
    _def: handler,
    input(schema) {
      return createNewHandlerBuilder(handler, { inputModel: schema });
    },
    pathParams(schema) {
      return createNewHandlerBuilder(handler, { pathParamsModel: schema });
    },
    output(schema) {
      return createNewHandlerBuilder(handler, { outputModel: schema });
    },
    meta(meta) {
      return createNewHandlerBuilder(handler, { meta });
    },
    use(fn) {
      return createNewHandlerBuilder(handler, { middlewares: [fn] });
    },
    handler(fn) {
      return {
        handler: true,
        _def: {
          path,
          $types: {
            input: handler.inputModel,
            output: handler.outputModel,
          },
        },
      };
    },
  };

  return builder;
}
