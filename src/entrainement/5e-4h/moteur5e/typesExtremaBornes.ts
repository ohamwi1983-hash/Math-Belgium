/**
 * Couche B (5e) — types pour 5gen34 ("Extrema en contexte borné"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Contrairement à 5gen29 (skips conditionnels selon la nature des racines), les 6 écrans sont
 * TOUJOURS présents dans cet ordre fixe — ce générateur construit TOUJOURS 2 ou 3 vrais extrema
 * locaux (jamais de racine double, jamais "ni_lun_ni_lautre") et TOUJOURS 2 bornes informatives :
 *   1. "deriver"      — calculer f'(t) (champ symbolique).
 *   2. "racines"      — résoudre f'(t)=0 (ensemble de valeurs, ordre indifférent) — décision C de
 *      l'audit : la résolution est VÉRIFIÉE, les racines ne sont plus données par le tableau.
 *   3. "tableauFPrime" — tableau de signes sur [0 ; T] (racines confirmées en en-tête).
 *   4. "valeursExtremums" — f(t) à CHAQUE extremum local trouvé à l'écran 3.
 *   5. "valeursBornes" — f(0) et f(T).
 *   6. "comparaison"   — identifier le maximum absolu et le minimum absolu parmi TOUTES les valeurs
 *      confirmées aux écrans 4+5 (le piège central du générateur).
 */
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export const ORDRE_ECRANS_EXTREMA_BORNES = ["deriver", "racines", "tableauFPrime", "valeursExtremums", "valeursBornes", "comparaison"] as const;
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
  /** Indexé par écran — TOUJOURS les 6 clés de `ORDRE_ECRANS_EXTREMA_BORNES` (jamais de saut). */
  scores: Partial<Record<EcranExtremaBornes, number>>;
  /** même principe que `EtatSessionExtremaBornes.revelesPartiels` (voir son commentaire). */
  revelesPartiels: Partial<Record<EcranExtremaBornes, boolean>>;
}

export interface EtatSessionExtremaBornes {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceExtremaBornes;
  exerciceCourant: ExerciceExtremaBornes;
  phase: EcranExtremaBornes;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranExtremaBornes, number>>;
  /** vrai signal "révélé" par écran, peuplé depuis `etapeCourante.revelee` à la clôture (jamais
   * recalculé) — jusqu'au 2025-10, le récapitulatif le déduisait de `scoresPartiels[phase] === 0`,
   * une heuristique fausse ici : la pénalité d'aide (`niveauAide * PENALITE`) était soustraite (avant le retrait des pénalités) APRÈS
   * le score de tentatives puis plafonnée à 0 (`Math.max(0, ...)`), donc une réussite fortement
   * aidée pouvait légitimement tomber à 0 et s'afficher à tort comme "révélée" (point A, balayage
   * générique). */
  revelesPartiels: Partial<Record<EcranExtremaBornes, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceExtremaBornes[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
