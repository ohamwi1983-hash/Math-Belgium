import type { ExerciceLogProbD } from "../../../core6e/logarithmesProblemes.types";
import { CONTEXTES_D } from "../contextes";
import { tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille D — asymptote non nulle, ALLÉGÉE vs 6gen14/`equationsExpLog` : `Ta`/`T0` DONNÉS
 * DIRECTEMENT dans l'énoncé (pas de 3 points à ajuster, `k` reste symbolique, jamais numériquement
 * déterminé — voir en-tête `core6e/logarithmesProblemes.types.ts`). Aucun précédent réel trouvé
 * dans `core6e/equationsExpLog.types.ts` (6gen14) pour ce patron exact "Ta/T0 directement donnés,
 * k jamais résolu" — sa famille la plus proche (asymptotes) résout systématiquement un `k`
 * numérique depuis des points supplémentaires, ce que la spec 6gen22 exclut explicitement pour
 * cette famille (voir devlog `docs/historique-6e.md`) — implémentation FRAÎCHE depuis l'algèbre du
 * prompt, cohérente avec le patron narratif de `exponentiellesProblemes/familles/D.ts` (6gen12)
 * réutilisé seulement pour le CHOIX DE CONTEXTE (signe implicite "approche par le haut"), jamais
 * pour la mécanique de résolution (différente ici : aucun point b/c à calculer).
 */
export function construireD(): ExerciceLogProbD {
  const Ta = tirerEntier(15, 25);
  const T0 = Ta + tirerEntier(40, 75);
  const contexte = tirerParmi(CONTEXTES_D);

  return { famille: "D", contexteId: contexte.id, Ta, T0 };
}
