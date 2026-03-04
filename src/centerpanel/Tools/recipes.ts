


import type { SelectionSnapshot } from "./audit";

export type RecipeId = "consult/pdf/v1";


export type BaseManifest = Record<string, unknown>;

export interface RenderResult {
  html: string;
  filenameBase: string;
}

export interface Recipe<M extends BaseManifest = BaseManifest> {
  id: RecipeId;
  render: (manifest: M) => RenderResult;
}


export type ConsultPdfManifest = {
  version: "v1";
  scopeKind: "encounter" | "patient" | "cohort";
  scopeLabel: string;
  policyPreset: "none" | "limited" | "safe";
  selection: SelectionSnapshot;
  bodyHtml: string;
};


const registry = new Map<RecipeId, Recipe<any>>();

export function registerRecipe<M extends BaseManifest = BaseManifest>(id: RecipeId, r: Recipe<M>): void {
  registry.set(id, r as unknown as Recipe<any>);
}

export function getRecipe<M extends BaseManifest = BaseManifest>(id: RecipeId): Recipe<M> | undefined {
  return registry.get(id) as unknown as Recipe<M> | undefined;
}


import { consultPdfV1 } from "./exportRecipes/consult";
registerRecipe("consult/pdf/v1", consultPdfV1);
