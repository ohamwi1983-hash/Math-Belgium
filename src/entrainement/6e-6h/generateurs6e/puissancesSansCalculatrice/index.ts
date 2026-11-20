import type {
  BaseComparer,
  ExerciceComparer,
  ExerciceInverse,
  ExercicePuissances,
  ExerciceSimplifier,
  ExposantComparer,
  Relation,
  SousTypeInverse,
  SousTypeSimplifier,
  VariantePuissances,
} from "../../core6e/puissancesSansCalculatrice.types";
import { decL, entier, parmi } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de 6gen146 « Puissances à exposant réel : calculer et comparer sans
 * calculatrice ». `Math.random()` seul (le `?code=` rejoue le tirage avec une graine). Toutes les
 * valeurs demandées sont EXACTES (entiers, fractions 1/aⁿ) : aucune n'exige de calculatrice ni de
 * logarithme (décision de l'utilisateur pour le ch. 2).
 */

export type IdVariantePuissances = VariantePuissances;

export const CATALOGUE_VARIANTES: { id: IdVariantePuissances; label: string }[] = [
  { id: "simplifier", label: "Simplifier un produit, un quotient, une puissance de puissance (exposants irrationnels)" },
  { id: "comparer", label: "Comparer deux puissances de même base sans calculatrice" },
  { id: "inverse", label: "Bases 1/a, 0,5, a² : écrire comme une puissance de a" },
];

/** Plage des exposants entiers dont la valeur reste lisible (aⁿ ≤ 125, 1/aⁿ ≥ 1/125). */
const PLAGE: Record<number, [number, number]> = { 2: [-4, 6], 3: [-3, 4], 5: [-2, 3] };

function exposantPermis(a: number, n: number): boolean {
  const [lo, hi] = PLAGE[a];
  return n >= lo && n <= hi && n !== 0;
}

function simplifier(sousType?: SousTypeSimplifier): ExerciceSimplifier {
  const st: SousTypeSimplifier = sousType ?? parmi(["produit", "quotient", "puissance", "base"] as const);
  for (;;) {
    const a = parmi([2, 3, 5]);
    const k = parmi([2, 3, 5, 7]);
    if (st === "puissance") {
      const kk = parmi([2, 3]);
      const r = parmi([1, 2, -1]);
      const n = r * kk;
      if (!exposantPermis(a, n)) continue;
      return { variante: "simplifier", sousType: st, a, k: kk, r, p: 0, s: 0, n };
    }
    const r = parmi([1, 2, 3, -1, -2]);
    if (st === "base") {
      if (a === 5) continue; // 25^{…} : base trop grande à réécrire de tête
      const s = entier(-2, 4);
      if (!exposantPermis(a, s)) continue;
      return { variante: "simplifier", sousType: st, a, k, r: Math.abs(r), p: 0, s, n: s };
    }
    const p = entier(-2, 4);
    const s = entier(-2, 3);
    const n = st === "produit" ? p + s : p - s;
    if (!exposantPermis(a, n)) continue;
    // Produit : les deux parties entières non nulles en même temps (sinon un exposant est « r√k » seul,
    // ce qui reste correct, mais on garde la forme complète la plupart du temps).
    if (p === 0 && s === 0) continue;
    return { variante: "simplifier", sousType: st, a, k, r, p, s, n };
  }
}

const BASES_CROISSANTES: BaseComparer[] = [
  { latex: "2", valeur: 2 },
  { latex: "3", valeur: 3 },
  { latex: "5", valeur: 5 },
  { latex: "e", valeur: Math.E },
  { latex: "1{,}5", valeur: 1.5 },
];
const BASES_DECROISSANTES: BaseComparer[] = [
  { latex: "\\frac{1}{2}", valeur: 0.5 },
  { latex: "\\frac{1}{3}", valeur: 1 / 3 },
  { latex: "0{,}4", valeur: 0.4 },
  { latex: "0{,}7", valeur: 0.7 },
  { latex: "\\frac{2}{3}", valeur: 2 / 3 },
];

const RADICANDES = [2, 3, 5, 6, 7, 10, 11];
const EGAUX: [number, number][] = [
  [2, 2],
  [2, 3],
  [3, 2],
  [2, 5],
  [3, 3],
  [5, 2],
  [3, 5],
];

/** Paire d'exposants (u < v) non égaux : √k et un décimal à un chiffre après la virgule, ou π. */
function paireDistincte(): { petit: ExposantComparer; grand: ExposantComparer; genre: "carres" | "pi" } {
  if (Math.random() < 0.18) {
    const d = parmi([3.1, 3.2, 3.15]);
    const pi: ExposantComparer = { latex: "\\pi", valeur: Math.PI, carreLatex: null };
    const dec: ExposantComparer = { latex: decL(d), valeur: d, carreLatex: null };
    return d < Math.PI ? { petit: dec, grand: pi, genre: "pi" } : { petit: pi, grand: dec, genre: "pi" };
  }
  const k = parmi(RADICANDES);
  const r = Math.sqrt(k);
  const bas = Math.floor(r * 10) / 10;
  const d = Math.random() < 0.5 ? bas : Math.round((bas + 0.1) * 10) / 10;
  const rac: ExposantComparer = { latex: `\\sqrt{${k}}`, valeur: r, carreLatex: `${k}` };
  const dec: ExposantComparer = { latex: decL(d), valeur: d, carreLatex: decL(Math.round(d * d * 100) / 100) };
  return d < r ? { petit: dec, grand: rac, genre: "carres" } : { petit: rac, grand: dec, genre: "carres" };
}

function comparer(): ExerciceComparer {
  const tirage = Math.random();
  const relation: Relation = tirage < 0.2 ? "=" : tirage < 0.6 ? "<" : ">";
  const croissante = Math.random() < 0.55;
  const base = parmi(croissante ? BASES_CROISSANTES : BASES_DECROISSANTES);
  if (relation === "=") {
    const [m, k] = parmi(EGAUX);
    const long: ExposantComparer = { latex: `\\sqrt{${m * m * k}}`, valeur: Math.sqrt(m * m * k), carreLatex: `${m * m * k}` };
    const court: ExposantComparer = { latex: `${m}\\sqrt{${k}}`, valeur: m * Math.sqrt(k), carreLatex: `${m * m * k}` };
    const [gauche, droite] = Math.random() < 0.5 ? [long, court] : [court, long];
    return { variante: "comparer", base, gauche, droite, genre: "egaux", m, k, relationExposants: "=", croissante, relation };
  }
  const { petit, grand, genre } = paireDistincte();
  // a^petit < a^grand si croissante : on place à gauche ce qui donne la relation tirée.
  const petitAGauche = (relation === "<") === croissante;
  const [gauche, droite] = petitAGauche ? [petit, grand] : [grand, petit];
  return { variante: "comparer", base, gauche, droite, genre, relationExposants: petitAGauche ? "<" : ">", croissante, relation };
}

function inverse(sousType?: SousTypeInverse): ExerciceInverse {
  const st: SousTypeInverse = sousType ?? parmi(["inverse", "produit", "quotient", "decimale"] as const);
  for (;;) {
    let a = parmi([2, 3, 5]);
    let i = 0;
    let j = 0;
    let p = 0;
    let m = 0;
    let c = 0;
    if (st === "inverse") {
      i = parmi([1, 2, 3]);
      p = entier(-2, 2);
      m = i;
      c = -p;
    } else if (st === "produit") {
      i = entier(1, 4);
      j = a === 5 ? 2 : parmi([2, 3]);
      m = j - i;
    } else if (st === "quotient") {
      j = a === 5 ? 2 : parmi([2, 3]);
      p = parmi([-3, -2, -1, 1, 2, 3]);
      m = j - 1;
      c = -p;
    } else {
      a = parmi([2, 5]);
      i = a === 2 ? parmi([1, 2, 3]) : parmi([1, 2]);
      j = a === 5 ? 2 : parmi([2, 3]);
      m = j - i;
    }
    if (m === 0) continue;
    const x0 = parmi([-2, -1, 1, 2, 3]);
    const e0 = m * x0 + c;
    if (!exposantPermis(a, e0)) continue;
    return { variante: "inverse", sousType: st, a, i, j, p, m, c, x0 };
  }
}

export function construireAvecVariante(id: string): ExercicePuissances {
  if (id === "comparer") return comparer();
  if (id === "inverse") return inverse();
  return simplifier();
}

export function genererExercicePuissances(): ExercicePuissances {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}

/** Pour les mesures : un sous-type précis. */
export const construireSimplifier = simplifier;
export const construireInverse = inverse;
