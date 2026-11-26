// Copie 5e (6h) de `5e-4h/ui5e/recapitulatifSuiteClassique.ts` (56gen8 ← 5gen17, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { formatTermesReponseAttendueLatex, texteReponseAttendueQCM, LIBELLE_PHASE_SUITE_CLASSIQUE } from "./formatSuiteClassique";
import { ordreComplet } from "../moteur/typesSuiteClassique";
import type { EtatSessionSuiteClassique } from "../moteur/typesSuiteClassique";
import type { EntreeRecapitulatif } from "../../../../5e-4h/ui5e/recapitulatif";

function entreeUnique(libelle: string, valeur: string, revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur, revele };
}

function entreeMultiple(libelle: string, valeurs: string[], revele: boolean): EntreeRecapitulatif {
  return { libelle, estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele };
}

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen17 — une entrée par écran déjà clos (libellé
 * `LIBELLE_PHASE_SUITE_CLASSIQUE` + icône ✓/✗), avec la réponse CONFIRMÉE de l'écran :
 * `formatTermesReponseAttendueLatex` pour les écrans à champ(s), `texteReponseAttendueQCM` (LaTeX
 * court) pour les QCM — les mêmes fonctions que la réponse révélée et le corrigé.
 * "suitesFinalesCombinees" n'y figure jamais : c'est toujours la DERNIÈRE phase de son scénario.
 *
 * Icône (✓/✗) pilotée par `etat.revelesPartiels[phase]`, peuplé depuis `etapeCourante.revelee` à
 * la clôture de chaque écran — jamais `scoresPartiels[phase] === 0`.
 */
export function calculerRecapitulatifSuiteClassique(etat: EtatSessionSuiteClassique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(etat.phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];

  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of precedentes) {
    const revele = etat.revelesPartiels[phase] ?? false;
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
