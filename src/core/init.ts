import { TSchema, Type } from "@sinclair/typebox";

import { MaybePromise } from "../utils/types";
import { SecurityScheme } from "./oapi-security";
import { createCrudBuilder } from "./crud-builder";
import { ValidPath } from "./http-path";

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
  createContext: CreateContextFn<Context> | undefined = undefined;
  securitySchemes: Schemes = undefined as Schemes;
  modelSchemes: Models = undefined as Models;

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
      CRUD: createCrudBuilder({}, "/"),
      controller: <ControllerPath extends ValidPath>(path: ControllerPath = "/" as ControllerPath) => {},
      middleware: () => {},
    };
  }
}

const d = new Apex().context<{ asdf: string }>().meta<{ openapi: string }>().schemes({}).models({}).init();

const f = d.CRUD.GET("/user").input(Type.Object({ a: Type.String() })).output(Type.Object({})).handler(({ input }) => {
  return {};
});
