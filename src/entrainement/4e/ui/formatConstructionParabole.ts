/**
 * Couche présentation — "Construction graphique de la parabole" (`src/generateurs/constructionParabole/`,
 * `src/moteur/sessionConstructionParabole.ts`). Aucun champ de saisie libre nulle part dans ce
 * générateur (uniquement des gestes de glisser-déposer et de clic) : pas de placeholder, pas de
 * statut à 3 valeurs, pas de fragment LaTeX adaptatif — voir `moteur/verificationConstructionParabole.ts`.
 */
import { rMinimal } from "../moteur/verificationConstructionParabole";
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";

export const CONSIGNE_CONSTRUCTION =
  "Choisis un rayon au compas, puis construis la droite parallèle à la directrice, à cette même distance, du côté du foyer.";

export const TEXTE_AIDE_CONSTRUCTION_NIVEAU1 =
  "Le compas est toujours centré en F : choisis un rayon r crantable, strictement supérieur à la moitié de la distance entre F et la directrice. L'équerre construit ensuite une droite parallèle à la directrice, à cette même distance r, du côté de F.";

export const TEXTE_AIDE_CONSTRUCTION_NIVEAU2 = "Un cercle correctement construit est affiché en exemple — reste à placer la droite parallèle au bon endroit.";

/** Message d'ERREUR affiché EN DIRECT (avant même toute tentative de validation) dès que le rayon
 * choisi ne respecte pas la contrainte géométrique stricte — jamais une erreur silencieuse ni un
 * plantage (`promptgen53remplacement.md` : "le signaler explicitement comme geste invalide"). Ne
 * couvre PLUS le cas "rayon déjà utilisé" (voir `messageRayonDejaUtilise` ci-dessous, informatif —
 * `promptgen53corrections.md`, A.4 : cette réutilisation n'est pas une erreur de construction, donc
 * pas la même sévérité visuelle). */
export function messageRayonInvalide(exercice: ExerciceConstructionParabole, r: number): string | null {
  return r <= rMinimal(exercice) ? `Rayon trop petit : il doit être strictement supérieur à ${rMinimal(exercice)}.` : null;
}

/** `true` ssi la valeur crantée de `r` correspond exactement à un rayon déjà confirmé à une
 * itération précédente de la même instance (`promptgen53corrections.md`, A.4/A.5) — un r réutilisé
 * produirait 2 paires de points cibles identiques sur l'écran de tracé final, la seconde jamais
 * cliquable (voir `verificationConstructionParabole.ts::rEstValide`). */
export function rEstDejaUtilise(r: number, rDejaUtilises: number[]): boolean {
  return rDejaUtilises.some((u) => u === r);
}

/** Message INFORMATIF (jamais une alerte d'erreur rouge, `promptgen53corrections.md` A.4) affiché
 * EN DIRECT, en complément de la légende dynamique (`formatLegendeRayon`/`formatLegendeDistanceLigne`),
 * dès que le rayon crantée est déjà utilisé — combiné à un verrouillage du bouton "Valider" (A.5)
 * côté composant, jamais atteignable après validation. */
export function messageRayonDejaUtilise(r: number, rDejaUtilises: number[]): string | null {
  return rEstDejaUtilise(r, rDejaUtilises) ? "Ce rayon a déjà été utilisé à une itération précédente — choisis-en un autre." : null;
}

export function formatLegendeRayon(r: number): string {
  return `r = ${r}`;
}

export function formatLegendeDistanceLigne(ligneY: number): string {
  return `Distance à la directrice = ${Math.abs(ligneY)}`;
}
