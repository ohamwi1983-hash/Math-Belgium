import type { Exercice } from "../../../core/generateur.types";
import { randomInt } from "../aleatoire";

/**
 * ax² + c = a(x - r)(x + r) = 0, avec c = -a·r².
 * b = 0 et c = -a·r² garantit mécaniquement que a et c sont de signes opposés
 * (a et r² sont toujours positifs ici, donc c est toujours négatif).
 * `racineImposee` (générateur "Simplifier") fixe r = |racineImposee| au lieu de le tirer, pour
 * que la racine imposée (non nulle par contrat de l'appelant) fasse partie de {-r, r}.
 * `aImpose` (générateur "L'inconnue au dénominateur") fixe a au lieu de le tirer — utilisé pour
 * générer une équation monique (a=1), orthogonal à racineImposee.
 */
export function construireBinomeConjugue(options?: {
  racineImposee?: number;
  aImpose?: number;
}): Omit<Exercice, "formeAffichage"> {
  const a = options?.aImpose ?? randomInt(1, 4);
  const r = options?.racineImposee !== undefined ? Math.abs(options.racineImposee) : randomInt(1, 5);
  const c = -a * r * r;

  const prefixe = a === 1 ? "" : a === -1 ? "-" : String(a);

  return {
    categorie: "binome_conjugue",
    enonce: { a, b: 0, c },
    solution: {
      formeFactorisee: `${prefixe}(x - ${r})(x + ${r})`,
      racines: [-r, r],
      racinesExactes: true,
    },
  };
}
