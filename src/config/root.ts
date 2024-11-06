import { PartialIf } from "../utils/types";
import { CombinedDataTransformer } from "./transform";

export interface RootTypes {
  ctx: object;
  responseShape: {};
  transformer: boolean;
}

export interface RootConfig<RTypes extends RootTypes> {
  $types: RTypes;
  transformer: CombinedDataTransformer;
  debug: boolean;
}

export type CreateRootTypes<RTypes extends RootTypes> = RTypes;

export type AnyRootTypes = CreateRootTypes<{
  ctx: any;
  responseShape: any;
  transformer: any;
}>;

export type CreateCtxCallback<
  InCtx,
  Func extends (...args: any[]) => any,
> = PartialIf<object extends InCtx ? true : false, { createCtx: Func }>;
