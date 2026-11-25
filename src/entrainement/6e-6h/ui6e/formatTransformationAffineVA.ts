import type { Exercice111, Phase111 } from "../core6e/transformationAffineVA";
import { PHASES_111, eY, sY, vX, vY } from "../core6e/transformationAffineVA";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { COURS, dl, dlp, dt } from "./outilsVariablesAleatoiresLotH1";

/**
 * Couche C — textes de `6gen111` « Y = aX + b » : situation (données E(X) et V(X) ou σ(X)), consignes,
 * champs, aides à deux niveaux (propriété du cours, puis posée pour l'instance — jamais le résultat),
 * réponses attendues. Propriétés : E(aX + b) = aE(X) + b, V(aX + b) = a²V(X), σ(aX + b) = |a|σ(X).
 */

type E = Exercice111;
type P = Phase111;
const t = tx;
const l = lx;
const C1 = COURS(1);

/** Donnée de dispersion de X, en KaTeX (« V(X)=6{,}25 » ou « \sigma(X)=2{,}5 »), unité éventuelle. */
function dispersion(e: E, unite: string): Frag[] {
  return e.donnee === "variance" ? [t("pour variance "), l(`V(X)=${dl(vX(e))}`)] : [t("pour écart-type "), l(`\\sigma(X)=${dl(e.sX)}`), t(unite)];
}

export function situation111(e: E): Frag[] {
  const E = l(`E(X)=${dl(e.eX)}`);
  switch (e.contexte) {
    case "devise":
      return [t("Le bénéfice journalier X (en euros) d'un stand a pour espérance "), E, t(" € et "), ...dispersion(e, " €"), t(`. On convertit ce bénéfice en dollars, au taux de 1 € pour ${dt(e.a)} dollar ; on note Y le bénéfice journalier en dollars.`)];
    case "temperature":
      return [t("La température X (en °C) relevée à midi en mai a pour espérance "), E, t(" °C et "), ...dispersion(e, " °C"), t(". On la convertit en degrés Fahrenheit : une température de "), l("x"), t(" °C vaut "), l("1{,}8x+32"), t(" °F. On note Y la température en °F.")];
    case "mise":
      return [t("À un jeu, le gain brut X (en euros) a pour espérance "), E, t(" € et "), ...dispersion(e, " €"), t(`. Pour jouer, il faut payer une mise de ${dt(-e.b)} € ; on note Y le gain net (gain brut moins la mise).`)];
    case "points":
      return [t("À un jeu, le nombre X de points marqués a pour espérance "), E, t(" et "), ...dispersion(e, ""), t(`. Chaque point rapporte ${dt(e.a)} €, et la participation coûte ${dt(-e.b)} € ; on note Y le gain net (en euros).`)];
    case "prime":
      return [t("Le nombre X de défauts relevés chaque semaine sur la production d'un ouvrier a pour espérance "), E, t(" et "), ...dispersion(e, ""), t(`. Sa prime hebdomadaire vaut ${dt(e.b)} € moins ${dt(-e.a)} € par défaut ; on note Y la prime (en euros).`)];
    case "reservoir":
      return [t(`Au départ d'un trajet, le réservoir d'une voiture contient ${dt(e.b)} L de carburant. La quantité X consommée pendant le trajet (en litres) a pour espérance `), E, t(" L et "), ...dispersion(e, " L"), t(". On note Y la quantité de carburant restant à l'arrivée (en litres).")];
  }
}

export const consigneGlobale111 = (): Frag[] => [t("Écris Y sous la forme "), l("Y=aX+b"), t(", puis calcule "), l("E(Y)"), t(", "), l("V(Y)"), t(" et "), l("\\sigma(Y)"), t(" sans chercher la loi de Y.")];

export const consigneGenerale111 = (e: E): Frag[] => [...situation111(e), t(" "), ...consigneGlobale111()];

export function libelle111(_e: E, p: P): string {
  switch (p) {
    case "coefficients":
      return "Y = aX + b";
    case "esperance":
      return "E(Y)";
    case "variance":
      return "V(Y)";
    case "ecartType":
      return "σ(Y)";
  }
}

export function consigne111(_e: E, p: P): Frag[] {
  switch (p) {
    case "coefficients":
      return [t("Écris Y en fonction de X sous la forme "), l("Y=aX+b"), t(" : donne a et b.")];
    case "esperance":
      return [t("Calcule l'espérance "), l("E(Y)"), t(".")];
    case "variance":
      return [t("Calcule la variance "), l("V(Y)"), t(".")];
    case "ecartType":
      return [t("Calcule l'écart-type "), l("\\sigma(Y)"), t(".")];
  }
}

export function champs111(_e: E, p: P): ChampEcran[] {
  switch (p) {
    case "coefficients":
      return [
        { label: "a", labelLatex: "a=", placeholder: "nombre" },
        { label: "b", labelLatex: "b=", placeholder: "nombre" },
      ];
    case "esperance":
      return [{ label: "E(Y)", labelLatex: "E(Y)=", placeholder: "valeur exacte" }];
    case "variance":
      return [{ label: "V(Y)", labelLatex: "V(Y)=", placeholder: "valeur exacte" }];
    case "ecartType":
      return [{ label: "σ(Y)", labelLatex: "\\sigma(Y)=", placeholder: "valeur exacte" }];
  }
}

const aXb = (e: E) => `Y=${e.a === 1 ? "" : e.a === -1 ? "-" : dl(e.a)}X${e.b === 0 ? "" : e.b < 0 ? dl(e.b) : `+${dl(e.b)}`}`;
export const formeAffine = aXb;

export function reponse111(e: E, p: P): Frag[] {
  switch (p) {
    case "coefficients":
      return [l(aXb(e)), t(" : "), l(`a=${dl(e.a)}`), t(" et "), l(`b=${dl(e.b)}`)];
    case "esperance":
      return [l(`E(Y)=${dl(eY(e))}`)];
    case "variance":
      return [l(`V(Y)=${dl(vY(e))}`)];
    case "ecartType":
      return [l(`\\sigma(Y)=${dl(sY(e))}`)];
  }
}

export const recap111 = (e: E, p: P): Frag[] => (p === "coefficients" ? [l(aXb(e))] : reponse111(e, p));

export const messageIllisible111 = (): string => "Nombre non reconnu : écris un nombre (par exemple 68, −2,5 ou 3/4). Cela ne compte pas comme une tentative.";

export function aide1_111(_e: E, p: P): AideEcran {
  switch (p) {
    case "coefficients":
      return { texte: [t("Exprime la quantité Y à l'aide de X, comme dans la situation : a multiplie X, b est la partie fixe (ajoutée ou retirée).")] };
    case "esperance":
      return { texte: [t(`Linéarité de l'espérance ${C1} :`)], latex: "E(aX+b)=a\\,E(X)+b" };
    case "variance":
      return { texte: [t(`Variance d'une transformation affine ${C1} : b décale toutes les valeurs sans changer leur dispersion, a la multiplie, et la variance porte le carré :`)], latex: "V(aX+b)=a^2\\,V(X)" };
    case "ecartType":
      return { texte: [t(`Écart-type ${C1} : racine carrée de la variance, donc positif :`)], latex: "\\sigma(aX+b)=|a|\\,\\sigma(X)" };
  }
}

export function aide2_111(e: E, p: P): AideEcran | null {
  switch (p) {
    case "coefficients":
      switch (e.contexte) {
        case "devise":
          return { texte: [t(`Ici, chaque euro vaut ${dt(e.a)} dollar : un bénéfice de X euros vaut combien de dollars ?`)] };
        case "temperature":
          return { texte: [t("Ici, l'énoncé donne la conversion : remplace x par X.")] };
        case "mise":
          return { texte: [t("Ici, le gain net est le gain brut moins la mise : que vaut a, que vaut b ?")] };
        case "points":
          return { texte: [t(`Ici, X points rapportent ${dt(e.a)} × X euros, puis on retire la participation.`)] };
        case "prime":
          return { texte: [t(`Ici, la prime part de ${dt(e.b)} € et perd ${dt(-e.a)} € par défaut : X défauts lui retirent combien ?`)] };
        case "reservoir":
          return { texte: [t(`Ici, il reste ce qu'il y avait au départ moins ce qui a été consommé.`)] };
      }
      break;
    case "esperance":
      return { texte: [t("Ici :")], latex: `E(Y)=${dlp(e.a)}\\times ${dlp(e.eX)}${e.b === 0 ? "" : e.b < 0 ? dl(e.b) : `+${dl(e.b)}`}` };
    case "variance":
      return e.donnee === "variance"
        ? { texte: [t("Ici :")], latex: `V(Y)=${dlp(e.a)}^2\\times ${dl(vX(e))}` }
        : { texte: [t("Ici, la variance de X est le carré de son écart-type :")], latex: `V(Y)=${dlp(e.a)}^2\\times ${dl(e.sX)}^2` };
    case "ecartType":
      return { texte: [t("Ici :")], latex: `\\sigma(Y)=|${dl(e.a)}|\\times \\sigma(X)` };
  }
  return null;
}

export { PHASES_111 };
