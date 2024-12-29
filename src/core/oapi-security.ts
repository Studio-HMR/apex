type SecuritySchemeType = "apiKey" | "http" | "oauth2" | "openIdConnect";

type SupportedSecuritySchemeType = Exclude<SecuritySchemeType, "openIdConnect">;

interface OAuthFlowObject {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: Record<string, any>;
}
interface OAuthFlowsObject {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}

interface ApiKeySecurityScheme {
  type: "apiKey";
  name: string;
  in: string;
  description?: string;
}

interface HttpSecurityScheme {
  type: "http";
  scheme: string;
  bearerFormat?: string;
  description?: string;
}

interface OAuth2SecurityScheme {
  type: "oauth2";
  description?: string;
  flows: OAuthFlowsObject;
}

export interface SecuritySchemeObject {
  type: SupportedSecuritySchemeType;
  description?: string;
  name?: string;
  in?: string;
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
}

export type SecurityScheme =
  | ApiKeySecurityScheme
  | HttpSecurityScheme
  | OAuth2SecurityScheme;
