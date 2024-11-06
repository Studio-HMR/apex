export type ValidPath = `/${string}`;
export type ToValidPath<Path extends string> = Path extends `/${infer Tail}`
  ? `/${Tail}`
  : `/${Path}`;
export type ValidPathParam = `:${string}`;
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

export type PathParts<
  Path extends string,
  Take extends boolean = false,
> = Path extends `/${infer Tail}`
  ? [...PathParts<Tail, true>]
  : Path extends `${infer Head}/${infer Tail}`
    ? [Head extends `:${infer Param}` ? Param : Head, ...PathParts<Tail, true>]
    : Take extends true
      ? [Path extends `:${infer Param}` ? Param : Path]
      : [];

export type PathParams<Path extends string> = {
  [key in PathParam<Path>]: string;
};

export type PathParamsFromParts<
  Parts extends string[],
  Params extends Record<string, string> = {},
> = Parts extends [infer Head, ...infer Tail]
  ? Head extends `:${infer Param}`
    ? PathParamsFromParts<
        Tail extends string[] ? Tail : string[],
        Params & { [key in Param]: string }
      >
    : PathParamsFromParts<Tail extends string[] ? Tail : string[], Params>
  : Params;
