import { Static, TSchema, Type } from "@sinclair/typebox";

import { ApexError } from "../error/codes";
import { ValidPath } from "./http-path";

interface ControllerDef<
  Path extends ValidPath,
  ControllerSchema extends TSchema,
  Context,
  Routes,
> {
  $types: {
    path: Path;
    schema: ControllerSchema | undefined;
    context: Context;
    routes: Routes;
  };
}

export interface BuiltControllerDef {
  schema: unknown;
  basePath: unknown;
}

export interface Controller<
  Def extends BuiltControllerDef,
  Routes extends Record<string, any>,
> {
  _def: {
    $types: {
      path: Def["basePath"];
      schema: Def["schema"];
    };
    meta: unknown;
  };
  _routes: Routes;
}
export type AnyController = Controller<BuiltControllerDef, any>;

export type inferControllerTypes<$Controller> =
  $Controller extends AnyController ? $Controller["_def"]["$types"] : never;
export type inferControllerPath<$Controller extends AnyController> =
  undefined extends inferControllerTypes<$Controller>["path"]
    ? void | inferControllerTypes<$Controller>["path"]
    : inferControllerTypes<$Controller>["path"];
export type inferControllerSchema<$Controller extends AnyController> =
  undefined extends inferControllerTypes<$Controller>["schema"]
    ? void | inferControllerTypes<$Controller>["schema"]
    : inferControllerTypes<$Controller>["schema"];

type ControllerBuilder = {
  _def: ControllerDef;
  <T extends TSchema>(controllerScheme?: T | undefined): void;
};

export function createNewControllerBuilder() {}

export function createControllerBuilder() {}

type CrudOpHandler = (path: string) => {
  use: (
    middleware: (opts: {
      ctx: any;
      input: any;
      meta: any;
      next: (opts: { ctx: any }) => void;
    }) => any,
  ) => ReturnType<CrudOpHandler>;
  input: (schema: TSchema) => ReturnType<CrudOpHandler>;
  output: (schema: TSchema) => ReturnType<CrudOpHandler>;
  meta: (meta: Meta) => ReturnType<CrudOpHandler>;
  handle: (
    handler: (opts: { ctx: any; input: any; params: any }) => any,
  ) => void;
};

const initApex = <Context, Meta>() => {
  return {
    middleware: (
      middleware: (opts: {
        ctx: any;
        next: (opts: { ctx: any }) => void;
      }) => any,
    ) => {},
    controller: (path?: string) => ({
      use: (
        middleware: (opts: {
          ctx: any;
          input: any;
          meta: Meta;
          next: (opts: { ctx: any }) => void;
        }) => any,
      ) => {
        return {
          routes: (
            handler: (opts: {
              get: CrudOpHandler;
              post: CrudOpHandler;
              put: CrudOpHandler;
              delete: CrudOpHandler;
            }) => any,
          ) => {},
        };
      },
      routes: (
        handler: (opts: {
          get: CrudOpHandler;
          post: CrudOpHandler;
          put: CrudOpHandler;
          delete: CrudOpHandler;
        }) => any,
      ) => {},
    }),
  };
};

const UserSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
});
// example of a user object that might exist on the context
type User = Static<typeof UserSchema>;
// example of an auth token that might exist on the context
type AuthToken = {};

// Context is similar to the context object in tRPC.
// The context is created on request receive on the server and is passed/ can be transformed via middlewares and finally is passed to the route resolver.
// The context can contain really any data, including functions and objects.
// The context is first created via a `createContext` function that the user of the library must supply in order to create the base context object from the request.
interface Context {
  user?: User;
  authToken: AuthToken;
}

// Meta is similar to the meta object in tRPC.
// It is a way to specify metadata about a given route that middlewares can see and use in their own business logic
// The meta interface can be any object, and is optional for routes and controllers.
interface Meta {
  name: string;
  description: string;
  requiresAuth: boolean;
}

// initApex is the main function that the user of the library will call to initialize building controllers and routes. We pass it the base Context and Meta objects as type parameters to initialize it knowing what the base context is and what meta interface is expected from routes that actually define a meta.
const apex = initApex<Context, Meta>();

// We can now use the apex object to build controllers and routes.

// Example 1, basic controller
const controller = apex
  // Controllers can associate a "base path" which is used as the prefix for all routes on the controller.
  .controller("/user")
  // The controller functions returns an object with a routes function that takes a handler function that defines the routes on the controller.
  .routes((ops) => ({
    // basic crud ops are exposed on the ops param here to build typesafe CRUD routes
    // getSelf is a route that gets the user's own user object
    getSelf: ops
      // this would mean the resolved route would be GET /user/
      .get("/")
      // the optional meta object defined here specifies `requiresAuth` true. When middlewares are processing requests for this route, they can see this on the meta for the route and adjust their logic accordingly
      .meta({
        name: "Get self",
        description: "Get the user's own user object",
        requiresAuth: true,
      })
      // the handle function is the final function call in any CRUD op chain and takes a handler function that defines the business logic of the route
      // the handler function is passed an object with the context and input of the route
      .handle(({ ctx }) => {
        // do business logic
        // return a user object
        return {};
      }),
    getUser: ops
      // this would mean the resolved route would be GET /user/:id where :id is a path parameter that will then be defined in the handler callback parameters
      .get("/:id")
      // the output function on the crud op handler is used to define a strict output type for the handler callback
      .output(UserSchema)
      .handle(({ ctx, params, input }) => {
        // id is typesafe and is typed to a string here since we specified it in the params in the .get("/:id") call
        const { id } = params;

        // if this doesn't match the user schema type, this should give a type error since we specified a strict output schema. If we did not specify an output schema, the output would be inferred as the return type of this function
        return {
          id: id,
          name: "John Doe",
        };
      }),
    createUser: ops
      // Equivalent to POST /user/
      .post("/")
      // Since we've specified an input schema here the server will parse and throw if the POST body does not match this schema
      .input(UserSchema)
      // output should be a raw true/ false
      .output(Type.Boolean())
      .handle(({ ctx, input }) => {
        // create user logic
        // ...
        return true;
      }),
  }));

// Example 2: basic controller with middlewares
const controllerWithMiddleware = apex
  .controller("/org")
  // we can define a middleware on the controller level that will be applied to all routes on the controller
  .use(({ ctx, input, meta, next }) => {
    // context, input, and meta objects are available on middlewares. the context can be modified. the meta object and input are read-only
    // we continue to the next middleware or route by calling next with our modified context
    return next({
      ctx: {
        ...ctx,
        newContextKey: "somthing from the middleware goes here",
      },
    });
  })
  .routes((ops) => ({
    getOrg: ops
      .get("/:id")
      // Routes can use middlewares as well
      .use(({ ctx, next }) => {
        return next({ ctx });
      })
      .output(Type.Object({ name: Type.String() }))
      .handle(({ ctx, params }) => {
        return {
          name: "My Org",
        };
      }),
  }));

// Reusable middlewares can be defined using the middleware function on the apex object. You can build middleware pipelines using the "pipe" function on the apex object.
// middlewares can also throw to halt execution of the route/ controller and return an error to the client
const authMiddleware = apex.middleware(({ ctx, next }) => {
  if (!ctx.authToken) {
    throw new ApexError(
      "UNAUTHORIZED",
      "You must be logged in to access this",
      "NO_AUTH",
    );
  }
  return next({
    ctx: {
      ...ctx,
      isAuthed: true,
    },
  });
});
