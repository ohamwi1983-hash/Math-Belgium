import type { ExerciceDerivabilite, PolyU, VerdictDerivabilite } from "../core5e/derivabilite";
import { deriveeEnA, enX, f, fa, limDroite, limGauche, limTauxDroite, limTauxGauche, unilaterale, verdict } from "../core5e/derivabilite";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { polyL } from "./ecrituresLimitesLotG";
import type { SpecRepere } from "./figureLotHDerivees";
import { COULEUR_REPERE, COULEUR_TANGENTE, repereSvg } from "./figureLotHDerivees";

/**
 * Couche C — textes et figure de `5gen75` « Dérivable ou non en a ? » : écriture de f, consignes,
 * champs, options du verdict, aides à deux niveaux, réponses. Source unique de l'écran, du papier et
 * du corrigé.
 */

type E = ExerciceDerivabilite;
export type PhaseDerivabilite = "continuite" | "gauche" | "droite" | "verdict" | "tangente";

export function phases(e: E): PhaseDerivabilite[] {
  const p: PhaseDerivabilite[] = unilaterale(e) ? ["continuite", "droite", "verdict"] : ["continuite", "gauche", "droite", "verdict"];
  if (verdict(e) === "derivable") p.push("tangente");
  return p;
}

// ============================================================================
// Écritures.
// ============================================================================

/** « x - 2 », « x + 3 », « x ». */
export const xMoinsA = (a: number): string => (a === 0 ? "x" : a > 0 ? `x-${a}` : `x+${-a}`);
/** « a + h » écrit avec la valeur de a : « 2+h », « -3+h », « h ». */
export const aPlusH = (a: number): string => (a === 0 ? "h" : `${a}+h`);

/** Second membre de f en LaTeX. */
export function fL(e: E): string {
  const a = e.a;
  if (e.variante === "racine") {
    const coef = e.c === 1 ? "" : e.c === -1 ? "-" : `${e.c}`;
    return `${coef}\\sqrt{${xMoinsA(a)}}${e.b === 0 ? "" : e.b > 0 ? `+${e.b}` : `${e.b}`}`;
  }
  if (e.variante === "absolue") {
    const coef = e.c === 1 ? "" : e.c === -1 ? "-" : `${e.c}`;
    const q = polyL(e.q);
    const suite = q === "0" ? "" : q.startsWith("-") ? q : `+${q}`;
    return `${coef}\\left|${xMoinsA(a)}\\right|${suite}`;
  }
  return `\\begin{cases}${polyL(enX(e.gauche, a))}&\\text{si }x\\leqslant ${a}\\\\${polyL(enX(e.droite, a))}&\\text{si }x>${a}\\end{cases}`;
}

export const definitionL = (e: E): string => `f(x)=${fL(e)}`;

export const limiteL = (v: number): string => (v === Infinity ? "+\\infty" : v === -Infinity ? "-\\infty" : `${v}`);
export const limiteT = (v: number): string => (v === Infinity ? "+∞" : v === -Infinity ? "−∞" : `${v}`.replace("-", "−"));

/** Taux simplifié en h (LaTeX), côté gauche ou droit. */
export function tauxL(e: E, cote: "g" | "d"): string {
  if (e.variante === "racine") return e.c === 1 ? "\\dfrac{1}{\\sqrt{h}}" : e.c === -1 ? "-\\dfrac{1}{\\sqrt{h}}" : `${e.c < 0 ? "-" : ""}\\dfrac{${Math.abs(e.c)}}{\\sqrt{h}}`;
  const p: PolyU = cote === "g" ? e.gauche : e.droite;
  const saut = cote === "g" ? 0 : e.droite[2] - e.gauche[2];
  let s = polyL([p[0], p[1]], "h");
  if (s === "0") s = "";
  if (saut !== 0) s += `${saut > 0 ? (s === "" ? "" : "+") : "-"}\\dfrac{${Math.abs(saut)}}{h}`;
  return s === "" ? "0" : s;
}

const LIM_G = "\\lim\\limits_{h\\to 0^-}";
const LIM_D = "\\lim\\limits_{h\\to 0^+}";
export const limG = LIM_G;
export const limD = LIM_D;
export const tauxGeneralL = (e: E): string => `\\dfrac{f(${aPlusH(e.a)})-f(${e.a})}{h}`;

export const PHRASES_VERDICT: Record<VerdictDerivabilite, string> = {
  derivable: "f est dérivable en a.",
  anguleux: "f n'est pas dérivable en a : point anguleux.",
  verticale: "f n'est pas dérivable en a : tangente verticale.",
  discontinue: "f n'est pas continue en a, donc pas dérivable en a.",
};
export const ORDRE_VERDICTS: VerdictDerivabilite[] = ["derivable", "anguleux", "verticale", "discontinue"];

/** Tangente (verdict dérivable) : y = f′(a)(x − a) + f(a), réduite. */
export function tangenteL(e: E): string {
  const m = deriveeEnA(e);
  const p = fa(e) - m * e.a;
  return `y=${polyL([m, p])}`;
}

// ============================================================================
// Figure (corrigé, étape du verdict).
// ============================================================================

export function figureVerdict(e: E): string {
  const a = e.a;
  const y0 = Math.round(fa(e));
  const s: SpecRepere = {
    xmin: a - 4,
    xmax: a + 4,
    ymin: y0 - 5,
    ymax: y0 + 5,
    sx: 1,
    sy: 1,
    carreau: 22,
    police: 10,
    courbes: [],
    points: [],
    titre: "C",
  };
  if (e.variante === "racine") {
    s.courbes.push({ f: (x) => f(e, x), de: a });
    s.segments = [{ x1: a, y1: y0 - 2.5, x2: a, y2: y0 + 2.5, couleur: COULEUR_TANGENTE, pointilles: true }];
  } else {
    s.courbes.push({ f: (x) => f(e, x), a });
    s.courbes.push({ f: (x) => f(e, x), de: a + 1e-6 });
    const mg = limTauxGauche(e);
    s.segments = [{ x1: a - 2, y1: fa(e) - 2 * mg, x2: a, y2: fa(e), couleur: COULEUR_TANGENTE, pointilles: true }];
    if (verdict(e) !== "discontinue") {
      const md = limTauxDroite(e);
      s.segments.push({ x1: a, y1: fa(e), x2: a + 2, y2: fa(e) + 2 * md, couleur: verdict(e) === "derivable" ? COULEUR_TANGENTE : COULEUR_REPERE, pointilles: true });
    } else s.points!.push({ x: a, y: limDroite(e), creux: true });
  }
  s.points!.push({ x: a, y: fa(e), label: "A", position: "no" });
  return repereSvg(s);
}

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseDerivabilite, string> = {
  continuite: "Continuité en a",
  gauche: "Nombre dérivé à gauche",
  droite: "Nombre dérivé à droite",
  verdict: "Verdict",
  tangente: "Tangente en a",
};

export const libelle = (_e: E, p: PhaseDerivabilite): string => LIBELLES[p];

export function consigneGenerale(e: E): Frag[] {
  const dom: Frag[] = e.variante === "racine" ? [tx(" (définie sur "), lx(`[${e.a}\\,;+\\infty\\mathclose{[}`), tx(")")] : [];
  return [tx("On considère la fonction f définie par "), lx(definitionL(e)), ...dom, tx(". Étudie la continuité puis la dérivabilité de f en "), lx(`a=${e.a}`), tx(".")];
}

export function consigne(e: E, p: PhaseDerivabilite): Frag[] {
  const a = e.a;
  if (p === "continuite") return unilaterale(e) ? [tx("Calcule "), lx(`f(${a})`), tx(" et la limite de f(x) quand x tend vers "), lx(`${a}`), tx(" par la droite (f n'est pas définie à gauche de "), lx(`${a}`), tx(").")] : [tx("Calcule "), lx(`f(${a})`), tx(", puis les limites de f(x) quand x tend vers "), lx(`${a}`), tx(" par la gauche et par la droite.")];
  if (p === "gauche") return [tx("Pour h < 0, simplifie le taux d'accroissement "), lx(tauxGeneralL(e)), tx(", puis calcule sa limite quand h tend vers 0 par la gauche.")];
  if (p === "droite") return [tx("Pour h > 0, simplifie le taux d'accroissement "), lx(tauxGeneralL(e)), tx(", puis calcule sa limite quand h tend vers 0 par la droite.")];
  if (p === "verdict") return [tx("Conclus : f est-elle dérivable en "), lx(`${a}`), tx(" ?")];
  return [tx("Écris une équation de la tangente à la courbe de f au point d'abscisse "), lx(`${a}`), tx(".")];
}

const champLimite = (cote: "g" | "d"): ChampEcran => ({ label: cote === "g" ? "Limite à gauche" : "Limite à droite", labelLatex: `${cote === "g" ? LIM_G : LIM_D}\\,\\dfrac{f(a+h)-f(a)}{h}=`, placeholder: "ex. : 3, −2 ou +∞", raccourcis: [{ libelle: "+∞", texte: "+∞" }, { libelle: "−∞", texte: "−∞" }] });

export function champs(e: E, p: PhaseDerivabilite): ChampEcran[] {
  const a = e.a;
  if (p === "continuite") {
    const fA: ChampEcran = { label: `f(${a})`, labelLatex: `f(${a})=`, placeholder: "ex. : −2" };
    const lg: ChampEcran = { label: "Limite à gauche", labelLatex: `\\lim\\limits_{x\\to ${a}^-}f(x)=`, placeholder: "ex. : 3" };
    const ld: ChampEcran = { label: "Limite à droite", labelLatex: `\\lim\\limits_{x\\to ${a}^+}f(x)=`, placeholder: "ex. : 3" };
    return unilaterale(e) ? [fA, ld] : [fA, lg, ld];
  }
  if (p === "gauche" || p === "droite") {
    const c = p === "gauche" ? "g" : "d";
    return [{ label: "Taux simplifié (en h)", labelLatex: "\\dfrac{f(a+h)-f(a)}{h}=", placeholder: "ex. : 2h + 3 ou 2/√h", raccourcis: [{ libelle: "h", texte: "h" }, { libelle: "√", texte: "√" }] }, champLimite(c)];
  }
  return [{ label: "Équation de la tangente", labelLatex: "y=", placeholder: "ex. : 3x − 1", raccourcis: [{ libelle: "x", texte: "x" }] }];
}

export function optionsVerdict(_e: E): OptionEcran[] {
  return ORDRE_VERDICTS.map((v) => ({ id: v, fragments: [tx(PHRASES_VERDICT[v])] }));
}

export function aide1(_e: E, p: PhaseDerivabilite): AideEcran {
  if (p === "continuite") return { texte: [tx("f est continue en a si les limites à gauche et à droite existent et valent toutes deux f(a). Pour chaque limite, utilise l'expression de f de CE côté-là de a.")] };
  if (p === "gauche" || p === "droite") return { texte: [tx("Le nombre dérivé à " + (p === "gauche" ? "gauche" : "droite") + " est la limite du taux d'accroissement quand h tend vers 0 " + (p === "gauche" ? "par valeurs négatives" : "par valeurs positives") + " :")], latex: `${p === "gauche" ? LIM_G : LIM_D}\\dfrac{f(a+h)-f(a)}{h}` };
  if (p === "verdict") return { texte: [tx("f est dérivable en a seulement si les nombres dérivés à gauche et à droite existent (finis) et sont ÉGAUX. Rappel : dérivable ⟹ continue ; continue ne suffit pas.")] };
  return { texte: [tx("La tangente en a passe par "), lx("(a\\,;f(a))"), tx(" et a pour pente f′(a) :")], latex: "y=f'(a)\\,(x-a)+f(a)" };
}

export function aide2(e: E, p: PhaseDerivabilite): AideEcran | null {
  const a = e.a;
  if (p === "continuite") {
    if (unilaterale(e)) return { texte: [tx("Remplace x par "), lx(`${a}`), tx(" sous la racine : "), lx(`\\sqrt{${a}-${a < 0 ? `(${a})` : a}}`), tx(" vaut 0.")] };
    if (e.variante === "absolue") return { texte: [tx("En "), lx(`x=${a}`), tx(", "), lx(`\\left|${xMoinsA(a)}\\right|=0`), tx(" : il reste la partie sans valeur absolue, des deux côtés.")] };
    return { texte: [tx("À gauche (et en "), lx(`x=${a}`), tx("), f(x) vaut "), lx(polyL(enX(e.gauche, a))), tx(" ; à droite, "), lx(polyL(enX(e.droite, a))), tx(". Remplace x par "), lx(`${a}`), tx(" dans chacun.")] };
  }
  if (p === "gauche" || p === "droite") {
    const cote = p === "gauche" ? "g" : "d";
    if (e.variante === "racine") return { texte: [tx("Ici "), lx(`f(${aPlusH(a)})-f(${a})=${e.c === 1 ? "" : e.c === -1 ? "-" : e.c}\\sqrt{h}`), tx(" ; divise par h, puis regarde ce que devient "), lx("\\dfrac{1}{\\sqrt{h}}"), tx(" quand h devient très petit.")] };
    if (e.variante === "absolue") return { texte: [tx(p === "gauche" ? "Pour h < 0, " : "Pour h > 0, "), lx(p === "gauche" ? "|h|=-h" : "|h|=h"), tx(" : remplace "), lx(`\\left|${aPlusH(a)}-${a < 0 ? `(${a})` : a}\\right|`), tx(" par "), lx(p === "gauche" ? "-h" : "h"), tx(", puis simplifie par h.")] };
    return { texte: [tx(`Remplace x par a + h dans le morceau de ${p === "gauche" ? "gauche" : "droite"}, retire f(${a}) = ${fa(e)}`.replace(/-(\d)/g, "−$1")), tx(", puis divise par h"), ...(cote === "d" && e.droite[2] !== e.gauche[2] ? [tx(" (attention : la valeur du morceau de droite en a n'est pas f(a))")] : []), tx(".")] };
  }
  if (p === "verdict") {
    const g = unilaterale(e) ? null : limTauxGauche(e);
    const d = limTauxDroite(e);
    return { texte: [tx("Compare ce que tu as trouvé : "), ...(g === null ? [] : [tx("à gauche "), lx(limiteL(g)), tx(", ")]), tx("à droite "), lx(limiteL(d)), tx(". Une limite infinie n'est pas un nombre dérivé.")] };
  }
  return { texte: [tx("Ici "), lx(`f(${a})=${fa(e)}`), tx(" et "), lx(`f'(${a})=${deriveeEnA(e)}`), tx(" : remplace, distribue, réduis.")] };
}

export function reponse(e: E, p: PhaseDerivabilite): Frag[] {
  const a = e.a;
  if (p === "continuite") {
    const base: Frag[] = [lx(`f(${a})=${fa(e)}`)];
    if (!unilaterale(e)) base.push(tx(" ; "), lx(`\\lim\\limits_{x\\to ${a}^-}f(x)=${limGauche(e)}`));
    base.push(tx(" ; "), lx(`\\lim\\limits_{x\\to ${a}^+}f(x)=${limDroite(e)}`));
    return base;
  }
  if (p === "gauche") return [lx(`\\dfrac{f(a+h)-f(a)}{h}=${tauxL(e, "g")}`), tx(" ; limite "), lx(limiteL(limTauxGauche(e)))];
  if (p === "droite") return [lx(`\\dfrac{f(a+h)-f(a)}{h}=${tauxL(e, "d")}`), tx(" ; limite "), lx(limiteL(limTauxDroite(e)))];
  if (p === "verdict") return [tx(PHRASES_VERDICT[verdict(e)])];
  return [lx(tangenteL(e))];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseDerivabilite): string {
  if (p === "tangente") return "Équation non reconnue : écris le second membre en x, par exemple 3x − 1. Cette saisie ne compte pas comme une tentative.";
  if (p === "gauche" || p === "droite") return "Saisie non reconnue : écris le taux en h (par exemple 2h + 3, 3 + 2/h ou 2/√h) et une limite (un nombre, +∞ ou −∞). Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre, par exemple −2 ou 3. Cette saisie ne compte pas comme une tentative.";
}
