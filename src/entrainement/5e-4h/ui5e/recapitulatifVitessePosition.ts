import type { EtatSessionVitessePosition } from "../moteur5e/typesVitessePosition";
import { ordreEcransVitessePosition } from "../moteur5e/typesVitessePosition";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, LIBELLE_ECRAN } from "./formatVitessePosition";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours (5gen35). Icône (✓/✗)
 * pilotée par `etat.revelesPartiels[ecran]`, peuplé depuis `etapeCourante.revelee` à la clôture de
 * chaque écran (`sessionVitessePosition.ts`) — jamais `scoresPartiels[ecran] === 0` (point A,
 * balayage générique) : la pénalité d'aide multi-niveaux de ce générateur est soustraite APRÈS le
 * score de tentatives puis plafonnée à 0, donc une réussite fortement aidée pouvait légitimement
 * tomber à 0 et s'afficher à tort comme "révélée". `ordreEcransVitessePosition(exercice)` donne la
 * séquence RÉELLE (5 écrans pour la variante "A", 6 pour "B" — fixée dès le tirage, voir
 * `typesVitessePosition.ts`) ; on s'arrête à l'écran courant (pas encore clos). Réutilise
 * `formatReponseAttenduePhaseLatex`, déjà la seule source de vérité pour la réponse CONFIRMÉE par
 * écran (même fonction que la bannière de validation dans `App5gen35.tsx`).
 */
export function calculerRecapitulatifVitessePosition(etat: EtatSessionVitessePosition): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const ecran of ordreEcransVitessePosition(exercice)) {
    if (ecran === etat.phase) break;
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) continue;
    const valeurs = formatReponseAttenduePhaseLatex(exercice, ecran);
    entrees.push({
      libelle: LIBELLE_ECRAN[ecran],
      estLatex: true,
      valeur: valeurs.join("\\quad"),
      ...(valeurs.length > 1 ? { valeurs } : {}),
      revele: etat.revelesPartiels[ecran] ?? false,
    });
  }

  return entrees;
}
