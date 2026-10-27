import type { Exercice } from "../../../core/generateur.types";
import { randomNonZeroInt } from "../aleatoire";

/**
 * a(x - r)² = ax² + bx + c, avec b = -2a·r et c = a·r².
 * Cette construction garantit c = b²/(4a) — donc Δ = 0 — sans jamais calculer Δ après coup.
 * `racineImposee` (générateur "Simplifier") fixe r à cette valeur — la racine double vaut alors
 * exactement racineImposee. `aImpose` (générateur "L'inconnue au dénominateur") fixe a au lieu de
 * le tirer — utilisé pour générer une équation monique (a=1), orthogonal à racineImposee.
 */
export function construireProduitRemarquable(options?: {
  racineImposee?: number;
  aImpose?: number;
  /** Même principe que `construireMiseEnEvidence` (voir son commentaire) — plages par défaut
   * [1,4]/[-5,5] (comportement historique inchangé), gen7 passe des plages plus larges et un `a`
   * signé. */
  aRange?: [number, number];
  rRange?: [number, number];
}): Omit<Exercice, "formeAffichage"> {
  const [aMin, aMax] = options?.aRange ?? [1, 4];
  const [rMin, rMax] = options?.rRange ?? [-5, 5];
  const a = options?.aImpose ?? randomNonZeroInt(aMin, aMax);
  const r = options?.racineImposee ?? randomNonZeroInt(rMin, rMax);
  const b = -2 * a * r;
  const c = a * r * r;

  return {
    categorie: "produit_remarquable",
    enonce: { a, b, c },
    solution: {
      formeFactorisee: `${a === 1 ? "" : a}(${r >= 0 ? `x - ${r}` : `x + ${Math.abs(r)}`})^2`,
      racines: [r, r],
      racinesExactes: true,
    },
  };
}
