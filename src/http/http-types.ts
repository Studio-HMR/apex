export type HTTPGet = "GET";
export type HTTPPost = "POST";
export type HTTPPut = "PUT";
export type HTTPDelete = "DELETE";
export type HTTPAll = "ALL";

export type HTTPMethod = HTTPGet | HTTPPost | HTTPPut | HTTPDelete;

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
