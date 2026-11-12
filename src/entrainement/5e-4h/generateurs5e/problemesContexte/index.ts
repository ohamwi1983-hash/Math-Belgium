/**
 * Couche A (5e) — point d'entrée de 5gen5 : tirage UNIFORME parmi les 3 scénarios fixes A/B/C
 * (jamais une famille paramétrée abstraite unique — voir CLAUDE.md, section 5gen5).
 */
import type { ExerciceProblemeContexte, FormeChiffreAffairesC, FormeCoutVariableC, ModeleCoutUnitaire } from "../../core5e/problemesContexte.types";
import { construireScenarioAConteneur, construireScenarioAStockCommande, genererExerciceScenarioA } from "./scenarioA";
import { construireScenarioBAvecModele, genererExerciceScenarioB } from "./scenarioB";
import { construireScenarioCAvecFormes, genererExerciceScenarioC } from "./scenarioC";

export { genererExerciceScenarioA } from "./scenarioA";
export { genererExerciceScenarioB } from "./scenarioB";
export { genererExerciceScenarioC } from "./scenarioC";

const GENERATEURS = [genererExerciceScenarioA, genererExerciceScenarioB, genererExerciceScenarioC];

export function genererExerciceProblemeContexte(): ExerciceProblemeContexte {
  const generateur = GENERATEURS[Math.floor(Math.random() * GENERATEURS.length)];
  return generateur();
}

// ============================================================================
// Catalogue des variantes forçables — PARTAGÉ par le sélecteur de l'appli (`App5gen5.tsx`), son
// `?code=` et l'adaptateur papier (`exportEvaluation.ts`) : le même ordre partout, sinon le QR code
// d'une feuille rouvrirait une autre variante.
// ============================================================================

const LABEL_FORME_CV: Record<FormeCoutVariableC, string> = { racineCarree: "CV=k√x", racineCubique: "CV=k∛x", carre: "CV=kx²", cube: "CV=kx³" };
const LABEL_FORME_CA: Record<FormeChiffreAffairesC, string> = { affine: "CA=px", racineCarree: "CA=p√x", racineCubique: "CA=p∛x" };
export const FORMES_CV_C: FormeCoutVariableC[] = ["racineCarree", "racineCubique", "carre", "cube"];
export const FORMES_CA_C: FormeChiffreAffairesC[] = ["affine", "racineCarree", "racineCubique"];
const MODELES_B: ModeleCoutUnitaire[] = ["B1", "B2", "B3", "B4", "B5"];
const LABEL_MODELE_B: Record<ModeleCoutUnitaire, string> = {
  B1: "B1 — coût unitaire cu(x)=a+b/x",
  B2: "B2 — coût unitaire cu(x)=a+bx",
  B3: "B3 — coût unitaire cu(x)=a+b/x²",
  B4: "B4 — coût unitaire cu(x)=a/x+b/x²",
  B5: "B5 — coût unitaire cu(x)=ax+b/x",
};

export const CATALOGUE_PROBLEMES_CONTEXTE: { id: string; label: string }[] = [
  { id: "A1", label: "A1 — bidons cylindriques (k/x vs ax²)" },
  { id: "A2", label: "A2 — stock/commande (ax+b vs k/x)" },
  ...MODELES_B.map((m) => ({ id: m, label: LABEL_MODELE_B[m] })),
  ...FORMES_CV_C.flatMap((cv) => FORMES_CA_C.map((ca) => ({ id: `C-${cv}-${ca}`, label: `C — ${LABEL_FORME_CV[cv]} / ${LABEL_FORME_CA[ca]}` }))),
];

export function construireProblemeContexteAvecVariante(id: string): ExerciceProblemeContexte {
  if (id === "A1") return construireScenarioAConteneur();
  if (id === "A2") return construireScenarioAStockCommande();
  if ((MODELES_B as string[]).includes(id)) return construireScenarioBAvecModele(id as ModeleCoutUnitaire);
  const [, cv, ca] = id.split("-");
  if ((FORMES_CV_C as string[]).includes(cv) && (FORMES_CA_C as string[]).includes(ca)) return construireScenarioCAvecFormes(cv as FormeCoutVariableC, ca as FormeChiffreAffairesC);
  throw new Error(`construireProblemeContexteAvecVariante : variante inconnue « ${id} »`);
}
