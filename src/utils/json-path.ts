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

export type DotNotation<T extends Record<string, unknown>> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? T[K] extends any[] | Date
      ? K // skip arrays (to prevent indexing numeric properties)
      : `${K}.${DotNotation<T[K]>}` | K
    : K;
}[keyof T & string];

export type DotNotationPrim<T extends Record<string, unknown>> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? T[K] extends any[] | Date
      ? K // skip arrays (to prevent indexing numeric properties)
      : `${K}.${DotNotation<T[K]>}`
    : K;
}[keyof T & string];

export type DotNotationType<
  T extends object,
  Path extends string,
> = Path extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? T[Head] extends object
      ? Partial<DotNotationType<T[Head], Tail>>
      : never
    : never
  : Path extends keyof T
    ? Partial<T[Path]>
    : never;
