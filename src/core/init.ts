import type { TSchema } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";

import type { MaybePromise } from "../utils/types";
import type { AnyController } from "./controller-builder";
import type { ValidPath } from "./http-path";
import type { SecurityScheme } from "./oapi-security";
import type { ApexStartOpts } from "./start";
import { createControllerBuilder } from "./controller-builder";
import { createCrudBuilder } from "./crud-builder";
import { startServer } from "./start";

type CreateContextFn<Ctx extends object> = (
  req: Request,
  res: Response,
) => MaybePromise<Ctx>;

export class Apex<
  Context extends object,
  Meta extends object,
  Schemes extends Record<string, SecurityScheme> | undefined,
  Models extends Record<string, TSchema> | undefined,
> {
  private createContext: CreateContextFn<Context> | undefined = undefined;
  private securitySchemes: Schemes = undefined as Schemes;
  private modelSchemes: Models = undefined as Models;

  constructor(
    createContext?: CreateContextFn<Context>,
    schemes?: Schemes,
    models?: Models,
  ) {
    this.createContext = createContext;
    this.securitySchemes = schemes as Schemes;
    this.modelSchemes = models as Models;
  }

  context<$Context extends object>(
    createContext?: CreateContextFn<$Context>,
  ): Apex<$Context, Meta, Schemes, Models> {
    return new Apex<$Context, Meta, Schemes, Models>(
      createContext,
      this.securitySchemes,
      this.modelSchemes,
    );
  }

  meta<$Meta extends object>(): Apex<Context, $Meta, Schemes, Models> {
    return new Apex<Context, $Meta, Schemes, Models>(
      this.createContext,
      this.securitySchemes,
      this.modelSchemes,
    );
  }

  schemes<$Schemes extends Record<string, SecurityScheme>>(
    schemes: $Schemes,
  ): Apex<Context, Meta, $Schemes, Models> {
    return new Apex<Context, Meta, $Schemes, Models>(
      this.createContext,
      schemes,
      this.modelSchemes,
    );
  }

  models<$Models extends Record<string, TSchema>>(models: $Models) {
    return new Apex<Context, Meta, Schemes, $Models>(
      this.createContext,
      this.securitySchemes,
      models,
    );
  }

  init() {
    return {
      HTTP: createCrudBuilder<undefined, Context, Meta>({}, undefined),
      controller: <ControllerPath extends ValidPath>(
        controllerPath: ControllerPath = "/" as ControllerPath,
      ) => createControllerBuilder<ControllerPath, Context, {}>(controllerPath),
      middleware: () => {},
    };
  }

  startServer(controllerDef: AnyController, port: number, opts: ApexStartOpts) {
    if (!this.createContext) {
      throw new Error("Context function is not defined");
    }
    return startServer(controllerDef, port, opts, this.createContext);
  }
}

const apexSingletonInstance = new Apex()
  .context<{ asdf: string }>()
  .meta<{ asdf2: string }>();

const f = apexSingletonInstance.init();
const g = f.HTTP.GET("/:id")
  .input(Type.String())
  .output(Type.String())
  .pathParams(
    Type.Object({
      f: Type.String(),
      id: Type.String(),
    }),
  )
  .handler(async ({ ctx, meta }) => {
    return "";
  });

const m = f
  .controller("/users")
  .use(() => {})
  .routes({
    swag: f.controller("/swag").routes({
      c: f.HTTP.DELETE("/:id").handler(() => {}),
    }),
    p: g,
  });
