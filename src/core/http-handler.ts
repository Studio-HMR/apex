import { Static, TObject, TSchema, Type } from "@sinclair/typebox";

import { DotNotationPrim, DotNotationType } from "../utils/json-path";
import { MaybePromise, SetMarker, UnsetMarker } from "../utils/types";
import { PathParams, ToValidPath, ValidPath } from "./http-path-types";
import { HTTPGet, HTTPMethod, HTTPPost } from "./http-types";

// apex.scheme().controller("", ({ get, post, put, delete, input, output, use, route }) => {
//   asdf: use().input().output().get(({ ctx, input, query, params }) => {})
// })

const buildNewController = <Context, Meta>(_def?: AnyControllerDef) => {
  const newDef = _def
    ? {
        ..._def,
      }
    : {};
  return {
    _def: {},
    scheme: <NewSchema extends TSchema>(schema: NewSchema) => {
      return {
        controller: () => {},
      };
    },
    controller: <
      Path extends ValidPath,
      RouterDef extends Record<string, AnyRouteDefBuilder>,
    >(
      pathOrRouteDef: Path | ((routerDefiners: { get: () => {} }) => {}),
      routerDef?: (routeDefiners: RouteDefBuilder<"/">) => {},
    ) => {},
  };
};

type ControllerDefBuilder<
  Path extends ValidPath,
  Schema extends TSchema | UnsetMarker,
  Context,
  Meta,
  Def extends AnyControllerDef,
> = {
  _def: Def;
  scheme: Schema extends UnsetMarker
    ? <NewSchema extends TSchema>(
        schema: NewSchema,
      ) => ControllerDefBuilder<Path, NewSchema, Context, Meta, Def>
    : never;
  controller: ControllerHandler<Path, Schema, Context, Meta>;
};

type AnyControllerDefBuilder = ControllerDefBuilder<
  ValidPath,
  any,
  any,
  any,
  any
>;

type ControllerDef<
  Path extends ValidPath,
  Schema extends TSchema | UnsetMarker,
  Context,
  Meta,
  RouteDef extends AnyRouterDef,
> = {
  $path: Path;
  $router: RouteDef;
  $types: {
    ctx: Context;
    meta: Meta;
    input: Schema extends UnsetMarker ? TObject : Schema;
    output: Schema extends UnsetMarker ? TObject : Schema;
  };
};

type AnyControllerDef = ControllerDef<ValidPath, any, any, any, any>;
type AnyRouterDef = Record<string, AnyRouteDefBuilder | AnyControllerDef>;

type ControllerHandler<
  Path extends ValidPath,
  Schema extends TSchema | UnsetMarker,
  Context,
  Meta,
> = {
  <RouterDef extends AnyRouterDef>(
    path: Path,
    routerDef: (
      builder: RouteDefBuilder<
        Path,
        Context,
        Meta,
        Schema,
        UnsetMarker,
        Schema,
        UnsetMarker
      >,
    ) => RouterDef,
  ): ControllerDef<Path, Schema, Context, Meta, RouterDef>;
  <RouterDef extends AnyRouterDef>(
    routerDef: (
      builder: RouteDefBuilder<
        "/",
        Context,
        Meta,
        Schema,
        UnsetMarker,
        Schema,
        UnsetMarker
      >,
    ) => RouterDef,
  ): ControllerDef<Path, Schema, Context, Meta, RouterDef>;
};

type RouteDef = {};

type RouteHandlerDef<
  Path extends ValidPath,
  Method extends HTTPMethod,
  Context,
  Meta,
  Input,
  Output,
> = {
  $route: {
    path: Path;
    method: Method;
  };
  $types: {
    ctx: Context;
    meta: Meta;
    input: Input extends TSchema ? Input : never;
    output: Output extends TSchema ? Output : never;
  };
};

type BaseQuery<Schema extends TSchema> = {
  [K in keyof Static<Schema>]?: Static<Schema>[K];
};

type DotNotationQuery<Schema extends TObject> = {
  [K in DotNotationPrim<Static<Schema>>]?: DotNotationType<Static<Schema>, K>;
};

type Query<Schema extends TObject> = BaseQuery<Schema> &
  DotNotationQuery<Schema>;

type Sort<Schema extends TSchema> = {
  [K in keyof Static<Schema>]?: "asc" | "desc";
};

type Pagination = {
  cursor: number;
  limit: number;
};

type QueryParams<Schema extends TObject> = {
  query: Query<Schema>;
  sort: Sort<Schema>;
  pagination?: Pagination;
};

type RouteHandlerOpts<Path extends ValidPath, Context, Input> = {
  path: Path;
  ctx: Context;
  input: Input extends TSchema ? Input : never;
  params: PathParams<Path>;
  query: Input extends TSchema
    ? Input extends TObject
      ? QueryParams<Input>
      : string
    : never;
};

type RouteHandlerFn<Path extends ValidPath, Context, Input, Output> = (
  opts: RouteHandlerOpts<Path, Context, Input>,
) => MaybePromise<Output>;

type RouteHandler<
  BasePath extends ValidPath,
  Method extends HTTPMethod,
  Context,
  Meta,
  Input,
  Output,
> = {
  <Path extends ValidPath>(
    path: Path,
    handler: RouteHandlerFn<
      ToValidPath<`${BasePath}${Path}`>,
      Context,
      Input,
      Output
    >,
  ): RouteHandlerDef<
    ToValidPath<`${BasePath}${Path}`>,
    Method,
    Context,
    Meta,
    Input,
    Output
  >;
  (
    handler: RouteHandlerFn<BasePath, Context, Input, Output>,
  ): RouteHandlerDef<BasePath, Method, Context, Meta, Input, Output>;
};

type InputDef<
  BasePath extends ValidPath,
  Context,
  Meta,
  Input,
  InputOverride,
  Output,
  OutputOverride,
> = InputOverride extends UnsetMarker
  ? {
      input: <NewInput>(
        schema: NewInput,
      ) => RouteDefBuilder<
        BasePath,
        Context,
        Meta,
        Input,
        NewInput,
        Output,
        OutputOverride
      >;
    }
  : {};

type OutputDef<
  BasePath extends ValidPath,
  Context,
  Meta,
  Input,
  InputOverride,
  Output,
  OutputOverride,
> = OutputOverride extends UnsetMarker
  ? {
      output: <NewOutput>(
        schema: NewOutput,
      ) => RouteDefBuilder<
        BasePath,
        Context,
        Meta,
        Input,
        InputOverride,
        Output,
        NewOutput
      >;
    }
  : {};

type HTTPHandlerDef<
  BasePath extends ValidPath,
  Context,
  Meta,
  Input,
  InputOverride,
  Output,
  OutputOverride,
> = {
  [Method in Lowercase<HTTPMethod>]: RouteHandler<
    BasePath,
    Uppercase<Method>,
    Context,
    Meta,
    InputOverride extends UnsetMarker ? Input : InputOverride,
    OutputOverride extends UnsetMarker ? Output : OutputOverride
  >;
};

type RouteDefBuilder<
  BasePath extends ValidPath,
  Context,
  Meta,
  Input,
  InputOverride,
  Output,
  OutputOverride,
> = HTTPHandlerDef<
  BasePath,
  Context,
  Meta,
  Input,
  InputOverride,
  Output,
  OutputOverride
> &
  InputDef<
    BasePath,
    Context,
    Meta,
    Input,
    InputOverride,
    Output,
    OutputOverride
  > &
  OutputDef<
    BasePath,
    Context,
    Meta,
    Input,
    InputOverride,
    Output,
    OutputOverride
  >;

type AnyRouteDefBuilder = RouteDefBuilder<
  ValidPath,
  any,
  any,
  any,
  any,
  any,
  any
>;
