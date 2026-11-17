import {
  argumentBrut,
  argumentZ,
  conjugueR3,
  cosZ,
  formeAlgebrique,
  moduleCarreFacteur,
  moduleZ,
  numerateurAlgebrique,
  partiesFacteur,
  r3,
  reduireDouziemes,
  sinZ,
  valeurDouziemeNumerique,
} from "../core6e/deuxEcrituresComplexe";
import type { ComplexeR3, ExerciceDeuxEcritures, Facteur, Fraction, NombreR3, ValeurDouzieme } from "../core6e/deuxEcrituresComplexe";
import type { PhaseDeuxEcritures } from "../moteur6e/typesDeuxEcritures";

/**
 * Couche C (6e) — textes de `6gen94` « Valeurs exactes par deux écritures d'un même complexe ».
 * SOURCE UNIQUE des consignes, aides et réponses attendues : l'écran, le récapitulatif et
 * l'adaptateur de feuilles (`generateurs6e/deuxEcrituresComplexe/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (section « Forme trigonométrique, module, argument ») : `z=a+bi`, `\bar{z}`
 * (ici `\overline{…}` sur une expression), `|z|`, `\arg(z)` dans `]−π ; π]`,
 * `z=r(\cos\theta+i\sin\theta)`, `1+i\sqrt{3}`, `\sqrt{3}-i`, `\dfrac{\pi}{3}`. Aides : phrase
 * terminée par « : » puis la formule, jamais la réponse finale.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  label: string;
  labelLatex?: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Briques d'écriture.
// ============================================================================

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

/** Nombre décimal français en LaTeX (« 0{,}966 », « −0{,}259 »). */
export function approxLatex(v: number, decimales = 3): string {
  const s = (Math.round(v * 10 ** decimales) / 10 ** decimales).toFixed(decimales).replace(/0+$/, "").replace(/\.$/, "");
  return (s === "-0" ? "0" : s).replace(".", "{,}");
}

/** Numérateur p + q√3 sans dénominateur, sans signe global (p, q non tous deux ≤ 0 sauf nul). */
function numerateurR3(p: number, q: number): string {
  const racine = (k: number) => `${Math.abs(k) === 1 ? "" : Math.abs(k)}\\sqrt{3}`;
  if (q === 0) return `${p}`;
  if (p === 0) return `${q < 0 ? "-" : ""}${racine(q)}`;
  if (q > 0) return `${racine(q)}${p > 0 ? "+" : "-"}${Math.abs(p)}`;
  if (p < 0) return `-${racine(q)}-${Math.abs(p)}`;
  return `${p}-${racine(q)}`;
}

/** (p + q√3)/d en LaTeX : \dfrac{\sqrt{3}+1}{4}, 1-\sqrt{3}, -\dfrac{\sqrt{3}+1}{2}, 2\sqrt{3}. */
export function r3Latex(x: NombreR3): string {
  const negatif = x.p <= 0 && x.q <= 0 && (x.p !== 0 || x.q !== 0);
  const p = negatif ? -x.p : x.p;
  const q = negatif ? -x.q : x.q;
  // Négatif à deux termes sans dénominateur : « -\sqrt{3}-1 » (jamais « -\sqrt{3}+1 », qui changerait la valeur).
  if (negatif && x.d === 1 && x.p !== 0 && x.q !== 0) return numerateurR3(x.p, x.q);
  const num = numerateurR3(p, q);
  const corps = x.d === 1 ? num : `\\dfrac{${num}}{${x.d}}`;
  return negatif ? `-${corps}` : corps;
}

function estNegatifR3(x: NombreR3): boolean {
  return x.p <= 0 && x.q <= 0 && (x.p !== 0 || x.q !== 0);
}

function oppose(x: NombreR3): NombreR3 {
  return r3(-x.p, -x.q, x.d);
}

/** Coefficient de i écrit devant i : « (\sqrt{3}+1)\,i », « \dfrac{\sqrt{3}-1}{4}\,i », « 2\sqrt{3}\,i », « i ». */
function coefficientDeI(x: NombreR3): string {
  if (x.d === 1 && x.q === 0 && Math.abs(x.p) === 1) return "i";
  if (x.d === 1 && x.p !== 0 && x.q !== 0) return `\\left(${r3Latex(x)}\\right)i`;
  return `${r3Latex(x)}\\,i`;
}

/** a + bi en LaTeX à partir de parties exactes (forme algébrique de z). */
export function complexeR3Latex(z: ComplexeR3): string {
  const re = z.re.p === 0 && z.re.q === 0 ? "" : r3Latex(z.re);
  if (z.im.p === 0 && z.im.q === 0) return re || "0";
  if (estNegatifR3(z.im)) return `${re}-${coefficientDeI(oppose(z.im))}`;
  return re ? `${re}+${coefficientDeI(z.im)}` : coefficientDeI(z.im);
}

/** Partie d'un facteur (un seul terme ±k ou ±k√3) en LaTeX : « 1 », « -2 », « \sqrt{3} », « -2\sqrt{3} ». */
function termeSimple(x: NombreR3): string {
  return r3Latex(x);
}

/** Facteur en LaTeX, à la manière du cours : 1+i, -2+2i, \sqrt{3}-i, 1+i\sqrt{3}, -2-2i\sqrt{3}. */
export function partiesLatex(z: ComplexeR3): string {
  const re = termeSimple(z.re);
  const imAbs = estNegatifR3(z.im) ? oppose(z.im) : z.im;
  const k = imAbs.q !== 0 ? imAbs.q : imAbs.p;
  const imCorps = imAbs.q !== 0 ? `${k === 1 ? "" : k}i\\sqrt{3}` : `${k === 1 ? "" : k}i`;
  return `${re}${estNegatifR3(z.im) ? "-" : "+"}${imCorps}`;
}

export function facteurLatex(f: Facteur): string {
  return partiesLatex(partiesFacteur(f));
}

export function conjugueLatex(f: Facteur): string {
  return partiesLatex(conjugueR3(partiesFacteur(f)));
}

/** z en LaTeX : (1+i)(\sqrt{3}+i) ou \dfrac{1+i}{\sqrt{3}+i}. */
export function zLatex(e: ExerciceDeuxEcritures): string {
  return e.variante === "produit" ? `(${facteurLatex(e.z1)})(${facteurLatex(e.z2)})` : `\\dfrac{${facteurLatex(e.z1)}}{${facteurLatex(e.z2)}}`;
}

/** Angle tπ/12 réduit : \dfrac{\pi}{12}, -\dfrac{5\pi}{12}, \dfrac{3\pi}{4}, \pi, 0. */
export function angleLatex(tDouziemes: number): string {
  if (tDouziemes === 0) return "0";
  const g = pgcd(tDouziemes, 12);
  const num = tDouziemes / g;
  const den = 12 / g;
  const signe = num < 0 ? "-" : "";
  const n = Math.abs(num);
  const piNum = n === 1 ? "\\pi" : `${n}\\pi`;
  return den === 1 ? `${signe}${piNum}` : `${signe}\\dfrac{${piNum}}{${den}}`;
}

/** Angle en douzièmes NON réduit : \dfrac{3\pi}{12}. */
function douziemesLatex(tDouziemes: number): string {
  if (tDouziemes === 0) return "0";
  const n = Math.abs(tDouziemes);
  return `${tDouziemes < 0 ? "-" : ""}\\dfrac{${n === 1 ? "" : n}\\pi}{12}`;
}

/** Angle entre parenthèses s'il est négatif (pour l'écrire après un signe). */
function angleParenthese(tDouziemes: number, ecriture: (x: number) => string = angleLatex): string {
  return tDouziemes < 0 ? `\\left(${ecriture(tDouziemes)}\\right)` : ecriture(tDouziemes);
}

/** cos θ ou sin θ : \cos\dfrac{\pi}{12}, \sin\left(-\dfrac{5\pi}{12}\right). */
export function trigLatex(f: "cos" | "sin", tDouziemes: number): string {
  return tDouziemes < 0 ? `\\${f}\\left(${angleLatex(tDouziemes)}\\right)` : `\\${f}${angleLatex(tDouziemes)}`;
}

/** k√2 : \sqrt{2}, 2\sqrt{2}, \dfrac{\sqrt{2}}{2}, \dfrac{\sqrt{2}}{4}. */
export function racine2Latex(k: Fraction): string {
  const num = k.num === 1 ? "\\sqrt{2}" : `${k.num}\\sqrt{2}`;
  return k.den === 1 ? num : `\\dfrac{${num}}{${k.den}}`;
}

/** Module d'un facteur : c√2 ou 2d. */
export function moduleFacteurLatex(f: Facteur): string {
  return f.famille === "quart" ? racine2Latex({ num: f.coef, den: 1 }) : `${2 * f.coef}`;
}

export function moduleZLatex(e: ExerciceDeuxEcritures): string {
  return racine2Latex(moduleZ(e));
}

/** (u√6 + v√2)/4 en LaTeX. */
export function douziemeLatex(x: ValeurDouzieme): string {
  if (x.u === 1 && x.v === 1) return "\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}";
  if (x.u === 1) return "\\dfrac{\\sqrt{6}-\\sqrt{2}}{4}";
  if (x.v === 1) return "\\dfrac{\\sqrt{2}-\\sqrt{6}}{4}";
  return "-\\dfrac{\\sqrt{6}+\\sqrt{2}}{4}";
}

/** Une partie au carré, avec parenthèses si besoin : 1^2, (-1)^2, (\sqrt{3})^2, (2\sqrt{3})^2. */
function carreLatex(x: NombreR3): string {
  const s = r3Latex(x);
  return /^\d+$/.test(s) ? `${s}^2` : `(${s})^2`;
}

/** |z_j| = \sqrt{a^2+b^2} = \sqrt{N} = module. */
export function calculModuleFacteurLatex(f: Facteur, nom: string): string {
  const p = partiesFacteur(f);
  const N = moduleCarreFacteur(f);
  const racineN = `\\sqrt{${N}}`;
  const fin = racineN === moduleFacteurLatex(f) ? racineN : `${racineN}=${moduleFacteurLatex(f)}`;
  return `|${nom}|=\\sqrt{${carreLatex(p.re)}+${carreLatex(p.im)}}=${fin}`;
}

/** cos θ_j = a/r et sin θ_j = b/r, valeurs du cercle trigonométrique. */
function cosSinFacteurLatex(f: Facteur): { cos: string; sin: string } {
  const valeurs: Record<number, { cos: string; sin: string }> = {
    3: { cos: "\\dfrac{\\sqrt{2}}{2}", sin: "\\dfrac{\\sqrt{2}}{2}" },
    9: { cos: "-\\dfrac{\\sqrt{2}}{2}", sin: "\\dfrac{\\sqrt{2}}{2}" },
    2: { cos: "\\dfrac{\\sqrt{3}}{2}", sin: "\\dfrac{1}{2}" },
    10: { cos: "-\\dfrac{\\sqrt{3}}{2}", sin: "\\dfrac{1}{2}" },
    4: { cos: "\\dfrac{1}{2}", sin: "\\dfrac{\\sqrt{3}}{2}" },
    8: { cos: "-\\dfrac{1}{2}", sin: "\\dfrac{\\sqrt{3}}{2}" },
  };
  const v = valeurs[Math.abs(f.t)];
  return f.t < 0 ? { cos: v.cos, sin: v.sin.startsWith("-") ? v.sin.slice(1) : `-${v.sin}` } : v;
}

/** cos θ_j = a/r = …, sin θ_j = b/r = …, donc θ_j = …. */
export function calculArgumentFacteurLatex(f: Facteur, indice: string): string {
  const p = partiesFacteur(f);
  const r = moduleFacteurLatex(f);
  const cs = cosSinFacteurLatex(f);
  const quotient = (x: NombreR3, valeur: string) => {
    const q = `\\dfrac{${r3Latex(x)}}{${r}}`;
    return q === valeur ? q : `${q}=${valeur}`;
  };
  return `\\cos\\theta_${indice}=${quotient(p.re, cs.cos)},\\ \\sin\\theta_${indice}=${quotient(p.im, cs.sin)}\\ \\Rightarrow\\ \\theta_${indice}=${angleLatex(f.t)}`;
}

/** |z| = |z₁|·|z₂| = … ou |z₁|/|z₂| = …. */
export function calculModuleZLatex(e: ExerciceDeuxEcritures): string {
  const m1 = moduleFacteurLatex(e.z1);
  const m2 = moduleFacteurLatex(e.z2);
  if (e.variante === "produit") return `|z|=|z_1|\\cdot|z_2|=${m1}\\cdot ${m2}=${moduleZLatex(e)}`;
  const quotient = `\\dfrac{${m1}}{${m2}}`;
  return `|z|=\\dfrac{|z_1|}{|z_2|}=${quotient === moduleZLatex(e) ? quotient : `${quotient}=${moduleZLatex(e)}`}`;
}

/** arg z = θ₁ ± θ₂ = … (au même dénominateur, puis réduit dans ]−π ; π] si besoin). */
export function calculArgumentZLatex(e: ExerciceDeuxEcritures): string {
  const op = e.variante === "produit" ? "+" : "-";
  const nomArg = e.variante === "produit" ? "\\arg z=\\theta_1+\\theta_2" : "\\arg z=\\theta_1-\\theta_2";
  const brut = argumentBrut(e);
  const morceaux = [`${nomArg}=${angleLatex(e.z1.t)}${op}${angleParenthese(e.z2.t)}`, `${douziemesLatex(e.z1.t)}${op}${angleParenthese(e.z2.t, douziemesLatex)}`];
  if (brut !== reduireDouziemes(brut)) {
    morceaux.push(douziemesLatex(brut));
    morceaux.push(`${douziemesLatex(brut)}${brut > 0 ? "-" : "+"}2\\pi`);
  }
  morceaux.push(angleLatex(argumentZ(e)));
  return morceaux.join("=");
}

export function formeAlgebriqueLatex(e: ExerciceDeuxEcritures): string {
  return complexeR3Latex(formeAlgebrique(e));
}

export function formeTrigonometriqueLatex(e: ExerciceDeuxEcritures): string {
  const th = argumentZ(e);
  return `${moduleZLatex(e)}\\left(${trigLatex("cos", th)}+i${trigLatex("sin", th)}\\right)`;
}

/** Développement du produit en quatre termes : ac + adi + bci + bd i². */
function quatreTermesLatex(a: ComplexeR3, b: ComplexeR3): string {
  const produit = (x: NombreR3, y: NombreR3) => r3(x.p * y.p + 3 * x.q * y.q, x.p * y.q + x.q * y.p, x.d * y.d);
  const termes = [
    { v: produit(a.re, b.re), s: "" },
    { v: produit(a.re, b.im), s: "i" },
    { v: produit(a.im, b.re), s: "i" },
    { v: produit(a.im, b.im), s: "i^2" },
  ];
  return termes
    .map(({ v, s }, i) => {
      const neg = estNegatifR3(v);
      const abs = neg ? oppose(v) : v;
      const coef = r3Latex(abs);
      const corps = s === "" ? coef : coef === "1" ? s : `${coef}${coef.includes("sqrt") ? "\\," : ""}${s}`;
      return `${neg ? "-" : i === 0 ? "" : "+"}${corps}`;
    })
    .join("");
}

/** Calcul de la forme algébrique (développement, ou conjugué puis division). */
export function calculAlgebriqueLatex(e: ExerciceDeuxEcritures): string {
  const a = partiesFacteur(e.z1);
  if (e.variante === "produit") {
    return `z=${zLatex(e)}=${quatreTermesLatex(a, partiesFacteur(e.z2))}=${formeAlgebriqueLatex(e)}`;
  }
  const conj = conjugueLatex(e.z2);
  return `z=\\dfrac{(${facteurLatex(e.z1)})(${conj})}{(${facteurLatex(e.z2)})(${conj})}=\\dfrac{${complexeR3Latex(numerateurAlgebrique(e))}}{${moduleCarreFacteur(e.z2)}}=${formeAlgebriqueLatex(e)}`;
}

/** cos θ = Re(z)/r = … ≈ … (même chose pour sin θ). */
export function calculIdentificationLatex(e: ExerciceDeuxEcritures, f: "cos" | "sin"): string {
  const v = f === "cos" ? cosZ(e) : sinZ(e);
  return `${trigLatex(f, argumentZ(e))}=\\dfrac{${f === "cos" ? "\\mathrm{Re}(z)" : "\\mathrm{Im}(z)"}}{r}=${quotientParModuleLatex(e, f)}=${douziemeLatex(v)}\\approx ${approxLatex(valeurDouziemeNumerique(v))}`;
}

/** Re(z)/r (ou Im(z)/r) en une seule fraction, avant de rendre le dénominateur rationnel : \dfrac{\sqrt{3}+1}{2\sqrt{2}}. */
export function quotientParModuleLatex(e: ExerciceDeuxEcritures, f: "cos" | "sin"): string {
  const z = formeAlgebrique(e);
  const x = f === "cos" ? z.re : z.im;
  const k = moduleZ(e);
  // (p + q√3)/d ÷ (num/den)√2 = (p·den + q·den·√3) / (d·num·√2)
  const P = x.p * k.den;
  const Q = x.q * k.den;
  const g = pgcd(pgcd(P, Q), x.d * k.num) || 1;
  const D = (x.d * k.num) / g;
  return `\\dfrac{${r3Latex(r3(P / g, Q / g, 1))}}{${D === 1 ? "" : D}\\sqrt{2}}`;
}

// ============================================================================
// Consignes.
// ============================================================================

const INTERVALLE = "\\mathopen{]}-\\pi\\,;\\pi\\mathclose{]}";

export function consigneGenerale(e: ExerciceDeuxEcritures): FragmentConsigne[] {
  return [
    t("On considère le nombre complexe "),
    l(`z=${zLatex(e)}`),
    t(". En l'écrivant de deux façons — sous forme algébrique, puis sous forme trigonométrique —, tu vas obtenir les valeurs exactes du cosinus et du sinus d'un angle qui n'est pas remarquable."),
  ];
}

export function libellePhase(phase: PhaseDeuxEcritures): string {
  switch (phase) {
    case "algebrique":
      return "Forme algébrique";
    case "facteurs":
      return "Module et argument des facteurs";
    case "trigo":
      return "Forme trigonométrique";
    case "identification":
      return "Identification";
  }
}

export function consigneEcran(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures): FragmentConsigne[] {
  const th = argumentZ(e);
  switch (phase) {
    case "algebrique":
      if (e.variante === "produit") return [t("Écris "), l("z"), t(" sous forme algébrique "), l("a+bi"), t(" : développe le produit, avec "), l("i^2=-1"), t(". Donne sa partie réelle et sa partie imaginaire exactes.")];
      return [t("Écris "), l("z"), t(" sous forme algébrique "), l("a+bi"), t(" : multiplie le numérateur et le dénominateur par le conjugué du dénominateur. Donne sa partie réelle et sa partie imaginaire exactes.")];
    case "facteurs":
      return [t("Calcule le module et un argument de chaque facteur, "), l(`z_1=${facteurLatex(e.z1)}`), t(" et "), l(`z_2=${facteurLatex(e.z2)}`), t(" (arguments en radians, dans "), l(INTERVALLE), t(" ou à "), l("2k\\pi"), t(" près).")];
    case "trigo":
      return [
        t("Déduis-en le module "),
        l("r"),
        t(" et un argument "),
        l("\\theta"),
        t(" de "),
        l(e.variante === "produit" ? "z=z_1z_2" : "z=\\dfrac{z_1}{z_2}"),
        t(" : c'est sa forme trigonométrique "),
        l("z=r(\\cos\\theta+i\\sin\\theta)"),
        t("."),
      ];
    case "identification":
      return [
        t("Les deux écritures désignent le même nombre : "),
        l(`${formeTrigonometriqueLatex(e)}=${formeAlgebriqueLatex(e)}`),
        t(". Identifie les parties réelles, puis les parties imaginaires, pour en déduire les valeurs exactes de "),
        l(trigLatex("cos", th)),
        t(" et de "),
        l(trigLatex("sin", th)),
        t("."),
      ];
  }
}

export function champsEcran(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures): ChampDef[] {
  const th = argumentZ(e);
  switch (phase) {
    case "algebrique":
      return [
        { label: "Re(z)", labelLatex: "\\mathrm{Re}(z)", placeholder: "valeur exacte, ex : (2 − √3)/3" },
        { label: "Im(z)", labelLatex: "\\mathrm{Im}(z)", placeholder: "valeur exacte, ex : 3√3 − 1" },
      ];
    case "facteurs":
      return [
        { label: "|z₁|", labelLatex: "|z_1|", placeholder: "ex : 3√2" },
        { label: "arg z₁", labelLatex: "\\arg z_1", placeholder: "en radians, ex : −2π/3" },
        { label: "|z₂|", labelLatex: "|z_2|", placeholder: "ex : 5" },
        { label: "arg z₂", labelLatex: "\\arg z_2", placeholder: "en radians, ex : π/2" },
      ];
    case "trigo":
      return [
        { label: "r = |z|", labelLatex: "r=|z|", placeholder: "valeur exacte, ex : √3/2" },
        { label: "θ = arg z", labelLatex: "\\theta=\\arg z", placeholder: "en radians, ex : −3π/4" },
      ];
    case "identification":
      return [
        { label: "cos θ", labelLatex: trigLatex("cos", th), placeholder: "valeur exacte, ex : (√5 − 1)/4" },
        { label: "sin θ", labelLatex: trigLatex("sin", th), placeholder: "valeur exacte, ex : (√5 + 1)/4" },
      ];
  }
}

// ============================================================================
// Réponses attendues (validation, récapitulatif, corrigé).
// ============================================================================

export function reponseFragments(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures): FragmentConsigne[] {
  switch (phase) {
    case "algebrique":
      return [l(calculAlgebriqueLatex(e))];
    case "facteurs":
      return [l(`|z_1|=${moduleFacteurLatex(e.z1)},\\ \\arg z_1=${angleLatex(e.z1.t)}`), t(" et "), l(`|z_2|=${moduleFacteurLatex(e.z2)},\\ \\arg z_2=${angleLatex(e.z2.t)}`)];
    case "trigo":
      return [l(`r=${moduleZLatex(e)},\\ \\theta=${angleLatex(argumentZ(e))}`), t(", donc "), l(`z=${formeTrigonometriqueLatex(e)}`)];
    case "identification":
      return [l(calculIdentificationLatex(e, "cos")), t(" et "), l(calculIdentificationLatex(e, "sin"))];
  }
}

export function reponseRecap(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures): string {
  const th = argumentZ(e);
  switch (phase) {
    case "algebrique":
      return `z=${formeAlgebriqueLatex(e)}`;
    case "facteurs":
      return `z_1=${moduleFacteurLatex(e.z1)}\\,e^{${angleExposant(e.z1.t)}},\\ z_2=${moduleFacteurLatex(e.z2)}\\,e^{${angleExposant(e.z2.t)}}`;
    case "trigo":
      return `z=${formeTrigonometriqueLatex(e)}`;
    case "identification":
      return `${trigLatex("cos", th)}=${douziemeLatex(cosZ(e))},\\ ${trigLatex("sin", th)}=${douziemeLatex(sinZ(e))}`;
  }
}

/** Exposant d'une forme exponentielle, à la manière du cours : i\pi/4, -3i\pi/4, 5i\pi/6. */
function angleExposant(tDouziemes: number): string {
  const g = pgcd(tDouziemes, 12);
  const num = tDouziemes / g;
  const den = 12 / g;
  const n = Math.abs(num);
  return `${num < 0 ? "-" : ""}${n === 1 ? "" : n}i\\pi${den === 1 ? "" : `/${den}`}`;
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

/** Plusieurs formules l'une sous l'autre (lisible à 390 px). */
function lignes(...formules: string[]): string {
  return `\\begin{gathered}${formules.join("\\\\")}\\end{gathered}`;
}

export function aideNiveau1(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures): AideAvecLatex {
  switch (phase) {
    case "algebrique":
      if (e.variante === "produit") return { texte: "Développe le produit terme à terme, en te souvenant que le carré de i vaut −1 :", latex: "(a+bi)(c+di)=ac+adi+bci+bd\\,i^2,\\qquad i^2=-1" };
      return { texte: "Multiplie le numérateur et le dénominateur par le conjugué du dénominateur ; le dénominateur devient alors réel :", latex: lignes("\\dfrac{z_1}{z_2}=\\dfrac{z_1\\,\\overline{z_2}}{z_2\\,\\overline{z_2}}", "(c+di)(c-di)=c^2+d^2") };
    case "facteurs":
      return { texte: "Le module et un argument d'un nombre complexe, à partir de sa partie réelle et de sa partie imaginaire :", latex: lignes("z=a+bi:\\quad r=\\sqrt{a^2+b^2}", "\\cos\\theta=\\dfrac{a}{r},\\quad \\sin\\theta=\\dfrac{b}{r}") };
    case "trigo":
      return e.variante === "produit"
        ? { texte: "Multiplier deux complexes multiplie leurs modules et additionne leurs arguments :", latex: lignes("|z_1z_2|=|z_1|\\cdot|z_2|", "\\arg(z_1z_2)=\\arg z_1+\\arg z_2") }
        : { texte: "Diviser deux complexes divise leurs modules et soustrait leurs arguments :", latex: lignes("\\left|\\dfrac{z_1}{z_2}\\right|=\\dfrac{|z_1|}{|z_2|}", "\\arg\\dfrac{z_1}{z_2}=\\arg z_1-\\arg z_2") };
    case "identification":
      return { texte: "Deux complexes égaux ont la même partie réelle et la même partie imaginaire :", latex: lignes("r(\\cos\\theta+i\\sin\\theta)=a+bi", "\\Longleftrightarrow\\ r\\cos\\theta=a\\ \\text{ et }\\ r\\sin\\theta=b") };
  }
}

export function aideNiveau2(e: ExerciceDeuxEcritures, phase: PhaseDeuxEcritures): AideAvecLatex {
  const th = argumentZ(e);
  switch (phase) {
    case "algebrique":
      if (e.variante === "produit") return { texte: "Les quatre produits ; il reste à remplacer le carré de i par −1, puis à regrouper :", latex: `z=${quatreTermesLatex(partiesFacteur(e.z1), partiesFacteur(e.z2))}` };
      return {
        texte: "Le dénominateur vaut le carré du module de z₂ ; il reste à développer le numérateur :",
        latex: `z=\\dfrac{(${facteurLatex(e.z1)})(${conjugueLatex(e.z2)})}{${moduleCarreFacteur(e.z2)}}`,
      };
    case "facteurs":
      return { texte: "Calcule d'abord les modules, puis cherche sur le cercle trigonométrique l'angle qui a le cosinus et le sinus obtenus (attention au quadrant) :", latex: lignes(`|z_1|=\\sqrt{${carreLatex(partiesFacteur(e.z1).re)}+${carreLatex(partiesFacteur(e.z1).im)}}`, `|z_2|=\\sqrt{${carreLatex(partiesFacteur(e.z2).re)}+${carreLatex(partiesFacteur(e.z2).im)}}`) };
    case "trigo": {
      const op = e.variante === "produit" ? "+" : "-";
      return { texte: "Avec les arguments de z₁ et de z₂ (mets les angles au même dénominateur, 12) :", latex: `\\arg z=${angleLatex(e.z1.t)}${op}${angleParenthese(e.z2.t)}` };
    }
    case "identification":
      return {
        texte: "Les deux égalités à résoudre ; divise par le module, puis rends le dénominateur rationnel (multiplie le numérateur et le dénominateur par la racine qui y reste) :",
        latex: lignes(`${moduleZLatex(e)}\\,${trigLatex("cos", th)}=${r3Latex(formeAlgebrique(e).re)}`, `${moduleZLatex(e)}\\,${trigLatex("sin", th)}=${r3Latex(formeAlgebrique(e).im)}`),
      };
  }
}
