import type { EtatSessionExerciceSynthese, PhaseExerciceSynthese } from "../moteur/typesExerciceSynthese";
import { SEQUENCES } from "../moteur/typesExerciceSynthese";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelSommesLatex } from "./formatMoyennePonderee";
import { formatEtatActuelTableauLatex } from "./formatDispersion";
import { versDispersion, versMoyennePonderee } from "../moteur/verificationExerciceSynthese";
import { formatEtatActuelIntervalleBTLatex, formatEtatActuelXBarSigmaLatex } from "./formatExerciceSynthese";

/**
 * Récapitulatif "Ce qu'on sait déjà" — sur les 17 écrans possibles (`SEQUENCES`,
 * `typesExerciceSynthese.ts`), SEULS 4 avaient un ancien bloc "état actuel" à reprendre (vérifié
 * par grep sur tous les `Etape*.tsx` montés par `AppExerciceSynthese.tsx` : aucun écran repris de
 * "Médiane"/"Boîte à moustaches"/"centres"/"sommes" n'en avait) :
 * - "sommes" → rappelée par l'ancien bloc de `EtapeQuotientMoyennePonderee.tsx` (PARTAGÉ avec
 *   `AppMoyennePonderee`, même sémantique : "sommes" précède toujours "quotient").
 * - "tableau" → rappelée par l'ancien bloc de `EtapeVarianceEcartTypeDispersion.tsx` (PARTAGÉ avec
 *   `AppDispersion`, même sémantique : "tableau" précède toujours "varianceEcartType").
 * - le COUPLE "quotient"+"varianceEcartType" → rappelé ENSEMBLE, jamais séparément, par l'ancien
 *   bloc de `EtapeBtIntervalle.tsx` (exclusif à ce générateur) via `formatEtatActuelXBarSigmaLatex`.
 *   Reste une entrée UNIQUE (jamais scindée en 2) car c'est ainsi — et ainsi seulement — qu'il a
 *   toujours été présenté avant ce chantier ; son icône ✓/✗ retient la révélation de L'UNE OU
 *   L'AUTRE des 2 phases (OR : les 2 sont de toute façon toujours closes ENSEMBLE à ce stade,
 *   "quotient" précédant toujours "varianceEcartType" dans les 2 variantes de `SEQUENCES`).
 * - "btIntervalle" → rappelée par l'ancien bloc de `EtapeBtPourcent.tsx` (exclusif à ce générateur).
 *
 * Chaque valeur est reprise TELLE QUELLE de ces anciens blocs (aucune nouvelle logique de
 * formatage) ; seuls les libellés "Sommes — ..." sont désambiguïsés (les 2 anciens blocs
 * partageaient le même libellé "Sommes confirmées", jamais un souci avant ce chantier puisqu'ils
 * n'apparaissaient jamais ensemble — ici les 2 entrées peuvent coexister dans le même panneau).
 */
export function calculerRecapitulatifExerciceSynthese(etat: EtatSessionExerciceSynthese): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = SEQUENCES[exercice.variante];
  const precedentes = new Set<PhaseExerciceSynthese>(sequence.slice(0, sequence.indexOf(etat.phase)));
  const entrees: EntreeRecapitulatif[] = [];

  if (precedentes.has("sommes")) {
    entrees.push({
      libelle: "Sommes — moyenne pondérée",
      estLatex: true,
      valeur: formatEtatActuelSommesLatex(versMoyennePonderee(exercice)),
      revele: etat.scoresAccumules.sommes!.revele,
    });
  }

  if (precedentes.has("tableau")) {
    entrees.push({
      libelle: "Sommes — dispersion",
      estLatex: true,
      valeur: formatEtatActuelTableauLatex(versDispersion(exercice)),
      revele: etat.scoresAccumules.tableau!.revele,
    });
  }

  // "tableau" précède toujours "varianceEcartType" dans les 2 variantes de `SEQUENCES` : au
  // moment où cette entrée combinée apparaît, l'entrée "tableau" ci-dessus est donc déjà présente
  // elle aussi — ordre chronologique de clôture respecté.
  if (precedentes.has("varianceEcartType")) {
    entrees.push({
      libelle: "x̄ et σ confirmés",
      estLatex: true,
      valeur: formatEtatActuelXBarSigmaLatex(exercice),
      revele: etat.scoresAccumules.quotient!.revele || etat.scoresAccumules.varianceEcartType!.revele,
    });
  }

  if (precedentes.has("btIntervalle")) {
    entrees.push({
      libelle: "Intervalle de Bienaymé-Tchebychev",
      estLatex: true,
      valeur: formatEtatActuelIntervalleBTLatex(exercice),
      revele: etat.scoresAccumules.btIntervalle!.revele,
    });
  }

  return entrees;
}
