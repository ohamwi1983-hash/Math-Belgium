import type { CandidatInvalide, CandidatValide, Exercice112, Phase112 } from "../core6e/fonctionRepartition";
import { Fi, cumuls, phases112, probaContinue, probaIntervalle, probaIntervalleContinue, probaQueue } from "../core6e/fonctionRepartition";
import type { AideEcran, ChampEcran, Frag, OptionEcran, TableauDonnees } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { COURS, dl, dt, q, ql } from "./outilsVariablesAleatoiresLotH1";

/**
 * Couche C — textes de `6gen112` « Fonction de répartition » : loi discrète (tableau) ou deux
 * fonctions candidates (formules), consignes, champs, options, aides à deux niveaux (propriété du
 * cours, puis posée pour l'instance — jamais le résultat), réponses attendues, raisons (message du
 * choix faux, corrigé). Notation du cours : F(x) = P(X ≤ x), P(a < X ≤ b) = F(b) − F(a), F′ = f.
 */

type E = Exercice112;
type P = Phase112;
const t = tx;
const l = lx;

// ---------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------

/** Formule de F sur [0 ; L] (sans « F(x) = »). */
export function formuleF(nom: CandidatValide | CandidatInvalide, L: number): string {
  const L2 = L * L;
  switch (nom) {
    case "carre":
      return `\\dfrac{x^2}{${L2}}`;
    case "lineaire":
      return `\\dfrac{x}{${L}}`;
    case "concave":
      return `\\dfrac{${2 * L}x-x^2}{${L2}}`;
    case "cube":
      return `\\dfrac{x^3}{${L ** 3}}`;
    case "pasUn":
      return `\\dfrac{x^2}{${L * (L + 1)}}`;
    case "depasse":
      return `\\dfrac{${3 * L}x-2x^2}{${L2}}`;
    case "negative":
      return `\\dfrac{2x^2-${L}x}{${L2}}`;
  }
}

/** Densité f = F′ (LaTeX, sans « f(x) = »). */
export function formuleDensite(nom: CandidatValide, L: number): string {
  switch (nom) {
    case "carre":
      return `\\dfrac{2x}{${L * L}}`;
    case "lineaire":
      return `\\dfrac{1}{${L}}`;
    case "concave":
      return `\\dfrac{${2 * L}-2x}{${L * L}}`;
    case "cube":
      return `\\dfrac{3x^2}{${L ** 3}}`;
  }
}

/** Formule de chacune des deux fonctions (numéro 1 et 2). */
export function formules12(e: E): [string, string] {
  const v = formuleF(e.valide!, e.L!);
  const i = formuleF(e.invalide!, e.L!);
  return e.numeroValide === 1 ? [v, i] : [i, v];
}

/** Raison pour laquelle la fonction non valide n'est pas une fonction de répartition. */
export function raisonInvalide(e: E): Frag[] {
  const L = e.L!;
  const n = e.numeroValide === 1 ? 2 : 1;
  switch (e.invalide!) {
    case "pasUn":
      return [l(`F_${n}(${L})=\\dfrac{${L * L}}{${L * (L + 1)}}=${ql(q(L, L + 1))}`), t(` : elle n'atteint pas 1 en ${L}, alors que `), l(`P(X\\leq ${L})=1`), t(" (et une fonction de répartition continue ne saute pas).")];
    case "depasse":
      return [l(`F_${n}`), t(" dépasse 1 puis décroît : par exemple "), l(`F_${n}\\left(${ql(q(3 * L, 4))}\\right)=\\dfrac{9}{8}>1`), t(" ; une fonction de répartition est croissante et ne dépasse jamais 1.")];
    case "negative":
      return [l(`F_${n}`), t(" prend des valeurs négatives : par exemple "), l(`F_${n}\\left(${ql(q(L, 4))}\\right)=-\\dfrac{1}{8}`), t(" ; une probabilité n'est jamais négative.")];
  }
}

export const evenementIntervalle = (e: E): string => {
  const { i, j, type } = e.intervalle!;
  const a = e.valeurs![i]!;
  const b = e.valeurs![j]!;
  return type === "]]" ? `P(${a}<X\\leq ${b})` : type === "[]" ? `P(${a}\\leq X\\leq ${b})` : `P(${a}<X<${b})`;
};
export const evenementQueue = (e: E): string => (e.queue!.type === ">=" ? `P(X\\geq ${e.valeurs![e.queue!.k]})` : `P(X>${e.valeurs![e.queue!.k]})`);
export const evenementProba = (e: E): string => (e.proba!.type === "<=" ? `P(X\\leq ${e.proba!.a})` : `P(X>${e.proba!.a})`);
export const evenementIntervalleC = (e: E): string => `P(${e.bornes!.a}<X<${e.bornes!.b})`;

// ---------------------------------------------------------------------------
// Énoncé
// ---------------------------------------------------------------------------

export function situation112(e: E): Frag[] {
  if (e.variante === "escalier") return [t("Une variable aléatoire discrète X a la loi de probabilité ci-dessous ; on note F sa fonction de répartition.")];
  const [f1, f2] = formules12(e);
  return [
    t("Deux fonctions "),
    l("F_1"),
    t(" et "),
    l("F_2"),
    t(" sont nulles pour "),
    l("x<0"),
    t(" et valent 1 pour "),
    l(`x>${e.L}`),
    t(". Pour "),
    l(`0\\leq x\\leq ${e.L}`),
    t(" : "),
    l(`F_1(x)=${f1}`),
    t(" et "),
    l(`F_2(x)=${f2}`),
    t(`. Une seule des deux est la fonction de répartition F d'une variable aléatoire continue X à valeurs dans `),
    l(`[0\\,;${e.L}]`),
    t("."),
  ];
}

export function tableau112(e: E): TableauDonnees | null {
  if (e.variante !== "escalier") return null;
  return { horizontal: true, entetes: [[l("x_i")], [l("P(X=x_i)")]], lignes: e.valeurs!.map((x, i) => [dt(x), dt(e.probas![i]! / 100)]) };
}

export function tableauLatex112(e: E): string {
  const n = e.valeurs!.length;
  return `\\begin{array}{c|${"c".repeat(n)}}x_i&${e.valeurs!.join("&")}\\\\\\hline P(X=x_i)&${e.probas!.map((p) => dl(p / 100)).join("&")}\\end{array}`;
}

export function consigneGlobale112(e: E): Frag[] {
  if (e.variante === "escalier")
    return [t("Donne les valeurs de F en chaque valeur de X, puis calcule, à l'aide de F, "), l(evenementIntervalle(e)), t(" et "), l(evenementQueue(e)), t(".")];
  return [
    t("Laquelle des deux fonctions est la fonction de répartition de X ? Justifie. Calcule ensuite "),
    l(evenementProba(e)),
    t(" et "),
    l(evenementIntervalleC(e)),
    t(", puis donne la densité f de X sur "),
    l(`\\mathopen{]}0\\,;${e.L}\\mathclose{[}`),
    t("."),
  ];
}

export const consigneGenerale112 = (e: E): Frag[] => [...situation112(e), t(" "), ...consigneGlobale112(e)];

export function libelle112(_e: E, p: P): string {
  switch (p) {
    case "repartition":
      return "Valeurs de F";
    case "intervalle":
      return "Intervalle";
    case "queue":
      return "Complément";
    case "choix":
      return "Fonction de répartition";
    case "proba":
      return "Probabilité";
    case "intervalleC":
      return "Intervalle";
    case "densite":
      return "Densité";
  }
}

export function consigne112(e: E, p: P): Frag[] {
  switch (p) {
    case "repartition":
      return [t("Donne "), l("F(x)=P(X\\leq x)"), t(" pour chaque valeur x de X.")];
    case "intervalle":
      return [t("Calcule "), l(evenementIntervalle(e)), t(" à l'aide des valeurs de F.")];
    case "queue":
      return [t("Calcule "), l(evenementQueue(e)), t(" à l'aide des valeurs de F.")];
    case "choix":
      return [t("Laquelle des deux fonctions est une fonction de répartition ?")];
    case "proba":
      return [t("Calcule "), l(evenementProba(e)), t(" (valeur exacte).")];
    case "intervalleC":
      return [t("Calcule "), l(evenementIntervalleC(e)), t(" (valeur exacte).")];
    case "densite":
      return [t("Donne la densité f de X sur "), l(`\\mathopen{]}0\\,;${e.L}\\mathclose{[}`), t(" : une expression en x.")];
  }
}

export function champs112(e: E, p: P): ChampEcran[] {
  switch (p) {
    case "repartition":
      return e.valeurs!.map((x) => ({ label: `F(${x})`, labelLatex: `F(${x})=`, placeholder: "valeur exacte" }));
    case "intervalle":
    case "queue":
    case "proba":
    case "intervalleC":
      return [{ label: "Probabilité", labelLatex: "P=", placeholder: "valeur exacte" }];
    case "densite":
      return [{ label: "f(x)", labelLatex: "f(x)=", placeholder: "expression en x", apercu: true }];
    default:
      return [];
  }
}

export function options112(e: E): OptionEcran[] {
  const [f1, f2] = formules12(e);
  return [
    { id: "1", fragments: [l(`F_1(x)=${f1}`)] },
    { id: "2", fragments: [l(`F_2(x)=${f2}`)] },
  ];
}

// ---------------------------------------------------------------------------
// Réponses
// ---------------------------------------------------------------------------

export function reponse112(e: E, p: P): Frag[] {
  switch (p) {
    case "repartition":
      return cumuls(e).flatMap((c, i) => [...(i > 0 ? [t(" ; ")] : []), l(`F(${e.valeurs![i]})=${dl(c / 100)}`)]);
    case "intervalle":
      return [l(`${evenementIntervalle(e)}=${dl(probaIntervalle(e).valeur / 100)}`)];
    case "queue":
      return [l(`${evenementQueue(e)}=${dl(probaQueue(e).valeur / 100)}`)];
    case "choix":
      return [t(`C'est `), l(`F_${e.numeroValide}`), t(" : elle est croissante, va de 0 à 1, sans saut.")];
    case "proba":
      return [l(`${evenementProba(e)}=${ql(probaContinue(e))}`)];
    case "intervalleC":
      return [l(`${evenementIntervalleC(e)}=${ql(probaIntervalleContinue(e))}`)];
    case "densite":
      return [l(`f(x)=${formuleDensite(e.valide!, e.L!)}`)];
  }
}

export const recap112 = (e: E, p: P): Frag[] => (p === "choix" ? [l(`F=F_${e.numeroValide}`)] : reponse112(e, p));

export function messageIllisible112(_e: E, p: P): string {
  if (p === "densite") return "Expression non reconnue : écris une expression en x (par exemple 2x/9 ou 3x²/8). Cela ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre (par exemple 0,35 ou 7/16). Cela ne compte pas comme une tentative.";
}

export function aide1_112(_e: E, p: P): AideEcran {
  switch (p) {
    case "repartition":
      return { texte: [t(`Fonction de répartition ${COURS(1)} : F(x) cumule les probabilités des valeurs inférieures ou égales à x :`)], latex: "F(x)=P(X\\leq x)" };
    case "intervalle":
      return { texte: [t(`Pour une variable discrète ${COURS(1)}, la borne compte : `), l("P(a<X\\leq b)=F(b)-F(a)"), t(" ; si une borne est incluse ou exclue autrement, décale-la à la valeur voisine.")] };
    case "queue":
      return { texte: [t(`Événement contraire ${COURS(1)} : `), l("P(X>a)=1-F(a)"), t(" ; « au moins k » est le contraire de « au plus la valeur juste avant k ».")] };
    case "choix":
      return { texte: [t(`Une fonction de répartition ${COURS(3)} est croissante, vaut 0 à gauche, 1 à droite, et (pour une variable continue) ne fait aucun saut.`)] };
    case "proba":
      return { texte: [t(`Propriétés de F ${COURS(3)} :`)], latex: "P(X\\leq a)=F(a)\\qquad P(X>a)=1-F(a)" };
    case "intervalleC":
      return { texte: [t(`Propriétés de F ${COURS(3)} : strict ou large ne change rien en continu :`)], latex: "P(a<X<b)=F(b)-F(a)" };
    case "densite":
      return { texte: [t(`La densité est la dérivée de la fonction de répartition ${COURS(3)} :`)], latex: "f=F'" };
  }
}

export function aide2_112(e: E, p: P): AideEcran | null {
  switch (p) {
    case "repartition":
      return { texte: [t("Ici, additionne les probabilités au fur et à mesure :")], latex: `F(${e.valeurs![0]})=${dl(e.probas![0]! / 100)},\\quad F(${e.valeurs![1]})=${dl(e.probas![0]! / 100)}+${dl(e.probas![1]! / 100)},\\ \\ldots` };
    case "intervalle": {
      const { haut, bas } = probaIntervalle(e);
      const Fb = `F(${e.valeurs![haut]})`;
      const Fa = bas < 0 ? "0" : `F(${e.valeurs![bas]})`;
      return { texte: [t("Ici, les valeurs de X comprises dans l'intervalle donnent :")], latex: `${evenementIntervalle(e)}=${Fb}-${Fa}` };
    }
    case "queue": {
      const { indice } = probaQueue(e);
      return { texte: [t("Ici :")], latex: `${evenementQueue(e)}=1-F(${e.valeurs![indice]})` };
    }
    case "choix":
      return { texte: [t("Ici, calcule chaque fonction en "), l(`x=${e.L}`), t(" (doit valoir 1) et en une ou deux valeurs intermédiaires (entre 0 et 1, de plus en plus grandes).")] };
    case "proba":
      return { texte: [t("Ici :")], latex: e.proba!.type === "<=" ? `${evenementProba(e)}=F(${e.proba!.a})` : `${evenementProba(e)}=1-F(${e.proba!.a})` };
    case "intervalleC":
      return { texte: [t("Ici :")], latex: `${evenementIntervalleC(e)}=F(${e.bornes!.b})-F(${e.bornes!.a})` };
    case "densite":
      return { texte: [t("Ici, dérive "), l(`F(x)=${formuleF(e.valide!, e.L!)}`), t(" (le dénominateur est une constante).")] };
  }
}

export { Fi, phases112 };
