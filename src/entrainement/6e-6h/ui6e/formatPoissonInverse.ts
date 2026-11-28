import type { ExercicePL, PhasePL } from "../core6e/poissonInverse";
import { lambdaAjuste, lambdaBase, lambdaFinal, modes, p0, phases, probaFinale, seuil } from "../core6e/poissonInverse";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { nL, p4L } from "./textesLoisLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationPoissonInverse";
import { correctionDetailleePL } from "../generateurs6e/poissonInverse/corrigeDetaille";

/**
 * Couche C — textes de `6gen121` « Poisson : λ inconnu, valeur la plus probable, seuil d'alerte ».
 * Source unique de l'écran, du papier et du corrigé. Notation du cours : P(X = k) = e^(−λ)·λᵏ/k!,
 * récurrence P(X = k) = P(X = k − 1)·λ/k, E(X) = V(X) = λ.
 */

type E = ExercicePL;
type P = PhasePL;
const t = tx;
const l = lx;

export const PRECISION = "Arrondis les probabilités au dix-millième.";

/** Échelle ajustée (lambdaZero, seuil) en mots : « en 3 minutes », « sur 4 pages », « sur 3 mois ». */
function echelle(e: E): Frag[] {
  const m = e.d.m!;
  if (e.variante === "lambdaZero") {
    if (e.ctx === 0) return [t("en "), l(`${m}`), t(" minutes")];
    if (e.ctx === 1) return [t("en "), l(`${5 * m}`), t(" minutes")];
    return [t("sur "), l(`${m}`), t(" pages")];
  }
  const [u1, u2] = e.ctx === 1 ? ["une semaine", "semaines"] : ["un mois", "mois"];
  return m === 1 ? [t(`en ${u1}`)] : [t("sur "), l(`${m}`), t(` ${u2}`)];
}

/** Objet compté, au pluriel (« appels », « clients », « fautes »…). */
function objets(e: E): string {
  const o: Record<string, string[]> = { lambdaZero: ["appels", "clients", "fautes"], egalite: ["buts", "colis", "pannes"], mode: ["gâteaux", "appels", "météores"], seuil: ["cas", "intoxications", "pannes graves"] };
  return o[e.variante]![e.ctx]!;
}

export function evenementL(e: E): string {
  if (e.variante === "mode") return "P(X=k)";
  if (e.variante === "seuil") return `P(X\\ge ${seuil(lambdaFinal(e), e.d.a100! / 100)})`;
  const X = e.variante === "lambdaZero" ? "Y" : "X";
  return e.d.q === 1 ? `P(${X}\\le 1)` : `P(${X}=${e.d.j})`;
}

export function situation(e: E): Frag[] {
  const d = e.d;
  switch (e.variante) {
    case "lambdaZero": {
      const debut = [
        [t("Le nombre "), l("X"), t(" d'appels reçus par un standard en une minute suit une loi de Poisson. La probabilité de ne recevoir aucun appel en une minute vaut "), l(p4L(p0(e))), t(".")],
        [t("Le nombre "), l("X"), t(" de clients qui entrent dans une boutique en 5 minutes suit une loi de Poisson. La probabilité qu'aucun client n'entre en 5 minutes vaut "), l(p4L(p0(e))), t(".")],
        [t("Le nombre "), l("X"), t(" de fautes de frappe sur une page d'un livre suit une loi de Poisson. La probabilité qu'une page ne contienne aucune faute vaut "), l(p4L(p0(e))), t(".")],
      ][e.ctx]!;
      return [...debut, t(" On note "), l("Y"), t(` le nombre de ${objets(e)} `), ...echelle(e), t(" ; "), l("Y"), t(" suit aussi une loi de Poisson.")];
    }
    case "egalite": {
      const debut = [
        [t("Le nombre "), l("X"), t(" de buts marqués par une équipe lors d'un match suit une loi de Poisson.")],
        [t("Le nombre "), l("X"), t(" de colis livrés en une heure à un point relais suit une loi de Poisson.")],
        [t("Le nombre "), l("X"), t(" de pannes d'un ascenseur en un mois suit une loi de Poisson.")],
      ][e.ctx]!;
      const c = d.c2! / 2;
      return [...debut, t(" On a observé que "), l(c === 1 ? `P(X=${d.k! + 1})=P(X=${d.k})` : `P(X=${d.k! + 1})=${nL(c)}\\times P(X=${d.k})`), t(".")];
    }
    case "mode": {
      const L = l(nL(lambdaBase(e)));
      return [
        [t("Une boulangerie vend en moyenne "), L, t(" gâteaux d'anniversaire par jour ; le nombre "), l("X"), t(" de gâteaux vendus un jour donné suit une loi de Poisson.")],
        [t("Le service d'urgence d'une petite ville reçoit en moyenne "), L, t(" appels par heure ; le nombre "), l("X"), t(" d'appels en une heure suit une loi de Poisson.")],
        [t("Lors d'une nuit d'observation, on voit en moyenne "), L, t(" météores par heure ; le nombre "), l("X"), t(" de météores vus en une heure suit une loi de Poisson.")],
      ][e.ctx]!;
    }
    case "seuil": {
      const r = l(nL(lambdaBase(e)));
      const debut = [
        [t("Une maladie rare provoque en moyenne "), r, t(" cas par mois dans une région.")],
        [t("Un hôpital reçoit en moyenne "), r, t(" intoxications par des champignons par semaine, en automne.")],
        [t("Un service de maintenance observe en moyenne "), r, t(" pannes graves par mois sur ses machines.")],
      ][e.ctx]!;
      return [...debut, t(" Le nombre "), l("X"), t(` de ${objets(e)} `), ...echelle(e), t(" suit une loi de Poisson. Une alerte est déclenchée si "), l("X"), t(" atteint un seuil "), l("k"), t(" qui n'avait qu'une probabilité d'au plus "), l(`${d.a100}\\,\\%`), t(" d'être atteint ou dépassé.")];
    }
  }
}

export function question(e: E): Frag[] {
  switch (e.variante) {
    case "lambdaZero":
      return [t("Détermine le paramètre "), l("\\lambda"), t(" de la loi de "), l("X"), t(" (au centième), puis celui de "), l("Y"), t(", et calcule "), l(evenementL(e)), t(". "), t(PRECISION)];
    case "egalite":
      return [t("Détermine le paramètre "), l("\\lambda"), t(", l'espérance et l'écart-type de "), l("X"), t(" (au centième), puis calcule "), l(evenementL(e)), t(". "), t(PRECISION)];
    case "mode":
      return [t("Quelle est la valeur la plus probable de "), l("X"), t(" (s'il y en a deux, donne les deux) ? Justifie avec la relation "), l("P(X=k)=P(X=k-1)\\times\\dfrac{\\lambda}{k}"), t(", puis calcule sa probabilité. "), t(PRECISION)];
    case "seuil":
      return [t("Détermine le paramètre "), l("\\lambda"), t(", puis le plus petit seuil "), l("k"), t(" d'alerte et la probabilité "), l("P(X\\ge k)"), t(". "), t(PRECISION)];
  }
}

export const consigneGenerale = (e: E): Frag[] => [...situation(e), t(" "), ...question(e)];

export function libelle(_e: E, p: P): string {
  const L: Record<P, string> = { lambda: "Paramètre λ", lambdaAjuste: "λ ajusté", esperance: "E(X) et σ(X)", mode: "Valeur(s) la plus probable", seuil: "Seuil d'alerte", proba: "Probabilité" };
  return L[p];
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "lambda":
      return e.variante === "lambdaZero" ? [t("Détermine le paramètre "), l("\\lambda"), t(" de la loi de "), l("X"), t(", au centième.")] : [t("Détermine le paramètre "), l("\\lambda"), t(" à partir de la relation observée.")];
    case "lambdaAjuste":
      return e.variante === "lambdaZero" ? [t("Quel est le paramètre de la loi de "), l("Y"), t(" ?")] : [t("Quel est le paramètre "), l("\\lambda"), t(" de la loi de "), l("X"), t(" ?")];
    case "esperance":
      return [t("Donne l'espérance "), l("E(X)"), t(" et l'écart-type "), l("\\sigma(X)"), t(" (au centième).")];
    case "mode":
      return [t("Quelle est la valeur la plus probable de "), l("X"), t(" ? S'il y en a deux, sépare-les par un point-virgule.")];
    case "seuil":
      return [t("Quel est le plus petit seuil "), l("k"), t(" tel que "), l(`P(X\\ge k)\\le ${nL(e.d.a100! / 100)}`), t(" ?")];
    case "proba":
      return e.variante === "mode" ? [t("Calcule la probabilité de cette valeur la plus probable (quatre décimales).")] : [t("Calcule "), l(evenementL(e)), t(" (quatre décimales).")];
  }
}

export function champs(_e: E, p: P): ChampEcran[] {
  switch (p) {
    case "lambda":
    case "lambdaAjuste":
      return [{ label: "λ", labelLatex: "\\lambda=", placeholder: "nombre" }];
    case "esperance":
      return [
        { label: "E(X)", labelLatex: "E(X)=", placeholder: "nombre" },
        { label: "σ(X)", labelLatex: "\\sigma(X)=", placeholder: "au centième" },
      ];
    case "mode":
      return [{ label: "Valeur(s) la plus probable", labelLatex: "k=", placeholder: "entier (ou deux, séparés par « ; »)" }];
    case "seuil":
      return [{ label: "Seuil k", labelLatex: "k=", placeholder: "entier" }];
    default:
      return [{ label: "Probabilité", labelLatex: "P=", placeholder: "quatre décimales" }];
  }
}

const sigmaL = (lam: number) => (Math.abs(Math.sqrt(lam) * 100 - Math.round(Math.sqrt(lam) * 100)) < 1e-9 ? nL(Math.sqrt(lam)) : `\\sqrt{${nL(lam)}}\\approx ${nL(Math.round(Math.sqrt(lam) * 100) / 100, 2)}`);

export function reponse(e: E, p: P): Frag[] {
  switch (p) {
    case "lambda":
      return [l(`\\lambda=${nL(lambdaBase(e))}`)];
    case "lambdaAjuste":
      return [l(`\\lambda=${nL(lambdaAjuste(e))}`)];
    case "esperance":
      return [l(`E(X)=${nL(lambdaBase(e))}`), t(" et "), l(`\\sigma(X)=${sigmaL(lambdaBase(e))}`)];
    case "mode": {
      const m = modes(lambdaFinal(e));
      return m.length === 2 ? [l(`k=${m[0]}`), t(" et "), l(`k=${m[1]}`), t(" (même probabilité)")] : [l(`k=${m[0]}`)];
    }
    case "seuil":
      return [l(`k=${seuil(lambdaFinal(e), e.d.a100! / 100)}`)];
    case "proba":
      return [l(`${e.variante === "mode" ? `P(X=${modes(lambdaFinal(e))[0]})` : evenementL(e)}\\approx ${p4L(Math.round(probaFinale(e) * 1e4) / 1e4)}`)];
  }
}

export const recap = reponse;

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "lambda":
      return e.variante === "lambdaZero" ? { texte: [t("Formule du cours pour "), l("k=0"), t(" :")], latex: "P(X=0)=e^{-\\lambda}" } : { texte: [t("Récurrence du cours (point 8) :")], latex: "P(X=k)=P(X=k-1)\\times\\dfrac{\\lambda}{k}" };
    case "lambdaAjuste":
      return { texte: [l("\\lambda"), t(" est le nombre moyen d'événements sur l'échelle de la question : il est proportionnel à la durée (ou au nombre de pages).")] };
    case "esperance":
      return { texte: [t("Propriété de la loi de Poisson (cours, point 8) :")], latex: "E(X)=V(X)=\\lambda\\qquad \\sigma(X)=\\sqrt{V(X)}" };
    case "mode":
      return { texte: [t("Avec la récurrence, "), l("P(X=k)>P(X=k-1)"), t(" tant que "), l("\\dfrac{\\lambda}{k}>1"), t(", c'est-à-dire "), l("k<\\lambda"), t(" ; égalité si "), l("k=\\lambda"), t(".")] };
    case "seuil":
      return { texte: [t("Calcule "), l("P(X\\ge k)"), t(" pour des valeurs de "), l("k"), t(" croissantes, avec le contraire :")], latex: "P(X\\ge k)=1-P(X\\le k-1)" };
    default:
      return { texte: [t("Loi de Poisson :")], latex: "P(X=k)=e^{-\\lambda}\\,\\dfrac{\\lambda^k}{k!}" };
  }
}

export function aide2(e: E, p: P): AideEcran | null {
  const d = e.d;
  switch (p) {
    case "lambda":
      return e.variante === "lambdaZero" ? { texte: [t("Ici :")], latex: `e^{-\\lambda}=${p4L(p0(e))}` } : { texte: [t("Ici, avec "), l(`k=${d.k! + 1}`), t(" :")], latex: `\\dfrac{\\lambda}{${d.k! + 1}}=${nL(d.c2! / 2)}` };
    case "lambdaAjuste":
      return { texte: [t("Ici, l'échelle de la question est "), l(`${d.m}`), t(" fois celle du taux connu.")] };
    case "esperance":
      return { texte: [t("Ici "), l(`\\lambda=${nL(lambdaBase(e))}`), t(".")] };
    case "mode":
      return { texte: [t("Ici "), l(`\\lambda=${nL(lambdaFinal(e))}`), t(" : compare "), l("k"), t(" à "), l("\\lambda"), t(" (est-il entier ?).")] };
    case "seuil":
      return { texte: [t("Ici "), l(`\\lambda=${nL(lambdaFinal(e))}`), t(" : commence vers "), l(`k=${Math.max(1, Math.round(lambdaFinal(e)))}`), t(" et monte jusqu'à passer sous "), l(nL(d.a100! / 100)), t(".")] };
    default:
      if (e.variante === "mode") return { texte: [t("Ici :")], latex: `P(X=k)=e^{-${nL(lambdaFinal(e))}}\\,\\dfrac{${nL(lambdaFinal(e))}^k}{k!}` };
      if (e.variante === "seuil") return { texte: [t("Ici :")], latex: `${evenementL(e)}=1-P(X\\le ${seuil(lambdaFinal(e), d.a100! / 100) - 1})` };
      return d.q === 1 ? { texte: [t("Ici, deux cas, avec "), l(`\\lambda=${nL(lambdaFinal(e))}`), t(" :")], latex: `${evenementL(e)}=P(\\cdot=0)+P(\\cdot=1)`.replace(/\\cdot/g, e.variante === "lambdaZero" ? "Y" : "X") } : { texte: [t("Ici, avec "), l(`\\lambda=${nL(lambdaFinal(e))}`), t(" et "), l(`k=${d.j}`), t(".")] };
  }
}

/** `6gen121` : trois écrans (deux pour « mode »), champs à trois tentatives. */
export const DEFINITION_PL: DefinitionEcrans<E, P> = {
  phases,
  estChoix: () => false,
  mode: (e, p) => ({ type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  diagnostiquer,
  piege,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  correction: correctionDetailleePL,
};
