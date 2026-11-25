import type { Exercice110, Loi110, Phase110 } from "../core6e/varianceLoiDiscrete";
import { ecartType, esperance, esperanceCarres, phases110, s1, s2, v10000, variance } from "../core6e/varianceLoiDiscrete";
import type { AideEcran, ChampEcran, Frag, OptionEcran, TableauDonnees } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { COURS, dl, dlp, dt } from "./outilsVariablesAleatoiresLotH1";

/**
 * Couche C — textes de `6gen110` « Variance et écart-type d'une loi discrète » (6e ch. 8, § 1) :
 * situation, tableau de la loi (écran : `tableau` ; papier : tableau KaTeX), consignes, champs, aides à
 * deux niveaux (formule du cours, puis posée pour l'instance — jamais le résultat), réponses
 * attendues. Notation du cours : E(X) = Σ xᵢ P(X = xᵢ), V(X) = E(X²) − [E(X)]², σ(X) = √V(X).
 */

type E = Exercice110;
type P = Phase110;
const t = tx;
const l = lx;
const C1 = COURS(1);

const probaTexte = (p: number) => dt(p / 100);
const probaLatex = (p: number) => dl(p / 100);

export function situation110(e: E): Frag[] {
  if (e.variante === "risque")
    return [t("Deux jeux de hasard sont proposés. On note X le gain (en euros) au jeu A et Y le gain au jeu B ; un gain négatif est une perte. Leurs lois de probabilité sont données ci-dessous.")];
  switch (e.contexte) {
    case "gain":
      return [t("Un jeu de hasard rapporte un gain X (en euros ; un gain négatif est une perte), dont la loi de probabilité est donnée ci-dessous.")];
    case "pannes":
      return [t("Le nombre X de pannes d'une machine en une semaine suit la loi de probabilité ci-dessous.")];
    case "buts":
      return [t("Le nombre X de buts marqués par une équipe lors d'un match suit la loi de probabilité ci-dessous.")];
  }
}

/** Tableau de l'écran (rangées horizontales). */
export function tableau110(e: E): TableauDonnees {
  if (e.variante === "calcul") {
    return { horizontal: true, entetes: [[l("x_i")], [l("P(X=x_i)")]], lignes: e.loi.valeurs.map((x, i) => [dt(x), probaTexte(e.loi.probas[i]!)]) };
  }
  const b = e.loiB!;
  const n = Math.max(e.loi.valeurs.length, b.valeurs.length);
  return {
    horizontal: true,
    entetes: [[t("Jeu A : "), l("x_i")], [l("P(X=x_i)")], [t("Jeu B : "), l("y_i")], [l("P(Y=y_i)")]],
    lignes: Array.from({ length: n }, (_, i) => [
      i < e.loi.valeurs.length ? dt(e.loi.valeurs[i]!) : "",
      i < e.loi.valeurs.length ? probaTexte(e.loi.probas[i]!) : "",
      i < b.valeurs.length ? dt(b.valeurs[i]!) : "",
      i < b.valeurs.length ? probaTexte(b.probas[i]!) : "",
    ]),
  };
}

/** Tableau papier (KaTeX). */
export function tableauLatex110(e: E): string {
  const ligne = (nom: string, xs: number[], n: number) => `${nom}&${Array.from({ length: n }, (_, i) => (i < xs.length ? dl(xs[i]!) : "")).join("&")}`;
  const proba = (nom: string, ps: number[], n: number) => `${nom}&${Array.from({ length: n }, (_, i) => (i < ps.length ? probaLatex(ps[i]!) : "")).join("&")}`;
  if (e.variante === "calcul") {
    const n = e.loi.valeurs.length;
    return `\\begin{array}{c|${"c".repeat(n)}}${ligne("x_i", e.loi.valeurs, n)}\\\\\\hline ${proba("P(X=x_i)", e.loi.probas, n)}\\end{array}`;
  }
  const b = e.loiB!;
  const n = Math.max(e.loi.valeurs.length, b.valeurs.length);
  return `\\begin{array}{c|${"c".repeat(n)}}${ligne("\\text{Jeu A : }x_i", e.loi.valeurs, n)}\\\\\\hline ${proba("P(X=x_i)", e.loi.probas, n)}\\\\[6pt]${ligne("\\text{Jeu B : }y_i", b.valeurs, n)}\\\\\\hline ${proba("P(Y=y_i)", b.probas, n)}\\end{array}`;
}

export const consigneGlobale110 = (e: E): Frag[] =>
  e.variante === "calcul"
    ? [t("Calcule l'espérance "), l("E(X)"), t(", puis "), l("E(X^2)"), t(", la variance "), l("V(X)"), t(" par la formule de König, et enfin l'écart-type "), l("\\sigma(X)"), t(" de cette loi.")]
    : [t("Compare les espérances des deux jeux, puis leurs variances : lequel des deux jeux est le plus risqué ? Justifie par un calcul.")];

export const consigneGenerale110 = (e: E): Frag[] => [...situation110(e), t(" "), ...consigneGlobale110(e)];

export function libelle110(_e: E, p: P): string {
  switch (p) {
    case "esperance":
      return "Espérance";
    case "carres":
      return "E(X²)";
    case "variance":
      return "Variance";
    case "ecartType":
      return "Écart-type";
    case "esperances":
      return "Espérances";
    case "variances":
      return "Variances";
    case "verdict":
      return "Jeu le plus risqué";
  }
}

export function consigne110(_e: E, p: P): Frag[] {
  switch (p) {
    case "esperance":
      return [t("Calcule l'espérance "), l("E(X)"), t(" (valeur exacte).")];
    case "carres":
      return [t("Calcule "), l("E(X^2)"), t(", l'espérance du carré de X (valeur exacte).")];
    case "variance":
      return [t("Calcule la variance "), l("V(X)"), t(" par la formule de König (valeur exacte).")];
    case "ecartType":
      return [t("Calcule l'écart-type "), l("\\sigma(X)"), t(" (c'est un nombre décimal : donne-le sans racine).")];
    case "esperances":
      return [t("Calcule l'espérance de gain de chaque jeu (valeurs exactes).")];
    case "variances":
      return [t("Calcule la variance de chaque jeu (valeurs exactes).")];
    case "verdict":
      return [t("Les deux jeux ont la même espérance. Lequel est le plus risqué (ses gains sont les plus dispersés autour de l'espérance) ?")];
  }
}

export function champs110(_e: E, p: P): ChampEcran[] {
  switch (p) {
    case "esperance":
      return [{ label: "E(X)", labelLatex: "E(X)=", placeholder: "valeur exacte" }];
    case "carres":
      return [{ label: "E(X²)", labelLatex: "E(X^2)=", placeholder: "valeur exacte" }];
    case "variance":
      return [{ label: "V(X)", labelLatex: "V(X)=", placeholder: "valeur exacte" }];
    case "ecartType":
      return [{ label: "σ(X)", labelLatex: "\\sigma(X)=", placeholder: "nombre décimal" }];
    case "esperances":
      return [
        { label: "E(X)", labelLatex: "E(X)=", placeholder: "jeu A" },
        { label: "E(Y)", labelLatex: "E(Y)=", placeholder: "jeu B" },
      ];
    case "variances":
      return [
        { label: "V(X)", labelLatex: "V(X)=", placeholder: "jeu A" },
        { label: "V(Y)", labelLatex: "V(Y)=", placeholder: "jeu B" },
      ];
    case "verdict":
      return [];
  }
}

export const OPTIONS_VERDICT_110: OptionEcran[] = [
  { id: "A", fragments: [t("Le jeu A")] },
  { id: "B", fragments: [t("Le jeu B")] },
];

// ---------------------------------------------------------------------------
// Écritures des sommes (aides, corrigé)
// ---------------------------------------------------------------------------

/** « 2\times0{,}15+3\times0{,}25+… » (`carre` : xᵢ²), `nb` premiers termes puis « + … » si tronqué. */
export function sommeProduits(loi: Loi110, carre: boolean, nb = loi.valeurs.length): string {
  const termes = loi.valeurs.slice(0, nb).map((x, i) => `${carre ? `${dlp(x)}^2` : dlp(x)}\\times ${probaLatex(loi.probas[i]!)}`);
  return termes.join("+") + (nb < loi.valeurs.length ? "+\\ldots" : "");
}

export const nomVA = (e: E, jeu: "A" | "B") => (e.variante === "calcul" || jeu === "A" ? "X" : "Y");

export function reponse110(e: E, p: P): Frag[] {
  const L = e.loi;
  switch (p) {
    case "esperance":
      return [l(`E(X)=${dl(esperance(L))}`)];
    case "carres":
      return [l(`E(X^2)=${dl(esperanceCarres(L))}`)];
    case "variance":
      return [l(`V(X)=${dl(variance(L))}`)];
    case "ecartType":
      return [l(`\\sigma(X)=${dl(ecartType(L))}`)];
    case "esperances":
      return [l(`E(X)=E(Y)=${dl(esperance(L))}`)];
    case "variances":
      return [l(`V(X)=${dl(variance(L))}`), t(" et "), l(`V(Y)=${dl(variance(e.loiB!))}`)];
    case "verdict":
      return [t(`Le jeu ${e.plusRisque} : sa variance est la plus grande (`), l(e.plusRisque === "A" ? `${dl(variance(L))}>${dl(variance(e.loiB!))}` : `${dl(variance(e.loiB!))}>${dl(variance(L))}`), t(").")];
  }
}

export const recap110 = (e: E, p: P): Frag[] => (p === "verdict" ? [t(`Le jeu ${e.plusRisque}`)] : reponse110(e, p));

export function messageIllisible110(_e: E, p: P): string {
  if (p === "ecartType") return "Nombre non reconnu : écris un nombre décimal (par exemple 1,5). Cela ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre (par exemple 3,85, −1,2 ou 7/4). Cela ne compte pas comme une tentative.";
}

export function aide1_110(_e: E, p: P): AideEcran {
  switch (p) {
    case "esperance":
    case "esperances":
      return { texte: [t(`Espérance ${C1} : la moyenne des valeurs, pondérée par leurs probabilités :`)], latex: "E(X)=\\sum x_i\\times P(X=x_i)" };
    case "carres":
      return { texte: [t(`Même somme pondérée ${C1}, mais avec les carrés des valeurs :`)], latex: "E(X^2)=\\sum x_i^2\\times P(X=x_i)" };
    case "variance":
    case "variances":
      return { texte: [t(`Formule de König ${C1} :`)], latex: "V(X)=E(X^2)-[E(X)]^2" };
    case "ecartType":
      return { texte: [t(`L'écart-type ${C1} est la racine carrée de la variance :`)], latex: "\\sigma(X)=\\sqrt{V(X)}" };
    case "verdict":
      return { texte: [t(`La variance ${C1} mesure la dispersion des valeurs autour de l'espérance : à espérance égale, le jeu le plus risqué est celui dont la variance (ou l'écart-type) est la plus grande.`)] };
  }
}

export function aide2_110(e: E, p: P): AideEcran | null {
  const L = e.loi;
  switch (p) {
    case "esperance":
      return { texte: [t("Ici, commence la somme :")], latex: `E(X)=${sommeProduits(L, false, 2)}` };
    case "carres":
      return { texte: [t(L.valeurs[0]! < 0 ? "Ici, commence la somme (attention au carré d'une valeur négative) :" : "Ici, commence la somme :")], latex: `E(X^2)=${sommeProduits(L, true, 2)}` };
    case "variance":
      return { texte: [t("Ici, avec les deux valeurs trouvées :")], latex: `V(X)=${dl(esperanceCarres(L))}-${dlp(esperance(L))}^2` };
    case "ecartType":
      return { texte: [t("Ici, cherche le nombre positif dont le carré vaut la variance :")], latex: `\\sigma(X)=\\sqrt{${dl(variance(L))}}` };
    case "esperances":
      return { texte: [t("Ici, pour le jeu A :")], latex: `E(X)=${sommeProduits(L, false, 2)}` };
    case "variances":
      return { texte: [t("Ici, calcule d'abord "), l("E(X^2)"), t(" et "), l("E(Y^2)"), t(" ; pour le jeu A :")], latex: `E(X^2)=${sommeProduits(L, true, 2)}` };
    case "verdict":
      return { texte: [t("Compare les deux variances trouvées à l'écran précédent.")] };
  }
}

export { phases110, s1, s2, v10000 };
