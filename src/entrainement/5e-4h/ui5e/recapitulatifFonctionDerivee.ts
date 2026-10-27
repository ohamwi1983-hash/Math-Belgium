import type { EtatSessionFonctionDerivee } from "../moteur5e/typesFonctionDerivee";
import { ECRANS_POSSIBLES } from "../moteur5e/typesFonctionDerivee";
import type { EntreeRecapitulatif } from "./recapitulatif";
import {
  formatTermesReponseAttendueDecomposerLatex,
  LIBELLE_ECRAN,
  texteReponseAttendueReconnaissance,
  formatReponseAttendueCalculerLatex,
} from "./formatFonctionDerivee";
import type { TypeDerivee } from "../core5e/fonctionDerivee.types";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours (5gen27). Icône (✓/✗)
 * pilotée par `etat.revelesPartiels[ecran]`, peuplé depuis `etapeCourante.revelee` à la clôture de
 * chaque écran (`sessionFonctionDerivee.ts::terminerEcranEtAvancer`). On itère `ECRANS_POSSIBLES` (les 3
 * écrans possibles, dans l'ordre) et on ignore simplement ceux absents de `scoresPartiels` — ce qui
 * couvre à la fois "pas encore atteint" ET "écran decomposer sauté" (type retenu "reglebase") sans
 * distinction nécessaire ici (dans les deux cas, rien à afficher). On s'arrête à l'écran courant.
 */
export function calculerRecapitulatifFonctionDerivee(etat: EtatSessionFonctionDerivee): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const ecran of ECRANS_POSSIBLES) {
    if (ecran === etat.phase) break;
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) continue;

    if (ecran === "reconnaissance") {
      entrees.push({
        libelle: LIBELLE_ECRAN.reconnaissance,
        estLatex: false,
        valeur: texteReponseAttendueReconnaissance(exercice),
        revele: etat.revelesPartiels[ecran] ?? false,
      });
    } else if (ecran === "decomposer" && etat.typeRetenu !== null) {
      const valeurs = formatTermesReponseAttendueDecomposerLatex(exercice, etat.typeRetenu as TypeDerivee);
      entrees.push({
        libelle: LIBELLE_ECRAN.decomposer,
        estLatex: true,
        valeur: valeurs.join("\\quad"),
        ...(valeurs.length > 1 ? { valeurs } : {}),
        revele: etat.revelesPartiels[ecran] ?? false,
      });
    } else if (ecran === "calculer") {
      entrees.push({
        libelle: LIBELLE_ECRAN.calculer,
        estLatex: true,
        valeur: formatReponseAttendueCalculerLatex(exercice),
        revele: etat.revelesPartiels[ecran] ?? false,
      });
    }
  }

  return entrees;
}
