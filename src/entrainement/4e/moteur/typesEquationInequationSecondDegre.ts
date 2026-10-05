import type { ExerciceEquationInequationSecondDegre, GenerateurExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Séquence à 4, 6 ou 9 écrans selon `exercice.voieSysteme`/`exercice.base.variante`/
 * `exercice.base.identificationXY` (voir CLAUDE.md "Création — cinquante-septième exercice",
 * restructuration `promptimplementationgen57.md`) : `voieSysteme=false`,
 * `base.variante==="modelisation"` (6 familles sur 8) — `identification` (conditionnelle à
 * `base.identificationXY`) `→ contrainteEtGrandeur → systeme → domaine → poserEquationInequation →
 * resoudre → validation → interpretation` (terminale) — écrans 1-4 RÉUTILISÉS TELS QUELS depuis
 * gen55 (`EtapeIdentificationOptimisation`/`EtapeContrainteEtGrandeurOptimisation`/
 * `EtapeSystemeOptimisation`/`EtapeDomaineOptimisation`, sa nouvelle architecture à 7 écrans — plus
 * l'ancienne architecture isolement/construction, retirée). `voieSysteme=true` (achatGroupe
 * uniquement) — `poserSysteme → eliminerSysteme → systeme → domaine → resoudre → validation →
 * interpretation` (`identification`/`contrainteEtGrandeur`/`poserEquationInequation` tous SAUTÉS :
 * les 2 équations posées aux écrans 0a/0b jouent exactement le rôle de l'écran "contrainteEtGrandeur"
 * de gen55, l'écran "systeme" les résout directement ; substituer dans l'équation d'origine produit
 * directement l'équation finale, sans seuil `k` séparé à poser). Les écrans
 * identification/contrainteEtGrandeur/systeme/domaine réutilisent directement `exercice.base` — voir
 * CLAUDE.md. */
export type PhaseEquationInequationSecondDegre =
  | "poserSysteme"
  | "eliminerSysteme"
  | "identification"
  | "contrainteEtGrandeur"
  | "systeme"
  | "domaine"
  | "poserEquationInequation"
  | "resoudre"
  | "validation"
  | "interpretation";

export interface ResultatExerciceEquationInequationSecondDegre {
  variante: ExerciceEquationInequationSecondDegre["variante"];
  famille: ExerciceEquationInequationSecondDegre["famille"];
  scorePoserSysteme: number | null;
  poserSystemeRevele: boolean;
  niveauAidePoserSysteme: number;
  scoreEliminerSysteme: number | null;
  eliminerSystemeRevele: boolean;
  niveauAideEliminerSysteme: number;
  /** `null` sauf `base.variante==="modelisation" && !voieSysteme && base.identificationXY` défini —
   * jamais renseigné par aucune des 8 familles actuelles (étape 1 de la restructuration), voir
   * `core/optimisation.types.ts::IdentificationXY`. */
  scoreIdentification: number | null;
  identificationRevele: boolean;
  niveauAideIdentification: number;
  /** `null` sauf `base.variante==="modelisation" && !voieSysteme` (écran sauté pour `voieSysteme`,
   * déjà fait via poserSysteme/eliminerSysteme — et pour `fonctionDonnee`, fonction déjà donnée). */
  scoreContrainteEtGrandeur: number | null;
  contrainteEtGrandeurRevele: boolean;
  niveauAideContrainteEtGrandeur: number;
  /** `null` seulement pour `fonctionDonnee` — présent pour `modelisation` ET `voieSysteme` (les 2
   * chemins produisent `base.fonction` via cet écran, voir en-tête de fichier). */
  scoreSysteme: number | null;
  systemeRevele: boolean;
  niveauAideSysteme: number;
  scoreDomaine: number | null;
  domaineRevele: boolean;
  niveauAideDomaine: number;
  scorePoserEquationInequation: number | null;
  poserEquationInequationRevele: boolean;
  niveauAidePoserEquationInequation: number;
  scoreResoudre: number;
  resoudreRevele: boolean;
  niveauAideResoudre: number;
  scoreValidation: number;
  validationRevele: boolean;
  niveauAideValidation: number;
  scoreInterpretation: number;
  interpretationRevele: boolean;
  niveauAideInterpretation: number;
}

export interface EtatSessionEquationInequationSecondDegre {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceEquationInequationSecondDegre;
  indexExercice: number;
  exerciceCourant: ExerciceEquationInequationSecondDegre;
  phase: PhaseEquationInequationSecondDegre;
  etapeCourante: EtatEtapeTentatives;
  niveauAidePoserSysteme: number;
  niveauAideEliminerSysteme: number;
  niveauAideIdentification: number;
  niveauAideContrainteEtGrandeur: number;
  niveauAideSysteme: number;
  niveauAideDomaine: number;
  niveauAidePoserEquationInequation: number;
  niveauAideResoudre: number;
  niveauAideValidation: number;
  niveauAideInterpretation: number;
  scorePoserSystemeExercice: number | null;
  poserSystemeRevele: boolean;
  scoreEliminerSystemeExercice: number | null;
  eliminerSystemeRevele: boolean;
  scoreIdentificationExercice: number | null;
  identificationRevele: boolean;
  scoreContrainteEtGrandeurExercice: number | null;
  contrainteEtGrandeurRevele: boolean;
  scoreSystemeExercice: number | null;
  systemeRevele: boolean;
  scoreDomaineExercice: number | null;
  domaineRevele: boolean;
  scorePoserEquationInequationExercice: number | null;
  poserEquationInequationRevele: boolean;
  scoreResoudreExercice: number | null;
  resoudreRevele: boolean;
  scoreValidationExercice: number | null;
  validationRevele: boolean;
  resultats: ResultatExerciceEquationInequationSecondDegre[];
  terminee: boolean;
}
