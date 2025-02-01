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

export const SetSym = Symbol(apexSym("SET"));
export type SetMarker = typeof SetSym;
export type IfSet<Value, CaseSet = Value, CaseNotSet = undefined> = Value extends SetMarker ? CaseSet : CaseNotSet;

export const UnsetSym = Symbol(apexSym("UNSET"));
export type UnsetMarker = typeof UnsetSym;
export type IfUnset<Value, CaseUnset = undefined, CaseNotUnset = Value> = Value extends UnsetMarker ? CaseUnset : CaseNotUnset;

// TODO: blow all of this up and remove anywhere it is used
const SYMBOL_MAP = {
  utils: {
    set: "SET",
    unset: "UNSET",
  },
  middleware: {
    layer: "layer",
    parser: "parser",
    security: "security",
    serializer: "serializer",
    error: "error",
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
