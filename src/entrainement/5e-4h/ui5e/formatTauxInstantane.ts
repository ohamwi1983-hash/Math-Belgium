import type { ExerciceTauxInstantane } from "../core5e/tauxInstantane";
import { contexte, deriveeCoefs, tauxInstantane, tauxMoyen, valeur } from "../core5e/tauxInstantane";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { decL, decT, net, polyDL } from "./ecrituresApplicationsDerivees";

/**
 * Couche C — textes de `5gen70` « Taux de variation instantané en contexte » : modèle, consignes,
 * champs, options (unités, interprétations), aides à deux niveaux, réponses. Source unique de
 * l'écran, du papier et du corrigé.
 */

type E = ExerciceTauxInstantane;
export type PhaseTauxInstantane = "moyen" | "derivee" | "instantane" | "unite" | "interpretation";
export const PHASES: PhaseTauxInstantane[] = ["moyen", "derivee", "instantane", "unite", "interpretation"];

// ============================================================================
// Écritures.
// ============================================================================

export const F = (e: E): string => contexte(e).nom;
export const V = (e: E): string => contexte(e).variable;
export const modeleL = (e: E): string => `${F(e)}(${V(e)})=${polyDL(e.coefs, V(e))}`;
export const deriveeL = (e: E): string => `${F(e)}'(${V(e)})=${polyDL(deriveeCoefs(e), V(e))}`;
export const uniteTaux = (e: E): string => contexte(e).unites[0];

/** Substitution d'un nombre dans un polynôme, sans calcul (« -0{,}5\cdot 6^2+6\cdot 6+4 »). */
export function substitutionL(coefs: number[], x: number): string {
  const deg = coefs.length - 1;
  let s = "";
  coefs.forEach((c0, i) => {
    const c = net(c0);
    const p = deg - i;
    if (c === 0) return;
    const abs = Math.abs(c);
    const signe = c < 0 ? "-" : s === "" ? "" : "+";
    const puissance = p === 0 ? "" : p === 1 ? `${x}` : `${x}^${p}`;
    const corps = p === 0 ? decL(abs) : abs === 1 ? puissance : `${decL(abs)}\\cdot ${puissance}`;
    s += `${signe}${corps}`;
  });
  return s === "" ? "0" : s;
}

/** Phrase du contexte (modèle compris). */
export function phraseContexte(e: E): Frag[] {
  const m = lx(modeleL(e));
  switch (e.variante) {
    case "temperature":
      return [tx("Un jour de printemps, la température extérieure (en °C) est modélisée par "), m, tx(", où t est le nombre d'heures écoulées depuis 6 h du matin ("), lx("0\\leqslant t\\leqslant 12"), tx(").")];
    case "altitude":
      return [tx("Un drone décolle d'une terrasse. Son altitude (en m) est donnée par "), m, tx(", où t est le temps en secondes ("), lx(`0\\leqslant t\\leqslant ${e.tmax}`), tx(").")];
    case "benefice":
      return [tx("Une entreprise fabrique et vend q pièces par jour ("), lx(`0\\leqslant q\\leqslant ${e.tmax}`), tx("). Son bénéfice journalier (en €) est "), m, tx(".")];
    case "population":
      return [tx("La population d'une ville (en milliers d'habitants) est modélisée par "), m, tx(", où t est le nombre d'années écoulées depuis 2000 ("), lx("0\\leqslant t\\leqslant 20"), tx(").")];
  }
}

/** Phrases d'interprétation : la bonne (0), puis signe faux, taux moyen, valeur de f. */
export function interpretations(e: E): string[] {
  const c = contexte(e);
  const v = tauxInstantane(e);
  const absV = decT(Math.abs(v));
  const verbe = (s: number) => (s > 0 ? "augmente" : "diminue");
  const debut = (x: number) => `En ${c.instant(x)}`;
  const valeurF = c.uniteF === "€" ? `${decT(v)} €` : `${decT(v)} ${c.uniteF}`;
  return [
    `${debut(e.a)}, ${c.grandeur} ${verbe(v)} à raison d'environ ${absV} ${c.parX}.`,
    `${debut(e.a)}, ${c.grandeur} ${verbe(-v)} à raison d'environ ${absV} ${c.parX}.`,
    `Entre ${c.instant(e.a)} et ${c.instant(e.b)}, ${c.grandeur} ${verbe(v)} en moyenne de ${absV} ${c.parX}.`,
    `${debut(e.a)}, ${c.grandeur} vaut ${valeurF}.`,
  ];
}

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseTauxInstantane, string> = {
  moyen: "Taux de variation moyen",
  derivee: "Fonction dérivée",
  instantane: "Taux de variation instantané",
  unite: "Unité",
  interpretation: "Interprétation",
};

export const libelle = (_e: E, p: PhaseTauxInstantane): string => LIBELLES[p];

export const consigneGenerale = (e: E): Frag[] => phraseContexte(e);

export function consigne(e: E, p: PhaseTauxInstantane): Frag[] {
  const f = F(e);
  const v = V(e);
  if (p === "moyen") return [tx(`Calcule le taux de variation moyen de ${f} entre `), lx(`${v}=${e.a}`), tx(" et "), lx(`${v}=${e.b}`), tx(".")];
  if (p === "derivee") return [tx("Calcule la fonction dérivée "), lx(`${f}'(${v})`), tx(".")];
  if (p === "instantane") return [tx(`Calcule le taux de variation instantané de ${f} en `), lx(`${v}=${e.a}`), tx(", c'est-à-dire "), lx(`${f}'(${e.a})`), tx(".")];
  if (p === "unite") return [tx("Dans quelle unité s'exprime "), lx(`${f}'(${e.a})`), tx(" (comme le taux moyen) ?")];
  return [tx("Quelle phrase interprète correctement "), lx(`${f}'(${e.a})`), tx(" dans le contexte ?")];
}

export function optionsUnite(e: E): OptionEcran[] {
  const u = contexte(e).unites;
  return e.ordreUnites.map((k) => ({ id: `u${k}`, fragments: [tx(u[k]!)] }));
}

export function optionsInterpretation(e: E): OptionEcran[] {
  const s = interpretations(e);
  return e.ordreInterpretations.map((k) => ({ id: `i${k}`, fragments: [tx(s[k]!)] }));
}

export function champs(e: E, p: PhaseTauxInstantane): ChampEcran[] {
  const f = F(e);
  const v = V(e);
  if (p === "moyen") return [{ label: "Taux moyen", labelLatex: "\\text{taux moyen}=", placeholder: "ex. : 2,5 ou 5/2" }];
  if (p === "derivee") return [{ label: `${f}′(${v})`, labelLatex: `${f}'(${v})=`, placeholder: `ex. : −3${v}² + 12${v}`, apercu: false, raccourcis: [{ libelle: v, texte: v }, { libelle: `${v}²`, texte: `${v}²` }] }];
  return [{ label: `${f}′(${e.a})`, labelLatex: `${f}'(${e.a})=`, placeholder: "ex. : −4" }];
}

export function aide1(e: E, p: PhaseTauxInstantane): AideEcran {
  const f = F(e);
  const v = V(e);
  if (p === "moyen") return { texte: [tx("Le taux de variation moyen entre deux valeurs est la variation de la grandeur divisée par la variation de la variable :")], latex: `\\dfrac{${f}(b)-${f}(a)}{b-a}` };
  if (p === "derivee") return { texte: [tx("Dérive terme à terme :")], latex: `(k\\,${v}^n)'=k\\,n\\,${v}^{n-1}` };
  if (p === "instantane") return { texte: [tx("Le taux instantané en a est le nombre dérivé "), lx(`${f}'(a)`), tx(" : remplace la variable par a dans la dérivée.")] };
  if (p === "unite") return { texte: [tx("Un taux de variation est un quotient : une variation de la grandeur divisée par une variation de la variable.")] };
  return { texte: [tx("Le signe du nombre dérivé dit si la grandeur augmente ou diminue à cet instant précis ; sa valeur absolue dit à quelle vitesse.")] };
}

export function aide2(e: E, p: PhaseTauxInstantane): AideEcran | null {
  const f = F(e);
  const v = V(e);
  const c = contexte(e);
  if (p === "moyen") return { texte: [tx("Ici, calcule d'abord "), lx(`${f}(${e.b})`), tx(" et "), lx(`${f}(${e.a})`), tx(", puis :")], latex: `\\dfrac{${f}(${e.b})-${f}(${e.a})}{${e.b}-${e.a}}` };
  if (p === "derivee") return { texte: [tx("Dérive chaque terme de "), lx(modeleL(e)), tx(" ; la constante disparaît.")] };
  if (p === "instantane") return { texte: [tx("Remplace "), lx(v), tx(" par "), lx(`${e.a}`), tx(" dans :")], latex: deriveeL(e) };
  if (p === "unite") return { texte: [tx(`Ici, la grandeur ${f} est en ${c.uniteF} et la variable ${v} en ${c.uniteX}.`)] };
  return { texte: [tx("Ici "), lx(`${f}'(${e.a})`), tx(` est ${tauxInstantane(e) > 0 ? "positif" : "négatif"} ; distingue aussi l'instant `), lx(`${v}=${e.a}`), tx(" d'une moyenne sur un intervalle, et la vitesse de variation de la valeur de la grandeur.")] };
}

export function reponse(e: E, p: PhaseTauxInstantane): Frag[] {
  const f = F(e);
  if (p === "moyen") return [lx(`\\text{taux moyen}=${decL(tauxMoyen(e))}`), tx(` ${uniteTaux(e)}`)];
  if (p === "derivee") return [lx(deriveeL(e))];
  if (p === "instantane") return [lx(`${f}'(${e.a})=${decL(tauxInstantane(e))}`)];
  if (p === "unite") return [tx(uniteTaux(e))];
  return [tx(interpretations(e)[0]!)];
}

export const recap = reponse;

export function messageIllisible(e: E, p: PhaseTauxInstantane): string {
  if (p === "derivee") return `Expression non reconnue : écris un polynôme en ${V(e)}, par exemple −3${V(e)}² + 12${V(e)} (ou −3${V(e)}^2 + 12${V(e)}). Cette saisie ne compte pas comme une tentative.`;
  return "Nombre non reconnu : écris un nombre, par exemple −4, 2,5 ou 5/2. Cette saisie ne compte pas comme une tentative.";
}

/** Valeur de f en a (pour les pièges). */
export const valeurEnA = (e: E): number => valeur(e, e.a);
