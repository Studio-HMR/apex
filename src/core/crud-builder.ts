export interface CrudBuilderDef {}
export interface CrudBuilder {
  use: () => unknown;
  GET: () => unknown;
  POST: () => unknown;
  PUT: () => unknown;
  DELETE: () => unknown;
  PATCH: () => unknown;
  _def: CrudBuilderDef;
}

export function createCrudBuilder() {}

export function createNewCrudBuilder() {}
