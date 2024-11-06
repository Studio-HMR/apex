export type PartialIf<Cond extends boolean, T> = Cond extends true
  ? Partial<T>
  : T;

export const unset = Symbol("unset");
export type Unset = typeof unset;

export type ValueOf<Obj> = Obj[keyof Obj];

export type Simplify<T> = T extends any[] | Date ? T : { [K in keyof T]: T[K] };
export type Dict<T> = Record<string, T | undefined>;
export type Maybe<T> = T | null | undefined;
export type MaybePromise<T> = T | Promise<T>;

export type FilterKeys<T extends object, FilterKeys> = {
  [K in keyof T]: K extends FilterKeys ? K : never;
}[keyof T];
export type FilterValues<T extends object, FilterValues> = {
  [K in keyof T]: T[K] extends FilterValues ? K : never;
}[keyof T];

export type Unwrap<T> = T extends (...args: any[]) => infer R ? Awaited<R> : T;
export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export type DistributiveOmit<T, Key extends keyof any> = T extends any
  ? Omit<T, Key>
  : never;

export type RemovedIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : K]: T[K];
};

export type Overwrite<TType, TWith> = TWith extends any
  ? TType extends object
    ? {
        [K in  // Exclude index signature from keys
          | keyof RemovedIndexSignature<TType>
          | keyof RemovedIndexSignature<TWith>]: K extends keyof TWith
          ? TWith[K]
          : K extends keyof TType
            ? TType[K]
            : never;
      } & (string extends keyof TWith // Handle cases with an index signature
        ? { [key: string]: TWith[string] }
        : number extends keyof TWith
          ? { [key: number]: TWith[number] }
          : {})
    : TWith
  : never;

export type ValidateShape<TActualShape, TExpectedShape> =
  TActualShape extends TExpectedShape
    ? Exclude<keyof TActualShape, keyof TExpectedShape> extends never
      ? TActualShape
      : TExpectedShape
    : never;

export type PickFirstDefined<TType, TPick> = undefined extends TType
  ? undefined extends TPick
    ? never
    : TPick
  : TType;

export type KeyFromValue<
  TValue,
  TType extends Record<PropertyKey, PropertyKey>,
> = {
  [K in keyof TType]: TValue extends TType[K] ? K : never;
}[keyof TType];

export type InvertKeyValue<TType extends Record<PropertyKey, PropertyKey>> = {
  [TValue in TType[keyof TType]]: KeyFromValue<TValue, TType>;
};

export type IntersectIfDefined<TType, TWith> = TType extends Unset
  ? TWith
  : TWith extends Unset
    ? TType
    : Simplify<TType & TWith>;
``;
export type DefaultValue<TValue, TFallback> = TValue extends Unset
  ? TFallback
  : TValue;
