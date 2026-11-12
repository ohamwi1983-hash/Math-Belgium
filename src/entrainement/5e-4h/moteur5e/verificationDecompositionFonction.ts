/**
 * Couche B — vérification pour 5gen2 ("Décomposer une fonction composée"). Réutilise directement
 * `evaluerExpressionGenerale` (`src/moteur/expressionGenerale.ts` du 5e — petit évaluateur pur
 * générique à une variable) : compose les lignes soumises par l'élève DANS L'ORDRE DÉCLARÉ en
 * chaînant les évaluations, et compare le résultat à f(x) évaluée directement — jamais une
 * comparaison à "la" décomposition canonique de l'exercice, uniquement à la reconstruction
 * effective (conformément à la spec).
 *
 * Audit 5e ch. 1, décision B : la reconstruction seule ne suffit plus — une seule ligne égale à f,
 * ou « g(x) = x ; h(x) = f(x) », reconstruisait f sans rien décomposer (accepté 600 fois sur 600).
 * Une décomposition valable est une chaîne d'AU MOINS deux fonctions de référence, sans en imposer
 * le nombre : chaque ligne est soit affine (jamais l'identité), soit un polynôme à au plus deux
 * termes de degré 2 à 4 (a·xⁿ + b·xᵐ, la couche intérieure « brute » du générateur), soit
 * c₁·R(x) + c₀ avec R ∈ {√x, ∛x, 1/x, |x|} — la fonction de référence elle-même, éventuellement
 * multipliée par un nombre ou augmentée d'une constante (c'est-à-dire fusionnée avec une couche
 * affine EXTÉRIEURE, ce qui reste une décomposition lisible). Une ligne qui applique une fonction de
 * référence à autre chose que x (« sqrt(2x+1) », « (2x+1)^2 ») fusionne deux couches : refusée,
 * avec un message qui ne consomme pas de tentative (voir `motifRefusStructure`).
 */
import type { ExerciceDecompositionFonction } from "../core5e/decompositionFonction.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { labelLigne } from "../ui5e/formatDecompositionFonction";

const TOLERANCE_ABSOLUE = 1e-6;
const TOLERANCE_RELATIVE = 1e-6;
const MIN_COMPARAISONS_VALIDES = 15;

/**
 * Plage large (±15, pas 0.25 → 121 points) : une composition impliquant une racine a un domaine
 * restreint à une partie de la droite réelle (ex. sqrt(2x-5) valide seulement pour x≥2.5) — la
 * racine du radicande peut, par construction (`tirerParametresAffine`, |a|≤3, |b|≤9), se trouver
 * jusqu'à ±9 ; il faut assez de marge au-delà pour dépasser `MIN_COMPARAISONS_VALIDES` même dans le
 * pire cas (racine proche du bord, domaine restreint au côté étroit).
 */
function pointsEchantillon(): number[] {
  const pts: number[] = [];
  for (let x = -15; x <= 15; x += 0.25) pts.push(Math.round(x * 4) / 4);
  return pts;
}

const POINTS = pointsEchantillon();

/** Tolérance absolue+relative combinée — nécessaire dès qu'une composition enchaîne plusieurs
 * puissances 4 (magnitudes énormes). */
function proches(a: number, b: number): boolean {
  return Math.abs(a - b) <= TOLERANCE_ABSOLUE + TOLERANCE_RELATIVE * Math.max(Math.abs(a), Math.abs(b));
}

/**
 * Saisie propre à 5gen2 (audit 5e ch. 1, point 17), appliquée AVANT l'évaluateur partagé du 5e —
 * jamais dans ce dernier, utilisé par une trentaine d'autres générateurs :
 * - « ∛(…) », « ∛x », « ∛2 » → « cbrt(…) » (même règle que « √ » dans l'évaluateur) ;
 * - « ÷ » → « / » ;
 * - « |u| » (non imbriqué) → « abs(u) » ;
 * - la variable « t » (le cours note les étages « f(t) = 5 − t ») → « x », jamais à l'intérieur
 *   d'un nom de fonction (« sqrt », « cbrt »).
 */
export function normaliserLigneDecomposition(ligne: string): string {
  return ligne
    .replace(/∛\s*(\(|\d+(?:[.,]\d+)?|[a-zA-Z]+)/g, (_, cible: string) => (cible === "(" ? "cbrt(" : `cbrt(${cible})`))
    .replace(/÷/g, "/")
    .replace(/\|([^|]+)\|/g, "abs($1)")
    .replace(/(?<![a-zA-Z])t(?![a-zA-Z])/g, "x");
}

function evaluerLigne(ligne: string, x: number): number {
  return evaluerExpressionGenerale(normaliserLigneDecomposition(ligne), x);
}

/**
 * Compose `lignes` (dans l'ordre déclaré, la première appliquée en premier — g avant h avant i…)
 * en x0 — ne s'arrête JAMAIS prématurément sur un résultat intermédiaire non fini (NaN/±Infinity) :
 * laisse l'arithmétique flottante native se propager d'un bout à l'autre de la chaîne, exactement
 * comme l'expression imbriquée évaluée en un seul passage (`1/(1/x)` en x=0).
 */
function composerEnPoint(lignes: string[], x0: number): number {
  let valeur = x0;
  for (const ligne of lignes) {
    valeur = evaluerLigne(ligne, valeur);
  }
  return valeur;
}

/** La composition des lignes reconstruit-elle f ? (critère historique, inchangé) */
function diagnostiquerReconstruction(exercice: ExerciceDecompositionFonction, lignes: string[]): StatutVerification {
  if (lignes.length === 0 || lignes.some((l) => l.trim() === "")) return "parse_error";

  let comparaisonsValides = 0;
  try {
    for (const x0 of POINTS) {
      const composeBrut = composerEnPoint(lignes, x0);
      const compose = Number.isFinite(composeBrut) ? composeBrut : null;
      const attenduBrut = evaluerExpressionGenerale(exercice.fFormule, x0);
      const attendu = Number.isFinite(attenduBrut) ? attenduBrut : null;

      if (compose === null && attendu === null) continue; // les deux non définis ici, rien à comparer
      if ((compose === null) !== (attendu === null)) return "not_equivalent"; // domaine différent
      if (!proches(compose as number, attendu as number)) return "not_equivalent";
      comparaisonsValides++;
    }
  } catch {
    return "parse_error";
  }

  return comparaisonsValides >= MIN_COMPARAISONS_VALIDES ? "correct" : "not_equivalent";
}

// ============================================================================
// Nature d'une ligne (décision B).
// ============================================================================

type NatureLigne = "identite" | "affine" | "polynome" | "reference" | "composee";

function valeursSur(ligne: string, points: number[]): (number | null)[] {
  return points.map((x) => {
    try {
      const v = evaluerLigne(ligne, x);
      return Number.isFinite(v) ? v : null;
    } catch {
      return null;
    }
  });
}

/** Polynôme d'interpolation de degré ≤ 4 aux points −2, −1, 0, 1, 2 (coefficients c₀…c₄),
 * par résolution exacte du système de Vandermonde (Gauss, 5×5). */
function interpolerDegre4(v: (x: number) => number): number[] | null {
  const xs = [-2, -1, 0, 1, 2];
  const m = xs.map((x) => [1, x, x * x, x ** 3, x ** 4, v(x)]);
  for (let col = 0; col < 5; col++) {
    let pivot = col;
    for (let r = col + 1; r < 5; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    if (Math.abs(m[pivot][col]) < 1e-12) return null;
    [m[col], m[pivot]] = [m[pivot], m[col]];
    for (let r = 0; r < 5; r++) {
      if (r === col) continue;
      const k = m[r][col] / m[col][col];
      for (let c = col; c < 6; c++) m[r][c] -= k * m[col][c];
    }
  }
  return m.map((ligne, i) => ligne[5] / ligne[i]);
}

interface Reference {
  f: (x: number) => number;
  domaine: (x: number) => boolean;
  /** Deux points du domaine où f diffère (pour ajuster c₁ et c₀). */
  x1: number;
  x2: number;
}

const REFERENCES: Reference[] = [
  { f: Math.sqrt, domaine: (x) => x >= 0, x1: 1, x2: 4 },
  { f: Math.cbrt, domaine: () => true, x1: 1, x2: 8 },
  { f: (x) => 1 / x, domaine: (x) => x !== 0, x1: 1, x2: 2 },
  { f: Math.abs, domaine: () => true, x1: 1, x2: 2 },
];

function natureLigne(ligne: string): NatureLigne {
  const valeurs = valeursSur(ligne, POINTS);
  const v = (x: number): number => {
    const i = POINTS.indexOf(Math.round(x * 4) / 4);
    const val = i >= 0 ? valeurs[i] : null;
    return val === null ? NaN : val;
  };
  const partoutDefinie = valeurs.every((val) => val !== null);

  if (partoutDefinie) {
    const b = v(0);
    const a = v(1) - b;
    if (POINTS.every((x) => proches(v(x), a * x + b))) {
      if (proches(a, 1) && proches(b, 0)) return "identite";
      return Math.abs(a) < 1e-9 ? "composee" : "affine";
    }
    const c = interpolerDegre4(v);
    if (c && POINTS.every((x) => proches(v(x), c[0] + c[1] * x + c[2] * x * x + c[3] * x ** 3 + c[4] * x ** 4))) {
      const echelle = Math.max(...c.map(Math.abs));
      const significatifs = c.map((k) => Math.abs(k) > 1e-7 * echelle);
      const degre = significatifs.lastIndexOf(true);
      const termes = significatifs.filter(Boolean).length;
      return degre >= 2 && termes <= 2 ? "polynome" : "composee";
    }
  }

  for (const ref of REFERENCES) {
    const memeDomaine = POINTS.every((x, i) => (valeurs[i] !== null) === ref.domaine(x));
    if (!memeDomaine) continue;
    const c1 = (v(ref.x2) - v(ref.x1)) / (ref.f(ref.x2) - ref.f(ref.x1));
    const c0 = v(ref.x1) - c1 * ref.f(ref.x1);
    if (!Number.isFinite(c1) || Math.abs(c1) < 1e-9) continue;
    if (POINTS.every((x, i) => valeurs[i] === null || proches(valeurs[i] as number, c1 * ref.f(x) + c0))) return "reference";
  }
  return "composee";
}

/**
 * Motif de refus STRUCTUREL d'une chaîne qui reconstruit bien f (décision B), ou `null` si elle
 * est une vraie décomposition. Affiché à l'élève SANS consommer de tentative.
 */
export function motifRefusStructure(lignes: string[]): string | null {
  if (lignes.length < 2) return "Une seule fonction ne décompose rien : écris f comme une chaîne d'au moins deux fonctions.";
  for (let i = 0; i < lignes.length; i++) {
    const nature = natureLigne(lignes[i]);
    const nom = labelLigne(i).replace(" =", "");
    if (nature === "identite") return `La fonction ${nom} = x ne change rien : retire-la de ta chaîne.`;
    if (nature === "composee") {
      return `${nom} enchaîne encore plusieurs opérations : décompose-la. Chaque ligne doit être une seule fonction de référence (affine, puissance, racine, inverse, valeur absolue), éventuellement multipliée par un nombre ou augmentée d'une constante.`;
    }
  }
  return null;
}

export function diagnostiquerDecomposition(exercice: ExerciceDecompositionFonction, lignes: string[]): StatutVerification {
  const reconstruction = diagnostiquerReconstruction(exercice, lignes);
  if (reconstruction !== "correct") return reconstruction;
  return motifRefusStructure(lignes) === null ? "correct" : "not_equivalent";
}

/** La chaîne reconstruit f MAIS ne la décompose pas (ligne unique, identité, couches fusionnées) :
 * l'écran affiche le motif sans consommer de tentative. */
export function reconstruitSansDecomposer(exercice: ExerciceDecompositionFonction, lignes: string[]): string | null {
  if (diagnostiquerReconstruction(exercice, lignes) !== "correct") return null;
  return motifRefusStructure(lignes);
}

export function verifierDecomposition(exercice: ExerciceDecompositionFonction, lignes: string[]): boolean {
  return diagnostiquerDecomposition(exercice, lignes) === "correct";
}
