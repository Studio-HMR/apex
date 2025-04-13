import type { TSchema } from "@sinclair/typebox";

import type { IfUnset, UnsetMarker } from "../utils/symbol";
import type { Overwrite } from "../utils/types";
import type { Handler, HandlerFn } from "./http-handler";
import type { ValidPath } from "./http-path";
import type { HTTPMethod } from "./http-types";
import { mergeWithoutOverrides } from "../utils/types";

export type HandlerBuilderDef<
  Path extends ValidPath,
  Method extends HTTPMethod,
  Meta,
> = {
  path: Path;
  method: Method;
  middlewares: any[];
  inputModel?: TSchema;
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

  return builder as HandlerBuilder<
    $Path,
    $Method,
    Context,
    Meta,
    object,
    UnsetMarker,
    UnsetMarker,
    false
  >;
}
