import type { NextFunction, Request, Response } from "ultimate-express";
import express, { Router } from "ultimate-express";

import type { AnyController, AnyRouteDef } from "./controller-builder";

export type ApexStartOpts = {
  expressSettings: Record<string, unknown>;
};

export const startServer = async <Context>(
  controllerDef: AnyController,
  port: number,
  opts: ApexStartOpts,
  getCtx: (req: any, res: any) => Context,
) => {
  const app = express();
  app.set("trust proxy", true);
  app.set("case sensitive routing", true);
  app.set("strict routing", true);
  app.set("x-powered-by", false);

  const fixedExpressAppSettings = {
    "case sensitive routing": true,
    "strict routing": true,
    "x-powered-by": false,
  };

  for (const [key, value] of Object.entries({
    ...opts.expressSettings,
    ...fixedExpressAppSettings,
  })) {
    app.set(key, value);
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(async (req, res, next) => {
    res.setHeader("x-powered-by", "ap-express");
    res.locals.ctx = await getCtx(req, res);
    next();
  });

  app.listen(port, () => {});
  const controller = await createControllerRoutes(controllerDef);
  app.use(controllerDef._def.path as string, controller);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  });

  return {
    app,
  };
};

const createControllerRoutes = async (
  controllerDef: AnyController,
): Promise<Router> => {
  const router = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
  });

  const routes = controllerDef._def.routes;
  for (const [key, _def] of Object.entries(routes)) {
    const def = _def as AnyRouteDef;
    if ("controller" in def) {
      const path = def._def.path as string;
      const controller = await createControllerRoutes(def);
      router.use(path, def._def.middlewares, controller);
    } else if ("handler" in def) {
      const route = await createControllerRoute(def);
      router.use(def._def.path as string, route as unknown as () => void);
    }
  }

  return router;
};

const createControllerRoute = async (routeDef: AnyRouteDef) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = res.locals.ctx;
    const middlewares = routeDef._def.middlewares;
    const handler = routeDef._def.handler;

    if (middlewares) {
      await wrapMiddleware(middlewares)(req, res, next);
    }

    try {
      const result = await handler({
        ctx,
        input: req.body,
        // signal: req.signal,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
};

const wrapMiddleware = (middlewares: Function[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (const middleware of middlewares) {
      await middleware(req, res, next);
    }
    next();
  };
};
