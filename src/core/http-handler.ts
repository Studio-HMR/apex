import { Static, TObject, TSchema } from "@sinclair/typebox";

import { PathParams, ValidPath } from "./http-path-types";
import { HTTPMethod } from "./http-types";

// apex.scheme().controller("", ({ get, post, put, delete, input, output, use, route }) => {
//   asdf: use().input().output().get(({ ctx, input, query, params }) => {})
// })

const buildControllerDef = () => {
  return {
    scheme: (schema: TSchema) => {
      return {
        controller: () => {},
      };
    },
    controller: (
      pathOrRouteDef: ValidPath | ((routeDefiners: { get: () => {} }) => {}),
      routeDef?: (routeDefiners: { get: () => {} }) => {},
    ) => {},
  };
};
const buildControllerHandler = (
  path: ValidPath | undefined,
  schema: TSchema | undefined,
) => {};

type ControllerDef = {
  (path: ValidPath, routeDefs: Function): unknown;
  (routeDefs: Function): unknown;
};

type RouteDefBuilder = {
  get: () => {};
  post: () => {};
  put: () => {};
  delete: () => {};
  input: () => {};
  output: () => {};
  use: () => {};
};

type RouteHandler = {
  (): void;
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

type Query<Schema extends TSchema> = {
  [K in keyof Static<Schema>]: Static<Schema>[K];
};

type DotNotationQuery<Schema extends TObject> = {
  [K in DotNotation<Static<Schema>>]: DotNotationType<Static<Schema>, K>;
};

type Sort<Schema extends TSchema> = {
  [K in keyof Static<Schema>]: "asc" | "desc";
};

type Pagination = {
  cursor: number;
  limit: number;
};

type QueryParams<Schema extends TObject> = {
  query: Query<Schema> & DotNotationQuery<Schema>;
  sort: Sort<Schema>;
  pagination: Pagination;
};

type RouteHandlerOpts<Path extends ValidPath, Context, Input> = {
  path: Path;
  ctx: Context;
  input: Input extends TSchema ? Input : never;
  params: PathParams<Path>;
  query: Input extends TObject ? QueryParams<Input> : never;
};

type JSONPathParts<
  Path extends string,
  FirstTail = true,
> = Path extends `${infer Head}.${infer Tail}`
  ? { [Key in Head]: { [Key in Tail]: JSONPathParts<Tail, false> } }
  : FirstTail extends true
    ? never
    : unknown;

type IsValidJsonPath<ObjectType, JSONPath extends string> =
  ObjectType extends JSONPathParts<JSONPath> ? true : false;

const c = {
  asdf: {
    fds: 0,
  },
  fddd: {},
};

const validPath = { "asdf.fds": 0 };
const invalidPath = { fdd: "" };

type Valid = IsValidJsonPath<typeof c, "asdf.fds">;
type Invalid = IsValidJsonPath<typeof c, "fdd">;

export type DotNotation<T extends Record<string, unknown>> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? T[K] extends any[] | Date
      ? K // skip arrays (to prevent indexing numeric properties)
      : `${K}.${DotNotation<T[K]>}` | K
    : K;
}[keyof T & string];

type DotNotationType<
  T extends object,
  Path extends string,
> = Path extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? T[Head] extends object
      ? DotNotationType<T[Head], Tail>
      : never
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

type D = {
  asdf: {
    fds: {
      jkl: number;
      ppp: string;
    };
    ff: number;
    d: Date;
  };
  chr: {
    d: {
      b: string;
    };
    f: {
      a: string;
    };
  };
};

type Dot = DotNotation<D>;
type T = DotNotationType<D, "asdf.fds.jkl">;

type ISODateString =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

type JSONDate = ISODateString | Date;
