import { TSchema, Type } from "@sinclair/typebox";

import { ApexError, ErrorCode } from "../error/codes";
import { apexSym } from "../utils/symbol";
import { Overwrite, Rewrite } from "../utils/types";
import { ValidPath } from "./http-path";
import { HTTPMethod } from "./http-types";

/**
 * Used for handling security schemas (as in the `securityScheme` OpenAPI concept). Should always be the first middleware(s) in the chain if present.
 */
export const SecurityMiddleware = Symbol(apexSym("security"));
export type SecurityMiddlewareType = typeof SecurityMiddleware;

/**
 * Used for handling layers. Layers are used to group middlewares together.
 */
export const LayerMiddleware = Symbol(apexSym("layer"));
export type LayerMiddlewareType = typeof LayerMiddleware;

/**
 * Used for handling input/ output parsers. Parsers are used to parse and validate the request body and outgoing response body. These will be Typebox Schemas for now, zod/ yup/ joi/ ark/ valibot (etc) support will be added later.
 */
export const ParserMiddleware = Symbol(apexSym("parser"));
export type ParserMiddlewareType = typeof ParserMiddleware;

/**
 * Used for handling serializers. Serializers are used to serialize the response body and return it to the client. This is for `superjson` use, etc.
 */
export const SerializerMiddleware = Symbol(apexSym("serializer"));
export type SerializerMiddlewareType = typeof SerializerMiddleware;

/**
 * Used for handling errors in the apex call stack. These will always be passed to a final error collection middleware at the end of the apex call stack.
 */
export const ErrorHandlerMiddleware = Symbol(apexSym("error"));
export type ErrorHandlerMiddlewareType = typeof ErrorHandlerMiddleware;

/**
 * Used for handling routes. Routes are used to handle requests. This will always be the 3rd or 4th to last middleware in the chain, followed by the output validator, output serializer (if present, e.g. superjson) and then the final error collection middleware.
 */
export const RouteMiddleware = Symbol(apexSym("route"));
export type RouteMiddlewareType = typeof RouteMiddleware;

type MiddlewareType =
  | SecurityMiddlewareType
  | LayerMiddlewareType
  | ParserMiddlewareType
  | SerializerMiddlewareType
  | ErrorHandlerMiddlewareType
  | RouteMiddlewareType;

export const MiddlewareMarker = "middleware" as "middleware" & {
  __brand: "middleware";
};
interface MiddlewareResultBase {
  readonly marker: typeof MiddlewareMarker;
}

interface MiddlewareOkResult<$NewContext> extends MiddlewareResultBase {
  ok: true;
  routeHandled: boolean;
  data: unknown;
}

interface MiddlewareErrorResult<$NewContext> extends MiddlewareResultBase {
  ok: false;
  routeHandled: boolean;
  error: ApexError<ErrorCode>;
}

type MiddlewareResult<NewContext> =
  | MiddlewareOkResult<NewContext>
  | MiddlewareErrorResult<NewContext>;

export interface MiddlewareBuilder<$Context, $Meta, $IncomingContext, $Input> {
  pipe<NewContext>(
    fn:
      | Middleware<$Context, $Meta, $IncomingContext, NewContext, $Input>
      | MiddlewareBuilder<
          Overwrite<$Context, $IncomingContext>,
          $Meta,
          $IncomingContext,
          $Input
        >,
  ): MiddlewareBuilder<
    Overwrite<$Context, $IncomingContext>,
    $Meta,
    $IncomingContext,
    $Input
  >;
  _middlewares: Middleware<$Context, $Meta, $IncomingContext, object, $Input>[];
}

export type Middleware<$Context, $Meta, $IncomingContext, $NewContext, Input> =
  {
    (opts: {
      ctx: Rewrite<$Context, $IncomingContext>;
      method: HTTPMethod;
      path: ValidPath;
      input: Input;
      meta: $Meta | undefined;
      signal: AbortSignal | undefined;
      next: {
        (): MiddlewareResult<$IncomingContext>;
        <NewContext>(opts: {
          ctx?: NewContext;
          input?: unknown;
        }): Promise<MiddlewareResult<NewContext>>;
      };
    }): Promise<MiddlewareResult<$NewContext>>;
    _type?: MiddlewareType;
  };

export type AnyMiddleware = Middleware<any, any, any, any, any>;
export type AnyMiddlewareBuilder = MiddlewareBuilder<any, any, any, any>;

export function createMiddlewareFactory<$Context, $Meta, $Input = unknown>() {
  function createMiddlewareInner(
    middlewares: AnyMiddleware[],
  ): AnyMiddlewareBuilder {
    return {
      _middlewares: middlewares,
      pipe(builderOrFn) {
        const piped =
          "_middlewares" in builderOrFn
            ? builderOrFn._middlewares
            : [builderOrFn];

        return createMiddlewareInner([...middlewares, ...piped]);
      },
    };
  }

  function createMiddleware<$IncomingContext>(
    fn: Middleware<$Context, $Meta, object, $IncomingContext, $Input>,
  ): MiddlewareBuilder<$Context, $Meta, $IncomingContext, $Input> {
    return createMiddlewareInner([fn]);
  }

  return createMiddleware;
}

export function createInputMiddleware<$Input>(parsers: $Input) {
  const inputMiddleware: AnyMiddleware =
    async function inputParseValidateMiddleware(opts) {
      return opts.next();
    };
  inputMiddleware._type = ParserMiddleware;
}
