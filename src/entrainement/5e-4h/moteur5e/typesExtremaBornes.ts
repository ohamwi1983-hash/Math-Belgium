/**
 * Couche B (5e) — types pour 5gen34 ("Extrema en contexte borné"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Contrairement à 5gen29 (skips conditionnels selon la nature des racines), les 5 écrans sont
 * TOUJOURS présents dans cet ordre fixe — ce générateur construit TOUJOURS 2 ou 3 vrais extrema
 * locaux (jamais de racine double, jamais "ni_lun_ni_lautre") et TOUJOURS 2 bornes informatives :
 *   1. "deriver"      — calculer f'(t) (champ symbolique).
 *   2. "tableauFPrime" — résoudre f'(t)=0 + tableau de signes étendu (racines déjà connues).
 *   3. "valeursExtremums" — f(t) à CHAQUE extremum local trouvé à l'écran 2.
 *   4. "valeursBornes" — f(0) et f(T).
 *   5. "comparaison"   — identifier le MAX absolu et le MIN absolu parmi TOUTES les valeurs
 *      confirmées aux écrans 3+4 (le piège central du générateur, voir CLAUDE.md).
 */
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export const ORDRE_ECRANS_EXTREMA_BORNES = ["deriver", "tableauFPrime", "valeursExtremums", "valeursBornes", "comparaison"] as const;
export type EcranExtremaBornes = (typeof ORDRE_ECRANS_EXTREMA_BORNES)[number];

export function ecranInitialExtremaBornes(): EcranExtremaBornes {
  return ORDRE_ECRANS_EXTREMA_BORNES[0];
}

export function ecranApresExtremaBornes(ecran: EcranExtremaBornes): EcranExtremaBornes | "termine" {
  const index = ORDRE_ECRANS_EXTREMA_BORNES.indexOf(ecran);
  return index + 1 < ORDRE_ECRANS_EXTREMA_BORNES.length ? ORDRE_ECRANS_EXTREMA_BORNES[index + 1] : "termine";
}

export interface ResultatExerciceExtremaBornes {
  exercice: ExerciceExtremaBornes;
  /** Indexé par écran — TOUJOURS les 5 clés de `ORDRE_ECRANS_EXTREMA_BORNES` (jamais de saut). */
  scores: Partial<Record<EcranExtremaBornes, number>>;
}

export interface EtatSessionExtremaBornes {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceExtremaBornes;
  exerciceCourant: ExerciceExtremaBornes;
  phase: EcranExtremaBornes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranExtremaBornes, number>>;
  indexExercice: number;
  resultats: ResultatExerciceExtremaBornes[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
