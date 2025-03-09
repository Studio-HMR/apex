export type HTTPAll = "ALL";

export const httpGET = "GET";
export const httpPOST = "POST";
export const httpPUT = "PUT";
export const httpDELETE = "DELETE";
export const httpTypes = [httpGET, httpPOST, httpPUT, httpDELETE] as const;

/**
 * @public
 */
export type HTTPMethod = (typeof httpTypes)[number];
/**
 * @public
 */
export type HTTPGet = typeof httpGET;
/**
 * @public
 */
export type HTTPPost = typeof httpPOST;
/**
 * @public
 */
export type HTTPPut = typeof httpPUT;
/**
 * @public
 */
export type HTTPDelete = typeof httpDELETE;

/**
 * @internal
 * @param Method - The HTTP method to switch on.
 * @param CaseGet - The case for the `GET` method.
 * @param CasePost - The case for the `POST` method.
 * @param CasePut - The case for the `PUT` method.
 * @param CaseDelete - The case for the `DELETE` method.
 * @param CaseAny - The case for not matching any of the above. Defaults to `never`.
 */
export type SwitchHTTPMethod<
  Method extends HTTPMethod,
  CaseGet,
  CasePost,
  CasePut,
  CaseDelete,
  CaseAny = never,
> = Method extends HTTPGet
  ? CaseGet
  : Method extends HTTPPost
    ? CasePost
    : Method extends HTTPPut
      ? CasePut
      : Method extends HTTPDelete
        ? CaseDelete
        : CaseAny;
