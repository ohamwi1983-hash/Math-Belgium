import type { CongruenceN, ConditionD, ExerciceFormeTrigD } from "../../core6e/formeTrigonometrique.types";
import { pgcd, tirerParmi } from "../calculPrimitives/aleatoire";
import { tirerZAvecAngleRemarquable } from "./familleA";

/**
 * Couche A (6e) — génération, famille D ("Trouver n selon une condition sur l'argument") de
 * `6gen37`.
 *
 * ============================================================================
 * **`resoudreCongruenceN` — résolution EXACTE (arithmétique entière, aucun flottant)**
 * ============================================================================
 * `θ=(p/q)·π` (fraction exacte, `AngleRemarquable`). La condition demandée sur `n·θ (mod 2π)`
 * s'écrit elle aussi comme une fraction de π : `C=(cp/cq)·π` avec `cq∈{1,2}` (réel positif : `C=0` ;
 * réel négatif : `C=π` soit `cp=1,cq=1` ; imaginaire pur positif : `C=π/2` soit `cp=1,cq=2` ;
 * imaginaire pur négatif : `C=3π/2` soit `cp=3,cq=2`). L'équation `n·θ≡C (mod 2π)` devient, en
 * multipliant les deux membres par `q·cq` pour tout mettre au même dénominateur entier :
 * `n·p·cq ≡ cp·q (mod 2·q·cq)` — une congruence linéaire ENTIÈRE classique `A·n≡B (mod M)`,
 * résoluble par recherche exhaustive (`M≤24` sur ce générateur, triviale en coût) plutôt que par
 * l'algorithme d'Euclide étendu (overkill pour une plage aussi petite, et plus lisible ainsi).
 * Solvable ssi `pgcd(A,M)` divise `B` (théorème standard des congruences linéaires) — sinon AUCUN
 * `n` ne vérifie la condition demandée (cas réel : ex. `θ=π/3` ne peut jamais donner un imaginaire
 * pur, `tan` n'y vaut jamais l'infini) : `construireFamilleD` retire alors un autre couple
 * angle/condition (voir plus bas) plutôt que de générer un exercice sans solution.
 *
 * ============================================================================
 * **`condition="reelPositif"` est TOUJOURS résoluble, pour n'importe quel angle** (garantit la
 * terminaison de la boucle de retirage ci-dessous)
 * ============================================================================
 * Pour `C=0` (`cp=0`), `B=0`, toujours divisible par n'importe quel `pgcd` — la boucle de retirage
 * ne peut donc jamais tourner indéfiniment : au pire, en retirant `condition` suffisamment de fois
 * pour un angle fixé, "réel positif" finit par être tiré et résout toujours.
 */

export function resoudreCongruenceN(p: number, q: number, cp: number, cq: number): CongruenceN | null {
  const A = p * cq;
  const B = cp * q;
  const M = 2 * q * cq;
  const g = pgcd(Math.abs(A), M);
  if (((B % g) + g) % g !== 0) return null;
  const m = M / g;
  for (let n = 0; n < M; n++) {
    if (((A * n - B) % M + M) % M === 0) return { k: n % m, m };
  }
  /* c8 ignore next */
  return null; // Ne peut pas arriver si g|B (théorème des congruences linéaires) — garde défensive.
}

const CONDITIONS: ConditionD[] = ["reelPositif", "reelNegatif", "imaginairePurPositif", "imaginairePurNegatif"];

/** `[cp,cq]` — voir en-tête de fichier pour la dérivation de chaque condition. */
const CP_CQ: Record<ConditionD, [number, number]> = {
  reelPositif: [0, 1],
  reelNegatif: [1, 1],
  imaginairePurPositif: [1, 2],
  imaginairePurNegatif: [3, 2],
};

export function construireFamilleD(): ExerciceFormeTrigD {
  for (let tentative = 0; tentative < 200; tentative++) {
    const z = tirerZAvecAngleRemarquable();
    if (z.angle.p === 0) continue; // θ=0 : z déjà réel positif, condition triviale pour n'importe quel n — sans intérêt pédagogique.
    const condition = tirerParmi(CONDITIONS);
    const [cp, cq] = CP_CQ[condition];
    const congruence = resoudreCongruenceN(z.angle.p, z.angle.q, cp, cq);
    if (congruence) return { famille: "D", z, condition, congruence };
  }
  /* c8 ignore next */
  throw new Error("construireFamilleD : aucune combinaison résoluble trouvée (ne devrait jamais arriver — 'reelPositif' est toujours résoluble)");
}
