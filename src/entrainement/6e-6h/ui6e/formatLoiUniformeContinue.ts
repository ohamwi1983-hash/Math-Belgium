import type { Exercice115, Phase115 } from "../core6e/loiUniformeContinue";
import { densite115, ecartType115, esperance115, intersection, longueur, phases115, proba115, probaInv115, variance115 } from "../core6e/loiUniformeContinue";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { COURS, arrondi, dl, ql, qdl } from "./outilsVariablesAleatoiresLotH1";

/**
 * Couche C — textes de `6gen115` « Loi uniforme continue » : situation, consignes, champs, aides à
 * deux niveaux (formule du cours, puis posée pour l'instance — jamais le résultat), réponses
 * attendues. Notation du cours (§ 5) : densité 1/(b − a), P(c ≤ X ≤ d) = (d − c)/(b − a),
 * E(X) = (a + b)/2, V(X) = (b − a)²/12, σ(X) = √V(X).
 */

type E = Exercice115;
type P = Phase115;
const t = tx;
const l = lx;
const C5 = COURS(5);

/** « 7 h 10 », « 11 h », « 11 h 05 » : m minutes après h0 heures. */
function hm(h0: number, m: number): string {
  const h = h0 + Math.floor(m / 60);
  const mm = m % 60;
  return mm === 0 ? `${h} h` : `${h} h ${String(mm).padStart(2, "0")}`;
}

const intervalle = (e: E) => `[${e.a}\\,;${e.b}]`;

export function evenement115(e: E): string {
  const { type, c, d } = e.evenement!;
  if (type === "auMoins") return `P(X\\geq ${c})`;
  if (type === "auPlus") return `P(X\\leq ${d})`;
  return `P(${c}\\leq X\\leq ${d})`;
}
export const evenementInv115 = (e: E) => `P(X\\leq ${e.cInv})`;

/** V(X) : décimal exact s'il est court, sinon fraction. */
export const varianceLatex = (e: E) => qdl(variance115(e));
export const sigmaArrondi = (e: E) => arrondi(ecartType115(e), 2);

export function situation115(e: E): Frag[] {
  const loi: Frag[] = [l("X"), t(" suit la loi uniforme sur "), l(intervalle(e)), t(".")];
  if (e.variante === "direct") {
    switch (e.contexte) {
      case "arrivee":
        return [t(`Un bus passe à l'arrêt à ${hm(7, e.b)}. Lina arrive à l'arrêt à un instant pris au hasard entre ${hm(7, e.a)} et ${hm(7, e.b)} ; on note X son heure d'arrivée, en minutes après 7 h : `), ...loi];
      case "livreur":
        return [t(`Un livreur annonce son passage entre ${hm(10, e.a)} et ${hm(10, e.b)}, à un instant pris au hasard ; on note X l'instant de son arrivée, en minutes après 10 h : `), ...loi];
      case "panne":
        return [t(`Une panne se produit en un point pris au hasard d'une ligne électrique, entre le kilomètre ${e.a} et le kilomètre ${e.b} ; on note X la position de la panne (en km) : `), ...loi];
      case "cuisson":
        return [t("Le temps de cuisson X (en minutes) d'un gâteau suit la loi uniforme sur "), l(intervalle(e)), t(".")];
      case "trajet":
        return [t("La durée X (en minutes) d'un trajet en bus suit la loi uniforme sur "), l(intervalle(e)), t(".")];
    }
  }
  const debut: Record<E["contexte"], string> = {
    arrivee: "Lina arrive à un arrêt de bus à un instant pris au hasard ; on note X son heure d'arrivée, en minutes après 7 h.",
    livreur: "Un livreur arrive à un instant pris au hasard ; on note X l'instant de son arrivée, en minutes après 10 h.",
    panne: "Une panne se produit en un point pris au hasard d'une ligne électrique ; on note X sa position (en km).",
    cuisson: "On note X le temps de cuisson (en minutes) d'un gâteau.",
    trajet: "On note X la durée (en minutes) d'un trajet en bus.",
  };
  return [t(`${debut[e.contexte]} X suit la loi uniforme sur un intervalle `), l("[a\\,;b]"), t(" inconnu, avec "), l(`E(X)=${dl(esperance115(e))}`), t(" et "), l(`V(X)=${varianceLatex(e)}`), t(".")];
}

export function consigneGlobale115(e: E): Frag[] {
  if (e.variante === "direct")
    return [t("Donne la densité de X, puis calcule "), l(evenement115(e)), t(", "), l("E(X)"), t(", "), l("V(X)"), t(" et "), l("\\sigma(X)"), t(" (valeurs exactes ; "), l("\\sigma(X)"), t(" peut être arrondi au centième).")];
  return [t("Détermine a et b, puis calcule "), l(evenementInv115(e)), t(" (valeur exacte).")];
}

export const consigneGenerale115 = (e: E): Frag[] => [...situation115(e), t(" "), ...consigneGlobale115(e)];

export function libelle115(_e: E, p: P): string {
  switch (p) {
    case "densite":
      return "Densité";
    case "proba":
      return "Probabilité";
    case "esperance":
      return "Espérance";
    case "dispersion":
      return "Variance et écart-type";
    case "longueur":
      return "Longueur b − a";
    case "bornes":
      return "Bornes a et b";
    case "probaInv":
      return "Probabilité";
  }
}

export function consigne115(e: E, p: P): Frag[] {
  switch (p) {
    case "densite":
      return [t("Donne la valeur de la densité f de X sur "), l(intervalle(e)), t(" (valeur exacte).")];
    case "proba":
      return [t("Calcule "), l(evenement115(e)), t(" (valeur exacte).")];
    case "esperance":
      return [t("Calcule l'espérance "), l("E(X)"), t(".")];
    case "dispersion":
      return [t("Calcule la variance "), l("V(X)"), t(" (valeur exacte) et l'écart-type "), l("\\sigma(X)"), t(" (valeur exacte ou arrondie au centième).")];
    case "longueur":
      return [t("Calcule la longueur "), l("b-a"), t(" de l'intervalle à partir de la variance.")];
    case "bornes":
      return [t("Déduis-en a et b à l'aide de l'espérance.")];
    case "probaInv":
      return [t("Calcule "), l(evenementInv115(e)), t(" (valeur exacte).")];
  }
}

export function champs115(_e: E, p: P): ChampEcran[] {
  switch (p) {
    case "densite":
      return [{ label: "f(x)", labelLatex: "f(x)=", placeholder: "valeur exacte" }];
    case "proba":
    case "probaInv":
      return [{ label: "Probabilité", labelLatex: "P=", placeholder: "valeur exacte" }];
    case "esperance":
      return [{ label: "E(X)", labelLatex: "E(X)=", placeholder: "valeur exacte" }];
    case "dispersion":
      return [
        { label: "V(X)", labelLatex: "V(X)=", placeholder: "valeur exacte" },
        { label: "σ(X)", labelLatex: "\\sigma(X)=", placeholder: "exacte ou au centième" },
      ];
    case "longueur":
      return [{ label: "b − a", labelLatex: "b-a=", placeholder: "nombre" }];
    case "bornes":
      return [
        { label: "a", labelLatex: "a=", placeholder: "nombre" },
        { label: "b", labelLatex: "b=", placeholder: "nombre" },
      ];
  }
}

export function reponse115(e: E, p: P): Frag[] {
  switch (p) {
    case "densite":
      return [l(`f(x)=${ql(densite115(e))}`)];
    case "proba":
      return [l(`${evenement115(e)}=${ql(proba115(e))}`)];
    case "esperance":
      return [l(`E(X)=${dl(esperance115(e))}`)];
    case "dispersion":
      // σ = (b − a)/√12 n'est jamais rationnel pour b − a entier : toujours « ≈ » au centième.
      return [l(`V(X)=${varianceLatex(e)}`), t(" et "), l(`\\sigma(X)=\\sqrt{${varianceLatex(e)}}\\approx ${dl(sigmaArrondi(e))}`)];
    case "longueur":
      return [l(`b-a=${longueur(e)}`)];
    case "bornes":
      return [l(`a=${e.a}`), t(" et "), l(`b=${e.b}`)];
    case "probaInv":
      return [l(`${evenementInv115(e)}=${ql(probaInv115(e))}`)];
  }
}

export const recap115 = reponse115;

export const messageIllisible115 = (): string => "Nombre non reconnu : écris un nombre (par exemple 25, 2/15 ou √12). Cela ne compte pas comme une tentative.";

export function aide1_115(_e: E, p: P): AideEcran {
  switch (p) {
    case "densite":
      return { texte: [t(`Loi uniforme ${C5} : la densité est constante sur l'intervalle (l'aire totale, un rectangle, vaut 1) :`)], latex: "f(x)=\\dfrac{1}{b-a}" };
    case "proba":
    case "probaInv":
      return { texte: [t(`Loi uniforme ${C5} : seule la longueur compte (pour un intervalle contenu dans `), l("[a\\,;b]"), t(") :")], latex: "P(c\\leq X\\leq d)=\\dfrac{d-c}{b-a}" };
    case "esperance":
      return { texte: [t(`Loi uniforme ${C5} : l'espérance est le milieu de l'intervalle :`)], latex: "E(X)=\\dfrac{a+b}{2}" };
    case "dispersion":
      return { texte: [t(`Loi uniforme ${C5} :`)], latex: "V(X)=\\dfrac{(b-a)^2}{12}\\qquad \\sigma(X)=\\sqrt{V(X)}" };
    case "longueur":
      return { texte: [t(`La variance ${C5} ne dépend que de la longueur de l'intervalle :`)], latex: "V(X)=\\dfrac{(b-a)^2}{12}" };
    case "bornes":
      return { texte: [t(`L'espérance ${C5} est le milieu de l'intervalle :`)], latex: "E(X)=\\dfrac{a+b}{2}" };
  }
}

export function aide2_115(e: E, p: P): AideEcran | null {
  switch (p) {
    case "densite":
      return { texte: [t("Ici :")], latex: `f(x)=\\dfrac{1}{${e.b}-${e.a}}` };
    case "proba": {
      const { type } = e.evenement!;
      if (type === "deborde") return { texte: [t("Ici, l'intervalle déborde de "), l(intervalle(e)), t(" : X ne prend aucune valeur en dehors. Ne garde que la partie commune aux deux intervalles.")] };
      if (type === "entre") return { texte: [t("Ici :")], latex: `${evenement115(e)}=\\dfrac{${e.evenement!.d}-${e.evenement!.c}}{${e.b}-${e.a}}` };
      const [c, d] = intersection(e);
      return { texte: [t("Ici, X ne dépasse pas les bornes de l'intervalle :")], latex: `${evenement115(e)}=P(${c}\\leq X\\leq ${d})` };
    }
    case "esperance":
      return { texte: [t("Ici :")], latex: `E(X)=\\dfrac{${e.a}+${e.b}}{2}` };
    case "dispersion":
      return { texte: [t("Ici :")], latex: `V(X)=\\dfrac{(${e.b}-${e.a})^2}{12}` };
    case "longueur":
      return { texte: [t("Ici, résous en b − a (positif) :")], latex: `\\dfrac{(b-a)^2}{12}=${varianceLatex(e)}` };
    case "bornes":
      return { texte: [t("Ici, tu connais "), l("a+b"), t(" (deux fois l'espérance) et "), l(`b-a=${longueur(e)}`), t(" : additionne les deux égalités.")] };
    case "probaInv":
      return { texte: [t("Ici, avec les bornes trouvées :")], latex: `${evenementInv115(e)}=P(a\\leq X\\leq ${e.cInv})` };
  }
}

export { phases115 };
