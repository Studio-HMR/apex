const ERROR_SYMBOL = Symbol("error");
export type ErrorSymbol = typeof ERROR_SYMBOL;
export type TypeError<Message extends string> = Message & { _: ErrorSymbol };

/** refs
 * @see https://plaid.com/docs/errors
 * @see https://docs.stripe.com/api/errors
 */

const RESPONSE_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 203,
  FROM_CACHE: 303,
} as const;
const ERROR_TYPES = {
  INVALID_REQUEST: {
    defaultReason: "...",
    defaultDisplayMessage: "...",
  },
  INVALID_RESULT: {
    defaultReason: "...",
    defaultDisplayMessage: "...",
  },
  INVALID_INPUT: {
    defaultReason: "...",
    defaultDisplayMessage: "...",
  },
  RATE_LIMIT_EXCEEDED: {
    defaultReason: "...",
    defaultDisplayMessage: "...",
  },
  API_ERROR: {
    defaultReason: "...",
    defaultDisplayMessage: "...",
  },
} as const;

type ResponseStatusCode = keyof typeof RESPONSE_STATUS_CODES;
type ErrorType = keyof typeof ERROR_TYPES;
type HTTPStatus = number;

type BaseErrorCause =
  | "input-validation"
  | "output-validation"
  | "controller-error"; // misc. error

interface ApiErrorCause<
  ErrorCause extends BaseErrorCause,
  ErrorCode extends string,
> {
  cause: ErrorCause;
  code: ErrorCode; // specifc to the API being called
  reason: string; // localized short description (developer-friendly)
  displayMessage: string; // long description (user-friendly)
  path: ErrorCause extends `${"input" | "output"}-validation` ? string : never; // path to the field/ attrib. that caused the error
  stackTrace: string | null; // stringified stack trace (for debugging)
  external: boolean;
}

type ApiRequestHeaders = {
  authorization?: `Bearer ${string}`;
  "x-api-key"?: string;
  "x-timestamp": string & { __encodedAs: Date }; // iso string
  "x-request-id": string;
  "tx-mock-response-id": string; // for testing; to override the response with the example id
};

type ApiResponseHeader = {
  "x-request-id": string;
  "x-timing": string & { __encodedAs: number }; // time it took for API to return this call in ms
  "x-timestamp": string & { __encodedAs: Date }; // iso string
};

type ApiResponse<
  ResponseData,
  ResponseMeta,
  ErrorCodes extends string[] = never,
  ErrorCauses extends Array<BaseErrorCause> = [],
> = {
  status: ResponseStatusCode; // like a TRPC error code, but incl. success codes + misc. codes
  httpStatus: HTTPStatus;
} & ErrorCodes extends never
  ? {
      data: ResponseData;
      meta: ResponseMeta;
    }
  : {
      type: ErrorType; // broad categorization of the error
      code: ErrorCodes[0]; // specific error code (specific to the API being called)
      reason: string; // localized short description of what error happened (developer-friendly)
      displayMessage: string; // long/ localized description of what error happened. can be used for display on a client app (user-friendly)
      stackTrace: string | null; // stringified stack trace (for debugging, really only apparent when API blows up and we don't know the reason why)
      external: boolean; // whether this error was caused by some interaction with an external source (e.g. another API or some side effect)
      causes: [
        // ensures that there is at least 1 item in the cause array and it matches the error code of the parent level error
        ApiErrorCause<ErrorCauses[0], ErrorCodes[0]>,
        ...ApiErrorCause<ErrorCauses[number], ErrorCodes[number]>[],
      ]; // array of errors containing a breakdown of what went wrong (always has ≥ 1 entry)
    };

function getUser() {
  try {
    const db: any = {};

    db.user.createOne({ data: {} });
  } catch (e) {
    // localized tenant-based description of the error at hand, falling back to our own default language
    return generateError({
      error: e,
      code: "",
      tenant: "",
      reason: "",
      displayMessage: "",
    });
  }
}

type Tenant = "frontier" | "freeman";
type AllErrorCodes = "asdf" | "fdfds";
const TENANT_ERROR_MESSAGES: {
  [K in Tenant]?: {
    [Code in AllErrorCodes]?: {
      reason: string;
      displayMessage: string;
    };
  };
} = {
  frontier: {
    asdf: {
      reason: "",
      displayMessage: "",
    },
    fdfds: {
      reason: "",
      displayMessage: "",
    },
  },
};

function generateError(input: {
  error: unknown;
  code: string;
  tenant?: string;
  reason: string;
  displayMessage: string;
}) {
  if (input.tenant) {
    const tenantError = lookupTenantErrorByCode(
      input.tenant,
      input.code,
      input.reason,
      input.displayMessage,
    );
    return tenantError;
  }

  return input;
}

function lookupTenantErrorByCode(
  tenant: string,
  code: string,
  reason: string,
  displayMessage: string,
) {
  throw new Error("Function not implemented.");
}

const f: ApiResponse<
  {},
  {},
  ["asdf", "fdfds"],
  ["input-validation", "output-validation"]
> = {
  type: "INVALID_REQUEST",
  code: "asdf",
  causes: [
    {
      cause: "input-validation",
      code: "asdf",
      reason: "",
      stackTrace: null,
      displayMessage: "",
      path: "",
      external: false,
    },
    {
      cause: "output-validation",
      code: "fdfds",
      reason: "",
      stackTrace: null,
      displayMessage: "",
      path: "",
      external: false,
    },
  ],
  reason: "",
  displayMessage: "",
  stackTrace: null,
  external: false,
};

export type ISODateString =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;
export type JSONDate = ISODateString | Date;
