import type { EtatSessionDefinitionDerivee } from "../moteur5e/typesDefinitionDerivee";
import { ORDRE_COMPLET } from "../moteur5e/typesDefinitionDerivee";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttendueEcranLatex, LIBELLE_ECRAN } from "./formatDefinitionDerivee";

/**
 * Construit le récapitulatif des écrans déjà clos de l'exercice en cours (5gen26). Icône (✓/✗)
 * pilotée par `etat.revelesPartiels[ecran]`, peuplé depuis `etapeCourante.revelee` à la clôture de
 * chaque écran (`sessionDefinitionDerivee.ts::soumettreEcran`). `ORDRE_COMPLET` (3 écrans, séquence
 * FIXE, voir `typesDefinitionDerivee.ts`) donne l'ordre d'itération ; on s'arrête à l'écran courant
 * (pas encore clos). Réutilise `formatReponseAttendueEcranLatex`, déjà la seule source de vérité
 * pour la réponse CONFIRMÉE par écran (même fonction que la bannière de validation dans
 * `App5gen26.tsx`).
 */
export function calculerRecapitulatifDefinitionDerivee(etat: EtatSessionDefinitionDerivee): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const ecran of ORDRE_COMPLET) {
    if (ecran === etat.phase) break;
    const score = etat.scoresPartiels[ecran];
    if (score === undefined) continue;
    const valeurs = formatReponseAttendueEcranLatex(exercice, ecran);
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
