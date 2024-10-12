import { CreateContextCallback, TRPCBuilder, initTRPC } from "@trpc/server";
import "@trpc/server";
import type { Http2ServerRequest, Http2ServerResponse } from "node:http2";
import { createServer } from "node:http2";
import { z } from "zod";

type PathSeparator = "/";
type QuerySeparator = "?";
type QueryParamSeparator = "&";
type PathParamSeparator = ":";
type BasePath = `${PathSeparator}${string}`;
type PathParam = `${PathSeparator}${PathParamSeparator}${string}`;
type PathParts<T extends string> =
  T extends `${infer Head}${PathSeparator}${infer Tail}`
    ? [Head, ...PathParts<Tail>]
    : [T];

type PathObj<T extends string> = {
  path: T;
};

const f = "/asdf/fds/fdsasdf";
type P = PathParts<typeof f>;

type FirstQueryParam = `?${string}`;
type RestQueryParam = `&${string}`;
type QueryParam = FirstQueryParam | RestQueryParam;

type Path = `${BasePath}` | `${BasePath}${PathParam}`;

interface CreateCtxParams {
  req: Http2ServerRequest;
  res: Http2ServerResponse;
}
type MaybePromise<T> = T | Promise<T>;
type CreateCtxFn<Ctx extends object> = (
  params: CreateCtxParams,
) => MaybePromise<Ctx>;

interface ApexInit<CtxInit extends object> {
  createCtx: CreateCtxFn<CtxInit>;
}

type InitTrpc<CtxInit extends object> = ReturnType<
  ReturnType<typeof initTRPC.context<CtxInit>>["create"]
>;

const createCtx = async ({ req, res }: CreateCtxParams) => {
  return {
    host: "",
  };
};

class Apex<CtxInit extends object, Routes extends any> {
  private createCtx: CreateCtxFn<CtxInit>;
  private t: InitTrpc<CtxInit>;
  private routes: Map<Path, any> = new Map<Path, any>();
  private middlewares: Map<string, any> = new Map<string, any>();

  constructor(private init: ApexInit<CtxInit>) {
    this.createCtx = init.createCtx;
    this.t = initTRPC.context<typeof createCtx>().meta().create();
    this.t._config.$types.ctx;
  }

  public async start(port: number = 3000, listeningListener?: () => void) {
    const app = createServer(async (req, res) => {
      const ctx = () => this.createCtx({ req, res });
      // if (ctx instanceof Promise) {
      //   ctx = (await ctx) as CtxInit;
      // }

      const callerCreation = this.t.createCallerFactory(
        this.t.router({
          asdf: this.t.router({
            asdf2: this.t.procedure.input(z.string()).query((input) => {
              return null;
            }),
          }),
        }),
      );
      callerCreation(ctx);

      const path = req.url;
      const route = this.routes.get(path as Path);
      if (route) {
        res.writeHead(200);
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    app.listen(port, listeningListener);
  }

  router = async () => {
    this.t.router({});
  };

  route = async () => {};

  middleware = async () => {};
}

const apex = new Apex({
  createCtx: async ({ req, res }) => {
    return {
      host: req.headers["hostname"],
    };
  },
});
