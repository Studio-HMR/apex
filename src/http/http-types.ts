export type HTTPAll = "ALL";

export const httpTypes = ["GET", "POST", "PUT", "DELETE"] as const;

/**
 * @public
 */
export type HTTPMethod = (typeof httpTypes)[number];

export type HTTPGet = (typeof httpTypes)[0];
export type HTTPPost = (typeof httpTypes)[1];
export type HTTPPut = (typeof httpTypes)[2];
export type HTTPDelete = (typeof httpTypes)[3];

/**
 * @internal
 */
export type SwitchHTTPMethod<
  /**
   * The HTTP method to switch on.
   */
  Method extends HTTPMethod,
  /**
   * The case for the GET method.
   */
  CaseGet,
  /**
   * The case for the POST method.
   */
  CasePost,
  /**
   * The case for the PUT method.
   */
  CasePut,
  /**
   * The case for the DELETE method.
   */
  CaseDelete,
> = Method extends HTTPGet
  ? CaseGet
  : Method extends HTTPPost
    ? CasePost
    : Method extends HTTPPut
      ? CasePut
      : Method extends HTTPDelete
        ? CaseDelete
        : never;
