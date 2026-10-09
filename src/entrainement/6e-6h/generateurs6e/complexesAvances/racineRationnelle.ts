/**
 * Couche A (6e) — simplification EXACTE de `√(num/den)` (num,den entiers strictement positifs) en
 * LaTeX radical simplifié, pour `6gen42` famille B (rayon d'un cercle de Thalès/Apollonius/centré en
 * O — voir en-tête `familleB.ts`) : `moteur6e/equivalenceExponentielle.ts` accepte `sqrt` en saisie
 * élève, mais l'AFFICHAGE côté plateforme doit rester une fraction/un radical simplifié, JAMAIS un
 * décimal (convention CLAUDE.md, "fraction irréductible, jamais de décimal, pour toute valeur
 * générée par la plateforme").
 *
 * Algorithme : réduit `num/den` par leur pgcd, extrait le plus grand facteur carré parfait de chaque
 * côté (`num=s²·num2`, `den=t²·den2`, `num2`/`den2` sans carré), puis rationalise le dénominateur :
 * `√(num/den) = (s/t)·√(num2/den2) = s·√(num2·den2) / (t·den2)` — `num2·den2` reste SANS CARRÉ
 * (`num2`/`den2` premiers entre eux après réduction initiale, produit de 2 sans-carrés premiers
 * entre eux = sans carré). Régression : `racineRationnelle.test.ts`.
 */

function pgcdLocal(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Décompose `n` (entier >0) en `{carre, sansCarre}` tels que `n=carre²·sansCarre`, `sansCarre` sans
 * facteur carré. */
function extraireCarre(n: number): { carre: number; sansCarre: number } {
  let carre = 1;
  let sansCarre = n;
  for (let d = 2; d * d <= sansCarre; d++) {
    while (sansCarre % (d * d) === 0) {
      sansCarre /= d * d;
      carre *= d;
    }
  }
  return { carre, sansCarre };
}

export function racineRationnelleLatex(numBrut: number, denBrut: number): { latex: string; numerique: number } {
  const numerique = Math.sqrt(numBrut / denBrut);
  const g = pgcdLocal(numBrut, denBrut);
  const num = numBrut / g;
  const den = denBrut / g;
  const { carre: s, sansCarre: num2 } = extraireCarre(num);
  const { carre: t, sansCarre: den2 } = extraireCarre(den);
  const radical = num2 * den2;
  const coefNum = s;
  const coefDen = t * den2;

  if (radical === 1) {
    // Rationnel pur.
    if (coefDen === 1) return { latex: `${coefNum}`, numerique };
    const gg = pgcdLocal(coefNum, coefDen);
    return { latex: `\\frac{${coefNum / gg}}{${coefDen / gg}}`, numerique };
  }

  const radicalLatex = `\\sqrt{${radical}}`;
  if (coefDen === 1) {
    return { latex: coefNum === 1 ? radicalLatex : `${coefNum}${radicalLatex}`, numerique };
  }
  const gg = pgcdLocal(coefNum, coefDen);
  const n = coefNum / gg;
  const d = coefDen / gg;
  const numeratorLatex = n === 1 ? radicalLatex : `${n}${radicalLatex}`;
  return { latex: `\\frac{${numeratorLatex}}{${d}}`, numerique };
}
