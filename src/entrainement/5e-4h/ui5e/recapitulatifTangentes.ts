import type { EtatSessionTangente } from "../moteur5e/typesTangentes";
import { ordreEcransTangente } from "../moteur5e/typesTangentes";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, LIBELLE_ECRAN } from "./formatTangentes";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours (5gen28). Icône (✓/✗)
 * pilotée par `etat.revelesPartiels[ecran]`, peuplé depuis `etapeCourante.revelee` à la clôture de
 * chaque écran (`sessionTangentes.ts`) — jamais `scoresPartiels[ecran] === 0` (point A, balayage
 * générique) : la pénalité d'aide multi-niveaux de ce générateur est soustraite APRÈS le score de
 * tentatives puis plafonnée à 0, donc une réussite fortement aidée pouvait légitimement tomber à 0
 * et s'afficher à tort comme "révélée". `ordreEcransTangente(exercice)` donne la séquence RÉELLE
 * (2 ou 3 écrans selon `exercice.variante`, fixée dès le tirage — jamais une branche réactive, voir
 * `typesTangentes.ts`) ; on s'arrête à l'écran courant (pas encore clos). Réutilise
 * `formatReponseAttenduePhaseLatex`, déjà la seule source de vérité pour la réponse CONFIRMÉE par
 * écran (même fonction que la bannière de validation dans `App5gen28.tsx`).
 */
export function calculerRecapitulatifTangentes(etat: EtatSessionTangente): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const ecran of ordreEcransTangente(exercice)) {
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
