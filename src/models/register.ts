import { isDeepStrictEqual } from "node:util";
import type { TObject, TSchema } from "@sinclair/typebox";
import type { TypeCheck } from "@sinclair/typebox/compiler";
import { TypeCompiler } from "@sinclair/typebox/compiler";

interface ModelDef<Model extends TSchema> {
  id: string;
  compiledModel: TypeCheck<Model>;
  model: Model;
}

export const areModelsEqual = (
  defA: ModelDef<TSchema>,
  defB: ModelDef<TSchema>,
): defA is typeof defB => {
  if (defA === defB) return true;
  else if (defA.model.$id === defB.model.$id) return true;
  else if (
    defA.model.title === defB.model.title &&
    isDeepStrictEqual(defA.model.params, defB.model.params)
  )
    return true;
  else if (isDeepStrictEqual(defA.model, defB.model)) return true;

  return false;
};

// TODO: this really does not need to be this complex. probably
const collapseModelProperties = (model: TObject): string => {
  return `{${Object.entries(model.properties)
    .map(([key, value]) => {
      if ("properties" in value) {
        return `{${key}:${collapseModelProperties(value as TObject)}}`;
      }
      return `{${key}:${value.type}}`;
    })
    .join(",")}}`;
};

// TODO: because... is this even faster than JSON.stringify...
const createModelId = (model: TSchema) => {
  if ("properties" in model) {
    return collapseModelProperties(model as TObject);
  }

  return JSON.stringify(model);
};

export const registerModel = <
  $NewModel extends TSchema,
  Models extends TSchema,
>(
  newModel: $NewModel,
  modelDefs: Record<string, ModelDef<Models>>,
): Record<string, ModelDef<Models | $NewModel>> => {
  const modelDef = {
    id:
      newModel.$id ??
      newModel.$schema ??
      newModel.title ??
      createModelId(newModel),
    compiledModel: TypeCompiler.Compile(newModel),
    model: newModel,
  };

  const exists = modelDef.id in modelDefs;
  if (exists) {
    return modelDefs;
  }

  return {
    ...modelDefs,
    [modelDef.id]: modelDef,
  };
};
