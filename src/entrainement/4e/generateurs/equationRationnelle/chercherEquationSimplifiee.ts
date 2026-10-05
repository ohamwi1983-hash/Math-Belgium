/**
 * Recherche générique d'un entier `param` (non nul) tel que l'équation
 * `a2·x² + b2·x + (constanteC2 - coefficientParam·param) = 0` ait un discriminant carré parfait
 * donnant deux racines entières — même principe de recherche par essais successifs déjà utilisé
 * par construireDeuxDenominateurs.ts/construireSousVarianteC.ts, factorisé ici car cas4a et cas4b
 * (prompt-cas4a-4b.md) partagent exactement cette forme pour dériver `P0` : `a2`/`b2` sont fixés
 * par les choix déjà faits (racine commune, coefficients de la fraction de gauche), seul `param`
 * (P0) reste libre.
 */
export function chercherParametreEtRacines(
  a2: number,
  b2: number,
  constanteC2: number,
  coefficientParam: number,
  plage: number,
): { param: number; racines: [number, number] } | null {
  for (let param = -plage; param <= plage; param++) {
    if (param === 0) continue;

    const c2 = constanteC2 - coefficientParam * param;
    const delta = b2 * b2 - 4 * a2 * c2;
    if (delta < 0) continue;

    const racineDelta = Math.sqrt(delta);
    if (!Number.isInteger(racineDelta)) continue;

    const deuxA = 2 * a2;
    if ((-b2 - racineDelta) % deuxA !== 0 || (-b2 + racineDelta) % deuxA !== 0) continue;

    const r1 = (-b2 - racineDelta) / deuxA;
    const r2 = (-b2 + racineDelta) / deuxA;
    return { param, racines: r1 < r2 ? [r1, r2] : [r2, r1] };
  }
  return null;
}
