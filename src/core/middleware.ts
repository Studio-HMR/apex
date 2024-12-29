import { ApexError, ErrorCode } from "../error/codes";
import { apexSym } from "../utils/symbol";
import { Overwrite } from "../utils/types";
import { BaseDef } from "./def";

/**
 * Used for handling security schemas. Should always be the first middleware(s) in the chain.
 */
export const SecurityMiddleware = Symbol(apexSym("security"));
export type SecurityMiddlewareType = typeof SecurityMiddleware;

/**
 * Used for handling layers. Layers are used to group middlewares together.
 */
export const LayerMiddleware = Symbol(apexSym("layer"));
export type LayerMiddlewareType = typeof LayerMiddleware;

/**
 * Used for handling input/ output parsers. Parsers are used to parse the request body and outgoing response body. These will be Typebox Schemas.
 */
export const ParserMiddleware = Symbol(apexSym("parser"));
export type ParserMiddlewareType = typeof ParserMiddleware;

/**
 * Used for handling error handlers. Error handlers are used to handle errors and return a response.
 */
export const ErrorHandlerMiddleware = Symbol(apexSym("error"));
export type ErrorHandlerMiddlewareType = typeof ErrorHandlerMiddleware;

/**
 * Used for handling serializers. Serializers are used to serialize the response body and return it to the client. This is for `superjson` use, etc.
 */
export const SerializerMiddleware = Symbol(apexSym("serializer"));
export type SerializerMiddlewareType = typeof SerializerMiddleware;

type MiddlewareType =
  | SecurityMiddlewareType
  | LayerMiddlewareType
  | ParserMiddlewareType
  | ErrorHandlerMiddlewareType
  | SerializerMiddlewareType;

type MiddlewareOkResult = {
  ok: true;
  error: never;
};

type MiddlewareErrorResult = {
  ok: false;
  error: ApexError<ErrorCode>;
};

type MiddlewareResult = MiddlewareOkResult | MiddlewareErrorResult;

interface MiddlewareDef<Type extends MiddlewareType, Context, Meta, Input>
  extends BaseDef<false, Context, Meta, Input> {
  handler: false;

  type: Type;
  input: Input;
}

/**
 * Middleware definition.
 *
 * @typeParam Context - The context type.
 * @typeParam Meta - The meta type.
 * @property {string?} name - The name of the middleware. Used for debugging purposes only.
 * @property {string?} description - The description of the middleware. Used for debugging purposes only.
 * @property {Symbol} type - The type of the middleware (Symbol).
 */
export type Middleware<
  Type extends MiddlewareType,
  Context,
  ContextOut,
  Meta,
  MetaOut,
  Input,
  InputOut,
  Output,
  OutputOut,
> = {
  _def: MiddlewareDef<Type, Context, Meta, Input>;
  (
    _in: {
      ctx: Context;
      meta: Meta;
      input: Input;
      output: Output;
    },
    next: (_out: {
      ctx?: ContextOut;
      meta?: MetaOut;
      input?: InputOut;
      output?: OutputOut;
    }) => MiddlewareResult,
  ): void;
};
