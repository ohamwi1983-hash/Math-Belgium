/**
 * 5gen27 (fonction dérivée) — lot B, règles communes : aides à deux niveaux (niveau 1 = la règle du
 * cours, `texteAideNiveau1` ; niveau 2 = la règle posée pour CETTE fonction, jamais la réponse — les
 * anciens « Exemple : f(x) = x·sin(2x)… » sont remplacés), messages ciblés (produit des dérivées,
 * terme oublié, numérateur inversé, carré oublié, facteur de la chaîne oublié, signe de (cos x)′, u et
 * v échangés dans un quotient), saisie illisible refusée par le moteur (`refusSaisieFonctionDerivee`).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { AtomeDerivable, ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import type { EcranFonctionDerivee } from "../moteur5e/typesFonctionDerivee";
import { evaluerRadiansFonctionDerivee } from "../moteur5e/verificationFonctionDerivee";
import { deriveeAtome, formatAtomeLatex, formatExterieurEnULatex, formatFDeXLatex, formatInterieurLatex, valeurAtome, valeurFonction } from "../generateurs5e/fonctionDerivee/index";
import type { AideTrig } from "./aidesTrigonometrie";
import { texteAideNiveau1 } from "./formatFonctionDerivee";
import { aideDepuis, l, t } from "./retoursDerivees";

const sansFx = (f: string) => f.replace(/^f\(x\)=/, "");

function niveau2(e: ExerciceFonctionDerivee, ecran: EcranFonctionDerivee, type: TypeDerivee | null): AideTrig {
  const fx = formatFDeXLatex(e);
  if (ecran === "reconnaissance") {
    return { texte: [t("Ici, calcule mentalement f(x) pour un nombre x : quelle est la DERNIÈRE opération effectuée — une somme de termes simples, un produit, une division, ou une fonction appliquée à une expression en x ?")], formules: [fx] };
  }
  if (ecran === "decomposer") {
    if (type === "produit") return { texte: [t("Ici, f(x) est un produit : u(x) est le facteur écrit avant le point, v(x) celui écrit après :")], formules: [`${fx}=u(x)\\cdot v(x)`] };
    if (type === "quotient") return { texte: [t("Ici, f(x) est une fraction : u(x) est tout le numérateur, v(x) tout le dénominateur (l'ordre compte) :")], formules: [`${fx}=\\dfrac{u(x)}{v(x)}`] };
    return { texte: [t("Ici, remplace par la lettre u toute l'expression sur laquelle porte la puissance, la racine ou le sinus ; ce qui reste est g(u) :")], formules: [`${fx}=g\\big(u(x)\\big)`] };
  }
  switch (e.famille) {
    case "reglebase":
      return { texte: [t("Ici, dérive chaque terme séparément, puis additionne :")], formules: [`f'(x)=${e.atomes.map((a) => `\\left(${formatAtomeLatex(a)}\\right)'`).join("+")}`] };
    case "produit": {
      const U = formatAtomeLatex(e.atome1);
      const V = formatAtomeLatex(e.atome2);
      return { texte: [t("Ici, applique la formule du produit avec u et v de l'étape précédente — calcule d'abord u′ et v′ :")], formules: [`f'(x)=\\left(${U}\\right)'\\cdot ${V}+${U}\\cdot\\left(${V}\\right)'`] };
    }
    case "quotient": {
      if (e.ambigu || type === "composee") {
        const fn = e.famille === "quotient" && e.ambigu ? (e.trig === "sin" ? "\\sin" : "\\cos") : "";
        return { texte: [t("Ici, f(x) est de la forme "), l("\\dfrac{1}{w^2}"), t(" avec "), l(`w=${fn}(\\ldots)`), t(" : dérive l'extérieure, puis multiplie par la dérivée de l'intérieure (règle de la chaîne, deux fois) :")], formules: [`\\left(\\dfrac{1}{w^2}\\right)'=-\\dfrac{2w'}{w^3}`] };
      }
      const U = formatAtomeLatex(e.atome1);
      const V = formatAtomeLatex(e.atome2);
      return { texte: [t("Ici, applique la formule du quotient — u′v d'abord, puis le dénominateur au carré :")], formules: [`f'(x)=\\dfrac{\\left(${U}\\right)'\\cdot ${V}-${U}\\cdot\\left(${V}\\right)'}{\\left(${V}\\right)^2}`] };
    }
    case "composee": {
      const u = formatInterieurLatex(e.atome);
      return { texte: [t("Ici, l'extérieure est "), l(`g(u)=${formatExterieurEnULatex(e.atome)}`), t(" et l'intérieure "), l(`u(x)=${u}`), t(" :")], formules: [`f'(x)=g'\\left(${u}\\right)\\cdot\\left(${u}\\right)'`] };
    }
  }
}

export function aidesFonctionDerivee(e: ExerciceFonctionDerivee, ecran: EcranFonctionDerivee, type: TypeDerivee | null): AideTrig[] {
  const n1 = texteAideNiveau1(ecran, type);
  return [aideDepuis(n1.texte, n1.latex), niveau2(e, ecran, type)];
}

const X = [0.37, 1.3, 2.1, 0.85];

function egaleA(texte: string, g: (x: number) => number): boolean {
  let n = 0;
  for (const x of X) {
    const c = g(x);
    if (!Number.isFinite(c)) continue;
    const v = evaluerRadiansFonctionDerivee(texte, x);
    if (v === null || Math.abs(v - c) > 1e-5 * Math.max(1, Math.abs(c))) return false;
    n++;
  }
  return n >= 3;
}

/** Dérivée d'un atome trig en OUBLIANT la dérivée de l'intérieure (chaîne oubliée). */
function deriveeSansChaine(at: AtomeDerivable, x: number): number {
  if (at.interieurA === 1) return NaN;
  return deriveeAtome(at, x) / at.interieurA;
}

/** Dérivée d'un atome avec (cos)′ = sin (signe oublié). */
function deriveeSigneCos(at: AtomeDerivable, x: number): number {
  return at.noyau.type === "trig" && at.noyau.fonction === "cos" ? -deriveeAtome(at, x) : deriveeAtome(at, x);
}

/** Message ciblé sur l'erreur trahie par la réponse fausse (null : message générique). */
export function cibleFonctionDerivee(e: ExerciceFonctionDerivee, ecran: EcranFonctionDerivee, type: TypeDerivee | null, valeurs: string[]): FragmentConsigne[] | null {
  if (ecran === "decomposer") {
    if (e.famille === "quotient" && !e.ambigu && type === "quotient") {
      const [u, v] = valeurs;
      if (egaleA(u, (x) => valeurAtome(e.atome2, x)) && egaleA(v, (x) => valeurAtome(e.atome1, x))) return [t("u et v sont échangés : dans un quotient, u(x) est le numérateur et v(x) le dénominateur.")];
    }
    if (e.famille === "composee" && type === "composee") {
      const [interieur] = valeurs;
      if (egaleA(interieur, (x) => valeurFonction(e, x))) return [t("u(x) est seulement l'expression à l'intérieur (la parenthèse, ou ce qui est sous la racine), pas toute la fonction.")];
    }
    return null;
  }
  if (ecran !== "calculer") return null;
  const [s] = valeurs;
  if (e.famille === "produit") {
    const { atome1: A, atome2: B } = e;
    if (egaleA(s, (x) => deriveeAtome(A, x) * deriveeAtome(B, x))) return [t("La dérivée d'un produit n'est pas le produit des dérivées : "), l("(uv)'=u'v+uv'"), t(".")];
    if (egaleA(s, (x) => deriveeAtome(A, x) * valeurAtome(B, x)) || egaleA(s, (x) => valeurAtome(A, x) * deriveeAtome(B, x))) return [t("Il manque un des deux termes : "), l("(uv)'=u'v+uv'"), t(" en a deux.")];
    if (egaleA(s, (x) => deriveeSansChaine(A, x) * valeurAtome(B, x) + valeurAtome(A, x) * deriveeAtome(B, x)) || egaleA(s, (x) => deriveeAtome(A, x) * valeurAtome(B, x) + valeurAtome(A, x) * deriveeSansChaine(B, x)))
      return [t("Un facteur de la chaîne manque : la dérivée de "), l("\\sin(ax+b)"), t(" est "), l("a\\cos(ax+b)"), t(".")];
    if (egaleA(s, (x) => deriveeSigneCos(A, x) * valeurAtome(B, x) + valeurAtome(A, x) * deriveeSigneCos(B, x))) return [t("Vérifie le signe : "), l("(\\cos x)'=-\\sin x"), t(".")];
    return null;
  }
  if (e.famille === "quotient" && !e.ambigu) {
    const { atome1: A, atome2: B } = e;
    const u = (x: number) => valeurAtome(A, x);
    const v = (x: number) => valeurAtome(B, x);
    const du = (x: number) => deriveeAtome(A, x);
    const dv = (x: number) => deriveeAtome(B, x);
    if (egaleA(s, (x) => (u(x) * dv(x) - du(x) * v(x)) / v(x) ** 2)) return [t("Le numérateur est inversé : c'est "), l("u'v-uv'"), t(", dans cet ordre (le signe du résultat change sinon).")];
    if (egaleA(s, (x) => (du(x) * v(x) - u(x) * dv(x)) / v(x))) return [t("Le dénominateur doit être élevé au carré : "), l("\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}"), t(".")];
    if (egaleA(s, (x) => du(x) / dv(x))) return [t("La dérivée d'un quotient n'est pas le quotient des dérivées : "), l("\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}"), t(".")];
    if (egaleA(s, (x) => (du(x) * v(x) + u(x) * dv(x)) / v(x) ** 2)) return [t("Au numérateur, c'est une différence : "), l("u'v-uv'"), t(".")];
    return null;
  }
  if (e.famille === "composee") {
    const at = e.atome;
    if (egaleA(s, (x) => deriveeSansChaine(at, x))) return [t("Le facteur de la chaîne manque : multiplie par la dérivée de l'intérieure, "), l(`\\left(${formatInterieurLatex(at)}\\right)'=${at.interieurA}`), t(".")];
    return null;
  }
  if (e.famille === "reglebase") {
    if (egaleA(s, (x) => e.atomes.reduce((acc, a) => acc + deriveeSigneCos(a, x), 0))) return [t("Vérifie le signe : "), l("(\\cos x)'=-\\sin x"), t(", alors que "), l("(\\sin x)'=\\cos x"), t(".")];
    return null;
  }
  return null;
}

export { sansFx };
