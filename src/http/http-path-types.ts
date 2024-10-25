/**
 * Path delimiter
 */
type PD = "/";
/**
 * Param delimiter
 */
type IdD = `${PD}:`;

export type ValidPath = `${PD}${string}`;
export type ToValidPath<Path extends string> = Path extends `${PD}${infer Tail}`
  ? `${PD}${Tail}`
  : `${PD}${Path}`;

type BasePath<Path extends string> = `${PD}${Path}`;
type PathParam<PathParam extends string> = `${PD}${IdD}${PathParam}`;

type ExtractPathParam<Path extends string> = Path extends `${IdD}${infer Param}`
  ? Param
  : Path extends `${PD}${infer Unused}${PD}`
    ? ExtractPathParam<`/${Unused}`>
    : Path;

type PathParts<T extends string> = T extends `${infer Head}${PD}${infer Tail}`
  ? Tail extends "" // trailing slash, we ignore
    ? []
    : Head extends ""
      ? [...PathParts<ExtractPathParam<Tail>>]
      : [Head, ...PathParts<ExtractPathParam<Tail>>]
  : [T];

type PathParamParts<T extends string> = T extends `${IdD}${infer Tail}`
  ? Tail extends `${infer TailHead}${PD}${infer NewTail}`
    ? [TailHead, ...PathParamParts<`${PD}${NewTail}`>]
    : [Tail]
  : T extends `${PD}${infer Tail}`
    ? [...PathParamParts<Tail>]
    : T extends `${infer UnusedHead}${PD}${infer Tail}`
      ? [...PathParamParts<`${PD}${Tail}`>]
      : [];

// : T extends

type ToParamDictionary<Path extends string> =
  Path extends `${IdD}${infer UnusedTail}`
    ? { [Key in PathParamParts<Path>[number]]: string }
    : false;

type GetFirstIdParam<Path extends string> =
  Path extends `${infer UnusedHead}${IdD}${infer First}`
    ? First extends `${infer Head}${PD}${infer UnusedRest}`
      ? Head
      : First
    : Path;

type GetFirstParam<Path extends string> =
  Path extends `${infer Head}${PD}${infer UnusedRest}` ? Head : Path;

type IdKeyId<IdKey extends string> = {
  _idKey: IdKey;
};

export type ToIdKey<IdKey extends string> = IdKeyId<GetFirstIdParam<IdKey>> & {
  [Key in GetFirstIdParam<IdKey>]: string;
};

export type CaptureIdParam<Path extends string> = IdKeyId<
  GetFirstParam<Path>
> & { [Key in GetFirstParam<Path>]: string };

export type PathParams<Path extends string> = Path extends `${IdD}${infer Tail}`
  ? CaptureIdParam<Tail> & {
      params: ToParamDictionary<Path>;
    }
  : {
      _idKey: false;
      params: false;
    };
