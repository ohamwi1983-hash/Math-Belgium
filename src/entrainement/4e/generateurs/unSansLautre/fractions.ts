/**
 * Recherche exhaustive des couples (p,q) coprimes, 0<p<q, servant de |valeurConnue| pour ce
 * générateur — jamais une table manuellement curatée (auto-vérifiée par construction, aucun risque
 * d'erreur de recopie d'un "triplet pythagoricien" mal calculé).
 */

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

function estCarreParfait(n: number): boolean {
  const racine = Math.round(Math.sqrt(n));
  return racine * racine === n;
}

export interface FractionPq {
  p: number;
  q: number;
}

/**
 * Couples (p,q) coprimes, 0<p<q<=qMax, tels que q²-p² soit (ou ne soit pas, selon
 * `carreParfaitVoulu`) un carré parfait — `carreParfaitVoulu=true` produit un "triplet
 * pythagoricien" (résultat final rationnel, sans racine) ; `false` produit une valeur nécessitant
 * une simplification de racine.
 */
export function construirePool(qMax: number, carreParfaitVoulu: boolean): FractionPq[] {
  const resultats: FractionPq[] = [];
  for (let q = 3; q <= qMax; q++) {
    for (let p = 1; p < q; p++) {
      if (pgcd(p, q) !== 1) continue;
      const n = q * q - p * p;
      if (estCarreParfait(n) === carreParfaitVoulu) resultats.push({ p, q });
    }
  }
  return resultats;
}

/**
 * `qMax=12` sur les deux pools — contrainte explicite (correction post-livraison, demandée
 * directement en conversation, sans fichier prompt dédié) : la valeur donnée dans l'énoncé
 * (`cosθ` ou `sinθ`) doit toujours avoir un dénominateur ≤12 une fois réduite à sa forme
 * irréductible (ex. `-3/5` ou `7/12` valides, `5/13` exclu) — ne s'applique qu'à cette valeur de
 * DÉPART, jamais aux résultats intermédiaires/finaux calculés par l'élève (carré, valeur signée,
 * tangente), qui peuvent librement comporter un dénominateur plus grand ou une racine.
 *
 * Conséquence mathématique assumée, pas un oubli : tout dénominateur d'un "triplet pythagoricien"
 * primitif est nécessairement l'hypoténuse d'un triangle rectangle à côtés entiers, et la plus
 * petite hypoténuse primitive après 5 est 13 (5-12-13) — déjà exclue par cette borne. **`5` est
 * donc l'unique dénominateur possible pour `POOL_TRIPLETS` sous cette contrainte** (`{p:3,q:5}`/
 * `{p:4,q:5}`, le triangle 3-4-5), vérifié explicitement par test plutôt que supposé.
 */
export const POOL_TRIPLETS = construirePool(12, true);

/** Mêmes 12 comme borne — l'exemple `7/12` de la correction (radicande `144-49=95`, non carré
 * parfait) y est bien atteignable. */
export const POOL_QUELCONQUES = construirePool(12, false);
