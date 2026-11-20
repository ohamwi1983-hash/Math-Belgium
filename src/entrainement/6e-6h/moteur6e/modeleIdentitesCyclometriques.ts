import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import type { CoupleIdentite, ExerciceArcTrig, ExerciceLitteral, ExerciceTrigArc, Trig } from "../core6e/identitesCyclometriques.types";
import type { Frag } from "../ui6e/ecransExp.types";
import { lx, tx } from "../ui6e/ecransExp.types";
import type { Q, Rad } from "../ui6e/nombresRecip";
import { extraireCarre, piL, piLP, q, qL, qLi, qP, racineQ, radDiv, radL, radMul, radQ, radV, trigAngleL, trigExact } from "../ui6e/nombresRecip";

/**
 * Modèle de `6gen153` « Identités trig∘arc et arc∘trig » : valeurs exactes, verdicts, et lignes du
 * corrigé détaillé (une seule source pour l'écran, les aides, le papier et le corrigé).
 */

const t = tx;
const l = lx;

// ============================================================================
// Images des arcfonctions.
// ============================================================================

export const IMAGE_L: Record<Trig, string> = {
  sin: "\\left[-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\right]",
  cos: "\\left[0\\,;\\,\\pi\\right]",
  tan: "\\mathopen{]}-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\mathclose{[}",
};

/** Bornes de l'image en douzièmes de π (et fermeture). */
const BORNES: Record<Trig, { g: number; d: number; ferme: boolean }> = {
  sin: { g: -6, d: 6, ferme: true },
  cos: { g: 0, d: 12, ferme: true },
  tan: { g: -6, d: 6, ferme: false },
};

export function dansImage(fn: Trig, k12: number): boolean {
  const b = BORNES[fn];
  return b.ferme ? k12 >= b.g && k12 <= b.d : k12 > b.g && k12 < b.d;
}

export const k12De = (e: ExerciceArcTrig): number => (e.n * 12) / e.d;
export const thetaL = (e: ExerciceArcTrig): string => piL(e.n, e.d);
export const arcL = (fn: Trig): string => `\\arc${fn}`;

/** Expression de l'énoncé : « \arcsin\left(\sin\dfrac{5\pi}{6}\right) ». */
export function expressionArcTrigL(e: ExerciceArcTrig): string {
  return `\\arc${e.fn}\\left(${trigAngleL(e.fn, e.n, e.d)}\\right)`;
}

/** Angle φ de l'image tel que f(φ) = f(θ), en douzièmes de π. */
export function phiK12(e: ExerciceArcTrig): number {
  const th = (e.n * Math.PI) / e.d;
  const v = e.fn === "sin" ? Math.asin(Math.sin(th)) : e.fn === "cos" ? Math.acos(Math.cos(th)) : Math.atan(Math.tan(th));
  return Math.round((v / Math.PI) * 12);
}

export const phiL = (e: ExerciceArcTrig): string => piL(phiK12(e), 12);
export const phiV = (e: ExerciceArcTrig): number => (phiK12(e) * Math.PI) / 12;

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** θ écrit au dénominateur commun avec la borne (« \dfrac{5\pi}{6} » ou « \dfrac{10\pi}{12} »). */
function thetaAuDenominateur(e: ExerciceArcTrig, kBorne: number): { th: string; bo: string; D: number } {
  const rb = q(kBorne, 12);
  const D = rb.n === 0 ? e.d : (rb.d * e.d) / pgcd(rb.d, e.d);
  const N = (e.n * D) / e.d;
  const ecrire = (n: number) => (n === 0 ? "0" : D === 1 ? (n === 1 ? "\\pi" : n === -1 ? "-\\pi" : `${n}\\pi`) : `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n) === 1 ? "" : Math.abs(n)}\\pi}{${D}}`);
  return { th: ecrire(N), bo: rb.n === 0 ? "0" : ecrire((rb.n * D) / rb.d), D };
}

const NOM_BORNE = (k: number): string => piL(k, 12);

/** Corrigé de l'écran 1 (arcTrig) : comparaison de θ aux bornes de l'image. */
export function lignesComparaison(e: ExerciceArcTrig): LigneCalcul[] {
  const k = k12De(e);
  const b = BORNES[e.fn];
  const lignes: LigneCalcul[] = [];
  const rel = (strict: boolean, sens: "<" | ">") => (sens === "<" ? (strict ? "<" : "\\leq ") : strict ? ">" : "\\geq ");
  const cote = (kb: number, sens: "<" | ">", vrai: boolean) => {
    const { th, bo, D } = thetaAuDenominateur(e, kb);
    const strictInterieur = !b.ferme;
    // vrai : θ du bon côté de la borne ; faux : du mauvais côté (inégalité inverse stricte)
    const r = vrai ? rel(strictInterieur, sens) : sens === "<" ? ">" : "<";
    const memeEcriture = th === thetaL(e) && bo === NOM_BORNE(kb);
    lignes.push(ligne(`${th}${r}${bo}`, memeEcriture ? (vrai ? "borne respectée" : "hors de l'image") : [t(`au dénominateur ${D} : `), l(`${NOM_BORNE(kb)}=${bo}`)]));
  };
  const okG = b.ferme ? k >= b.g : k > b.g;
  const okD = b.ferme ? k <= b.d : k < b.d;
  if (okG && okD) {
    cote(b.g, ">", true);
    cote(b.d, "<", true);
  } else if (!okD) cote(b.d, "<", false);
  else cote(b.g, ">", false);
  return lignes;
}

/** Corrigé de l'écran 2 (arcTrig) : valeur, angle de même f ramené dans l'image. */
export function lignesRamener(e: ExerciceArcTrig): { lignes: LigneCalcul[]; base: "theta" | "supplementaire" | "oppose" } {
  const k = k12De(e);
  const v = trigExact(e.fn, k)!;
  const phi = phiK12(e);
  const nom = e.fn === "sin" ? "sinus" : e.fn === "cos" ? "cosinus" : "tangente";
  const lignes: LigneCalcul[] = [ligne(`${trigAngleL(e.fn, e.n, e.d)}=${radL(v)}`, "valeur remarquable")];
  if (dansImage(e.fn, k)) {
    lignes.push(ligne(`${arcL(e.fn)}\\left(${radL(v)}\\right)=${thetaL(e)}`, [t("car "), l(thetaL(e)), t(` est dans l'image et son ${nom} vaut `), l(radL(v))]));
    return { lignes, base: "theta" };
  }
  const periode = e.fn === "tan" ? 12 : 24;
  let base: "theta" | "supplementaire" | "oppose" = "theta";
  let kb = k;
  if ((phi - k) % periode !== 0) {
    base = e.fn === "sin" ? "supplementaire" : "oppose";
    kb = e.fn === "sin" ? 12 - k : -k;
    const expr = e.fn === "sin" ? `\\pi-${piLP(e.n, e.d)}` : `-${piLP(e.n, e.d)}`;
    lignes.push(ligne(`${expr}=${piL(kb, 12)}`, e.fn === "sin" ? "angles supplémentaires : même sinus" : "angles opposés : même cosinus"));
  }
  const tours = (phi - kb) / periode;
  if (tours !== 0) {
    const pas = e.fn === "tan" ? Math.abs(tours) : 2 * Math.abs(tours);
    const pasL = pas === 1 ? "\\pi" : `${pas}\\pi`;
    const just = e.fn === "tan" ? `on ${tours < 0 ? "retire" : "ajoute"} ${pas === 1 ? "π" : `${pas}π`} : même tangente` : `on ${tours < 0 ? "retire" : "ajoute"} ${Math.abs(tours) === 1 ? "un tour" : `${Math.abs(tours)} tours`} : même ${nom}`;
    lignes.push(ligne(`${piL(kb, 12)}${tours < 0 ? "-" : "+"}${pasL}=${piL(phi, 12)}`, just));
  }
  const b = BORNES[e.fn];
  const r = b.ferme ? "\\leq " : "<";
  lignes.push(ligne(`${NOM_BORNE(b.g)}${r}${piL(phi, 12)}${r}${NOM_BORNE(b.d)}`, "dans l'image de l'arcfonction"));
  return { lignes, base };
}

// ============================================================================
// trig(arc a).
// ============================================================================

export function exterieure(c: CoupleIdentite): Trig {
  return c.split("_")[0] as Trig;
}
export function arcDe(c: CoupleIdentite): Trig {
  return c.split("_")[1].replace("arc", "") as Trig;
}

/** « \cos\left(\arcsin\left(-\dfrac{3}{5}\right)\right) ». */
export function expressionTrigArcL(e: ExerciceTrigArc): string {
  return `\\${exterieure(e.couple)}\\left(\\arc${arcDe(e.couple)}\\left(${qL(e.a)}\\right)\\right)`;
}

const unMoinsCarre = (a: Q): Q => q(a.d * a.d - a.n * a.n, a.d * a.d);
const unPlusCarre = (a: Q): Q => q(a.d * a.d + a.n * a.n, a.d * a.d);

/** Valeur exacte de g(arcf(a)). */
export function valeurTrigArc(e: ExerciceTrigArc): Rad {
  const a = e.a;
  switch (e.couple) {
    case "cos_arcsin":
    case "sin_arccos":
      return racineQ(unMoinsCarre(a));
    case "tan_arcsin":
      return radDiv(radQ(a), racineQ(unMoinsCarre(a)));
    case "tan_arccos":
      return radDiv(racineQ(unMoinsCarre(a)), radQ(a));
    case "sin_arctan":
      return radDiv(radQ(a), racineQ(unPlusCarre(a)));
    case "cos_arctan":
      return radDiv(radQ(q(1)), racineQ(unPlusCarre(a)));
  }
}

/** Le résultat est-il toujours positif (quel que soit le signe de a) ? */
export const toujoursPositif = (c: CoupleIdentite): boolean => c === "cos_arcsin" || c === "sin_arccos" || c === "cos_arctan";

export const alphaV = (e: ExerciceTrigArc): number => {
  const a = e.a.n / e.a.d;
  const f = arcDe(e.couple);
  return f === "sin" ? Math.asin(a) : f === "cos" ? Math.acos(a) : Math.atan(a);
};

/** √(n/d) simplifiée ligne à ligne (« =\dfrac{\sqrt{8}}{3} », « =\dfrac{2\sqrt{2}}{3} »). */
export function lignesRacineQ(x: Q): string[] {
  const out: string[] = [];
  const sn = extraireCarre(x.n);
  const sd = extraireCarre(x.d);
  const fin = radL(racineQ(x));
  if (sd.m === 1) {
    // dénominateur carré parfait
    const num = sn.m === 1 ? `${sn.k}` : `\\sqrt{${x.n}}`;
    if (sd.k === 1) {
      if (sn.m !== 1 && sn.k !== 1) out.push(`=${sn.k}\\sqrt{${sn.m}}`);
      else if (sn.m === 1) out.push(`=${sn.k}`);
    } else {
      out.push(`=\\dfrac{${num}}{${sd.k}}`);
      if (sn.m !== 1 && sn.k !== 1) out.push(`=\\dfrac{${sn.k}\\sqrt{${sn.m}}}{${sd.k}}`);
    }
  } else {
    // √(n/d) = √n/√d, puis dénominateur rendu rationnel
    const num = sn.m === 1 ? `${sn.k}` : `\\sqrt{${x.n}}`;
    out.push(`=\\dfrac{${num}}{\\sqrt{${x.d}}}`);
    out.push(`=\\dfrac{${num === "1" ? "" : num}\\sqrt{${x.d}}}{${x.d}}`);
  }
  if (out.length === 0 || out[out.length - 1] !== `=${fin}`) out.push(`=${fin}`);
  return sansDoublons(out);
}

function sansDoublons(t: string[]): string[] {
  return t.filter((x, i) => i === 0 || x !== t[i - 1]);
}

/** Quotient de deux nombres c·√r écrit ligne à ligne jusqu'à la forme simplifiée. */
export function lignesQuotient(num: Rad, den: Rad): string[] {
  const out: string[] = [`=\\dfrac{${radL(num, "\\frac")}}{${radL(den, "\\frac")}}`];
  const res = radDiv(num, den);
  if (num.r !== 1 || den.r !== 1) {
    // (c₁/c₂)·√r₁/√r₂
    const c = q(num.c.n * den.c.d, num.c.d * den.c.n);
    const s = c.n < 0 ? "-" : "";
    const A = Math.abs(c.n);
    const nu = num.r === 1 ? `${A}` : `${A === 1 ? "" : A}\\sqrt{${num.r}}`;
    const de = den.r === 1 ? `${c.d}` : `${c.d === 1 ? "" : c.d}\\sqrt{${den.r}}`;
    out.push(de === "1" ? `=${s}${nu}` : `=${s}\\dfrac{${nu}}{${de}}`);
    if (den.r !== 1) {
      const nu2 = `${A === 1 && num.r * den.r !== 1 ? "" : A}${num.r * den.r === 1 ? "" : `\\sqrt{${num.r * den.r}}`}`;
      out.push(`=${s}\\dfrac{${nu2}}{${c.d * den.r}}`);
    }
  }
  out.push(`=${radL(res)}`);
  return sansDoublons(out);
}

/** Corrigé de l'écran 1 (trigArc) : position de α et signe. */
export function lignesSigne(e: ExerciceTrigArc): LigneCalcul[] {
  const f = arcDe(e.couple);
  const g = exterieure(e.couple);
  const neg = e.a.n < 0;
  const L: LigneCalcul[] = [ligne(`\\alpha=\\arc${f}\\left(${qL(e.a)}\\right)`, "on nomme l'angle")];
  if (f === "sin") {
    L.push(ligne(neg ? "\\alpha<0" : "\\alpha>0", [t(neg ? "arcsin est croissante et " : "arcsin est croissante et "), l("\\arcsin 0=0"), t(", avec "), l(`${qL(e.a)}${neg ? "<" : ">"}0`)]));
    if (g === "cos") L.push(ligne("\\cos\\alpha>0", [t("le cosinus est positif sur "), l(IMAGE_L.sin)]));
    else L.push(ligne(neg ? "\\tan\\alpha<0" : "\\tan\\alpha>0", [t("sinus du signe de "), l("\\alpha"), t(", cosinus positif")]));
  } else if (f === "cos") {
    L.push(ligne(neg ? "\\alpha>\\dfrac{\\pi}{2}" : "\\alpha<\\dfrac{\\pi}{2}", [t("arccos est décroissante et "), l("\\arccos 0=\\dfrac{\\pi}{2}")]));
    if (g === "sin") L.push(ligne("\\sin\\alpha>0", [t("le sinus est positif sur "), l(IMAGE_L.cos)]));
    else L.push(ligne(neg ? "\\tan\\alpha<0" : "\\tan\\alpha>0", [t("sinus positif, cosinus "), l(`\\cos\\alpha=${qL(e.a)}`), t(neg ? " négatif" : " positif")]));
  } else {
    L.push(ligne(neg ? "\\alpha<0" : "\\alpha>0", [t("arctan est croissante et "), l("\\arctan 0=0")]));
    if (g === "cos") L.push(ligne("\\cos\\alpha>0", [t("le cosinus est positif sur "), l(IMAGE_L.tan)]));
    else L.push(ligne(neg ? "\\sin\\alpha<0" : "\\sin\\alpha>0", [t("le sinus a le signe de "), l("\\alpha"), t(" sur "), l(IMAGE_L.tan)]));
  }
  return L;
}

export const signePositif = (e: ExerciceTrigArc): boolean => radV(valeurTrigArc(e)) > 0;

/** Corrigé de l'écran 2 (trigArc) : identité, substitution, simplification. */
export function lignesValeur(e: ExerciceTrigArc): { utilise: Frag[]; lignes: LigneCalcul[] } {
  const f = arcDe(e.couple);
  const g = exterieure(e.couple);
  const a = e.a;
  const L: LigneCalcul[] = [];
  const racine = (nom: string, x: Q, just: Frag[]) => {
    L.push(ligne(`\\${nom}\\alpha=\\sqrt{${qL(x)}}`, just));
    for (const s of lignesRacineQ(x)) L.push(ligne(s));
  };
  if (f === "sin" || f === "cos") {
    const autre = f === "sin" ? "cos" : "sin";
    const x = unMoinsCarre(a);
    L.push(ligne(`\\${autre}^{2}\\alpha=1-\\${f}^{2}\\alpha`, [l("\\cos^{2}\\alpha+\\sin^{2}\\alpha=1")]));
    L.push(ligne(`=1-${qP(a)}^{2}`, [l(`\\${f}\\alpha=${qL(a)}`)]));
    L.push(ligne(`=1-${qL(q(a.n * a.n, a.d * a.d))}`));
    L.push(ligne(`=${qL(x)}`));
    racine(autre, x, [l(`\\${autre}\\alpha>0`), t(" sur "), l(IMAGE_L[f])]);
    const rac = racineQ(x);
    if (g === "tan") {
      const num = f === "sin" ? radQ(a) : rac;
      const den = f === "sin" ? rac : radQ(a);
      const [p, ...s] = lignesQuotient(num, den);
      L.push(ligne(`\\tan\\alpha=\\dfrac{\\sin\\alpha}{\\cos\\alpha}${p}`, "quotient"));
      for (const x2 of s) L.push(ligne(x2));
    }
    return { utilise: [t("Identité "), l("\\cos^{2}\\alpha+\\sin^{2}\\alpha=1"), t(` et signe de la racine fixé par l'image (cours, § 2)${g === "tan" ? ", puis " : "."}`), ...(g === "tan" ? [l("\\tan\\alpha=\\dfrac{\\sin\\alpha}{\\cos\\alpha}"), t(".")] : [])], lignes: L };
  }
  // arctan
  const x = q(a.d * a.d, a.d * a.d + a.n * a.n);
  L.push(ligne("\\cos^{2}\\alpha=\\dfrac{1}{1+\\tan^{2}\\alpha}", [l("1+\\tan^{2}\\alpha=\\dfrac{1}{\\cos^{2}\\alpha}")]));
  L.push(ligne(`=\\dfrac{1}{1+${qP(a)}^{2}}`, [l(`\\tan\\alpha=${qL(a)}`)]));
  const somme = unPlusCarre(a);
  if (a.d !== 1) L.push(ligne(`=\\dfrac{1}{1+${qLi(q(a.n * a.n, a.d * a.d))}}`));
  L.push(ligne(`=\\dfrac{1}{${qLi(somme)}}`));
  L.push(ligne(`=${qL(x)}`));
  racine("cos", x, [l("\\cos\\alpha>0"), t(" sur "), l(IMAGE_L.tan)]);
  const cosR = racineQ(x);
  if (g === "sin") {
    L.push(ligne(`\\sin\\alpha=\\tan\\alpha\\cdot\\cos\\alpha`, [l("\\tan\\alpha=\\dfrac{\\sin\\alpha}{\\cos\\alpha}")]));
    L.push(ligne(`=${qL(a)}\\cdot ${radL(cosR).startsWith("-") ? `\\left(${radL(cosR)}\\right)` : radL(cosR)}`));
    L.push(ligne(`=${radL(radMul(radQ(a), cosR))}`));
  }
  return {
    utilise: [t("Identité "), l("1+\\tan^{2}\\alpha=\\dfrac{1}{\\cos^{2}\\alpha}"), t(" et signe de la racine fixé par l'image (cours, § 2)"), ...(g === "sin" ? [t(", puis "), l("\\sin\\alpha=\\tan\\alpha\\cdot\\cos\\alpha"), t(".")] : [t(".")])],
    lignes: L.filter((x2, i) => i === 0 || x2.latex !== L[i - 1].latex),
  };
}

// ============================================================================
// Littéral : g(arcf(kx)).
// ============================================================================

export type IdDomaine = "ferme" | "ouvert" | "troue" | "R" | "k";

export function domaineCorrect(c: CoupleIdentite): IdDomaine {
  if (c === "tan_arcsin") return "ouvert";
  if (c === "tan_arccos") return "troue";
  if (c === "sin_arctan" || c === "cos_arctan") return "R";
  return "ferme";
}

export function domaineL(id: IdDomaine, k: number): string {
  const u = `\\dfrac{1}{${k}}`;
  switch (id) {
    case "ferme":
      return `\\left[-${u}\\,;\\,${u}\\right]`;
    case "ouvert":
      return `\\mathopen{]}-${u}\\,;\\,${u}\\mathclose{[}`;
    case "troue":
      return `\\left[-${u}\\,;\\,0\\right[\\,\\cup\\,\\left]0\\,;\\,${u}\\right]`;
    case "R":
      return "\\mathbb{R}";
    case "k":
      return `\\left[-${k}\\,;\\,${k}\\right]`;
  }
}

export const DOMAINES: IdDomaine[] = ["ferme", "ouvert", "troue", "R", "k"];

/** « \cos\left(\arcsin(3x)\right) ». */
export function expressionLitteraleL(e: ExerciceLitteral): string {
  return `\\${exterieure(e.couple)}\\left(\\arc${arcDe(e.couple)}(${e.k}x)\\right)`;
}

/** Forme simplifiée attendue (LaTeX). */
export function formeSimplifieeL(e: ExerciceLitteral): string {
  const k = e.k;
  const k2 = k * k;
  const moins = `\\sqrt{1-${k2}x^{2}}`;
  const plus = `\\sqrt{1+${k2}x^{2}}`;
  switch (e.couple) {
    case "cos_arcsin":
    case "sin_arccos":
      return moins;
    case "tan_arcsin":
      return `\\dfrac{${k}x}{${moins}}`;
    case "tan_arccos":
      return `\\dfrac{${moins}}{${k}x}`;
    case "sin_arctan":
      return `\\dfrac{${k}x}{${plus}}`;
    case "cos_arctan":
      return `\\dfrac{1}{${plus}}`;
  }
}

/** Fonction attendue (mêmes valeurs que la composée sur le domaine). */
export function fonctionAttendue(e: ExerciceLitteral): (x: number) => number {
  const k = e.k;
  switch (e.couple) {
    case "cos_arcsin":
    case "sin_arccos":
      return (x) => Math.sqrt(1 - k * k * x * x);
    case "tan_arcsin":
      return (x) => (k * x) / Math.sqrt(1 - k * k * x * x);
    case "tan_arccos":
      return (x) => Math.sqrt(1 - k * k * x * x) / (k * x);
    case "sin_arctan":
      return (x) => (k * x) / Math.sqrt(1 + k * k * x * x);
    case "cos_arctan":
      return (x) => 1 / Math.sqrt(1 + k * k * x * x);
  }
}

/** Points de contrôle dans le domaine. */
export function pointsControle(e: ExerciceLitteral): number[] {
  const id = domaineCorrect(e.couple);
  if (id === "R") return [-1.3, -0.4, 0.3, 0.9, 1.7];
  return [-0.83, -0.41, 0.27, 0.62, 0.9].map((u) => u / e.k);
}

/** Corrigé de l'écran 1 (littéral) : conditions d'existence. */
export function lignesDomaine(e: ExerciceLitteral): LigneCalcul[] {
  const k = e.k;
  const u = `\\dfrac{1}{${k}}`;
  const f = arcDe(e.couple);
  if (f === "tan") {
    return [ligne(`${k}x\\in\\mathbb{R}`, "arctan est définie sur ℝ"), ligne(`\\cos\\left(\\arctan(${k}x)\\right)>0`, [t("jamais nul : l'angle est dans "), l(IMAGE_L.tan)])];
  }
  const L: LigneCalcul[] = [ligne(`-1\\leq ${k}x\\leq 1`, `domaine de arc${f} : [−1 ; 1]`), ligne(`-${u}\\leq x\\leq ${u}`, `on divise par ${k} > 0`)];
  if (e.couple === "tan_arcsin") L.push(ligne(`\\cos\\left(\\arcsin(${k}x)\\right)\\neq 0\\iff ${k}x\\neq\\pm 1`, "le quotient de la tangente doit exister"), ligne(`x\\neq\\pm ${u}`, "bornes exclues"));
  if (e.couple === "tan_arccos") L.push(ligne(`\\cos\\left(\\arccos(${k}x)\\right)=${k}x\\neq 0`, "le quotient de la tangente doit exister"), ligne("x\\neq 0", "zéro exclu"));
  return L;
}

/** Corrigé de l'écran 2 (littéral). */
export function lignesSimplification(e: ExerciceLitteral): { utilise: Frag[]; lignes: LigneCalcul[] } {
  const k = e.k;
  const k2 = k * k;
  const f = arcDe(e.couple);
  const g = exterieure(e.couple);
  const L: LigneCalcul[] = [];
  if (f === "sin" || f === "cos") {
    const autre = f === "sin" ? "cos" : "sin";
    L.push(ligne(`\\${autre}^{2}\\alpha=1-\\${f}^{2}\\alpha`, [l("\\cos^{2}\\alpha+\\sin^{2}\\alpha=1")]));
    L.push(ligne(`=1-(${k}x)^{2}`, [l(`\\${f}\\alpha=${k}x`)]));
    L.push(ligne(`=1-${k2}x^{2}`, [t("le carré porte sur "), l(`${k}`), t(" aussi")]));
    L.push(ligne(`\\${autre}\\alpha=\\sqrt{1-${k2}x^{2}}`, [l(`\\${autre}\\alpha\\geq 0`), t(` sur ${f === "sin" ? "[−π/2 ; π/2]" : "[0 ; π]"}`)]));
    if (g === "tan") {
      L.push(ligne(`\\tan\\alpha=\\dfrac{\\sin\\alpha}{\\cos\\alpha}`, "quotient"));
      L.push(ligne(`=${formeSimplifieeL(e)}`));
    }
    return { utilise: [t("On pose "), l(`\\alpha=\\arc${f}(${k}x)`), t(", donc "), l(`\\${f}\\alpha=${k}x`), t(" ; identité "), l("\\cos^{2}\\alpha+\\sin^{2}\\alpha=1"), t(" et signe sur l'image (cours, § 2).")], lignes: L };
  }
  L.push(ligne("\\cos^{2}\\alpha=\\dfrac{1}{1+\\tan^{2}\\alpha}", [l("1+\\tan^{2}\\alpha=\\dfrac{1}{\\cos^{2}\\alpha}")]));
  L.push(ligne(`=\\dfrac{1}{1+(${k}x)^{2}}`, [l(`\\tan\\alpha=${k}x`)]));
  L.push(ligne(`=\\dfrac{1}{1+${k2}x^{2}}`));
  L.push(ligne(`\\cos\\alpha=\\sqrt{\\dfrac{1}{1+${k2}x^{2}}}`, [l("\\cos\\alpha>0"), t(" sur l'image de arctan")]));
  L.push(ligne(`=\\dfrac{1}{\\sqrt{1+${k2}x^{2}}}`));
  if (g === "sin") {
    L.push(ligne("\\sin\\alpha=\\tan\\alpha\\cdot\\cos\\alpha", [l("\\tan\\alpha=\\dfrac{\\sin\\alpha}{\\cos\\alpha}")]));
    L.push(ligne(`=${k}x\\cdot\\dfrac{1}{\\sqrt{1+${k2}x^{2}}}`));
    L.push(ligne(`=${formeSimplifieeL(e)}`));
  }
  return { utilise: [t("On pose "), l(`\\alpha=\\arctan(${k}x)`), t(", donc "), l(`\\tan\\alpha=${k}x`), t(" ; identité "), l("1+\\tan^{2}\\alpha=\\dfrac{1}{\\cos^{2}\\alpha}"), t(" (cours, § 2).")], lignes: L };
}
