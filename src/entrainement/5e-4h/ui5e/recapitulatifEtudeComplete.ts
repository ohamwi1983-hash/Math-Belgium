import { ordreComplet } from "../moteur5e/typesEtudeComplete";
import type { EtatSessionEtudeComplete } from "../moteur5e/typesEtudeComplete";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { estPhaseTexteSimple, formatReponseAttendueTexte, formatReponseAttenduePhaseLatex, labelPhase } from "./formatEtudeComplete";

/**
 * Construit le récapitulatif des phases déjà closes de l'exercice en cours (5gen24, "Étude
 * complète") — une entrée par phase de `ordreComplet(etat.exerciceCourant)` (pipeline linéaire à
 * longueur VARIABLE — 1 ou 2 exclusions, point vide optionnel, coefficient directeur optionnel,
 * cas spécial optionnel, voire la seule phase "constructionInverse" pour la variante bonus —
 * jamais un ordre fixe reconstitué à la main, voir l'en-tête de `moteur5e/typesEtudeComplete.ts`)
 * dont le score est déjà connu (`etat.scoresPartiels[phase] !== undefined`), dans l'ordre. Le
 * moteur ne trackait, à l'origine, que `derniereEtapeRevelee` (générique, pas un booléen par
 * phase) — on retrouve donc le verdict par phase via l'heuristique `scoresPartiels[phase] === 0 ⟺
 * révélée` (seul cas où `soumettreEtapeTentatives` renvoie exactement 0, voir
 * `moteur/etapeTentatives.ts` ; `soumettreEcran` y soustrait ensuite la pénalité d'aide avant
 * stockage, donc ce 0 peut aussi provenir d'une réussite tardive fortement pénalisée par l'aide —
 * même heuristique qu'ailleurs sur la plateforme, pas une garantie absolue).
 *
 * Même distinction texte simple/LaTeX que `reponseAttendueEtudeComplete` dans `App5gen24.tsx` :
 * "constructionInverse" (`estPhaseTexteSimple`, seule phase de la variante bonus) affiche le texte
 * des 2 propriétés demandées (`formatReponseAttendueTexte`, texte brut), les autres phases
 * (variante "etude") réutilisent `formatReponseAttenduePhaseLatex` (même source que la validation
 * inline) — plusieurs fragments d'une même phase joints par `\quad` (même convention que
 * `recapitulatifEquationRationnelle.ts`, 4e). Le libellé vient de `labelPhase(phase)`, seule
 * source déjà partagée avec la consigne d'écran.
 */
export function calculerRecapitulatifEtudeComplete(etat: EtatSessionEtudeComplete): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const phase of ordreComplet(exercice)) {
    const score = etat.scoresPartiels[phase];
    if (score === undefined) continue;
    const revele = score === 0;
    const libelle = labelPhase(phase);

    if (estPhaseTexteSimple(exercice, phase)) {
      entrees.push({ libelle, estLatex: false, valeur: formatReponseAttendueTexte(exercice, phase), revele });
      continue;
    }

    // Garde défensive jamais atteinte en pratique : `estPhaseTexteSimple` est déjà vraie pour
    // TOUTE phase de la variante "constructionInverse" (voir sa définition) — ce `continue` ne
    // fait donc que satisfaire le narrowing TypeScript de `ExerciceEtudeCompletePipeline`.
    if (exercice.mode !== "etude") continue;

    entrees.push({ libelle, estLatex: true, valeur: formatReponseAttenduePhaseLatex(exercice, phase).join("\\quad"), revele });
  }

  return entrees;
}
