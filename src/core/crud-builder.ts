import type { UnsetMarker } from "../utils/symbol";
import type { Overwrite } from "../utils/types";
import type { HandlerBuilder } from "./http-handler";
import type { ToValidPath, ValidPath } from "./http-path";
import type {
  HTTPDelete,
  HTTPGet,
  HTTPMethod,
  HTTPPost,
  HTTPPut,
} from "./http-types";
import { mergeWithoutOverrides } from "../utils/types";
import { createHandlerBuilder } from "./http-handler";

type OptionalCrudPathHandler<
  ControllerPath extends ValidPath | undefined,
  Method extends HTTPMethod,
  Context,
  Meta,
  ContextOverrides,
  Input,
  PathParamInput,
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
          PathParamInput,
          Output,
          false
        >;
        <$Path extends ValidPath>(
          path: $Path,
        ): HandlerBuilder<
          ToValidPath<`${R extends `/${infer M}` ? M : R}${$Path}`>,
          Method,
          Context,
          Meta,
          ContextOverrides,
          Input,
          PathParamInput,
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
        PathParamInput,
        Output,
        false
      >
  : never;

export type CrudBuilderDef<
  ControllerPath extends ValidPath | undefined,
  Meta,
> = {
  controllerPath: ControllerPath;
  meta?: Meta;
  middlewares: any[];
};
export type AnyCrudBuilderDef = CrudBuilderDef<any, any>;
export interface CrudBuilder<
  ControllerPath extends ValidPath | undefined,
  Context,
  Meta,
  ContextOverrides,
  Input,
  PathParamInput,
  Output,
> {
  use: <$NewContextOverrides>(
    fn: (...args: any[]) => any,
  ) => CrudBuilder<
    ControllerPath,
    Context,
    Meta,
    Overwrite<ContextOverrides, $NewContextOverrides>,
    Input,
    PathParamInput,
    Output
  >;
  GET: OptionalCrudPathHandler<
    ControllerPath,
    HTTPGet,
    Context,
    Meta,
    ContextOverrides,
    Input,
    PathParamInput,
    Output
  >;
  POST: OptionalCrudPathHandler<
    ControllerPath,
    HTTPPost,
    Context,
    Meta,
    ContextOverrides,
    Input,
    PathParamInput,
    Output
  >;
  PUT: OptionalCrudPathHandler<
    ControllerPath,
    HTTPPut,
    Context,
    Meta,
    ContextOverrides,
    Input,
    PathParamInput,
    Output
  >;
  DELETE: OptionalCrudPathHandler<
    ControllerPath,
    HTTPDelete,
    Context,
    Meta,
    ContextOverrides,
    Input,
    PathParamInput,
    Output
  >;
  _def: CrudBuilderDef<ControllerPath, Meta>;
}

export type AnyCrudBuilder = CrudBuilder<any, any, any, any, any, any, any>;

export function createNewCrudBuilder<
  ControllerPath extends ValidPath | undefined,
>(
  def1: AnyCrudBuilderDef,
  def2: Partial<AnyCrudBuilderDef>,
  controllerPath: ControllerPath,
): AnyCrudBuilder {
  const { middlewares = [], meta, ...rest } = def2;

  return createCrudBuilder(
    {
      ...mergeWithoutOverrides(def1, rest),
      middlewares: [...def1.middlewares, ...middlewares],
      meta: def1.meta && meta ? { ...def1.meta, ...meta } : (meta ?? def1.meta),
    },
    controllerPath,
  );
}

export function createCrudBuilder<
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
      return createNewCrudBuilder(_def, { middlewares: [fn] }, controllerPath);
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

  return builder satisfies CrudBuilder<
    ControllerPath,
    Context,
    Meta,
    object,
    UnsetMarker,
    UnsetMarker,
    UnsetMarker
  > as CrudBuilder<
    ControllerPath,
    Context,
    Meta,
    object,
    UnsetMarker,
    UnsetMarker,
    UnsetMarker
  >;
}
