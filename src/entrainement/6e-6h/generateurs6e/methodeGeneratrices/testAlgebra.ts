/**
 * Utilitaire de TEST uniquement pour `6gen57` (jamais importé par du code applicatif, jamais par
 * `moteur6e/` — voir règle de couches CLAUDE.md) — évalue numériquement une équation "gauche=droite"
 * produite par CE générateur (jamais une saisie élève) pour vérifier, dans les tests Couche A, que
 * chaque `elimineFactorise`/`generatrice*` correspond EXACTEMENT au "Résultat attendu (vérifié)"
 * donné tel quel par le cahier des charges de la mission. Implémentation VOLONTAIREMENT
 * INDÉPENDANTE de `moteur6e/verificationMethodeGeneratrices.ts` (même principe — comparaison à un
 * facteur multiplicatif non nul près, par échantillonnage — mais réécrite ici, jamais partagée) :
 * si les deux avaient un bug identique, un partage de code l'aurait masqué des deux côtés.
 */
function evaluer(expr: string, vars: Record<string, number>): number {
  const corps = expr.replace(/\^/g, "**");
  const noms = Object.keys(vars);
  const fn = new Function(...noms, "tan", "sin", "cos", `"use strict"; return (${corps});`);
  return fn(...noms.map((n) => vars[n]), Math.tan, Math.sin, Math.cos) as number;
}

function separer(equation: string): { gauche: string; droite: string } {
  const i = equation.indexOf("=");
  if (i === -1) throw new Error(`Équation invalide (pas de "=") : ${equation}`);
  return { gauche: equation.slice(0, i), droite: equation.slice(i + 1) };
}

function difference(equation: string, vars: Record<string, number>): number {
  const { gauche, droite } = separer(equation);
  return evaluer(gauche, vars) - evaluer(droite, vars);
}

/** Génère `n` points aléatoires (coordonnées non nulles, non entières) pour les variables données —
 * évite les coïncidences accidentelles qu'un tirage entier pourrait produire. */
export function echantillonsAleatoires(variables: string[], n = 8): Record<string, number>[] {
  const resultat: Record<string, number>[] = [];
  for (let i = 0; i < n; i++) {
    const point: Record<string, number> = {};
    for (const v of variables) point[v] = (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 3.1);
    resultat.push(point);
  }
  return resultat;
}

/** Vrai si `equation` et `reference` décrivent le MÊME lieu, càd sont proportionnelles à un facteur
 * multiplicatif non nul près (jamais une égalité terme à terme stricte — 2 écritures valides d'une
 * même équation ne partagent pas forcément le même facteur d'échelle), sur tous les échantillons. */
export function memeEquation(equation: string, reference: string, echantillons: Record<string, number>[]): boolean {
  let ratio: number | null = null;
  for (const point of echantillons) {
    const dEq = difference(equation, point);
    const dRef = difference(reference, point);
    if (!Number.isFinite(dEq) || !Number.isFinite(dRef)) continue;
    if (ratio === null) {
      if (Math.abs(dRef) < 1e-9) continue;
      ratio = dEq / dRef;
      if (Math.abs(ratio) < 1e-9) return false;
      continue;
    }
    if (Math.abs(dEq - ratio * dRef) > 1e-6 * (1 + Math.abs(dRef))) return false;
  }
  return ratio !== null;
}
