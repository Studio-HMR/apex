export interface BaseDef<IsHandler extends boolean, Context, Meta, Input> {
  handler: IsHandler;

  name?: string;
  description?: string;

  context: Context;
  meta: Meta;
  input: Input;
}
