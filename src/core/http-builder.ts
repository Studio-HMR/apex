import type { UnsetMarker } from "../utils/symbol";
import type { Overwrite } from "../utils/types";
import type { HandlerBuilder } from "./http-handler-builder";
import type { ToValidPath, ValidPath } from "./http-path";
import type {
  HTTPDelete,
  HTTPGet,
  HTTPMethod,
  HTTPPost,
  HTTPPut,
} from "./http-types";
import { mergeWithoutOverrides } from "../utils/types";
import { createHandlerBuilder } from "./http-handler-builder";

type OptionalHTTPPathHandler<
  ControllerPath extends ValidPath | undefined,
  Method extends HTTPMethod,
  Context,
  Meta,
  ContextOverrides,
  Input,
  Output,
> = ControllerPath extends infer R
  ? R extends ValidPath
    ? {
        (): HandlerBuilder<
          R,
          Method,
          Context,
          Meta,
          ContextOverrides,
          Input,
          Output,
          false
        >;
        <$Path extends ValidPath>(
          path: $Path,
        ): HandlerBuilder<
          ToValidPath<`${R}${$Path}`>,
          Method,
          Context,
          Meta,
          ContextOverrides,
          Input,
          Output,
          false
        >;
      }
    : <$Path extends ValidPath>(
        path: $Path,
      ) => HandlerBuilder<
        $Path,
        Method,
        Context,
        Meta,
        ContextOverrides,
        Input,
        Output,
        false
      >
  : never;

export type HTTPBuilderDef<
  ControllerPath extends ValidPath | undefined,
  Meta,
> = {
  controllerPath: ControllerPath;
  meta?: Meta;
  middlewares: any[];
};
export type AnyCrudBuilderDef = HTTPBuilderDef<any, any>;
export interface CrudBuilder<
  ControllerPath extends ValidPath | undefined,
  Context,
  Meta,
  ContextOverrides,
  Input,
  Output,
> {
  use: <$NewContextOverrides>(
    fn: Function,
  ) => CrudBuilder<
    ControllerPath,
    Context,
    Meta,
    Overwrite<ContextOverrides, $NewContextOverrides>,
    Input,
    Output
  >;
  GET: OptionalHTTPPathHandler<
    ControllerPath,
    HTTPGet,
    Context,
    Meta,
    ContextOverrides,
    Input,
    Output
  >;
  POST: OptionalHTTPPathHandler<
    ControllerPath,
    HTTPPost,
    Context,
    Meta,
    ContextOverrides,
    Input,
    Output
  >;
  PUT: OptionalHTTPPathHandler<
    ControllerPath,
    HTTPPut,
    Context,
    Meta,
    ContextOverrides,
    Input,
    Output
  >;
  DELETE: OptionalHTTPPathHandler<
    ControllerPath,
    HTTPDelete,
    Context,
    Meta,
    ContextOverrides,
    Input,
    Output
  >;
  _def: HTTPBuilderDef<ControllerPath, Meta>;
}

export type AnyCrudBuilder = CrudBuilder<any, any, any, any, any, any>;

export function createNewHTTPBuilder<
  ControllerPath extends ValidPath | undefined,
>(
  def1: AnyCrudBuilderDef,
  def2: Partial<AnyCrudBuilderDef>,
  controllerPath: ControllerPath,
): AnyCrudBuilder {
  const { middlewares = [], meta, ...rest } = def2;

  return createHTTPBuilder(
    {
      ...mergeWithoutOverrides(def1, rest),
      middlewares: [...def1.middlewares, ...middlewares],
      meta: def1.meta && meta ? { ...def1.meta, ...meta } : (meta ?? def1.meta),
    },
    controllerPath,
  );
}

export function createHTTPBuilder<
  ControllerPath extends ValidPath | undefined,
  Context,
  Meta,
>(
  initDef: Partial<AnyCrudBuilderDef>,
  controllerPath: ControllerPath,
): CrudBuilder<
  ControllerPath,
  Context,
  Meta,
  object,
  UnsetMarker,
  UnsetMarker
> {
  const _def: AnyCrudBuilderDef = {
    controllerPath,
    middlewares: [],
    ...initDef,
  };

  const builder: AnyCrudBuilder = {
    _def,
    use(fn) {
      return createNewHTTPBuilder(_def, { middlewares: [fn] }, controllerPath);
    },
    GET(path?: ValidPath) {
      return createHandlerBuilder(
        `${controllerPath}${path ?? ""}` as ValidPath,
        "GET",
        {},
      );
    },
    POST(path?: ValidPath) {
      return createHandlerBuilder(
        `${controllerPath}${path ?? ""}` as ValidPath,
        "POST",
        {},
      );
    },
    PUT(path?: ValidPath) {
      return createHandlerBuilder(
        `${controllerPath}${path ?? ""}` as ValidPath,
        "PUT",
        {},
      );
    },
    DELETE(path?: ValidPath) {
      return createHandlerBuilder(
        `${controllerPath}${path ?? ""}` as ValidPath,
        "DELETE",
        {},
      );
    },
  };

  return builder;
}
