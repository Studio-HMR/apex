import { TSchema } from "@sinclair/typebox";

import { BaseDef } from "./def";
import { ValidPath } from "./http-path-types";
import { HTTPMethod } from "./http-types";

interface HandlerDef<
  $Path extends ValidPath,
  $Method extends HTTPMethod,
  $Context,
  $Meta,
  Input,
  Output,
> extends BaseDef<true, $Context, $Meta, Input> {
  path: $Path;
  method: $Method;
  output: Output;
}

type Handler<
  $Path extends ValidPath,
  $Method extends HTTPMethod,
  $Context,
  $Meta,
  $Input,
  $Output,
> = {
  _def: HandlerDef<$Path, $Method, $Context, $Meta, $Input, $Output>;
  (): Promise<$Output>;
};

interface HandlerBuilderDef {
  _pathMap: Record<ValidPath, true>;
}

interface HandlerBuilder<
  $Controller,
  $Path extends ValidPath,
  $Method extends HTTPMethod,
  Context,
  Meta,
  Input,
  Output,
> {
  use<NewContext, NewMeta, NewInput, NewOutput>(): void;
  input<I extends TSchema[]>(
    ...inputs: I
  ): HandlerBuilder<
    $Controller,
    $Path,
    $Method,
    Context,
    Meta,
    I[number] | Input,
    Output
  >;
  output<O extends TSchema[]>(
    ...outputs: O
  ): HandlerBuilder<
    $Controller,
    $Path,
    $Method,
    Context,
    Meta,
    Input,
    O[number] | Output
  >;
  handle(): void;
}