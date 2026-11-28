import type { ExerciceRelevesSinusoide } from "../core5e/relevesSinusoide";
import type { AideEcran, ChampEcran, Frag, TableauDonnees } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { exactA, heureMinutesT, nbL, nbT } from "./nombresTrigo";

/**
 * Couche C — textes de `5gen57` « Modéliser des relevés réels par une sinusoïde ». Source unique de
 * l'écran, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceRelevesSinusoide;
export type PhaseReleves = "lecture" | "parametres" | "phase" | "prevision" | "duree";
export const PHASES_RELEVES: PhaseReleves[] = ["lecture", "parametres", "phase", "prevision", "duree"];

export const nomF = (e: E) => (e.variante === "maree" ? "h" : e.variante === "jour" ? "d" : "\\theta");
export const vL = (e: E, x: number, dec = e.decimales) => nbL(x, dec);
export const vT = (e: E, x: number, dec = e.decimales) => nbT(x, dec);
/** A et b : exacts (jusqu'à 3 décimales). */
export const pL = (x: number) => nbL(x, 4);
export const TL = (e: E) => nbL(e.T, 2);
export const omegaExactL = (e: E) => `\\dfrac{2\\pi}{${TL(e)}}`;
export const omegaL = (e: E) => `${omegaExactL(e)}\\approx ${nbL(e.omega, 4, true)}`;
export const phiL = (e: E) => nbL(e.phi, 2, true);
const uniteLongue = (e: E) => (e.variante === "maree" ? "heures" : e.uniteTemps);

export function modeleL(e: E): string {
  const p = e.phi < 0 ? `-${nbL(-e.phi, 2, true)}` : `+${nbL(e.phi, 2, true)}`;
  const o = nbL(e.omega, 4, true);
  return `${nomF(e)}(t)\\approx ${pL(e.A)}\\sin\\left(${o}\\,t${p}\\right)+${pL(e.b)}`;
}

export function situation(e: E): Frag[] {
  switch (e.variante) {
    case "maree":
      return [tx(`Dans ${e.lieu}, l'annuaire des marées donne pour une journée les heures et les hauteurs d'eau ci-dessous (t en heures depuis minuit). On modélise la hauteur d'eau (en m) par `), lx("h(t)=A\\sin(\\omega t+\\varphi)+b"), tx(", avec "), lx("A>0"), tx(" et "), lx("\\omega>0"), tx(".")];
    case "jour":
      return [tx(`Le tableau donne la durée du jour (du lever au coucher du soleil, en heures décimales) à ${e.lieu}, au 21 de plusieurs mois (t : nombre de jours depuis le 1er janvier). Le phénomène se répète chaque année : on prend une période de 365 jours. On modélise la durée du jour par `), lx("d(t)=A\\sin(\\omega t+\\varphi)+b"), tx(", avec "), lx("A>0"), tx(" et "), lx("\\omega>0"), tx(".")];
    case "temperature":
      return [tx(`Le tableau donne les températures moyennes de chaque mois relevées à ${e.lieu} une année (en °C ; t en mois depuis le 1er janvier, chaque mois au milieu). Le phénomène se répète chaque année (période de 12 mois). On modélise la température moyenne par `), lx("\\theta(t)=A\\sin(\\omega t+\\varphi)+b"), tx(", avec "), lx("A>0"), tx(" et "), lx("\\omega>0"), tx(".")];
  }
}

const ABREGES: Record<string, string> = { janvier: "janv.", février: "févr.", mars: "mars", avril: "avr.", mai: "mai", juin: "juin", juillet: "juil.", août: "août", septembre: "sept.", octobre: "oct.", novembre: "nov.", décembre: "déc." };

export function tableau(e: E): TableauDonnees {
  switch (e.variante) {
    case "maree":
      return { entetes: [[tx("Événement")], [tx("Heure")], [lx("t"), tx(" (h)")], [tx("Hauteur (m)")]], lignes: e.releves.map((r) => [r.libelle, r.heure ?? "", nbT(r.t, 1), nbT(r.valeur, e.decimales, true)]) };
    case "jour":
      return { entetes: [[tx("Date")], [lx("t"), tx(" (jours)")], [tx("Durée du jour (h)")]], lignes: e.releves.map((r) => [r.libelle, String(r.t), nbT(r.valeur, e.decimales, true)]) };
    case "temperature":
      return { horizontal: true, entetes: [[tx("Mois")], [lx("t"), tx(" (mois)")], [tx("θ (°C)")]], lignes: e.releves.map((r) => [ABREGES[r.libelle] ?? r.libelle, nbT(r.t, 1), nbT(r.valeur, e.decimales, true)]) };
  }
}

export function consigneGenerale(e: E): Frag[] {
  return situation(e);
}

export function libelle(_e: E, phase: PhaseReleves): string {
  switch (phase) {
    case "lecture":
      return "Max, min, période";
    case "parametres":
      return "A, b et ω";
    case "phase":
      return "Modèle";
    case "prevision":
      return "Prévision";
    case "duree":
      return "Durée au-dessus du seuil";
  }
}

function questionPrevision(e: E): string {
  switch (e.variante) {
    case "maree":
      return `Quelle est la hauteur d'eau prévue par le modèle ${e.libellePrev} (t = ${e.tPrev}), en m, au centième ?`;
    case "jour":
      return `Quelle durée du jour le modèle prévoit-il ${e.libellePrev} (t = ${e.tPrev}), en heures, au centième ?`;
    case "temperature":
      return `Quelle température moyenne le modèle prévoit-il ${e.libellePrev} (t = ${e.tPrev}), en °C, au dixième ?`;
  }
}

export function questionDuree(e: E): string {
  switch (e.variante) {
    case "maree":
      return `Un voilier a besoin d'au moins ${vT(e, e.seuil)} m d'eau pour entrer dans le port. Sur une période de marée, pendant combien de temps peut-il entrer (en heures, au centième) ?`;
    case "jour":
      return `Combien de jours par an le jour dure-t-il plus de ${nbT(e.seuil, 2)} h ? Arrondis à l'unité.`;
    case "temperature":
      return `Pendant combien de mois par an la température moyenne dépasse-t-elle ${nbT(e.seuil, 1)} °C ? Arrondis au dixième.`;
  }
}

export function consigne(e: E, phase: PhaseReleves): Frag[] {
  switch (phase) {
    case "lecture":
      return [tx(e.tDonnee ? "Lis dans le tableau la valeur maximale et la valeur minimale, et donne la période " : "Lis dans le tableau la valeur maximale et la valeur minimale, et déduis-en la période "), lx("T"), tx(` (en ${uniteLongue(e)}).`)];
    case "parametres":
      return [tx("Calcule l'amplitude "), lx("A"), tx(", le décalage vertical "), lx("b"), tx(" et la pulsation "), lx("\\omega"), tx(" (valeur exacte ou arrondie à quatre décimales).")];
    case "phase":
      return [tx(`Le maximum est atteint en t = ${nbT(e.tMax, 1)}. Calcule `), lx("\\varphi"), tx(" (dans "), lx("]-\\pi\\,;\\pi]"), tx(", au centième).")];
    case "prevision":
      return [tx(questionPrevision(e))];
    case "duree":
      return [tx(questionDuree(e))];
  }
}

export function champs(e: E, phase: PhaseReleves): ChampEcran[] {
  const u = e.unite;
  switch (phase) {
    case "lecture":
      return [
        { label: "max", labelLatex: "\\max =", unite: u, placeholder: "ex. : 4,6" },
        { label: "min", labelLatex: "\\min =", unite: u, placeholder: "ex. : 0,8" },
        { label: "T", labelLatex: "T =", unite: uniteLongue(e), placeholder: "ex. : 12,4" },
      ];
    case "parametres":
      return [
        { label: "A", labelLatex: "A =", unite: u, placeholder: "ex. : 1,9" },
        { label: "b", labelLatex: "b =", unite: u, placeholder: "ex. : 2,7" },
        { label: "ω", labelLatex: "\\omega =", placeholder: "ex. : 2π/12,4 ou 0,5067" },
      ];
    case "phase":
      return [{ label: "φ", labelLatex: "\\varphi =", placeholder: "ex. : −1,37" }];
    case "prevision":
      return [{ label: "prévision", labelLatex: `${nomF(e)}(${e.tPrev}) =`, unite: u, placeholder: "ex. : 3,41" }];
    case "duree":
      return [{ label: "durée", labelLatex: "\\text{durée} =", unite: uniteLongue(e), placeholder: e.variante === "jour" ? "ex. : 120" : "ex. : 5,48" }];
  }
}

export function aide1(e: E, phase: PhaseReleves): AideEcran {
  switch (phase) {
    case "lecture":
      return e.tDonnee
        ? { texte: [tx("Le maximum et le minimum sont la plus grande et la plus petite valeur du tableau ; la période est la durée d'un cycle complet, donnée dans l'énoncé.")] }
        : { texte: [tx("Le maximum et le minimum se lisent sur les pleines et basses mers ; la période est la durée entre deux pleines mers (pas entre une pleine et une basse mer).")] };
    case "parametres":
      return { texte: [tx("Comme pour la grande roue (cours, point 8) :")], latex: "A=\\dfrac{\\max-\\min}{2}\\qquad b=\\dfrac{\\max+\\min}{2}\\qquad \\omega=\\dfrac{2\\pi}{T}" };
    case "phase":
      return { texte: [tx("Au maximum, le sinus vaut 1, donc l'argument vaut "), lx("\\dfrac{\\pi}{2}"), tx(" :")], latex: "\\omega\\, t_{\\max}+\\varphi=\\dfrac{\\pi}{2}\\iff\\varphi=\\dfrac{\\pi}{2}-\\omega\\, t_{\\max}" };
    case "prevision":
      return { texte: [tx("Remplace "), lx("t"), tx(" dans le modèle, calculatrice en mode radian.")] };
    case "duree":
      return { texte: [tx("Résous l'inéquation sur le cercle (cours, point 8) : isole le sinus, lis l'arc du haut ; sa longueur en "), lx("u"), tx(" divisée par "), lx("\\omega"), tx(" donne la durée :")], latex: "\\sin u\\geq m\\iff u\\in[\\arcsin m\\,;\\,\\pi-\\arcsin m]+2k\\pi" };
  }
}

export function aide2(e: E, phase: PhaseReleves): AideEcran | null {
  const nom = nomF(e);
  switch (phase) {
    case "lecture": {
      if (e.tDonnee) return { texte: [tx(e.variante === "jour" ? "Ici, le maximum est au 21 juin, le minimum au 21 décembre, et la période vaut un an." : "Ici, le minimum est en janvier, le maximum en juillet, et la période vaut un an.")] };
      const [p1, , p2] = e.releves;
      return { texte: [tx(`Ici, les deux pleines mers sont à t = ${nbT(p1.t, 1)} et t = ${nbT(p2.t, 1)} :`)], latex: `T=${nbL(p2.t, 1)}-${nbL(p1.t, 1)}` };
    }
    case "parametres":
      return { texte: [tx("Ici :")], latex: `A=\\dfrac{${vL(e, e.max)}-${e.min < 0 ? `(${vL(e, e.min)})` : vL(e, e.min)}}{2}\\qquad b=\\dfrac{${vL(e, e.max)}+${e.min < 0 ? `(${vL(e, e.min)})` : vL(e, e.min)}}{2}\\qquad\\omega=${omegaExactL(e)}` };
    case "phase":
      return { texte: [tx("Ici :")], latex: `\\varphi=\\dfrac{\\pi}{2}-${omegaExactL(e)}\\cdot ${nbL(e.tMax, 1)}` };
    case "prevision":
      return { texte: [tx("Ici, avec les valeurs non arrondies si possible :")], latex: `${nom}(${e.tPrev})=${pL(e.A)}\\sin\\left(${nbL(e.omega, 4, true)}\\cdot ${e.tPrev}${e.phi < 0 ? "-" : "+"}${nbL(Math.abs(e.phi), 2, true)}\\right)+${pL(e.b)}` };
    case "duree":
      return { texte: [tx("Ici, la grandeur dépasse le seuil quand :")], latex: `${pL(e.A)}\\sin u+${pL(e.b)}\\geq ${nbL(e.seuil, 2)}\\iff \\sin u\\geq\\dfrac{${nbL(e.seuil, 2)}-${pL(e.b)}}{${pL(e.A)}}` };
  }
}

export function messageIllisible(_e: E, _phase: PhaseReleves): string {
  return "Nombre non reconnu : écris un nombre comme 4,6, −1,37 ou 2π/12,4 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

function egal(x: number, dec: number): string {
  return exactA(x, dec) ? `=${nbL(x, dec)}` : `\\approx ${nbL(x, dec, true)}`;
}

export function reponse(e: E, phase: PhaseReleves): Frag[] {
  switch (phase) {
    case "lecture":
      return [lx(`\\max=${vL(e, e.max)}`), tx(" ; "), lx(`\\min=${vL(e, e.min)}`), tx(" ; "), lx(`T=${TL(e)}`), tx(` ${e.variante === "maree" ? "h" : e.uniteTemps}`)];
    case "parametres":
      return [lx(`A=${pL(e.A)}`), tx(" ; "), lx(`b=${pL(e.b)}`), tx(" ; "), lx(`\\omega=${omegaL(e)}`)];
    case "phase":
      return [lx(`\\varphi\\approx ${phiL(e)}`), tx(", d'où "), lx(modeleL(e))];
    case "prevision": {
      const d = e.variante === "temperature" ? 1 : 2;
      return [lx(`${nomF(e)}(${e.tPrev})${egal(e.prevision, d)}`), tx(` ${e.unite}`)];
    }
    case "duree": {
      const r: Frag[] = [lx(`\\text{durée}${egal(e.duree, e.decimalesDuree)}`), tx(` ${uniteLongue(e)}`)];
      if (e.variante === "maree") r.push(tx(` (environ ${heureMinutesT(e.duree)})`));
      return r;
    }
  }
}

export function recap(e: E, phase: PhaseReleves): Frag[] {
  return phase === "phase" ? [lx(modeleL(e))] : reponse(e, phase);
}
