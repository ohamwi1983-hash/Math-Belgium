import { fois, moins, plus, premiersTermes, puissance, rat, valeursOptions } from "../core5e/definirSuite";
import type {
  ExerciceDefinirSuite,
  ExerciceNature,
  ExerciceNotations,
  ExerciceRecurrence,
  FormuleExplicite,
  Q,
  RecurrenceLineaire,
  RelationRecurrence,
  Verdict,
} from "../core5e/definirSuite";
import type { PhaseDefinirSuite } from "../moteur5e/typesDefinirSuite";
import { nombresAttendus } from "../moteur5e/verificationDefinirSuite";
import type { TypeChamp } from "../moteur5e/verificationDefinirSuite";

/**
 * Couche C (5e) — textes de `5gen44` « Définir et reconnaître une suite ». SOURCE UNIQUE des
 * consignes, aides, options et réponses attendues : l'écran, le récapitulatif et l'adaptateur de
 * feuilles (`generateurs5e/definirSuite/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (chapitre 3 de 5e) : rang 1 = u₁, uₙ₊₁ (terme de rang n + 1), raison r
 * (arithmétique) ou q (géométrique), `\dfrac` pour les fractions, signe moins typographique, jamais
 * de prose dans le mode math. Aides : phrase terminée par « : » puis la formule, sans la réponse
 * finale (la formule n'est jamais l'expression complète substituée, qui serait acceptée telle
 * quelle par la vérification par équivalence).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };


export interface ChampDef {
  /** Texte brut (historique, aria-label). */
  label: string;
  labelLatex: string;
  placeholder: string;
  type: TypeChamp;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

export interface OptionChoix {
  id: Verdict;
  fragments: FragmentConsigne[];
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Nombres et monômes.
// ============================================================================

/** Rationnel en LaTeX : « 5 », « -7 », « \dfrac{7}{3} », « -\dfrac{7}{3} ». */
export function qLatex(x: Q): string {
  if (x.den === 1) return `${x.num}`;
  return `${x.num < 0 ? "-" : ""}\\dfrac{${Math.abs(x.num)}}{${x.den}}`;
}

/** Même chose, entre parenthèses s'il est négatif ou fractionnaire (facteur, base, soustraction). */
export function qParen(x: Q): string {
  return x.num < 0 || x.den !== 1 ? `\\left(${qLatex(x)}\\right)` : qLatex(x);
}

/** Rationnel en texte brut : « −7/3 ». */
export function qTexte(x: Q): string {
  const s = x.num < 0 ? "−" : "";
  return x.den === 1 ? `${s}${Math.abs(x.num)}` : `${s}${Math.abs(x.num)}/${x.den}`;
}

const INDICES = "₀₁₂₃₄₅₆₇₈₉";
export function indiceTexte(k: number): string {
  return String(k)
    .split("")
    .map((c) => INDICES[Number(c)])
    .join("");
}

const q = (x: number | Q): Q => (typeof x === "number" ? rat(x) : x);

interface Terme {
  coef: number | Q;
  /** Monôme LaTeX (« n », « n^{2} », « u_n », « 2^{n} »), vide pour une constante. */
  mono: string;
}

/** Somme de monômes, signes réglés, termes nuls omis (« 0 » si tout est nul). */
export function somme(termes: Terme[]): string {
  let s = "";
  for (const { coef, mono } of termes) {
    const c = q(coef);
    if (c.num === 0) continue;
    const negatif = c.num < 0;
    const abs = rat(Math.abs(c.num), c.den);
    let corps: string;
    if (mono === "") corps = qLatex(abs);
    else if (abs.num === 1 && abs.den === 1) corps = mono;
    else corps = `${qLatex(abs)}${/^[0-9(\\]/.test(mono) ? "\\cdot " : ""}${mono}`;
    if (s === "") s = negatif ? `-${corps}` : corps;
    else s += negatif ? `-${corps}` : `+${corps}`;
  }
  return s === "" ? "0" : s;
}

/** Facteur d'un produit : parenthèses sauf pour un monôme seul (« n », « 2n »). */
function facteur(expr: string): string {
  return /^-?\d*n$/.test(expr) ? expr : `\\left(${expr}\\right)`;
}

/** Base d'une puissance : parenthèses si négative ou fractionnaire. */
function base(p: Q): string {
  return qParen(p);
}

/** k·p^{expo} (k = 1 → p^{expo}, k = −1 → −p^{expo}). */
function produitPuissance(k: Q, p: Q, expo: string): string {
  const puis = `${base(p)}^{${expo}}`;
  if (k.num === k.den) return puis;
  if (k.num === -k.den) return `-${puis}`;
  return `${qLatex(k)}\\cdot ${puis}`;
}

function exposant(e: number, dec: number, decalageRang = 0): string {
  // Exposant e·(n + decalageRang) + dec, écrit simplement.
  const cst = e * decalageRang + dec;
  const lin = e === 1 ? "n" : e === -1 ? "-n" : `${e}n`;
  if (cst === 0) return lin;
  return `${lin}${cst > 0 ? "+" : "-"}${Math.abs(cst)}`;
}

// ============================================================================
// Formules explicites.
// ============================================================================

const lin = (a: number | Q, b: number | Q, v = "n"): string => somme([{ coef: a, mono: v }, { coef: b, mono: "" }]);
const poly2 = (a: number, b: number, c: number): string => somme([{ coef: a, mono: "n^{2}" }, { coef: b, mono: "n" }, { coef: c, mono: "" }]);

/** Membre de droite de uₙ = … */
export function latexFormule(f: FormuleExplicite): string {
  switch (f.type) {
    case "affine":
      return f.c === 1 ? lin(f.a, f.b) : `\\dfrac{${lin(f.a, f.b)}}{${f.c}}`;
    case "second-degre":
      return poly2(f.a, f.b, f.c);
    case "homographique":
      return `\\dfrac{${lin(f.a, f.b)}}{${lin(f.c, f.d)}}`;
    case "exponentielle":
      switch (f.ecriture) {
        case "produit":
        case "double":
          return produitPuissance(f.k, f.p, exposant(f.e, f.dec));
        case "quotient":
          return `\\dfrac{${base(f.p)}^{${exposant(f.e, f.dec)}}}{${f.k.den}}`;
        case "inverse":
          return `\\dfrac{${f.k.num}}{${base(f.p)}^{n}}`;
      }
      break;
    case "somme-expo":
      return somme([{ coef: 1, mono: `${f.p}^{n}` }, { coef: f.alpha, mono: "n" }, { coef: f.beta, mono: "" }]);
  }
  throw new Error("latexFormule : cas impossible");
}

/** Expression simplifiée de u_{n + decalage} (decalage = 1 : uₙ₊₁, −1 : uₙ₋₁) ou de u₂ₙ (`double`). */
export function latexDecale(f: FormuleExplicite, quoi: "suivant" | "precedent" | "double"): string {
  const h = quoi === "suivant" ? 1 : -1;
  switch (f.type) {
    case "affine": {
      const corps = quoi === "double" ? lin(2 * f.a, f.b) : lin(f.a, f.b + h * f.a);
      return f.c === 1 ? corps : `\\dfrac{${corps}}{${f.c}}`;
    }
    case "second-degre":
      if (quoi === "double") return poly2(4 * f.a, 2 * f.b, f.c);
      return poly2(f.a, 2 * h * f.a + f.b, f.a + h * f.b + f.c);
    case "homographique":
      if (quoi === "double") return `\\dfrac{${lin(2 * f.a, f.b)}}{${lin(2 * f.c, f.d)}}`;
      return `\\dfrac{${lin(f.a, f.b + h * f.a)}}{${lin(f.c, f.d + h * f.c)}}`;
    case "exponentielle": {
      // Même écriture que uₙ (produit, quotient, inverse) : seul l'exposant change.
      if (f.ecriture === "inverse") return `\\dfrac{${f.k.num}}{${base(f.p)}^{${quoi === "double" ? "2n" : exposant(1, 0, h)}}}`;
      const expo = quoi === "double" ? exposant(2 * f.e, f.dec) : exposant(f.e, f.dec, h);
      if (f.ecriture === "quotient") return `\\dfrac{${base(f.p)}^{${expo}}}{${f.k.den}}`;
      return produitPuissance(f.k, f.p, expo);
    }
    case "somme-expo":
      return somme([{ coef: 1, mono: `${f.p}^{${quoi === "double" ? "2n" : h > 0 ? "n+1" : "n-1"}}` }, { coef: quoi === "double" ? 2 * f.alpha : f.alpha, mono: "n" }, { coef: quoi === "double" ? f.beta : f.beta + h * f.alpha, mono: "" }]);
  }
}

/** uₙ₊₁ − uₙ simplifiée. */
export function latexDifferenceFormule(f: FormuleExplicite): string {
  switch (f.type) {
    case "affine":
      return qLatex(rat(f.a, f.c));
    case "second-degre":
      return lin(2 * f.a, f.a + f.b);
    case "homographique": {
      const num = f.a * f.d - f.b * f.c;
      const f1 = lin(f.c, f.d);
      const f2 = lin(f.c, f.c + f.d);
      return `${num < 0 ? "-" : ""}\\dfrac{${Math.abs(num)}}{${facteur(f1)}${facteur(f2)}}`;
    }
    case "exponentielle": {
      const qr = puissance(f.p, f.e);
      if (f.ecriture === "inverse") {
        // m/p^{n+1} − m/p^{n} = m(1 − p)/p^{n+1}.
        const c = f.k.num * (1 - f.p.num);
        return `${c < 0 ? "-" : ""}\\dfrac{${Math.abs(c)}}{${base(f.p)}^{n+1}}`;
      }
      return produitPuissance(fois(f.k, moins(qr, rat(1))), f.p, exposant(f.e, f.dec));
    }
    case "somme-expo":
      return somme([{ coef: f.p - 1, mono: `${f.p}^{n}` }, { coef: f.alpha, mono: "" }]);
  }
}

/** uₙ₊₁ / uₙ simplifié. */
export function latexQuotientFormule(f: FormuleExplicite): string {
  switch (f.type) {
    case "affine":
      return `\\dfrac{${lin(f.a, f.a + f.b)}}{${lin(f.a, f.b)}}`;
    case "second-degre":
      return `\\dfrac{${latexDecale(f, "suivant")}}{${poly2(f.a, f.b, f.c)}}`;
    case "homographique": {
      const dn = lin(f.c, f.d);
      const dn1 = lin(f.c, f.c + f.d);
      if (f.a === 0) return `\\dfrac{${dn}}{${dn1}}`;
      return `\\dfrac{${facteur(lin(f.a, f.a + f.b))}${facteur(dn)}}{${facteur(lin(f.a, f.b))}${facteur(dn1)}}`;
    }
    case "exponentielle":
      return qLatex(puissance(f.p, f.e));
    case "somme-expo":
      return `\\dfrac{${latexDecale(f, "suivant")}}{${latexFormule(f)}}`;
  }
}

/**
 * f écrite avec `arg` à la place de n, sans rien calculer ni développer : une valeur p (aide
 * « remplace n par p », corrigé de uₚ) ou une expression « n+1 », « n-1 », « 2n » (corrigé de uₙ₊₁,
 * uₙ₋₁, u₂ₙ). Le résultat est l'écriture « substituée », jamais la forme simplifiée.
 */
export function substitutionLatex(f: FormuleExplicite, arg: number | "n+1" | "n-1" | "2n"): string {
  const xProd = typeof arg === "number" ? `${arg}` : arg === "2n" ? "2n" : `(${arg})`;
  const xPow = typeof arg === "number" ? `${arg}` : `(${arg})`;
  const prod = (c: number, x: string) => (c === 1 ? x : c === -1 ? `-${x}` : /^\d/.test(x) ? `${c}\\times ${x}` : `${c}${x}`);
  const ajoute = (s: string, c: number, x: string) => (c === 0 ? s : s === "" ? prod(c, x) : c < 0 ? `${s}-${prod(-c, x)}` : `${s}+${prod(c, x)}`);
  const cst = (s: string, c: number) => (c === 0 ? s : s === "" ? `${c}` : `${s}${c < 0 ? "-" : "+"}${Math.abs(c)}`);
  const affine = (a: number, b: number) => cst(ajoute("", a, xProd), b);
  switch (f.type) {
    case "affine":
      return f.c === 1 ? affine(f.a, f.b) : `\\dfrac{${affine(f.a, f.b)}}{${f.c}}`;
    case "second-degre":
      return cst(ajoute(ajoute("", f.a, `${xPow}^{2}`), f.b, xProd), f.c);
    case "homographique":
      return `\\dfrac{${affine(f.a, f.b)}}{${affine(f.c, f.d)}}`;
    case "exponentielle": {
      const expo = typeof arg === "number" ? `${f.e * arg + f.dec}` : arg === "2n" ? exposant(2 * f.e, f.dec) : exposant(f.e, f.dec, arg === "n+1" ? 1 : -1);
      if (typeof arg !== "number") return produitPuissance(f.k, f.p, expo);
      const puis = `${base(f.p)}^{${expo}}`;
      if (f.k.num === f.k.den) return puis;
      if (f.k.num === -f.k.den) return `-${puis}`;
      return `${qLatex(f.k)}\\times ${puis}`;
    }
    case "somme-expo": {
      const expo = typeof arg === "number" ? `${arg}` : arg;
      return cst(ajoute(`${f.p}^{${expo}}`, f.alpha, xProd), f.beta);
    }
  }
}

/** Calcul intermédiaire (puissance, produit) de l'aide 2 de l'écran « terme ». */
function intermediaireTerme(f: FormuleExplicite, p: number): string | undefined {
  switch (f.type) {
    case "affine":
      return `${f.a}\\times ${p}=${f.a * p}`;
    case "second-degre":
      return `${p}^{2}=${p * p}`;
    case "homographique":
      return `${f.c === 1 ? `${p}` : `${f.c}\\times ${p}`}+${f.d}=${f.c * p + f.d}`;
    case "exponentielle":
      return `${base(f.p)}^{${p}}=${qLatex(puissance(f.p, p))}`;
    case "somme-expo":
      return `${f.p}^{${p}}=${Math.pow(f.p, p)}`;
  }
}

// ============================================================================
// Récurrences.
// ============================================================================

/** Produit « coef × uₙ » : symbole (`u_n`) ou valeur (« 2\times 3 »). */
function fu(coef: number, u: string | Q): string {
  if (typeof u === "string") return coef === 1 ? u : coef === -1 ? `-${u}` : `${coef}${u}`;
  // Parenthèses seulement autour d'un nombre négatif (une fraction positive se lit sans ambiguïté).
  const v = u.num < 0 ? qParen(u) : qLatex(u);
  if (coef === 1) return v;
  if (coef === -1) return `-${qParen(u)}`;
  return `${coef}\\times ${v}`;
}

function plusCst(s: string, c: number): string {
  return c === 0 ? s : `${s}${c < 0 ? "-" : "+"}${Math.abs(c)}`;
}

/** Membre de droite de uₙ₊₁ = g(uₙ), avec uₙ symbolique ou remplacé par une valeur. */
export function latexRelation(g: RelationRecurrence, u: string | Q = "u_n"): string {
  const U = typeof u === "string" ? u : qParen(u);
  if (g.type === "carre") return plusCst(`${U}^{2}`, g.c);
  const num = g.alpha === 0 ? `${g.beta}` : plusCst(fu(g.alpha, u), g.beta);
  return `\\dfrac{${num}}{${denominateurRelation(g, u)}}`;
}

/** Dénominateur de la relation homographique, uₙ symbolique ou remplacé par une valeur. */
function denominateurRelation(g: Extract<RelationRecurrence, { type: "homographique" }>, u: string | Q): string {
  const U = typeof u === "string" ? u : qParen(u);
  if (g.style === "inverse") return `${g.delta}-${U}`;
  if (g.delta === 0) return fu(g.gamma, u);
  if (g.style === "quotient") return `1+${fu(g.gamma, u)}`;
  return plusCst(fu(g.gamma, u), g.delta);
}

/** Calcul intermédiaire (dénominateur ou carré) de l'aide 2 d'un écran de récurrence. */
function intermediaireRecurrence(g: RelationRecurrence, u: Q): string {
  if (g.type === "carre") return `${qParen(u)}^{2}=${qLatex(fois(u, u))}`;
  const den = plus(fois(rat(g.gamma), u), rat(g.delta));
  return `${denominateurRelation(g, u)}=${qLatex(den)}`;
}

/** Membre de droite de uₙ₊₁ = A·uₙ + B·n + C, dans l'écriture du `style`. */
export function latexRecurrenceLineaire(g: RecurrenceLineaire): string {
  const A = g.A;
  switch (g.style) {
    case "somme":
      return plusCst("u_n", g.C);
    case "somme-inversee":
      return `${g.C}+u_n`;
    case "deguisee-arith":
      return `2\\left(${plusCst("u_n", g.h ?? 0)}\\right)-u_n`;
    case "produit":
      return fu(A.num, "u_n");
    case "quotient":
      return `${A.num < 0 ? "-" : ""}\\dfrac{u_n}{${A.den}}`;
    case "fraction":
      return `\\dfrac{${A.num}u_n}{${A.den}}`;
    case "deguisee-geom":
      return `u_n+${fu(g.h ?? 1, "u_n")}`;
    case "affine": {
      const tete = A.den === 1 ? fu(A.num, "u_n") : `${A.num < 0 ? "-" : ""}\\dfrac{u_n}{${A.den}}`;
      return plusCst(tete, g.C);
    }
    case "rang":
      return somme([{ coef: 1, mono: "u_n" }, { coef: g.B, mono: "n" }, { coef: g.C, mono: "" }]);
  }
}

/** uₙ₊₁ − uₙ simplifiée : (A − 1)·uₙ + B·n + C. */
export function latexDifferenceRecurrence(g: RecurrenceLineaire): string {
  return somme([{ coef: moins(g.A, rat(1)), mono: "u_n" }, { coef: g.B, mono: "n" }, { coef: g.C, mono: "" }]);
}

/** uₙ₊₁ / uₙ simplifié : A + (B·n + C)/uₙ. */
export function latexQuotientRecurrence(g: RecurrenceLineaire): string {
  const A = qLatex(g.A);
  if (g.B === 0 && g.C === 0) return A;
  const numerateur = somme([{ coef: g.B, mono: "n" }, { coef: g.C, mono: "" }]);
  const seulNegatif = (g.B === 0 || g.C === 0) && numerateur.startsWith("-");
  return seulNegatif ? `${A}-\\dfrac{${numerateur.slice(1)}}{u_n}` : `${A}+\\dfrac{${numerateur}}{u_n}`;
}

// ============================================================================
// Énoncés.
// ============================================================================

function phraseExplicite(f: FormuleExplicite): FragmentConsigne[] {
  return [t("On considère la suite "), l("(u_n)"), t(" définie, pour tout entier "), l("n\\geq 1"), t(", par "), l(`u_n=${latexFormule(f)}`), t(".")];
}

function phraseRecurrence(u1: Q, relation: string): FragmentConsigne[] {
  return [t("La suite "), l("(u_n)"), t(" est définie par "), l(`u_1=${qLatex(u1)}`), t(" et, pour tout entier "), l("n\\geq 1"), t(", par "), l(`u_{n+1}=${relation}`), t(".")];
}

export function listeTermesFragments(termes: Q[]): FragmentConsigne[] {
  const out: FragmentConsigne[] = [];
  termes.forEach((x, i) => {
    if (i > 0) out.push(t(" ; "));
    // Groupe `{…}` : KaTeX ne coupe jamais la ligne entre « u₅ = » et sa valeur.
    out.push(l(`{u_{${i + 1}}=${qLatex(x)}}`));
  });
  return out;
}

const QUESTION_NATURE = " Est-elle arithmétique, géométrique, ou ni l'une ni l'autre ?";

export function consigneGenerale(e: ExerciceDefinirSuite): FragmentConsigne[] {
  switch (e.variante) {
    case "notations":
      return phraseExplicite(e.f);
    case "recurrence":
      return phraseRecurrence(e.u1, latexRelation(e.g));
    case "nature-formule":
      return [...phraseExplicite(e.f), t(QUESTION_NATURE)];
    case "nature-recurrence":
      return [...phraseRecurrence(e.u1, latexRecurrenceLineaire(e.g)), t(QUESTION_NATURE)];
    case "nature-termes":
      return [
        t(`Voici les ${e.termes.length} premiers termes d'une suite `),
        l("(u_n)"),
        t(" : "),
        ...listeTermesFragments(e.termes),
        t(". Sont-ils compatibles avec une suite arithmétique, une suite géométrique, ou aucune des deux ?"),
      ];
  }
}

/** Indice LaTeX du deuxième terme demandé en `notations`. */
export function indiceAutre(e: ExerciceNotations): string {
  return e.autre === "double" ? "2n" : "n-1";
}

export function consigneEcran(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): FragmentConsigne[] {
  switch (phase) {
    case "suivant":
      return [t("Exprime "), l("u_{n+1}"), t(" en fonction de "), l("n"), t(", sous forme simplifiée.")];
    case "autre":
      if (e.variante !== "notations") return [];
      return e.autre === "double"
        ? [t("Exprime "), l("u_{2n}"), t(" en fonction de "), l("n"), t(", sous forme simplifiée.")]
        : [t("Exprime "), l("u_{n-1}"), t(" en fonction de "), l("n"), t(" (pour "), l("n\\geq 2"), t("), sous forme simplifiée.")];
    case "terme":
      return e.variante === "notations" ? [t("Calcule "), l(`u_{${e.p}}`), t(" (valeur exacte).")] : [];
    case "terme2":
    case "terme3":
    case "terme4": {
      const k = Number(phase.slice(-1));
      return [t("Calcule "), l(`u_{${k}}`), t(` (valeur exacte : une fraction est acceptée).`)];
    }
    case "difference":
      return e.variante === "nature-recurrence"
        ? [t("Exprime "), l("u_{n+1}-u_n"), t(" en fonction de "), l("u_n"), t(" (et de "), l("n"), t(" si besoin), sous forme simplifiée. Au clavier, écris u pour "), l("u_n"), t(".")]
        : [t("Calcule "), l("u_{n+1}-u_n"), t(" en fonction de "), l("n"), t(", sous forme simplifiée.")];
    case "quotient":
      return e.variante === "nature-recurrence"
        ? [t("Exprime "), l("\\dfrac{u_{n+1}}{u_n}"), t(" en fonction de "), l("u_n"), t(" (et de "), l("n"), t(" si besoin), sous forme simplifiée. Au clavier, écris u pour "), l("u_n"), t(".")]
        : [t("Calcule "), l("\\dfrac{u_{n+1}}{u_n}"), t(" en fonction de "), l("n"), t(", sous forme simplifiée.")];
    case "ecarts":
      return [t("Calcule les écarts entre deux termes consécutifs : chaque terme MOINS le précédent.")];
    case "rapports":
      return [t("Calcule les rapports entre deux termes consécutifs : chaque terme DIVISÉ par le précédent (valeurs exactes).")];
    case "verdict":
      return e.variante === "nature-termes"
        ? [t("Conclus : ces termes sont-ils compatibles avec une suite arithmétique, une suite géométrique, ou aucune des deux ?")]
        : [t("Conclus : quelle est la nature de la suite "), l("(u_n)"), t(" ?")];
  }
}

/** Titre court de l'écran (puces, historique, récapitulatif). */
export function libellePhase(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): string {
  switch (phase) {
    case "suivant":
      return "uₙ₊₁";
    case "autre":
      return e.variante === "notations" && e.autre === "double" ? "u₂ₙ" : "uₙ₋₁";
    case "terme":
      return e.variante === "notations" ? `u${indiceTexte(e.p)}` : "Terme";
    case "terme2":
      return "u₂";
    case "terme3":
      return "u₃";
    case "terme4":
      return "u₄";
    case "difference":
      return "uₙ₊₁ − uₙ";
    case "quotient":
      return "uₙ₊₁ / uₙ";
    case "ecarts":
      return "Écarts";
    case "rapports":
      return "Rapports";
    case "verdict":
      return "Conclusion";
  }
}

// ============================================================================
// Champs.
// ============================================================================

const PH_N = "ex. : 3n + 7";
const PH_U = "ex. : 2u + 1 (u pour uₙ)";
const PH_NOMBRE = "ex. : 12 ou −7/3";

export function champsEcran(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): ChampDef[] {
  const termes = e.variante === "nature-termes" ? e.termes : [];
  switch (phase) {
    case "suivant":
      return [{ label: "uₙ₊₁ =", labelLatex: "u_{n+1}=", placeholder: PH_N, type: "n" }];
    case "autre": {
      const double = e.variante === "notations" && e.autre === "double";
      return [{ label: double ? "u₂ₙ =" : "uₙ₋₁ =", labelLatex: double ? "u_{2n}=" : "u_{n-1}=", placeholder: PH_N, type: "n" }];
    }
    case "terme": {
      const p = e.variante === "notations" ? e.p : 0;
      return [{ label: `u${indiceTexte(p)} =`, labelLatex: `u_{${p}}=`, placeholder: PH_NOMBRE, type: "nombre" }];
    }
    case "terme2":
    case "terme3":
    case "terme4": {
      const k = Number(phase.slice(-1));
      return [{ label: `u${indiceTexte(k)} =`, labelLatex: `u_{${k}}=`, placeholder: PH_NOMBRE, type: "nombre" }];
    }
    case "difference":
      return [{ label: "uₙ₊₁ − uₙ =", labelLatex: "u_{n+1}-u_n=", placeholder: e.variante === "nature-recurrence" ? PH_U : PH_N, type: e.variante === "nature-recurrence" ? "un" : "n" }];
    case "quotient":
      return [{ label: "uₙ₊₁ / uₙ =", labelLatex: "\\dfrac{u_{n+1}}{u_n}=", placeholder: e.variante === "nature-recurrence" ? PH_U : "ex. : (n + 2)/(n + 1)", type: e.variante === "nature-recurrence" ? "un" : "n" }];
    case "ecarts":
      return termes.slice(1).map((_, i) => ({ label: `u${indiceTexte(i + 2)} − u${indiceTexte(i + 1)} =`, labelLatex: `u_{${i + 2}}-u_{${i + 1}}=`, placeholder: "ex. : −4", type: "nombre" as const }));
    case "rapports":
      return termes.slice(1).map((_, i) => ({ label: `u${indiceTexte(i + 2)} / u${indiceTexte(i + 1)} =`, labelLatex: `\\dfrac{u_{${i + 2}}}{u_{${i + 1}}}=`, placeholder: "ex. : 3 ou 5/2", type: "nombre" as const }));
    case "verdict":
      return [];
  }
}

// ============================================================================
// Verdict.
// ============================================================================

export function optionsChoix(e: ExerciceNature): OptionChoix[] {
  const { r, q: qq } = valeursOptions(e);
  if (e.variante === "nature-termes") {
    return [
      { id: "arithmetique", fragments: [t("Compatibles avec une suite arithmétique de raison "), l(`r=${qLatex(r)}`)] },
      { id: "geometrique", fragments: [t("Compatibles avec une suite géométrique de raison "), l(`q=${qLatex(qq)}`)] },
      { id: "aucune", fragments: [t("Compatibles avec aucune des deux")] },
    ];
  }
  return [
    { id: "arithmetique", fragments: [t("Arithmétique, de raison "), l(`r=${qLatex(r)}`)] },
    { id: "geometrique", fragments: [t("Géométrique, de raison "), l(`q=${qLatex(qq)}`)] },
    { id: "aucune", fragments: [t("Ni arithmétique ni géométrique")] },
  ];
}

export function fragmentsOption(options: OptionChoix[], id: string | undefined): FragmentConsigne[] {
  return options.find((o) => o.id === id)?.fragments ?? [t("—")];
}

/** Conclusion rédigée (réponse attendue du verdict, corrigé) : la raison et sa justification. */
export function conclusionVerdict(e: ExerciceNature): FragmentConsigne[] {
  const { r, q: qq } = valeursOptions(e);
  if (e.variante === "nature-termes") {
    if (e.verdict === "arithmetique") return [t("Tous les écarts valent "), l(qLatex(r)), t(" : ces termes sont compatibles avec une suite arithmétique de raison "), l(`r=${qLatex(r)}`), t(".")];
    if (e.verdict === "geometrique") return [t("Tous les rapports valent "), l(qLatex(qq)), t(" : ces termes sont compatibles avec une suite géométrique de raison "), l(`q=${qLatex(qq)}`), t(".")];
    return [t("Les écarts ne sont pas tous égaux, les rapports non plus : ces termes ne sont compatibles avec aucune suite arithmétique ni géométrique.")];
  }
  if (e.verdict === "arithmetique") return [t("La différence "), l("u_{n+1}-u_n"), t(" est constante : la suite est arithmétique, de raison "), l(`r=${qLatex(r)}`), t(".")];
  if (e.verdict === "geometrique") return [t("Le quotient "), l("\\dfrac{u_{n+1}}{u_n}"), t(" est constant : la suite est géométrique, de raison "), l(`q=${qLatex(qq)}`), t(".")];
  const de = e.variante === "nature-recurrence" ? "de uₙ ou de n" : "de n";
  return [t(`Ni la différence ni le quotient ne sont constants (ils dépendent ${de}) : la suite n'est ni arithmétique ni géométrique.`)];
}

// ============================================================================
// Réponses attendues.
// ============================================================================

function joindre(latex: string[]): FragmentConsigne[] {
  const out: FragmentConsigne[] = [];
  latex.forEach((x, i) => {
    if (i > 0) out.push(t(" ; "));
    out.push(l(x));
  });
  return out;
}

/** Latex « membre = valeur » de chaque champ (réponse attendue, récapitulatif). */
export function reponseLatex(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): string[] {
  switch (phase) {
    case "suivant":
      return e.variante === "notations" ? [`u_{n+1}=${latexDecale(e.f, "suivant")}`] : [];
    case "autre":
      return e.variante === "notations" ? [`u_{${indiceAutre(e)}}=${latexDecale(e.f, e.autre)}`] : [];
    case "difference":
      if (e.variante === "nature-formule") return [`u_{n+1}-u_n=${latexDifferenceFormule(e.f)}`];
      if (e.variante === "nature-recurrence") return [`u_{n+1}-u_n=${latexDifferenceRecurrence(e.g)}`];
      return [];
    case "quotient":
      if (e.variante === "nature-formule") return [`\\dfrac{u_{n+1}}{u_n}=${latexQuotientFormule(e.f)}`];
      if (e.variante === "nature-recurrence") return [`\\dfrac{u_{n+1}}{u_n}=${latexQuotientRecurrence(e.g)}`];
      return [];
    case "verdict":
      return [];
    default: {
      const labels = champsEcran(e, phase).map((c) => c.labelLatex);
      return nombresAttendus(e, phase).map((x, i) => `${labels[i]}${qLatex(x)}`);
    }
  }
}

export function reponseFragments(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): FragmentConsigne[] {
  if (phase === "verdict") return e.variante === "notations" || e.variante === "recurrence" ? [] : conclusionVerdict(e);
  return joindre(reponseLatex(e, phase));
}

/** Contenu d'une ligne du récapitulatif : texte (verdict) ou formules. */
export function reponseRecap(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): { texte: string } | { latex: string[] } {
  if (phase === "verdict" && e.variante !== "notations" && e.variante !== "recurrence") {
    const { r, q: qq } = valeursOptions(e);
    if (e.verdict === "arithmetique") return { texte: `arithmétique, de raison r = ${qTexte(r)}` };
    if (e.verdict === "geometrique") return { texte: `géométrique, de raison q = ${qTexte(qq)}` };
    return { texte: e.variante === "nature-termes" ? "compatibles avec aucune des deux" : "ni arithmétique ni géométrique" };
  }
  return { latex: reponseLatex(e, phase) };
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

function terme(e: ExerciceRecurrence, k: number): Q {
  return premiersTermes(e, k)[k - 1];
}

function aideDifferenceFormule(f: FormuleExplicite): AideAvecLatex {
  switch (f.type) {
    case "affine":
      return { texte: "Distribue le signe « − » sur toute l'expression de uₙ, puis regroupe : les termes en n s'éliminent-ils ?", latex: "-(an+b)=-an-b" };
    case "second-degre":
      return { texte: "Développe d'abord le carré :", latex: "(n+1)^{2}=n^{2}+2n+1" };
    case "homographique":
      return { texte: "Réduis les deux fractions au même dénominateur :", latex: "\\dfrac{A}{B}-\\dfrac{C}{D}=\\dfrac{AD-BC}{BD}" };
    case "exponentielle":
      return { texte: "Mets la puissance la plus petite en évidence :", latex: "a^{m+1}-a^{m}=a^{m}\\,(a-1)" };
    case "somme-expo":
      return { texte: "Traite la puissance à part, en mettant la plus petite en évidence :", latex: "a^{n+1}-a^{n}=a^{n}\\,(a-1)" };
  }
}

function aideQuotientFormule(f: FormuleExplicite): AideAvecLatex {
  switch (f.type) {
    case "homographique":
      return { texte: "Diviser par une fraction, c'est multiplier par son inverse :", latex: "\\dfrac{A}{B}\\div\\dfrac{C}{D}=\\dfrac{A}{B}\\times\\dfrac{D}{C}" };
    case "exponentielle":
      return { texte: "Quotient de deux puissances de même base :", latex: "\\dfrac{a^{m+1}}{a^{m}}=a" };
    default:
      return { texte: "Ici, rien ne se simplifie : le numérateur et le dénominateur restent deux expressions différentes en n. Écris simplement le quotient de uₙ₊₁ (simplifié) par uₙ :", latex: "\\dfrac{u_{n+1}}{u_n}=\\dfrac{\\ldots}{\\ldots}" };
  }
}

export function aideNiveau1(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): AideAvecLatex {
  switch (phase) {
    case "suivant":
      return {
        texte: "uₙ₊₁ est le terme de RANG n + 1 (ce n'est pas uₙ + 1) : dans la formule de uₙ, remplace chaque n par (n + 1), parenthèses comprises :",
        latex: "u_n=\\ldots n\\ldots\\quad\\Longrightarrow\\quad u_{n+1}=\\ldots(n+1)\\ldots",
      };
    case "autre":
      return e.variante === "notations" && e.autre === "double"
        ? { texte: "u₂ₙ est le terme de RANG 2n (ce n'est pas 2uₙ, le double du terme) : remplace chaque n par 2n :", latex: "u_n=\\ldots n\\ldots\\quad\\Longrightarrow\\quad u_{2n}=\\ldots(2n)\\ldots" }
        : { texte: "uₙ₋₁ est le terme de RANG n − 1 (ce n'est pas uₙ − 1) : remplace chaque n par (n − 1) :", latex: "u_n=\\ldots n\\ldots\\quad\\Longrightarrow\\quad u_{n-1}=\\ldots(n-1)\\ldots" };
    case "terme":
      return e.variante === "notations" ? { texte: `Remplace n par ${e.p} dans la formule de uₙ, puis calcule :`, latex: `u_{${e.p}}=${substitutionLatex(e.f, e.p)}` } : { texte: "" };
    case "terme2":
    case "terme3":
    case "terme4": {
      if (e.variante !== "recurrence") return { texte: "" };
      const k = Number(phase.slice(-1));
      const prec = terme(e, k - 1);
      return { texte: `Pour obtenir u${indiceTexte(k)}, remplace uₙ par le terme précédent, u${indiceTexte(k - 1)} = ${qTexte(prec)}, dans la relation de récurrence :`, latex: `u_{${k}}=${latexRelation(e.g, prec)}` };
    }
    case "difference":
      if (e.variante === "nature-recurrence") return { texte: "Soustrais uₙ aux deux membres de la relation de récurrence, puis réduis :", latex: "u_{n+1}-u_n=\\ldots-u_n" };
      if (e.variante === "nature-formule") return { texte: "Écris d'abord uₙ₊₁ (remplace chaque n par n + 1), puis soustrais uₙ tout entier, entre parenthèses :", latex: `u_{n+1}-u_n=\\big(\\ldots\\big)-\\left(${latexFormule(e.f)}\\right)` };
      return { texte: "" };
    case "quotient":
      if (e.variante === "nature-recurrence") return { texte: "Divise les deux membres de la relation par uₙ (uₙ ≠ 0) :", latex: "\\dfrac{u_{n+1}}{u_n}=\\dfrac{\\ldots}{u_n}" };
      if (e.variante === "nature-formule") return { texte: "Divise uₙ₊₁ par uₙ, dans cet ordre (le terme suivant au numérateur) :", latex: `\\dfrac{u_{n+1}}{u_n}=\\dfrac{\\ldots}{${latexFormule(e.f)}}` };
      return { texte: "" };
    case "ecarts":
      if (e.variante !== "nature-termes") return { texte: "" };
      return { texte: "Un écart, c'est un terme MOINS le précédent, dans cet ordre ; par exemple :", latex: `u_2-u_1=${qLatex(e.termes[1])}-${qParen(e.termes[0])}` };
    case "rapports":
      if (e.variante !== "nature-termes") return { texte: "" };
      return { texte: "Un rapport, c'est un terme DIVISÉ par le précédent ; par exemple :", latex: `\\dfrac{u_2}{u_1}=\\dfrac{${qLatex(e.termes[1])}}{${qLatex(e.termes[0])}}` };
    case "verdict":
      return e.variante === "nature-termes"
        ? { texte: "Une suite arithmétique a TOUS ses écarts égaux, une suite géométrique TOUS ses rapports égaux. Vérifie chaque écart et chaque rapport, pas seulement les premiers." }
        : { texte: "Arithmétique : la différence uₙ₊₁ − uₙ est un nombre constant. Géométrique : le quotient uₙ₊₁/uₙ est un nombre constant. Une expression qui contient encore n (ou uₙ) n'est pas constante." };
  }
}

export function aideNiveau2(e: ExerciceDefinirSuite, phase: PhaseDefinirSuite): AideAvecLatex {
  switch (phase) {
    case "suivant":
    case "autre": {
      if (e.variante !== "notations") return { texte: "" };
      const f = e.f;
      const double = phase === "autre" && e.autre === "double";
      const h = phase === "suivant" ? "n+1" : "n-1";
      switch (f.type) {
        case "affine":
          return double ? { texte: "Le coefficient de n est multiplié par 2 :", latex: "a\\times 2n=2a\\,n" } : { texte: "Distribue le coefficient de n sur la parenthèse, puis regroupe les nombres :", latex: `a\\,(${h})=an${phase === "suivant" ? "+" : "-"}a` };
        case "second-degre":
          return double ? { texte: "Le carré porte sur 2n tout entier :", latex: "(2n)^{2}=4n^{2}" } : { texte: "Développe le carré :", latex: phase === "suivant" ? "(n+1)^{2}=n^{2}+2n+1" : "(n-1)^{2}=n^{2}-2n+1" };
        case "homographique":
          return { texte: "Remplace n au numérateur ET au dénominateur, puis réduis chacun séparément." };
        case "exponentielle":
          return double ? { texte: "L'exposant devient 2n ; tu peux aussi l'écrire comme une puissance de puissance :", latex: "a^{2n}=\\left(a^{2}\\right)^{n}" } : { texte: "Seul l'exposant change ; il s'écrit entre parenthèses au clavier :", latex: `a^{n}\\;\\longrightarrow\\;a^{${h}}` };
        case "somme-expo":
          return { texte: "Remplace n dans l'exposant ET dans le reste de la formule." };
      }
      break;
    }
    case "terme": {
      if (e.variante !== "notations") return { texte: "" };
      const x = intermediaireTerme(e.f, e.p);
      return { texte: "Respecte les priorités : les puissances d'abord, puis les produits, puis les sommes ; par exemple :", latex: x };
    }
    case "terme2":
    case "terme3":
    case "terme4": {
      if (e.variante !== "recurrence") return { texte: "" };
      const prec = terme(e, Number(phase.slice(-1)) - 1);
      return e.g.type === "carre"
        ? { texte: prec.num < 0 ? "Calcule d'abord le carré (le carré d'un nombre négatif est positif) :" : "Calcule d'abord le carré :", latex: intermediaireRecurrence(e.g, prec) }
        : { texte: "Calcule d'abord le dénominateur, puis simplifie la fraction obtenue :", latex: intermediaireRecurrence(e.g, prec) };
    }
    case "difference":
      if (e.variante === "nature-formule") return aideDifferenceFormule(e.f);
      if (e.variante === "nature-recurrence") return { texte: "Regroupe les termes en uₙ ; le résultat est-il un nombre fixe, ou dépend-il encore de uₙ ou de n ?", latex: "a\\,u_n-u_n=(a-1)\\,u_n" };
      return { texte: "" };
    case "quotient":
      if (e.variante === "nature-formule") return aideQuotientFormule(e.f);
      if (e.variante === "nature-recurrence") return { texte: "Divise chaque terme du numérateur par uₙ :", latex: "\\dfrac{a\\,u_n+b}{u_n}=a+\\dfrac{b}{u_n}" };
      return { texte: "" };
    case "ecarts":
      return { texte: "Garde le signe : quand la suite diminue, l'écart est négatif." };
    case "rapports":
      return { texte: "Simplifie chaque fraction ; un rapport n'est pas toujours un entier, et un rapport négatif signifie que le signe change." };
    case "verdict":
      return { texte: "" };
  }
  return { texte: "" };
}

