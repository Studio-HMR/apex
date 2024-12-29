import {
  ErrorHandlerMiddleware,
  LayerMiddleware,
  ParserMiddleware,
  SecurityMiddleware,
  SerializerMiddleware,
} from "../core/middleware";
import { JsonPaths } from "./types";

const symbolPrefix =
  typeof process.env.SYM_PREFIX === "string" &&
  process.env.SYM_PREFIX.length > 0
    ? process.env.SYM_PREFIX
    : "__apex";

export const apexSym = (symbol: string) => `${symbolPrefix}_${symbol}`;

export const SetMarker = Symbol(apexSym("SET"));
export type IsSet = typeof SetMarker;
export const UnsetMarker = Symbol(apexSym("UNSET"));
export type IsUnset = typeof UnsetMarker;

const SYMBOL_MAP = {
  utils: {
    set: SetMarker,
    unset: UnsetMarker,
  },
  middleware: {
    layer: LayerMiddleware,
    parser: ParserMiddleware,
    security: SecurityMiddleware,
    serializer: SerializerMiddleware,
    error: ErrorHandlerMiddleware,
  },
} as const;

type SymbolMap = typeof SYMBOL_MAP;
type SymbolParent = keyof SymbolMap;
type SymbolKey = {
  [K in SymbolParent]: keyof SymbolMap[K];
}[SymbolParent];
type SymbolChild<T extends SymbolParent> = keyof SymbolMap[T];

type SymbolPath = JsonPaths<SymbolMap>;

export const getApexSym = (symbol: SymbolPath) => {
  const [_parent, _sym] = symbol.split(".") as [
    SymbolParent,
    SymbolChild<SymbolParent>,
  ];

  const parent = SYMBOL_MAP[_parent];
  const sym = parent[_sym] as symbol;

  if (Symbol.for(sym.description ?? "") !== sym) {
    throw new Error(`Symbol not found: ${symbol}`);
  }

  return sym;
};
