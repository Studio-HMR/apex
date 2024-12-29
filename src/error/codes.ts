import { apexSym } from "../utils/symbol";

export const ERROR_SYM = Symbol(apexSym("ERROR_SYM"));

export const ERROR_CODES = {
  // 400
  BAD_REQUEST: 400,
  // 401
  UNAUTHORIZED: 401,
  // 403
  FORBIDDEN: 403,
  // 404
  NOT_FOUND: 404,
  // 405
  METHOD_NOT_ALLOWED: 405,
  // 406
  NOT_ACCEPTABLE: 406,
  // 409
  CONFLICT: 409,
  // 415
  UNSUPPORTED_MEDIA_TYPE: 415,
  // 418
  IM_A_TEAPOT: 418,
  // 422
  UNPROCESSABLE_ENTITY: 422,
  // 429
  TOO_MANY_REQUESTS: 429,
  // 451
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  // 500
  INTERNAL_SERVER_ERROR: 500,
  // 501
  NOT_IMPLEMENTED: 501,
  // 502
  BAD_GATEWAY: 502,
  // 503
  SERVICE_UNAVAILABLE: 503,
  // 504
  GATEWAY_TIMEOUT: 504,
  // 505
  HTTP_VERSION_NOT_SUPPORTED: 505,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export interface ServerError<Code extends ErrorCode> extends Error {
  [ERROR_SYM]: true;
  code: Code;
  status: (typeof ERROR_CODES)[Code];
  message: string;
  localizedDescription: string;
  data?: unknown;
}

export class ApexError<Code extends ErrorCode>
  extends Error
  implements ServerError<Code>
{
  [ERROR_SYM] = true as const;
  code: Code;
  status: (typeof ERROR_CODES)[Code];
  localizedDescription: string;
  data?: unknown;

  constructor(
    code: Code,
    message: string,
    localizedDescription: string,
    data?: unknown,
  ) {
    super(message);
    this.code = code;
    this.status = ERROR_CODES[code];
    this.localizedDescription = localizedDescription;
    this.data = data;
  }
}

export const isServerError = (
  error: unknown,
): error is ServerError<ErrorCode> =>
  error instanceof ApexError && ERROR_SYM in error && error[ERROR_SYM] === true;
