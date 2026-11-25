import type { Exercice113, G113, Phase113 } from "../core6e/densiteProbabilite";
import { bornesQueue, esperance113, phases113, probaIntervalle113, probaQueue113, support, valeurK } from "../core6e/densiteProbabilite";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { densiteSvg } from "./figuresVariablesAleatoiresLotH1";
import { COURS, ql } from "./outilsVariablesAleatoiresLotH1";

/**
 * Couche C — textes de `6gen113` « Densité de probabilité » : densité tracée (figure : sommets sur le
 * quadrillage, hauteurs « k » et « 2k ») ou donnée par une formule, consignes, champs, aides à deux
 * niveaux (propriété du cours, puis posée pour l'instance — jamais le résultat), réponses attendues.
 * Notation du cours : ∫ f = 1 sur le support, P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx (aire), E(X) = ∫ x f(x) dx.
 */

type E = Exercice113;
type P = Phase113;
const t = tx;
const l = lx;
const C3 = COURS(3);

/** g(x) en LaTeX (« x », « x^2 », « 4-x », « x(4-x) »). */
export function gLatex(g: G113, L: number): string {
  switch (g) {
    case "x":
      return "x";
    case "x2":
      return "x^2";
    case "Lmx":
      return `(${L}-x)`;
    case "xLmx":
      return `x(${L}-x)`;
  }
}

/** Primitive G de g (LaTeX, variable x). */
export function primitiveLatex(g: G113, L: number): string {
  switch (g) {
    case "x":
      return "\\dfrac{x^2}{2}";
    case "x2":
      return "\\dfrac{x^3}{3}";
    case "Lmx":
      return `${L}x-\\dfrac{x^2}{2}`;
    case "xLmx":
      return `\\dfrac{${L}x^2}{2}-\\dfrac{x^3}{3}`;
  }
}

/** x·g(x) développé (intégrande de l'espérance) et sa primitive. */
export function xgLatex(g: G113, L: number): { integrande: string; primitive: string } {
  switch (g) {
    case "x":
      return { integrande: "x^2", primitive: "\\dfrac{x^3}{3}" };
    case "x2":
      return { integrande: "x^3", primitive: "\\dfrac{x^4}{4}" };
    case "Lmx":
      return { integrande: `${L}x-x^2`, primitive: `\\dfrac{${L}x^2}{2}-\\dfrac{x^3}{3}` };
    case "xLmx":
      return { integrande: `${L}x^2-x^3`, primitive: `\\dfrac{${L}x^3}{3}-\\dfrac{x^4}{4}` };
  }
}

export const fLatex = (e: E) => `f(x)=k${gLatex(e.g!, e.L!)}`;

export const evenementIntervalle113 = (e: E) => `P(${e.a}\\leq X\\leq ${e.b})`;
export const evenementQueue113 = (e: E) => (e.queue!.type === ">=" ? `P(X\\geq ${e.queue!.c})` : `P(X\\leq ${e.queue!.c})`);

export function figure113(e: E): string | null {
  return e.variante === "trace" ? densiteSvg(e.segments!) : null;
}

export function situation113(e: E): Frag[] {
  if (e.variante === "trace") {
    const [u, v] = support(e);
    return [t("La courbe ci-dessous représente la densité de probabilité f d'une variable aléatoire continue X à valeurs dans "), l(`[${u}\\,;${v}]`), t(" (f est nulle en dehors) ; k est un réel strictement positif.")];
  }
  return [t("Une variable aléatoire continue X, à valeurs dans "), l(`[0\\,;${e.L}]`), t(", a pour densité "), l(fLatex(e)), t(" sur "), l(`[0\\,;${e.L}]`), t(" (et 0 en dehors), où k est un réel strictement positif.")];
}

export function consigneGlobale113(e: E): Frag[] {
  if (e.variante === "trace") return [t("Détermine k, puis calcule "), l(evenementIntervalle113(e)), t(" et "), l(evenementQueue113(e)), t(" (valeurs exactes).")];
  return [t("Détermine k, puis calcule "), l(evenementIntervalle113(e)), t(" et l'espérance "), l("E(X)"), t(" (valeurs exactes).")];
}

export const consigneGenerale113 = (e: E): Frag[] => [...situation113(e), t(" "), ...consigneGlobale113(e)];

export function libelle113(_e: E, p: P): string {
  switch (p) {
    case "k":
      return "Valeur de k";
    case "intervalle":
      return "Intervalle";
    case "queue":
      return "Probabilité";
    case "esperance":
      return "Espérance";
  }
}

export function consigne113(e: E, p: P): Frag[] {
  switch (p) {
    case "k":
      return [t("Détermine k pour que f soit une densité de probabilité (valeur exacte).")];
    case "intervalle":
      return [t("Calcule "), l(evenementIntervalle113(e)), t(" (valeur exacte).")];
    case "queue":
      return [t("Calcule "), l(evenementQueue113(e)), t(" (valeur exacte).")];
    case "esperance":
      return [t("Calcule l'espérance "), l("E(X)"), t(" (valeur exacte).")];
  }
}

export function champs113(_e: E, p: P): ChampEcran[] {
  if (p === "k") return [{ label: "k", labelLatex: "k=", placeholder: "valeur exacte" }];
  if (p === "esperance") return [{ label: "E(X)", labelLatex: "E(X)=", placeholder: "valeur exacte" }];
  return [{ label: "Probabilité", labelLatex: "P=", placeholder: "valeur exacte" }];
}

export function reponse113(e: E, p: P): Frag[] {
  switch (p) {
    case "k":
      return [l(`k=${ql(valeurK(e))}`)];
    case "intervalle":
      return [l(`${evenementIntervalle113(e)}=${ql(probaIntervalle113(e))}`)];
    case "queue":
      return [l(`${evenementQueue113(e)}=${ql(probaQueue113(e))}`)];
    case "esperance":
      return [l(`E(X)=${ql(esperance113(e))}`)];
  }
}

export const recap113 = reponse113;

export const messageIllisible113 = (): string => "Nombre non reconnu : écris une fraction (par exemple 3/16) ou un décimal exact. Cela ne compte pas comme une tentative.";

export function aide1_113(e: E, p: P): AideEcran {
  switch (p) {
    case "k":
      return e.variante === "trace"
        ? { texte: [t(`Une densité ${C3} est positive et l'aire totale sous sa courbe vaut 1.`)] }
        : { texte: [t(`Une densité ${C3} est positive et l'aire totale sous sa courbe vaut 1 :`)], latex: `\\int_0^{${e.L}}f(x)\\,dx=1` };
    case "intervalle":
    case "queue":
      return e.variante === "trace"
        ? { texte: [t(`Probabilité d'un intervalle ${C3} : c'est l'aire sous la courbe de f entre ses bornes ; découpe-la en triangles, rectangles ou trapèzes.`)] }
        : { texte: [t(`Probabilité d'un intervalle ${C3} :`)], latex: "P(a\\leq X\\leq b)=\\int_a^b f(x)\\,dx" };
    case "esperance":
      return { texte: [t(`Espérance d'une variable continue ${C3} :`)], latex: `E(X)=\\int_0^{${e.L}}x\\,f(x)\\,dx` };
  }
}

export function aide2_113(e: E, p: P): AideEcran | null {
  const kl = ql(valeurK(e));
  switch (p) {
    case "k":
      if (e.variante === "trace") return { texte: [t("Ici, exprime l'aire totale en fonction de k (les hauteurs sont lues sur le quadrillage), puis écris qu'elle vaut 1.")] };
      return { texte: [t("Ici :")], latex: `k\\int_0^{${e.L}}${gLatex(e.g!, e.L!)}\\,dx=1` };
    case "intervalle":
      if (e.variante === "trace") return { texte: [t(`Ici, l'aire entre ${e.a} et ${e.b} ; avec `), l(`k=${kl}`), t(", lis les hauteurs aux bornes (au milieu d'une pente, la hauteur est une fraction de k).")] };
      return { texte: [t("Ici, avec la valeur de k :")], latex: `${evenementIntervalle113(e)}=${kl}\\int_{${e.a}}^{${e.b}}${gLatex(e.g!, e.L!)}\\,dx` };
    case "queue": {
      const [u, v] = bornesQueue(e);
      return { texte: [t(`Ici, c'est l'aire sous la courbe entre ${u} et ${v}, avec `), l(`k=${kl}`), t(".")] };
    }
    case "esperance":
      return { texte: [t("Ici :")], latex: `E(X)=${kl}\\int_0^{${e.L}}${xgLatex(e.g!, e.L!).integrande.includes("-") ? `\\left(${xgLatex(e.g!, e.L!).integrande}\\right)` : xgLatex(e.g!, e.L!).integrande}\\,dx` };
  }
}

export { phases113 };
