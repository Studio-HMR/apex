import type { Overwrite } from "../utils/types";
import type { AnyHandler } from "./http-handler";
import type { ValidPath } from "./http-path";
import type { ApexStartOpts } from "./start";

export type ControllerBuilderDef<Path extends ValidPath> = {
  path: Path;
  controller: true;
  middlewares: any[];
};
export type AnyControllerBuilderDef = ControllerBuilderDef<any>;

export type ControllerDef<
  ControllerPath extends ValidPath,
  Routes extends Record<string, AnyHandler | AnyController>,
> = {
  controller: true;
  _def: {
    path: ControllerPath;
    routes: Routes;
    middlewares: any[];
  };
};
export type AnyRouteDef = AnyHandler | AnyController;
export type AnyController = ControllerDef<any, any>;

export interface ControllerBuilder<
  Path extends ValidPath,
  Context,
  ContextOverrides,
> {
  use: <$NewContextOverrides>(
    fn: (...args: any[]) => any,
  ) => ControllerBuilder<
    Path,
    Context,
    Overwrite<ContextOverrides, $NewContextOverrides>
  >;
  routes: <$Routes extends Record<string, AnyHandler | AnyController>>(
    routes: $Routes,
  ) => ControllerDef<Path, $Routes>;
  _def: ControllerBuilderDef<Path>;
}

export const createControllerBuilder = <
  Path extends ValidPath,
  Context,
  ContextOverrides,
>(
  path: Path,
  middlewares: any[] = [],
): ControllerBuilder<Path, Context, ContextOverrides> => {
  const _def: ControllerBuilderDef<Path> = {
    path,
    controller: true,
    middlewares,
  };

  return {
    use: (fn) => createControllerBuilder(path, [...middlewares, fn]),
    routes: (routes) => ({
      controller: true,
      _def: {
        path,
        routes,
        middlewares,
      },
    }),
    _def,
  };
};
