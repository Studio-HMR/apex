import type { Static, TSchema } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";
import type { Request, Response } from "express";
import express from "express";

import { HTTPMethod, SwitchHTTPMethod } from "./core/http-types";

type CreateCtxArgs = {
  req: Request;
  res: Response;
};

type CreateCtxFn<Ctx> = (args: CreateCtxArgs) => MaybePromise<Ctx>;

type MaybePromise<T> = T | Promise<T>;

type SecurityScheme = {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: {
    implicit?: {
      authorizationUrl: string;
      refreshUrl?: string;
      scopes: Record<string, string>;
    };
    password?: {
      tokenUrl: string;
      refreshUrl?: string;
      scopes: Record<string, string>;
    };
    clientCredentials?: {
      tokenUrl: string;
      refreshUrl?: string;
      scopes: Record<string, string>;
    };
    authorizationCode?: {
      authorizationUrl: string;
      tokenUrl: string;
      refreshUrl?: string;
      scopes: Record<string, string>;
    };
  };
  openIdConnectUrl?: string;
};

type AppParams<SchemeNames extends string> = {
  expressAppSettings: Record<string, unknown>;
  securitySchemes: Record<SchemeNames, SecurityScheme>;
  basePath: string;
  port: number;
};

const DEFAULT_PARAMS: AppParams<string> = {
  expressAppSettings: {},
  securitySchemes: {},
  basePath: "/",
  port: 3000,
};

const buildMethodDefs = <InCtx>() => {};

class ApexBuilder<
  Params extends AppParams<Schemes>,
  Schemes extends string = string,
  InCtx extends object = {},
> {
  createContext: CreateCtxFn<InCtx>;
  params: Params;

  constructor(params?: Params, createContextFn?: CreateCtxFn<InCtx>) {
    this.createContext = createContextFn || (() => ({}) as InCtx);
    this.params = params ?? (DEFAULT_PARAMS as Params);
  }

  appParams<NewParams extends AppParams<NewSchemes>, NewSchemes extends string>(
    params: NewParams,
  ) {
    return new ApexBuilder<NewParams, NewSchemes, InCtx>(
      params,
      this.createContext,
    );
  }

  context<NewCtx extends object>(createContextFn: CreateCtxFn<NewCtx>) {
    return new ApexBuilder<Params, Schemes, NewCtx>(
      this.params,
      createContextFn,
    );
  }

  create() {
    const app = express();

    for (const [key, value] of Object.entries(this.params.expressAppSettings)) {
      app.set(key, value);
    }

    return {
      _expressApp: app,
      get: (path: string, handler: (ctx: InCtx) => unknown) => {
        app.get(path, async (req, res) => {
          const ctx = await this.createContext({ req, res });
          const result = await handler(ctx);
          res.json(result);
        });
      },
      listen: () => {
        app.listen(this.params.port);
      },
    };
  }
}

// const apexInit = new ApexBuilder();

// const apex = apexInit
//   .context(({ req, res }) => {
//     return {
//       ip: req.ip,
//     };
//   })
//   .create();

// apex.get("/", (ctx) => {
//   return ctx.ip;
// });

// (async () => {
//   apex.listen();
//   const res = await fetch("http://localhost:3000/");
//   const json = await res.json();
//   console.log(json);
// })();
