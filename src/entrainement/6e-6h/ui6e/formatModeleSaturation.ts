import type { ExerciceModeleSaturation } from "../core6e/modeleSaturation";
import type { AideEcran, ChampEcran, Frag, TableauDonnees } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { exactA, nbL, nbT, parL, rat, ratL, ratT } from "./nombresExpoLotG";

/**
 * Couche C — textes de `6gen150` « Modèle L + C·qᵗ ». Source unique de l'écran, des aides, du
 * récapitulatif, du corrigé et du papier.
 */

type E = ExerciceModeleSaturation;
export type PhaseModeleSaturation = "rapport" | "limite" | "q" | "prevision" | "seuil";
export const PHASES_MODELE_SATURATION: PhaseModeleSaturation[] = ["rapport", "limite", "q", "prevision", "seuil"];

const n = (v: number) => (v < 0 ? `-${-v}` : String(v));
export const nomF = (e: E) => (e.variante === "plafonnement" ? "N" : "T");
export const uniteGrandeur = (e: E) => (e.variante === "plafonnement" ? "milliers" : "°C");
export const uniteTemps = (e: E) => (e.variante === "plafonnement" ? "semaines" : "min");
export const rL = (e: E) => ratL(e.r);
export const qL = (e: E) => nbL(e.q, 4, true);
export const modeleGeneralL = (e: E) => `${nomF(e)}(t)=L+C\\cdot q^{t}`;
export function modeleL(e: E): string {
  return `${nomF(e)}(t)\\approx ${e.L}${e.C < 0 ? "-" : "+"}${Math.abs(e.C)}\\cdot ${qL(e)}^{t}`;
}

export function consigneGenerale(e: E): Frag[] {
  const nom = nomF(e);
  const debut: Frag[] =
    e.variante === "refroidissement"
      ? [tx(`Une tasse de thé est posée dans une pièce. On relève sa température (en °C) toutes les ${e.d} minutes ; t est le temps en minutes.`)]
      : e.variante === "rechauffement"
        ? [tx(`Une bouteille sortie du réfrigérateur se réchauffe dans une pièce. On relève sa température (en °C) toutes les ${e.d} minutes ; t est le temps en minutes.`)]
        : [tx(`Une nouvelle application de langues compte ses inscrits (en milliers) ; on relève leur nombre toutes les ${e.d} semaines, t en semaines. Le nombre d'inscrits plafonne.`)];
  return [...debut, tx(" On modélise la grandeur par "), lx(modeleGeneralL(e)), tx(", avec "), lx("0<q<1"), tx(" : "), lx("L"), tx(" est la valeur limite, vers laquelle "), lx(nom), tx(" se rapproche.")];
}

export function tableau(e: E): TableauDonnees {
  return {
    horizontal: true,
    entetes: [[lx("t"), tx(` (${uniteTemps(e)})`)], [lx(`${nomF(e)}(t)`), tx(` (${uniteGrandeur(e)})`)]],
    lignes: e.mesures.map((m, i) => [String(i * e.d), nbT(m, 0)]),
  };
}

export function libelle(_e: E, phase: PhaseModeleSaturation): string {
  return { rapport: "Rapport des écarts", limite: "L et C", q: "Facteur q", prevision: "Prévision", seuil: "Seuil atteint" }[phase];
}

export function questionPrevision(e: E): string {
  return e.variante === "plafonnement"
    ? `Combien d'inscrits (en milliers) le modèle prévoit-il à t = ${e.tPrev} semaines ? Arrondis au dixième.`
    : `Quelle température le modèle prévoit-il à t = ${e.tPrev} min ? Arrondis au dixième de degré.`;
}
export function questionSeuil(e: E): string {
  switch (e.variante) {
    case "refroidissement":
      return `Le thé se boit sans se brûler à ${e.seuil} °C. Au bout de combien de minutes atteint-il cette température ? Arrondis au dixième.`;
    case "rechauffement":
      return `Au bout de combien de minutes la bouteille atteint-elle ${e.seuil} °C ? Arrondis au dixième.`;
    case "plafonnement":
      return `Au bout de combien de semaines l'application atteint-elle ${e.seuil} milliers d'inscrits ? Arrondis au dixième.`;
  }
}

export function consigne(e: E, phase: PhaseModeleSaturation): Frag[] {
  const d = e.d;
  switch (phase) {
    case "rapport":
      return [tx(`Calcule le rapport des écarts successifs `), lx(`r=\\dfrac{${nomF(e)}(${2 * d})-${nomF(e)}(${d})}{${nomF(e)}(${d})-${nomF(e)}(0)}`), tx(" (valeur exacte).")];
    case "limite":
      return [tx("Sur chaque intervalle de "), lx(`${d}`), tx(` ${uniteTemps(e)}, l'écart à la valeur limite est multiplié par `), lx("r"), tx(". Déduis-en "), lx("L"), tx(", puis "), lx("C"), tx(".")];
    case "q":
      return [tx("Le rapport "), lx("r"), tx(" correspond à "), lx(`${d}`), tx(` ${uniteTemps(e)} : `), lx(`q^{${d}}=r`), tx(". Calcule "), lx("q"), tx(" (arrondi au dix-millième).")];
    case "prevision":
      return [tx(questionPrevision(e))];
    case "seuil":
      return [tx(questionSeuil(e))];
  }
}

export function champs(e: E, phase: PhaseModeleSaturation): ChampEcran[] {
  switch (phase) {
    case "rapport":
      return [{ label: "r", labelLatex: "r =", placeholder: "ex. : 5/7" }];
    case "limite":
      return [
        { label: "L", labelLatex: "L =", placeholder: "ex. : 17" },
        { label: "C", labelLatex: "C =", placeholder: "ex. : −49" },
      ];
    case "q":
      return [{ label: "q", labelLatex: "q \\approx", placeholder: "ex. : 0,9123" }];
    case "prevision":
      return [{ label: "prévision", labelLatex: `${nomF(e)}(${e.tPrev}) \\approx`, unite: uniteGrandeur(e), placeholder: "ex. : 41,7" }];
    case "seuil":
      return [{ label: "instant", labelLatex: "t \\approx", unite: uniteTemps(e), placeholder: "ex. : 12,6" }];
  }
}

export function aide1(e: E, phase: PhaseModeleSaturation): AideEcran {
  const N = nomF(e);
  switch (phase) {
    case "rapport":
      return { texte: [tx("Dans une différence de deux mesures, L disparaît ; les écarts successifs sont donc dans le rapport "), lx(`q^{${e.d}}`), tx(" :")], latex: `${N}(t+${e.d})-${N}(t)=C\\,q^{t}\\left(q^{${e.d}}-1\\right)` };
    case "limite":
      return { texte: [tx("L'écart à la valeur limite est multiplié par "), lx("r"), tx(" en "), lx(`${e.d}`), tx(` ${uniteTemps(e)} :`)], latex: `${N}(${e.d})-L=r\\,\\big(${N}(0)-L\\big)\\qquad C=${N}(0)-L` };
    case "q":
      return { texte: [tx(`Racine ${e.d}ᵉ de r, c'est-à-dire r à la puissance `), lx(`\\dfrac{1}{${e.d}}`), tx(" :")], latex: `q^{${e.d}}=r\\iff q=r^{\\frac{1}{${e.d}}}` };
    case "prevision":
      return { texte: [tx("Remplace "), lx("t"), tx(" dans le modèle complet, sans oublier L :")], latex: modeleGeneralL(e) };
    case "seuil":
      return { texte: [tx("Isole le terme exponentiel, puis utilise la touche ln de la calculatrice (cours, § 7) :")], latex: `L+C\\,q^{t}=S\\iff q^{t}=\\dfrac{S-L}{C}\\iff t=\\dfrac{\\ln\\left(\\frac{S-L}{C}\\right)}{\\ln q}` };
  }
}

export function aide2(e: E, phase: PhaseModeleSaturation): AideEcran {
  const [m0, m1, m2] = e.mesures;
  switch (phase) {
    case "rapport":
      return { texte: [tx("Ici :")], latex: `r=\\dfrac{${m2}-${m1}}{${m1}-${m0}}` };
    case "limite":
      return { texte: [tx("Ici, développe puis regroupe les termes en L :")], latex: `${m1}-L=${rL(e)}\\,(${m0}-L)` };
    case "q":
      return { texte: [tx(`Ici, d = ${e.d} : touche racine ${e.d}ᵉ de la calculatrice (ou puissance `), lx(`\\dfrac{1}{${e.d}}`), tx("), appliquée à la valeur exacte de r.")] };
    case "prevision":
      return { texte: [tx("Ici, avec q non arrondi si possible :")], latex: `${nomF(e)}(${e.tPrev})=${e.L}+${parL(n(e.C))}\\cdot q^{${e.tPrev}}` };
    case "seuil":
      return { texte: [tx("Ici :")], latex: `q^{t}=\\dfrac{${e.seuil}-${e.L}}{${e.C}}` };
  }
}

export function messageIllisible(_e: E, _phase: PhaseModeleSaturation): string {
  return "Nombre non reconnu : écris par exemple 5/7, −49 ou 12,6 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

const egal = (x: number, dec: number) => (exactA(x, dec) ? `=${nbL(x, dec)}` : `\\approx ${nbL(x, dec, true)}`);

export function reponse(e: E, phase: PhaseModeleSaturation): Frag[] {
  switch (phase) {
    case "rapport":
      return [lx(`r=${rL(e)}`)];
    case "limite":
      return [lx(`L=${e.L}`), tx(" ; "), lx(`C=${n(e.C)}`)];
    case "q":
      return [lx(`q=${e.r.den === 1 ? rL(e) : `\\left(${rL(e)}\\right)`}^{\\frac{1}{${e.d}}}\\approx ${qL(e)}`)];
    case "prevision":
      return [lx(`${nomF(e)}(${e.tPrev})${egal(e.prevision, 1)}`), tx(` ${uniteGrandeur(e)}`)];
    case "seuil":
      return [lx(`t${egal(e.tSeuil, 1)}`), tx(` ${uniteTemps(e)}`)];
  }
}

export function recap(e: E, phase: PhaseModeleSaturation): Frag[] {
  if (phase === "q") return [lx(`q\\approx ${qL(e)}`), tx(", d'où "), lx(modeleL(e))];
  return reponse(e, phase);
}

/** r en texte (aides papier) et rapport des mesures (pièges). */
export const rT = (e: E) => ratT(e.r);
export const rapportMesures = (e: E) => rat(e.mesures[1], e.mesures[0]);
