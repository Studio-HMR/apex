import { ValidPath } from "./http-path";

interface ControllerBuilderDef<Meta> {
  controller: true;
  meta: Meta;
}

export interface ControllerBuilder<
  Path extends ValidPath | undefined,
  Meta extends object,
> {
  secure: () => ControllerBuilder<Path, Meta>;
  use: () => ControllerBuilder<Path, Meta>;
  routes: () => ControllerBuilder<Path, Meta>;
  _def: ControllerBuilderDef<Meta>;
}
