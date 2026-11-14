import { analyser, equationBrute, equationSimplifiee, evaluerPoly, membresDeveloppes, raisonEn, relationCorrecte, termesEn } from "../core5e/troisTermes.types";
import type { ExerciceTroisTermes, Fraction, IdRelation, Poly } from "../core5e/troisTermes.types";
import type { PhaseTroisTermes } from "../moteur5e/typesTroisTermes";

/**
 * Couche C (5e) — textes de `5gen46` « Trois termes consécutifs ». SOURCE UNIQUE des consignes,
 * champs, aides et réponses attendues : l'écran, le récapitulatif et l'adaptateur de feuilles
 * (`generateurs5e/troisTermes/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (chapitre 3 de 5e) : un terme est la moyenne arithmétique de ses voisins
 * (2b = a + c), le carré d'un terme est le produit de ses voisins (b² = a·c, plutôt que la moyenne
 * géométrique √(a·c), fausse quand b est négatif) ; discriminant Δ. Signe moins typographique (rendu
 * KaTeX), jamais de prose dans le mode math ; aides = phrase terminée par « : » puis la formule, sans
 * la réponse finale.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  /** Texte brut (aria-label, historique). */
  label: string;
  labelLatex?: string;
  /** LaTeX affiché APRÈS le champ (« = 0 » de l'équation réduite). */
  suffixeLatex?: string;
  placeholder: string;
  /** Titre de groupe (LaTeX) affiché avant ce champ : « x = 3 » à l'écran `termes`. */
  groupeLatex?: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Écriture des nombres et des polynômes.
// ============================================================================

/** Entier en LaTeX. */
export function nb(x: number): string {
  return `${x < 0 ? "-" : ""}${Math.abs(x)}`;
}

/** Nombre négatif entre parenthèses dans un calcul substitué. */
export function jeton(x: number): string {
  return x < 0 ? `(${nb(x)})` : nb(x);
}

export function fractionLatex(f: Fraction): string {
  if (f.den === 1) return nb(f.num);
  return `${f.num < 0 ? "-" : ""}\\dfrac{${Math.abs(f.num)}}{${f.den}}`;
}

/** Polynôme en LaTeX : « 3x^2-x+4 », « 0 » s'il est nul. */
export function polyLatex(p: Poly): string {
  const morceaux: string[] = [];
  const monome = (k: number, lettre: string) => (k === 1 ? lettre : k === -1 ? `-${lettre}` : `${nb(k)}${lettre}`);
  if (p[2] !== 0) morceaux.push(monome(p[2], "x^2"));
  if (p[1] !== 0) morceaux.push(monome(p[1], "x"));
  if (p[0] !== 0) morceaux.push(nb(p[0]));
  if (morceaux.length === 0) return "0";
  return morceaux.map((m, i) => (i === 0 || m.startsWith("-") ? m : `+${m}`)).join("");
}

function nombreDeMonomes(p: Poly): number {
  return p.filter((k) => k !== 0).length;
}

/** Facteur d'un produit ou d'une puissance : parenthèses sauf pour un monôme à coefficient positif. */
function facteur(p: Poly): string {
  const s = polyLatex(p);
  return nombreDeMonomes(p) > 1 || s.startsWith("-") ? `(${s})` : s;
}

/** Terme d'une somme : parenthèses s'il commence par un signe moins (hors première place). */
function terme(p: Poly, premier: boolean): string {
  const s = polyLatex(p);
  if (premier) return s;
  return s.startsWith("-") ? `+(${s})` : `+${s}`;
}

/** Produit a·c de deux expressions, en LaTeX : juxtaposition devant une parenthèse, « × » sinon. */
function produitLatex(a: Poly, c: Poly): string {
  const fa = facteur(a);
  const fc = facteur(c);
  return fc.startsWith("(") ? `${fa}${fc}` : `${fa}\\times ${fc}`;
}

/** Polynôme où x est remplacé par une valeur : « 3\times(-2)+1 ». */
export function polySubstitueLatex(p: Poly, x: number): string {
  const morceaux: string[] = [];
  const v = jeton(x);
  if (p[2] !== 0) morceaux.push(p[2] === 1 ? `${v}^2` : p[2] === -1 ? `-${v}^2` : `${nb(p[2])}\\times ${v}^2`);
  if (p[1] !== 0) morceaux.push(p[1] === 1 ? v : p[1] === -1 ? `-${v}` : `${nb(p[1])}\\times ${v}`);
  if (p[0] !== 0 || morceaux.length === 0) morceaux.push(nb(p[0]));
  return morceaux.map((m, i) => (i === 0 || m.startsWith("-") ? m : `+${m}`)).join("");
}

/** Valeur d'un terme pour x : « 3\times 4+1=13 » ; la valeur seule pour x = 0 ou une constante
 * (« -0-9 » ou « 7=7 » ne se lisent pas). */
function calculTerme(p: Poly, x: number): string {
  const valeur = nb(evaluerPoly(p, x));
  if (x === 0 || (nombreDeMonomes(p) <= 1 && p[0] !== 0)) return valeur;
  return `${polySubstitueLatex(p, x)}=${valeur}`;
}

// ============================================================================
// Relations.
// ============================================================================

const RELATION_LATEX: Record<IdRelation, string> = {
  "2b=a+c": "2b=a+c",
  "b2=ac": "b^2=a\\times c",
  "b=a+c": "b=a+c",
  "b=ac": "b=a\\times c",
  "2b=ac": "2b=a\\times c",
};

export function relationLatex(id: IdRelation): string {
  return RELATION_LATEX[id];
}

const RELATION_TEXTE: Record<IdRelation, string> = {
  "2b=a+c": "2b = a + c",
  "b2=ac": "b² = a × c",
  "b=a+c": "b = a + c",
  "b=ac": "b = a × c",
  "2b=ac": "2b = a × c",
};

/** Relation en texte brut (historique « ta réponse »). */
export function relationTexte(id: string): string {
  return RELATION_TEXTE[id as IdRelation] ?? id;
}

/** Relation de l'énoncé avec a, b, c remplacés par leurs expressions. */
export function relationSubstitueeLatex(e: ExerciceTroisTermes): string {
  const [a, b, c] = e.termes;
  if (e.variante === "arithmetique") {
    const deuxB = nombreDeMonomes(b) > 1 ? `2(${polyLatex(b)})` : `2\\times ${facteur(b)}`;
    return `${deuxB}=${terme(a, true)}${terme(c, false)}`;
  }
  // Carré : parenthèses sauf pour « x » ou une constante positive (« 2x^2 » se lirait 2·x²).
  const sb = polyLatex(b);
  const carre = sb === "x" || (nombreDeMonomes(b) === 1 && b[0] > 0) ? `${sb}^2` : `(${sb})^2`;
  return `${carre}=${produitLatex(a, c)}`;
}

/** Les deux membres développés : « 6x+2=8x-2 ». */
export function membresDeveloppesLatex(e: ExerciceTroisTermes): string {
  const [g, d] = membresDeveloppes(e);
  return `${polyLatex(g)}=${polyLatex(d)}`;
}

/** Équation réduite (simplifiée) : « x^2-5x+6=0 ». */
export function equationSimplifieeLatex(e: ExerciceTroisTermes): string {
  return `${polyLatex(equationSimplifiee(e))}=0`;
}

/** Équation ramenée à 0 avant simplification (même membre gauche que la relation). */
export function equationBruteLatex(e: ExerciceTroisTermes): string {
  return `${polyLatex(equationBrute(e))}=0`;
}

function memePoly(p: Poly, q: Poly): boolean {
  return p.every((k, i) => k === q[i]);
}

// ============================================================================
// Énoncé.
// ============================================================================

function nature(e: ExerciceTroisTermes): string {
  return e.variante === "arithmetique" ? "arithmétique" : "géométrique";
}

/** Énoncé complet (écran ET papier) : les trois expressions et la question. */
export function consigneGenerale(e: ExerciceTroisTermes): FragmentConsigne[] {
  const [a, b, c] = e.termes;
  return [
    t("On note "),
    l(`a=${polyLatex(a)}`),
    t(", "),
    l(`b=${polyLatex(b)}`),
    t(" et "),
    l(`c=${polyLatex(c)}`),
    t(". Pour quelle(s) valeur(s) de "),
    l("x"),
    t(" les nombres "),
    l("a"),
    t(", "),
    l("b"),
    t(" et "),
    l("c"),
    t(` sont-ils, dans cet ordre, trois termes consécutifs d'une suite ${nature(e)} ? Donne alors, pour chaque valeur, les trois termes et la raison de la suite.`),
  ];
}

export function libellePhase(phase: PhaseTroisTermes): string {
  switch (phase) {
    case "relation":
      return "Relation";
    case "equation":
      return "Équation réduite";
    case "solutions":
      return "Valeur(s) de x";
    case "termes":
      return "Termes et raison";
  }
}

export function consigneEcran(e: ExerciceTroisTermes, phase: PhaseTroisTermes): FragmentConsigne[] {
  switch (phase) {
    case "relation":
      return [t(`Quelle relation les trois termes consécutifs `), l("a"), t(", "), l("b"), t(" et "), l("c"), t(` d'une suite ${nature(e)} vérifient-ils ?`)];
    case "equation":
      return [t("Remplace "), l("a"), t(", "), l("b"), t(" et "), l("c"), t(" par leurs expressions dans cette relation, développe, puis ramène tous les termes dans le membre de gauche : écris l'équation réduite sous la forme "), l("\\ldots=0"), t(".")];
    case "solutions":
      return [t("Quelle(s) valeur(s) de "), l("x"), t(` conviennent ? Résous l'équation réduite, puis vérifie que chaque solution donne bien trois termes d'une suite ${nature(e)}.`)];
    case "termes":
      return e.variante === "arithmetique"
        ? [t("Calcule les trois termes "), l("a"), t(", "), l("b"), t(", "), l("c"), t(" et la raison "), l("r"), t(" de la suite.")]
        : [t("Pour chaque valeur de "), l("x"), t(" qui convient, calcule les trois termes "), l("a"), t(", "), l("b"), t(", "), l("c"), t(" et la raison "), l("q"), t(" de la suite.")];
  }
}

export function champsEcran(e: ExerciceTroisTermes, phase: PhaseTroisTermes): ChampDef[] {
  switch (phase) {
    case "relation":
      return [];
    case "equation":
      return [{ label: "Équation réduite (membre de gauche)", suffixeLatex: "=0", placeholder: "expression en x" }];
    case "solutions":
      return [{ label: "x", labelLatex: "x=", placeholder: "valeur de x" }];
    case "termes": {
      const lettre = e.variante === "arithmetique" ? "r" : "q";
      return analyser(e).valables.flatMap((x): ChampDef[] => [
        { label: `a (x = ${x})`, labelLatex: "a=", placeholder: "valeur de a", groupeLatex: `x=${nb(x)}` },
        { label: `b (x = ${x})`, labelLatex: "b=", placeholder: "valeur de b" },
        { label: `c (x = ${x})`, labelLatex: "c=", placeholder: "valeur de c" },
        { label: `${lettre} (x = ${x})`, labelLatex: `${lettre}=`, placeholder: "raison" },
      ]);
    }
  }
}

// ============================================================================
// Réponses attendues.
// ============================================================================

/** Calcul de la résolution (discriminant ou isolement de x), en LaTeX. */
export function resolutionLatex(e: ExerciceTroisTermes): string {
  const s = equationSimplifiee(e);
  const [c0, c1, c2] = s;
  const an = analyser(e);
  const res = an.resolution;
  switch (res.type) {
    case "contradiction":
      return `${polyLatex(equationBrute(e))}=0`;
    case "premier-degre": {
      const x = res.racines[0];
      if (c1 === 1) return `${polyLatex(s)}=0\\iff x=${nb(x)}`;
      return `${polyLatex(s)}=0\\iff ${c1 === -1 ? "-x" : `${nb(c1)}x`}=${nb(-c0)}\\iff x=${nb(x)}`;
    }
    default: {
      const delta = `\\Delta=${jeton(c1)}^2-4\\times ${jeton(c2)}\\times ${jeton(c0)}=${nb(res.delta ?? 0)}`;
      if (res.type === "delta-negatif") return delta;
      if (res.type === "delta-nul") return `${delta}\\qquad x=\\dfrac{${nb(-c1)}}{${nb(2 * c2)}}=${nb(res.racines[0])}`;
      const r = Math.sqrt(res.delta ?? 0);
      const [x1, x2] = res.racines;
      return `${delta}\\qquad x_1=\\dfrac{${nb(-c1)}-${r}}{${nb(2 * c2)}}=${nb(x1)}\\qquad x_2=\\dfrac{${nb(-c1)}+${r}}{${nb(2 * c2)}}=${nb(x2)}`;
    }
  }
}

/** Trois termes pour une valeur de x : « 6\,;\ 13\,;\ 20 ». */
function termesValeursLatex(e: ExerciceTroisTermes, x: number): string {
  return termesEn(e, x).map(nb).join("\\,;\\ ");
}

/** Phrase de vérification d'une solution (géométrique) : convient, ou écartée. */
function verificationSolution(e: ExerciceTroisTermes, x: number): FragmentConsigne[] {
  const valeurs = termesEn(e, x);
  const nuls = (["a", "b", "c"] as const).filter((_, i) => valeurs[i] === 0);
  const debut: FragmentConsigne[] = [t("pour "), l(`x=${nb(x)}`), t(", les termes valent "), l(termesValeursLatex(e, x))];
  if (nuls.length === 0) return [...debut, t(" : aucun n'est nul, cette valeur convient")];
  return [...debut, t(" : un terme nul n'a pas de place dans une suite géométrique (la raison n'est jamais nulle, et on ne passe pas de 0 à un nombre non nul en multipliant), cette valeur est écartée")];
}

/** Conclusion de l'écran `solutions` (verdict). */
export function conclusionSolutions(e: ExerciceTroisTermes): FragmentConsigne[] {
  const v = analyser(e).valables;
  if (v.length === 0) return [t("Aucune valeur de "), l("x"), t(" ne convient.")];
  if (v.length === 1) return [t("Une seule valeur convient : "), l(`x=${nb(v[0])}`), t(".")];
  return [t("Deux valeurs conviennent : "), l(`x=${nb(v[0])}`), t(" et "), l(`x=${nb(v[1])}`), t(".")];
}

/** Calcul de l'écran `solutions` sans la phrase de conclusion (ligne « Calcul » du corrigé, suivie
 * d'une ligne « Conclusion »). */
export function calculSolutionsFragments(e: ExerciceTroisTermes): FragmentConsigne[] {
  const an = analyser(e);
  const res = an.resolution;
  const morceaux: FragmentConsigne[] = [l(resolutionLatex(e))];
  if (res.type === "contradiction") morceaux.push(t(" : cette égalité est fausse quelle que soit la valeur de "), l("x"), t(", l'équation n'a aucune solution."));
  else if (res.type === "delta-negatif") morceaux.push(t(" : le discriminant est négatif, l'équation n'a aucune solution réelle."));
  else if (e.variante === "geometrique") {
    morceaux.push(t(" ; vérification : "));
    res.racines.forEach((x, i) => morceaux.push(...(i > 0 ? [t(" ; ")] : []), ...verificationSolution(e, x)));
    morceaux.push(t("."));
  } else morceaux.push(t(" ; une suite arithmétique peut contenir n'importe quels nombres : cette valeur convient."));
  return morceaux;
}

/** Explication complète de l'écran `solutions` (bloc de validation). */
function reponseSolutions(e: ExerciceTroisTermes): FragmentConsigne[] {
  return [...calculSolutionsFragments(e), t(" "), ...conclusionSolutions(e)];
}

/** Calcul d'une raison, en LaTeX. */
function raisonLatex(e: ExerciceTroisTermes, x: number): string {
  const [a, b] = termesEn(e, x);
  const r: Fraction = raisonEn(e, x);
  if (e.variante === "arithmetique") return `r=b-a=${nb(b)}-${jeton(a)}=${fractionLatex(r)}`;
  const dejaReduite = r.den !== 1 && a === r.den && b === r.num;
  return `q=\\dfrac{b}{a}=\\dfrac{${nb(b)}}{${nb(a)}}${dejaReduite ? "" : `=${fractionLatex(r)}`}`;
}

/** Réponse d'un écran (bloc de validation, corrigé) : calcul et résultat. */
export function reponseFragments(e: ExerciceTroisTermes, phase: PhaseTroisTermes): FragmentConsigne[] {
  switch (phase) {
    case "relation":
      return e.variante === "arithmetique"
        ? [t("Les deux différences sont égales : "), l("b-a=c-b"), t(", donc "), l("2b=a+c"), t(" (b est la moyenne de a et c).")]
        : [t("Les deux quotients sont égaux : "), l("\\dfrac{b}{a}=\\dfrac{c}{b}"), t(", donc "), l("b^2=a\\times c"), t(" (produit en croix).")];
    case "equation": {
      const brute = equationBrute(e);
      const simple = equationSimplifiee(e);
      const fin: FragmentConsigne[] = memePoly(brute, simple) ? [] : [t(", ou plus simplement "), l(equationSimplifieeLatex(e))];
      return [l(relationSubstitueeLatex(e)), t(" ; en développant : "), l(membresDeveloppesLatex(e)), t(" ; donc "), l(equationBruteLatex(e)), ...fin, t(".")];
    }
    case "solutions":
      return reponseSolutions(e);
    case "termes":
      return analyser(e).valables.flatMap((x, i): FragmentConsigne[] => {
        const [a, b, c] = e.termes;
        return [
          ...(i > 0 ? [t(" ; ")] : []),
          t("pour "),
          l(`x=${nb(x)}`),
          t(" : "),
          l(`a=${calculTerme(a, x)}`),
          t(", "),
          l(`b=${calculTerme(b, x)}`),
          t(", "),
          l(`c=${calculTerme(c, x)}`),
          t(", raison "),
          l(raisonLatex(e, x)),
        ];
      }).concat([t(".")]);
  }
}

/** Valeurs confirmées (récapitulatif « Ce qu'on sait déjà »), en LaTeX ; tableau vide = aucune valeur. */
export function reponseRecap(e: ExerciceTroisTermes, phase: PhaseTroisTermes): string[] {
  switch (phase) {
    case "relation":
      return [relationLatex(relationCorrecte(e))];
    case "equation":
      return [equationSimplifieeLatex(e)];
    case "solutions": {
      const v = analyser(e).valables;
      return v.map((x) => `x=${nb(x)}`);
    }
    case "termes": {
      const lettre = e.variante === "arithmetique" ? "r" : "q";
      return analyser(e).valables.map((x) => `x=${nb(x)}\\colon\\ ${termesValeursLatex(e, x)}\\quad ${lettre}=${fractionLatex(raisonEn(e, x))}`);
    }
  }
}

/** Réponse brève (page « Je vérifie », barème). */
export function reponseBreveFragments(e: ExerciceTroisTermes): FragmentConsigne[] {
  const v = analyser(e).valables;
  if (v.length === 0) return [t("Aucune valeur de "), l("x"), t(" ne convient.")];
  const lettre = e.variante === "arithmetique" ? "r" : "q";
  return v
    .flatMap((x, i): FragmentConsigne[] => [...(i > 0 ? [t(" ; ")] : []), l(`x=${nb(x)}`), t(" : termes "), l(termesValeursLatex(e, x)), t(", raison "), l(`${lettre}=${fractionLatex(raisonEn(e, x))}`)])
    .concat([t(".")]);
}

// ============================================================================
// Aides (deux niveaux, jamais la réponse finale).
// ============================================================================

export function aideNiveau1(e: ExerciceTroisTermes, phase: PhaseTroisTermes): AideAvecLatex {
  const arith = e.variante === "arithmetique";
  switch (phase) {
    case "relation":
      return arith
        ? { texte: "Dans une suite arithmétique, la raison est la différence entre un terme et le précédent ; écris-la de deux façons :", latex: "r=b-a\\qquad r=c-b" }
        : { texte: "Dans une suite géométrique, la raison est le quotient d'un terme par le précédent ; écris-la de deux façons :", latex: "q=\\dfrac{b}{a}\\qquad q=\\dfrac{c}{b}" };
    case "equation":
      return { texte: "Remplace a, b et c par leurs expressions dans la relation :", latex: relationSubstitueeLatex(e) };
    case "solutions": {
      const res = analyser(e).resolution;
      const s = equationSimplifiee(e);
      if (res.type === "contradiction") return { texte: "Les termes en x se sont éliminés : l'équation réduite est une égalité entre deux nombres :", latex: `${polyLatex(equationBrute(e))}=0` };
      if (res.type === "premier-degre") return { texte: "Équation du premier degré : isole x dans l'équation réduite :", latex: `${polyLatex(s)}=0` };
      return { texte: "Équation du second degré : calcule son discriminant :", latex: `\\Delta=${jeton(s[1])}^2-4\\times ${jeton(s[2])}\\times ${jeton(s[0])}` };
    }
    case "termes":
      return arith
        ? { texte: "Remplace x par la valeur trouvée dans chaque expression, puis calcule la raison :", latex: "r=b-a" }
        : { texte: "Remplace x par chaque valeur qui convient dans les trois expressions, puis calcule la raison :", latex: "q=\\dfrac{b}{a}" };
  }
}

export function aideNiveau2(e: ExerciceTroisTermes, phase: PhaseTroisTermes): AideAvecLatex {
  const arith = e.variante === "arithmetique";
  switch (phase) {
    case "relation":
      return arith
        ? { texte: "Égale ces deux différences, puis regroupe les b dans un même membre :", latex: "b-a=c-b" }
        : { texte: "Égale ces deux quotients, puis fais un produit en croix :", latex: "\\dfrac{b}{a}=\\dfrac{c}{b}" };
    case "equation":
      return { texte: arith ? "Développe chaque membre, puis ramène tous les termes à gauche :" : "Développe chaque membre (carré d'une somme, produit de deux sommes), puis ramène tous les termes à gauche :", latex: membresDeveloppesLatex(e) };
    case "solutions": {
      const res = analyser(e).resolution;
      const s = equationSimplifiee(e);
      if (res.type === "contradiction") return { texte: "Une telle égalité peut-elle être vraie pour une valeur de x ?" };
      const verif = arith
        ? "Une suite arithmétique peut contenir n'importe quels nombres : toute solution de l'équation convient."
        : "Vérifie ensuite chaque solution : dans une suite géométrique, aucun terme n'est nul (la raison n'est jamais nulle, et on ne passe pas de 0 à un nombre non nul en multipliant).";
      if (res.type === "premier-degre") {
        // « x = … » serait la réponse : le terme en x isolé n'est montré que si son coefficient n'est pas ±1.
        if (Math.abs(s[1]) === 1) return { texte: verif };
        return { texte: `${verif} Le terme en x isolé :`, latex: `${nb(s[1])}x=${nb(-s[0])}` };
      }
      return { texte: `Si Δ est positif ou nul, les solutions sont données par la formule ci-dessous. ${verif}`, latex: `x=\\dfrac{${nb(-s[1])}\\pm\\sqrt{\\Delta}}{${nb(2 * s[2])}}` };
    }
    case "termes": {
      const valables = analyser(e).valables;
      const x = valables[0];
      const [a, b, c] = e.termes;
      if (x === 0) return { texte: "Pour x = 0, chaque expression vaut son terme constant ; la raison se calcule ensuite avec la formule ci-dessus." };
      return { texte: `${valables.length > 1 ? "Par exemple, pour" : "Pour"} x = ${x < 0 ? "−" : ""}${Math.abs(x)} :`, latex: `a=${polySubstitueLatex(a, x)}\\qquad b=${polySubstitueLatex(b, x)}\\qquad c=${polySubstitueLatex(c, x)}` };
    }
  }
}
