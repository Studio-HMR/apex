import type { Static, TSchema } from "@sinclair/typebox";

import type { SetMarker, UnsetMarker } from "./symbol";

export type Primitive =
  | string
  | number
  | bigint
  | boolean
  | symbol
  | null
  | undefined;

export type PartialIf<Cond extends boolean, T> = Cond extends true
  ? Partial<T>
  : T;

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
        ? Record<string, TWith[string]>
        : number extends keyof TWith
          ? Record<number, TWith[number]>
          : {})
    : TWith
  : never;

export type Rewrite<TType, TWith> = Simplify<Overwrite<TType, TWith>>;

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

export type IntersectIfDefined<TType, TWith> = TType extends SetMarker
  ? TWith
  : TWith extends SetMarker
    ? TType
    : Simplify<TType & TWith>;

export type DefaultValue<
  TValue,
  TFallback,
  Marker = UnsetMarker,
> = TValue extends Marker ? TFallback : TValue;

export type DefaultSchema<TValue, TFallback> =
  DefaultValue<TValue, TFallback, UnsetMarker> extends infer R
    ? R extends TSchema
      ? Static<R>
      : R
    : never;

export type StringKey<K extends string | number | symbol> = K extends
  | string
  | number
  ? K
  : "SYMBOL";

export type JsonPaths<
  T extends Record<string, unknown>,
  Prefix extends string = "",
  IncludeParents extends boolean = true,
  Separator extends string = ".",
> = {
  [K in keyof T]: T[K] extends Primitive
    ? `${Prefix}${StringKey<K>}`
    : T[K] extends (infer S)[]
      ? S extends Primitive | Date
        ? `${Prefix}${StringKey<K>}${Separator}[]`
        : S extends Record<string, unknown>
          ? JsonPaths<
              S,
              `${Prefix}${StringKey<K>}${Separator}`,
              IncludeParents,
              Separator
            >
          : `${Prefix}${StringKey<K>}${Separator}?`
      : T[K] extends Record<string, unknown>
        ? JsonPaths<
            T[K],
            `${Prefix}${StringKey<K>}${Separator}`,
            IncludeParents,
            Separator
          >
        : never;
}[keyof T];

export function mergeWithoutOverrides<TType extends Record<string, unknown>>(
  obj1: TType,
  ...objs: Partial<TType>[]
): TType {
  const newObj: TType = Object.assign(Object.create(null), obj1);

  for (const overrides of objs) {
    for (const key in overrides) {
      if (key in newObj && newObj[key] !== overrides[key]) {
        throw new Error(`Duplicate key ${key}`);
      }
      newObj[key as keyof TType] = overrides[key] as TType[keyof TType];
    }
  }
  return newObj;
}
