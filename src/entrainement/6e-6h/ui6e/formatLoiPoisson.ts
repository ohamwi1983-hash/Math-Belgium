import type { ConditionPoisson, ExerciceLoiPoisson, ExerciceLoiPoissonB } from "../core6e/loiPoisson.types";
import { resultatB } from "../generateurs6e/loiPoisson/familles";
import { probabilitePoisson } from "../generateurs6e/loiPoisson/poisson";
import { lambdaA } from "../moteur6e/verificationLoiPoisson";
import type { PhaseLoiPoisson } from "../moteur6e/typesLoiPoisson";
import { vautEnviron } from "../moteur6e/saisieVariablesAleatoires";
import { arrondiLatex, decimalLatex, f, m, t } from "./fragmentsCombinatoire";
import type { ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen53` (6e ch. 8, § 8) — audit, lots B et C : X défini, consigne d'arrondi explicite,
 * virgule décimale (avant : « 0.1754673698 »), aucun exemple de champ (« ex : 5 » était λ), aides qui
 * ne confirment plus deux conditions sur trois, plus de « termes CONFIRMÉS » jamais confirmés.
 */

type E = ExerciceLoiPoisson;
type P = PhaseLoiPoisson;

export const LIBELLES_CONDITION_POISSON: Record<ConditionPoisson, string> = {
  n: "$n\\geq 30$",
  p: "$p\\leq 0{,}1$",
  np: "$n\\times p\\leq 15$",
};

export function evenementB(e: ExerciceLoiPoissonB): string {
  switch (e.typeQuestion) {
    case "exactement":
      return `P(X=${e.k})`;
    case "auPlus":
      return `P(X\\leq ${e.k})`;
    case "auMoins":
      return `P(X\\geq ${e.k})`;
    case "entreAetB":
      return `P(${e.k}\\leq X\\leq ${e.kHaut})`;
  }
}

function p4(x: number): string {
  return arrondiLatex(x, 4);
}

function sommeLatex(lambda: number, a: number, b: number): string {
  let s = 0;
  for (let i = a; i <= b; i++) s += probabilitePoisson(lambda, i);
  return p4(s);
}

export const FORMAT_6GEN53: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    if (e.famille === "A") return [t("Approximation d'une loi binomiale par une loi de Poisson (conditions du cours : "), m("n\\geq 30"), t(", "), m("p\\leq 0{,}1"), t(", "), m("n\\times p\\leq 15"), t("). Probabilités arrondies à "), m("10^{-4}"), t(".")];
    return [m("X"), t(" suit une loi de Poisson ; ajuste d'abord "), m("\\lambda"), t(" à la situation. Probabilités arrondies à "), m("10^{-4}"), t(".")];
  },
  donnees(e): FragmentConsigne[][] {
    if (e.famille === "A") return [[...f(e.texte), t(" On s'intéresse à "), m(`P(X=${e.k})`), t(".")]];
    return [[t(e.texte + ` On note `), m("X"), t(` ${e.definitionX}. On cherche `), m(evenementB(e)), t(".")]];
  },
  consigneEcran(e, p) {
    switch (p) {
      case "aVerdict":
        return [t("Peut-on approcher la loi de "), m("X"), t(" par une loi de Poisson ?")];
      case "aCondition":
        return [t("Quelle condition n'est pas vérifiée ?")];
      case "aLambda":
      case "bLambda":
        return [t("Quel est le paramètre "), m("\\lambda"), t(" de la loi de Poisson ?")];
      case "aProba":
        return e.famille === "A" ? [t("Calcule "), m(`P(X=${e.k})`), t(", arrondie à "), m("10^{-4}"), t(".")] : [];
      case "bProba":
        return e.famille === "B" ? [t("Calcule "), m(evenementB(e)), t(", arrondie à "), m("10^{-4}"), t(".")] : [];
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "aVerdict":
        return [
          {
            type: "choix",
            label: "",
            options: [
              { valeur: "oui", label: "Oui, les trois conditions sont vérifiées" },
              { valeur: "non", label: "Non, une condition n'est pas vérifiée" },
            ],
          },
        ];
      case "aCondition":
        return [{ type: "choix", label: "", options: (["n", "p", "np"] as ConditionPoisson[]).map((c) => ({ valeur: c, label: LIBELLES_CONDITION_POISSON[c] })) }];
      case "aLambda":
      case "bLambda":
        return [{ type: "texte", label: "$\\lambda$" }];
      case "aProba":
        return e.famille === "A" ? [{ type: "texte", label: `$P(X=${e.k})$` }] : [];
      case "bProba":
        return e.famille === "B" ? [{ type: "texte", label: `$${evenementB(e)}$` }] : [];
    }
  },
  aides(e, p) {
    switch (p) {
      case "aVerdict":
      case "aCondition":
        return [
          { texte: "On peut approcher une loi binomiale $\\mathcal{B}(n\\,;\\,p)$ par une loi de Poisson si les trois conditions sont vérifiées : $n\\geq 30$, $p\\leq 0{,}1$ et $n\\times p\\leq 15$." },
          { texte: "Repère $n$ (nombre d'épreuves) et $p$ dans le texte, puis teste chaque condition, $n\\times p$ compris." },
        ];
      case "aLambda":
        return [{ texte: "Pour l'approximation, on garde la même espérance :", latex: "\\lambda=n\\times p" }, { texte: "Repère $n$ et $p$ dans le texte." }];
      case "bLambda":
        return [
          { texte: "$\\lambda$ est le nombre moyen d'événements sur la durée ou l'effectif étudiés : on adapte le taux donné à l'échelle de la question." },
          { texte: "Compare l'échelle du taux (par minute, pour 1 000…) à celle de la question : combien de fois est-elle plus grande ?" },
        ];
      case "aProba":
        return [{ texte: "Loi de Poisson :", latex: "P(X=k)=e^{-\\lambda}\\,\\dfrac{\\lambda^{k}}{k!}" }, { texte: "Remplace $\\lambda$ (écran précédent) et $k$ ; à la calculatrice, la loi de Poisson donne aussi la valeur directement." }];
      case "bProba":
        return e.famille === "B"
          ? [
              { texte: "Chaque terme se calcule par :", latex: "P(X=k)=e^{-\\lambda}\\,\\dfrac{\\lambda^{k}}{k!}" },
              {
                texte:
                  e.typeQuestion === "exactement"
                    ? "Un seul terme : remplace $\\lambda$ et $k$."
                    : e.typeQuestion === "auMoins"
                      ? "« Au moins » contient beaucoup de valeurs : passe par l'événement contraire, en faisant attention à sa première valeur."
                      : "Additionne les probabilités des valeurs concernées (ou utilise les probabilités cumulées de la calculatrice), sans arrondir les termes en route.",
              },
            ]
          : [];
    }
  },
  reponseAttendue(e, p) {
    if (e.famille === "A") {
      if (p === "aVerdict") return [e.approximable ? "\\text{oui}" : "\\text{non}"];
      if (p === "aCondition") return [LIBELLES_CONDITION_POISSON[e.condition ?? "n"].replace(/\$/g, "") + "\\ \\text{n'est pas vérifiée}"];
      if (p === "aLambda") return [`\\lambda=${decimalLatex(lambdaA(e))}`];
      return [`P(X=${e.k})\\approx ${p4(probabilitePoisson(lambdaA(e), e.k))}`];
    }
    if (p === "bLambda") return [`\\lambda=${decimalLatex(e.lambda)}`];
    return [`${evenementB(e)}\\approx ${p4(resultatB(e))}`];
  },
  explication(e, p) {
    if (e.famille === "A") {
      const lam = lambdaA(e);
      const pp = decimalLatex(e.pCentiemes / 100);
      const verifs = `$n=${e.n}$ ${e.n >= 30 ? "≥" : "<"} 30 ; $p=${pp}$ ${e.pCentiemes <= 10 ? "≤" : ">"} 0,1 ; $n\\times p=${decimalLatex(lam)}$ ${lam <= 15 ? "≤" : ">"} 15.`;
      if (p === "aVerdict" || p === "aCondition") return [f(verifs), f(e.approximable ? "Les trois conditions sont vérifiées : on peut approcher par une loi de Poisson." : "Une condition échoue : l'approximation de Poisson n'est pas justifiée.")];
      if (p === "aLambda") return [f(`$\\lambda=n\\times p=${e.n}\\times ${pp}=${decimalLatex(lam)}$.`)];
      return [f(`$P(X=${e.k})=e^{-${decimalLatex(lam)}}\\times\\dfrac{${decimalLatex(lam)}^{${e.k}}}{${e.k}!}\\approx ${p4(probabilitePoisson(lam, e.k))}$.`)];
    }
    if (p === "bLambda") return [f(`On adapte le taux à l'échelle de la question : $\\lambda=${e.calculLambda}=${decimalLatex(e.lambda)}$.`)];
    const lam = decimalLatex(e.lambda);
    switch (e.typeQuestion) {
      case "exactement":
        return [f(`$P(X=${e.k})=e^{-${lam}}\\times\\dfrac{${lam}^{${e.k}}}{${e.k}!}\\approx ${p4(resultatB(e))}$.`)];
      case "auPlus":
        return [f(`$P(X\\leq ${e.k})=P(X=0)+\\ldots+P(X=${e.k})\\approx ${p4(resultatB(e))}$ (probabilités cumulées).`)];
      case "auMoins":
        return [f(`Le contraire de « $X\\geq ${e.k}$ » est « $X\\leq ${e.k - 1}$ » : $P(X\\geq ${e.k})=1-P(X\\leq ${e.k - 1})\\approx 1-${sommeLatex(e.lambda, 0, e.k - 1)}=${p4(resultatB(e))}$.`)];
      case "entreAetB":
        return [f(`$P(${e.k}\\leq X\\leq ${e.kHaut})=P(X=${e.k})+\\ldots+P(X=${e.kHaut})\\approx ${p4(resultatB(e))}$ (ou $P(X\\leq ${e.kHaut})-P(X\\leq ${e.k - 1})$).`)];
    }
  },
  libellePhase(_e, p) {
    const l: Record<P, string> = { aVerdict: "Approximable ?", aCondition: "Condition non vérifiée", aLambda: "Paramètre λ", aProba: "Probabilité", bLambda: "Paramètre λ", bProba: "Probabilité" };
    return l[p];
  },
  messageCible(e, p, valeurs) {
    const v = valeurs[0] ?? "";
    if (e.famille === "B" && p === "bProba") {
      const P = (i: number) => probabilitePoisson(e.lambda, i);
      let cum = 0;
      for (let i = 0; i <= e.k; i++) cum += P(i);
      if (e.typeQuestion === "auMoins" && vautEnviron(v, 1 - cum, 2e-4)) return f(`« Au moins ${e.k} » contient la valeur ${e.k} : son contraire est $X\\leq ${e.k - 1}$, pas $X\\leq ${e.k}$.`);
      if (e.typeQuestion === "entreAetB" && vautEnviron(v, resultatB(e) - P(e.k), 2e-4)) return [t(`La valeur ${e.k} est comprise dans l'intervalle : ajoute aussi son terme.`)];
      if (e.typeQuestion === "auPlus" && vautEnviron(v, cum - P(e.k), 2e-4)) return [t(`« Au plus ${e.k} » contient la valeur ${e.k}.`)];
      return null;
    }
    return null;
  },
};
