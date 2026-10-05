import type { Polynome } from "../../core5e/domaineDefinition.types";
import type { ValeurCellule } from "../../core/signesProduit.types";

/** Évalue un polynôme (coefficients ascendants) en x — Couche A, dupliquée telle quelle côté
 * moteur5e (voir `moteur5e/polynomeVerification.ts`) puisque `src/moteur5e/` ne peut jamais
 * importer `src/generateurs5e/` (même règle d'architecture qu'entre `src/moteur/` et
 * `src/generateurs/` côté 4e). */
export function evaluerPolynome(coeffs: Polynome, x: number): number {
  return coeffs.reduce((somme, c, i) => somme + c * x ** i, 0);
}

/** Terme unique "coefficient·x^degre", en LaTeX, coefficient JAMAIS affiché s'il vaut ±1 (sauf
 * pour le terme constant, degre 0, où le coefficient EST la valeur affichée). `null` si coeff===0
 * (le terme est alors omis par l'appelant). */
function formatTermeLatex(coeff: number, degre: number, variable: string): string | null {
  if (coeff === 0) return null;
  const abs = Math.abs(coeff);
  const partieVariable = degre === 0 ? "" : degre === 1 ? variable : `${variable}^${degre}`;
  const partieCoeff = degre === 0 ? String(abs) : abs === 1 ? "" : String(abs);
  return `${coeff < 0 ? "-" : ""}${partieCoeff}${partieVariable}`;
}

/**
 * Rendu LaTeX d'un polynôme (coefficients ascendants) dans l'ordre décroissant habituel
 * (a_n x^n + ... + a_1 x + a_0) — jamais de coefficient nul affiché, jamais de coefficient ±1
 * littéral (sauf le terme constant), jamais de double signe (`+(-k)` → `-k`), même convention que
 * `formatSommeTermes` (`ui/formatEquation.ts`, 4e) mais réimplémentée ici : `src/generateurs5e/`
 * ne peut jamais importer `src/ui/`, même principe que `generateurs/optimisation/formatNarratif.ts`
 * (gen55, 4e).
 */
export function formatPolynomeLatex(coeffs: Polynome, variable = "x"): string {
  const termes: string[] = [];
  for (let degre = coeffs.length - 1; degre >= 0; degre--) {
    const terme = formatTermeLatex(coeffs[degre], degre, variable);
    if (terme === null) continue;
    if (termes.length === 0) {
      termes.push(terme);
    } else if (terme.startsWith("-")) {
      termes.push(`- ${terme.slice(1)}`);
    } else {
      termes.push(`+ ${terme}`);
    }
  }
  return termes.length === 0 ? "0" : termes.join(" ");
}

/** Polynôme du 1er degré ax+b — coefficients ascendants [b, a]. */
export function polynomeLineaire(a: number, b: number): Polynome {
  return [b, a];
}

/** Polynôme du 2nd degré monique-scalé a(x-r1)(x-r2) développé — coefficients ascendants. */
export function polynomeQuadratiqueDepuisRacines(a: number, r1: number, r2: number): Polynome {
  return [a * r1 * r2, -a * (r1 + r2), a];
}

/** Polynôme du 2nd degré a(x-r)^2 développé — coefficients ascendants (racine double). */
export function polynomeCarreParfait(a: number, r: number): Polynome {
  return polynomeQuadratiqueDepuisRacines(a, r, r);
}

/** Produit de deux polynômes (convolution des coefficients ascendants). */
export function multiplierPolynomes(p: Polynome, q: Polynome): Polynome {
  const resultat = Array(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      resultat[i + j] += p[i] * q[j];
    }
  }
  return resultat;
}

/** LaTeX d'un facteur linéaire (x-r), signe automatique — "(x-3)"/"(x+3)". */
export function formatFacteurLineaireLatex(r: number, variable = "x"): string {
  return `(${formatPolynomeLatex(polynomeLineaire(1, -r), variable)})`;
}

/** Signe d'un polynôme en x, en cellule de tableau de signes (3 états) — tolérance flottante
 * pour absorber l'imprécision de calcul (x choisi exactement à une racine réelle). */
export function signeCellule(coeffs: Polynome, x: number, epsilon = 1e-9): ValeurCellule {
  const v = evaluerPolynome(coeffs, x);
  if (Math.abs(v) < epsilon) return "0";
  return v > 0 ? "+" : "-";
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/**
 * Réduit un numérateur CONSTANT et un dénominateur polynomial (coefficients entiers) par leur PGCD
 * commun — ex. 6/(3x+9) → 2/(x+3), jamais une fraction affichée à l'élève avec un facteur commun
 * non simplifié entre numérateur et dénominateur (A.7, `promptcorrectionsregroupees.md` — bug
 * trouvé sur `rationnelle.ts::construireLineaireSimple`, 5gen1, et sur
 * `composerFonctions/familles.ts::construireRationnelle`, 5gen3, réutilisée ici plutôt que dupliquée
 * une seconde fois, 5gen3 important déjà ce module — voir "Catalogue de variantes"/import
 * générateur→générateur, convention déjà établie). Le PGCD porte sur `numerateur` ET sur TOUS les
 * coefficients de `denominateur` à la fois — jamais seulement 2 d'entre eux — via `pgcd` répliquée
 * en 2-arg comme partout ailleurs sur la plateforme, `numerateur` toujours non nul en pratique
 * (garanti par les deux appelants), donc le PGCD final reste toujours ≥1, jamais 0.
 */
export function reduireNumerateurConstant(numerateur: number, denominateur: Polynome): { numerateur: number; denominateur: Polynome } {
  const g = denominateur.reduce((acc, c) => pgcd(acc, c), numerateur);
  return { numerateur: numerateur / g, denominateur: denominateur.map((c) => c / g) };
}
