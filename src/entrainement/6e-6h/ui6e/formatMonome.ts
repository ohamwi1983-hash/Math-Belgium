/**
 * Couche ui (6e) — formateur LaTeX commun aux générateurs de primitives (6gen23, 6gen24, 6gen25).
 * Audit du chapitre 4 de 6e : les écritures « 1x », « −1x⁴ », « x^{1} », « x^{0} », « 2·−1 », « 3/3 »,
 * « /1² », « x + 0 », « 0x » sortaient jusque dans 82 % des tirages de certaines variantes. Toute
 * écriture d'un coefficient, d'un monôme ou d'une constante additive passe désormais par ces
 * fonctions — jamais par une concaténation directe du nombre.
 *
 * Valeurs approchées : virgule décimale ({,}), « ≈ » seulement quand la valeur n'est pas exacte ;
 * `valeurExacteLatex` reconnaît les nombres de la forme r₀ + r₁·K (r₀, r₁ rationnels simples,
 * K ∈ {π, e, ln 2, ln 3, ln 5, √2, √3, √5}) pour afficher la forme exacte avant l'approchée.
 */

export function pgcdEntier(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible num/den en LaTeX (« 3 », « -\dfrac{2}{3} »). */
export function fractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const negatif = num < 0 !== den < 0;
  let n = Math.abs(num);
  let d = Math.abs(den);
  const g = pgcdEntier(n, d);
  n /= g;
  d /= g;
  const corps = d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`;
  return negatif ? `-${corps}` : corps;
}

/** Fraction en ligne (« 7/2 », « -1/3 ») — pour un exposant : x^{7/2}. */
export function fractionEnLigne(num: number, den: number): string {
  if (num === 0) return "0";
  const negatif = num < 0 !== den < 0;
  let n = Math.abs(num);
  let d = Math.abs(den);
  const g = pgcdEntier(n, d);
  n /= g;
  d /= g;
  const corps = d === 1 ? `${n}` : `${n}/${d}`;
  return negatif ? `-${corps}` : corps;
}

/** x élevé à un exposant rationnel num/den, simplifié (x^0 → "1", x^1 → "x", x^{7/2}). */
export function puissanceX(num: number, den: number = 1, variable: string = "x"): string {
  if (num === 0) return "1";
  const g = pgcdEntier(num, den);
  const n = num / g;
  const d = den / g;
  if (n === d) return variable;
  return `${variable}^{${fractionEnLigne(n, d)}}`;
}

/**
 * Monôme coef·corps (coef = num/den), avec son signe, en tête (`premier`) ou après un terme
 * (« + », « − » espacés). Coefficient ±1 omis, coefficient nul → chaîne vide. `corps` vide ou "1" :
 * le nombre seul est écrit. Coefficient fractionnaire : \dfrac{num}{den} devant le corps.
 */
export function monome(num: number, den: number, corps: string, premier: boolean): string {
  if (num === 0) return "";
  const negatif = num < 0 !== den < 0;
  const absNum = Math.abs(num);
  const absDen = Math.abs(den);
  const g = pgcdEntier(absNum, absDen);
  const n = absNum / g;
  const d = absDen / g;
  const sansCorps = corps === "" || corps === "1";
  let magnitude: string;
  if (sansCorps) magnitude = d === 1 ? `${n}` : `\\dfrac{${n}}{${d}}`;
  else if (n === 1 && d === 1) magnitude = corps;
  else if (d === 1) magnitude = `${n}${corps}`;
  else magnitude = `\\dfrac{${n}}{${d}}${corps}`;
  if (premier) return negatif ? `-${magnitude}` : magnitude;
  return negatif ? ` - ${magnitude}` : ` + ${magnitude}`;
}

/** Somme de monômes : chaque terme { num, den?, corps } ; les termes nuls disparaissent. */
export function sommeLatex(termes: { num: number; den?: number; corps: string }[]): string {
  let resultat = "";
  for (const t of termes) {
    const morceau = monome(t.num, t.den ?? 1, t.corps, resultat === "");
    resultat += morceau;
  }
  return resultat === "" ? "0" : resultat;
}

/** Polynôme en x à coefficients entiers, du plus haut degré au terme constant. */
export function polynomeLatex(coefficients: number[], variable: string = "x"): string {
  const degre = coefficients.length - 1;
  return sommeLatex(coefficients.map((c, i) => ({ num: c, corps: degre - i === 0 ? "" : puissanceX(degre - i, 1, variable) })));
}

/** « x+3 », « x-3 », « x » (constante nulle) — argument affine unitaire. */
export function xPlus(c: number, variable: string = "x"): string {
  if (c === 0) return variable;
  return c > 0 ? `${variable}+${c}` : `${variable}-${-c}`;
}

/** Coefficient devant un facteur : "" pour 1, "-" pour −1, sinon le nombre (ou la fraction). */
export function coefDevant(num: number, den: number = 1): string {
  const f = fractionLatex(num, den);
  if (f === "1") return "";
  if (f === "-1") return "-";
  return f;
}

/** Racine carrée simplifiée de l'entier n ≥ 0 : 16 → "4", 12 → "2\sqrt{3}", 7 → "\sqrt{7}". */
export function racineSimplifiee(n: number): string {
  if (n === 0) return "0";
  let exterieur = 1;
  let interieur = n;
  for (let k = Math.floor(Math.sqrt(n)); k >= 2; k--) {
    if (interieur % (k * k) === 0) {
      exterieur *= k;
      interieur /= k * k;
    }
  }
  if (interieur === 1) return `${exterieur}`;
  return exterieur === 1 ? `\\sqrt{${interieur}}` : `${exterieur}\\sqrt{${interieur}}`;
}

/** Nombre décimal arrondi à `decimales` chiffres, virgule décimale LaTeX ({,}), sans zéros inutiles. */
export function decimalLatex(v: number, decimales: number = 3): string {
  const p = Math.pow(10, decimales);
  let r = Math.round(v * p) / p;
  if (Object.is(r, -0) || r === 0) r = 0;
  return String(r).replace(".", "{,}");
}

/** Même chose en texte brut (virgule simple), pour un placeholder ou un texte hors LaTeX. */
export function decimalTexte(v: number, decimales: number = 3): string {
  const p = Math.pow(10, decimales);
  let r = Math.round(v * p) / p;
  if (Object.is(r, -0) || r === 0) r = 0;
  return String(r).replace("-", "−").replace(".", ",");
}

// ============================================================================
// Reconnaissance d'une valeur exacte.
// ============================================================================

const CONSTANTES: { latex: string; valeur: number }[] = [
  { latex: "\\pi", valeur: Math.PI },
  { latex: "e", valeur: Math.E },
  { latex: "\\ln(2)", valeur: Math.LN2 },
  { latex: "\\ln(3)", valeur: Math.log(3) },
  { latex: "\\ln(5)", valeur: Math.log(5) },
  { latex: "\\sqrt{2}", valeur: Math.SQRT2 },
  { latex: "\\sqrt{3}", valeur: Math.sqrt(3) },
  { latex: "\\sqrt{5}", valeur: Math.sqrt(5) },
];

const DENOMINATEURS = [1, 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 30, 36, 48, 60];

function rationnelProche(v: number, denMax: number = 60): [number, number] | null {
  for (const d of DENOMINATEURS) {
    if (d > denMax) break;
    const n = Math.round(v * d);
    if (Math.abs(n) <= 100000 && Math.abs(v - n / d) < 1e-9 * Math.max(1, Math.abs(v))) return [n, d];
  }
  return null;
}

const cacheExact = new Map<number, string | null>();

/**
 * Forme exacte LaTeX de v si v = r₀ + r₁·K (voir en-tête), sinon null. Résultat mis en cache
 * (appelé au rendu de chaque écran).
 */
export function valeurExacteLatex(v: number): string | null {
  if (!Number.isFinite(v)) return null;
  if (cacheExact.has(v)) return cacheExact.get(v) ?? null;
  let resultat: string | null = null;
  const r = rationnelProche(v);
  if (r) {
    resultat = fractionLatex(r[0], r[1]);
  } else {
    externe: for (const K of CONSTANTES) {
      for (const d1 of [1, 2, 3, 4, 6, 8, 12]) {
        for (let n1 = -72; n1 <= 72; n1++) {
          if (n1 === 0) continue;
          const r1 = n1 / d1;
          if (pgcdEntier(n1, d1) !== 1) continue;
          const reste = v - r1 * K.valeur;
          const r0 = Math.abs(reste) < 1e-9 ? ([0, 1] as [number, number]) : rationnelProche(reste, 24);
          if (r0) {
            resultat = combinaisonLatex(r0, [n1, d1], K.latex);
            break externe;
          }
        }
      }
    }
  }
  cacheExact.set(v, resultat);
  return resultat;
}

function combinaisonLatex(r0: [number, number], r1: [number, number], constante: string): string {
  const [n1, d1] = r1;
  // r₁·K : « \dfrac{\pi}{4} » plutôt que « \dfrac{1}{4}\pi » quand le numérateur vaut ±1.
  const g = pgcdEntier(n1, d1);
  const n = n1 / g;
  const d = d1 / g;
  const absN = Math.abs(n);
  let termeK: string;
  if (d === 1) termeK = absN === 1 ? constante : `${absN}${constante}`;
  else termeK = absN === 1 ? `\\dfrac{${constante}}{${d}}` : `\\dfrac{${absN}${constante}}{${d}}`;
  if (r0[0] === 0) return n < 0 ? `-${termeK}` : termeK;
  const debut = fractionLatex(r0[0], r0[1]);
  return n < 0 ? `${debut} - ${termeK}` : `${debut} + ${termeK}`;
}

/** « = forme exacte » puis « ≈ approchée » si la valeur n'est pas rationnelle ; « ≈ approchée » seule
 * si aucune forme exacte n'est reconnue. Renvoie ce qui suit le membre de gauche. */
export function egalExactPuisApproche(v: number, decimales: number = 3): string {
  const exacte = valeurExacteLatex(v);
  const approche = decimalLatex(v, decimales);
  if (exacte === null) return `\\approx ${approche}`;
  if (rationnelProche(v)) {
    if (!exacte.includes("\\dfrac")) return `= ${exacte}`;
    const p = Math.pow(10, decimales);
    const decimalExact = Math.abs(v * p - Math.round(v * p)) < 1e-9;
    return decimalExact ? `= ${exacte} = ${approche}` : `= ${exacte} \\approx ${approche}`;
  }
  return `= ${exacte} \\approx ${approche}`;
}
