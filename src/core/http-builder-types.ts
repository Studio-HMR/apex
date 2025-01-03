import { TSchema } from "@sinclair/typebox";

import {
  DefaultValue,
  IntersectIfDefined,
  MaybePromise,
  Overwrite,
  Simplify,
  UnsetMarker,
} from "../utils/types";
import { AnyHTTPHandler, HTTPHandler } from "./http-handler-types";
import { PathParams, ValidPath } from "./http-path";
import { HTTPMethod } from "./http-types";

export interface HandlerCallOptions<Path extends ValidPath, Ctx> {
  path: Path;
  ctx: Ctx;
  getRawInput: () => MaybePromise<unknown>;
  input?: unknown;
  type: HTTPMethod;
  signal: AbortSignal | undefined;
}

export type HandlerOverride<Path extends ValidPath, Ctx> = (opts: {
  args: unknown[];
  invoke: (opts: HandlerCallOptions<Path, Ctx>) => Promise<unknown>;
  _def: AnyHTTPHandler["_def"];
}) => Promise<unknown>;

export interface HandlerResolverOptions<Ctx, Input> {
  ctx: Simplify<Ctx>;
  input: Input extends UnsetMarker ? undefined : Input;
  signal: AbortSignal | undefined;
}

type HandlerBuilderResolver = (
  opts: HandlerResolverOptions<any, any>,
) => Promise<unknown>;

type HandlerBuilderDef<Path extends ValidPath> = {
  handler: true;
  inputs: TSchema[];
  output?: TSchema;
  resolver?: HandlerBuilderResolver;
  middlewares: any[];
  type?: HTTPMethod;
  caller: HandlerOverride<Path, unknown>;
};

type AnyHandlerBuilderDef = HandlerBuilderDef<ValidPath>;

type HandlerResolver<InCtx, Input, BaseOutput, Output> = (
  opts: HandlerResolverOptions<InCtx, Input>,
) => MaybePromise<DefaultValue<BaseOutput, Output>>;

type AnyResolver = HandlerResolver<any, any, any, any>;

export interface HandlerBuilder<
  Path extends ValidPath,
  Method extends HTTPMethod,
  InCtx,
  Input,
  Output,
  AsCaller extends boolean,
> {
  input<Schema extends TSchema>(
    schema: Input extends UnsetMarker ? Schema : never,
  ): HandlerBuilder<
    Path,
    Method,
    InCtx,
    IntersectIfDefined<Input, Schema>,
    Output,
    AsCaller
  >;
  output<Schema extends TSchema>(
    schema: Schema extends UnsetMarker ? Output : never,
  ): HandlerBuilder<
    Path,
    Method,
    InCtx,
    Input,
    IntersectIfDefined<Output, Schema>,
    AsCaller
  >;
  with<$OutCtx>(
    fn: ({ ctx }: { ctx: InCtx }) => MaybePromise<$OutCtx>,
  ): HandlerBuilder<
    Path,
    Method,
    Overwrite<InCtx, $OutCtx>,
    Input,
    Output,
    AsCaller
  >;
  handler<$Out>(): AsCaller extends true
    ? (input: DefaultValue<Input, void>) => Promise<DefaultValue<Output, $Out>>
    : HTTPHandler<
        Method,
        {
          input: DefaultValue<Input, void>;
          output: DefaultValue<Output, $Out>;
          path: Path;
          params: PathParams<Path>;
        }
      >;
}
