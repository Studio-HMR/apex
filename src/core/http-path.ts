export type ValidPath = `/${string}`;
export type ToValidPath<Path extends string> = Path extends `/${infer Tail}`
  ? `/${Tail}`
  : `/${Path}`;
export type ValidPathParam = `:${string}`;
export type ValidQueryParam =
  | `?${string}=${string}`
  | `?${string}`
  | `&${string}=${string}`
  | `&${string}`;

export const isValidPath = (path: string): path is ValidPath =>
  path.startsWith("/");

export const toValidPath = (path: string): ValidPath => {
  if (isValidPath(path)) {
    return path;
  }

  return `/${path}`;
};

export type PathParam<Path extends string> =
  Path extends `${infer Head}/${infer Tail}`
    ? PathParam<Head> | PathParam<Tail>
    : Path extends `${infer Head}/`
      ? PathParam<Head>
      : Path extends `/${infer Tail}`
        ? PathParam<Tail>
        : Path extends `:${infer Param}`
          ? Param
          : never;

export type PathParams<Path extends string> = {
  [key in PathParam<Path>]: string;
};

export type QueryParams<Path extends string> =
  Path extends `${string}?${infer Tail}`
    ? Tail extends `${infer Key}=${infer Value}&${infer Rest}`
      ? { [key in Key]: Value } & QueryParams<`?${Rest}`>
      : Tail extends `${infer LoneKey}&${infer Rest}`
        ? { [key in LoneKey]: true } & QueryParams<`?${Rest}`>
        : Tail extends `${infer LastKey}=${infer LastValue}`
          ? { [key in LastKey]: LastValue }
          : Tail extends `${infer LoneLastKey}`
            ? { [key in LoneLastKey]: true }
            : never
    : never;

export type QueryParamKeys<Path extends string> = keyof QueryParams<Path>;

type PathPart = {
  type: "path" | "param";
  value: string;
};

type FromPathPart<Part extends PathPart> = "param" extends Part["type"]
  ? Part["value"]
  : never;

export type PathParts<
  Path extends string,
  Take extends boolean = false,
> = Path extends `/${infer Tail}`
  ? [...PathParts<Tail, true>]
  : Path extends `${infer Head}/${infer Tail}`
    ? [
        Head extends `:${infer Param}`
          ? { type: "param"; value: Param }
          : { type: "path"; value: Head },
        ...PathParts<Tail, true>,
      ]
    : Take extends true
      ? [
          Path extends `:${infer Param}`
            ? { type: "param"; value: Param }
            : { type: "path"; value: Path },
        ]
      : [];

export type PathParamsFromParts<
  Parts extends PathPart[],
  Params extends Record<string, string> = {},
> = Parts extends [infer Head, ...infer Tail]
  ? Head extends PathPart
    ? PathParamsFromParts<
        Tail extends PathPart[] ? Tail : PathPart[],
        { [key in keyof Params | FromPathPart<Head>]: string }
      >
    : PathParamsFromParts<Tail extends PathPart[] ? Tail : PathPart[], Params>
  : Params;
