import { formatTermesReponseAttendueLatex, texteReponseAttendueQCM, LIBELLE_PHASE_SUITE_CLASSIQUE } from "./formatSuiteClassique";
import { ordreComplet } from "../moteur5e/typesSuiteClassique";
import type { EtatSessionSuiteClassique } from "../moteur5e/typesSuiteClassique";
import type { EntreeRecapitulatif } from "./recapitulatif";

function entreeUnique(libelle: string, valeur: string, revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur, revele };
}

function entreeMultiple(libelle: string, valeurs: string[], revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
}

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen17 — reprend EXACTEMENT les mêmes valeurs que
 * l'ancien bloc "état actuel" (`elementsEtatActuel`, `ui5e/formatSuiteClassique.ts`, consommé par
 * `components5e/EtatActuelSuiteClassique.tsx`) : réutilise les 2 mêmes fonctions
 * (`formatTermesReponseAttendueLatex` pour les écrans à champ(s)/liste,
 * `texteReponseAttendueQCM` pour les 6 écrans QCM), jamais une formule recalculée séparément — seul
 * le regroupement change : `elementsEtatActuel` retourne un flux plat de fragments sans label, ici
 * on reconstruit UNE entrée par phase (libellé `LIBELLE_PHASE_SUITE_CLASSIQUE` + icône ✓/✗).
 * "suitesFinalesCombinees" (seule phase des 26 sans formateur ici) n'est jamais "précédente" — elle
 * est toujours la DERNIÈRE phase de son scénario (`ORDRE_PHASES`), donc jamais rencontrée dans
 * cette boucle, même comportement que `elementsEtatActuel`.
 *
 * Heuristique de révélation : le moteur ne garde que `derniereEtapeRevelee` (générique), jamais un
 * booléen par phase — `scoresPartiels[phase] === 0` pilote donc l'icône (✓/✗), même convention que
 * 5gen14/5gen15/5gen16.
 */
export function calculerRecapitulatifSuiteClassique(etat: EtatSessionSuiteClassique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(etat.phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];

  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of precedentes) {
    const revele = etat.scoresPartiels[phase] === 0;
    const libelle = LIBELLE_PHASE_SUITE_CLASSIQUE[phase];
    const termes = formatTermesReponseAttendueLatex(exercice, phase);
    if (termes !== null) {
      entrees.push(termes.length === 1 ? entreeUnique(libelle, termes[0], revele) : entreeMultiple(libelle, termes, revele));
      continue;
    }
    const texteQCM = texteReponseAttendueQCM(exercice, phase);
    if (texteQCM !== null) entrees.push(entreeUnique(libelle, texteQCM, revele));
  }
  return entrees;
}
