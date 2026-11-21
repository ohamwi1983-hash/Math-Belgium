import type { ExerciceDetectiveLimites } from "../core5e/detectiveLimites.types";
import { copie, descriptionFragments, nombreLignes } from "../moteur5e/modeleDetectiveLimites";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";

/**
 * Couche C — textes de `5gen67` « Détective d'erreurs : limites » : consignes, options, champs de
 * l'écran 3, aides à deux niveaux, réponses. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceDetectiveLimites;
export type PhaseDetectiveLimites = "ligne" | "erreur" | "correction";
export const PHASES: PhaseDetectiveLimites[] = ["ligne", "erreur", "correction"];

export const CONSIGNE_GLOBALE = "Une seule ligne de cette résolution est fausse (les lignes suivantes en découlent). Trouve-la, explique l'erreur et corrige la résolution.";

export function consigneGenerale(e: E): Frag[] {
  return [tx("Un élève a résolu l'exercice suivant. "), ...copie(e).enonce, tx(" Une seule ligne de sa résolution est fausse ; les lignes suivantes en découlent.")];
}

export const numeroLigneFausse = (e: E): number => copie(e).ligneFausse + 1;

export function libelle(_e: E, p: PhaseDetectiveLimites): string {
  return p === "ligne" ? "Ligne fausse" : p === "erreur" ? "Erreur" : "Correction";
}

export function consigne(e: E, p: PhaseDetectiveLimites): Frag[] {
  if (p === "ligne") return [tx("Quelle ligne est fausse ? (la première ligne qui contient une erreur)")];
  if (p === "erreur") return [tx(`Quelle erreur a été commise à la ligne ${numeroLigneFausse(e)} ?`)];
  const v = copie(e).valeur;
  if (v.genre === "droite") return [tx(`Corrige la résolution à partir de la ligne ${numeroLigneFausse(e)} : donne l'équation de l'asymptote.`)];
  if (v.genre === "deux") return [tx(`Corrige la résolution à partir de la ligne ${numeroLigneFausse(e)} : donne la limite à gauche et la limite à droite.`)];
  return [tx(`Corrige la résolution à partir de la ligne ${numeroLigneFausse(e)} : donne la valeur exacte de la limite.`)];
}

export function optionsLigne(e: E): OptionEcran[] {
  return Array.from({ length: nombreLignes(e) }, (_, i) => ({ id: `L${i + 1}`, fragments: [tx(`Ligne ${i + 1}`)] }));
}

export function optionsErreur(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }));
}

const RACCOURCIS = [
  { libelle: "+∞", texte: "+∞" },
  { libelle: "−∞", texte: "−∞" },
  { libelle: "/", texte: "/" },
];

export function champs(e: E): ChampEcran[] {
  const v = copie(e).valeur;
  if (v.genre === "droite") return [{ label: "Asymptote", labelLatex: "y=", placeholder: "ex. : 4x − 7", apercu: true }];
  return v.labels.map((lab, i) => ({ label: v.genre === "deux" ? (i === 0 ? "Limite à gauche" : "Limite à droite") : "Limite", labelLatex: lab, placeholder: "ex. : 5/7, 0 ou +∞", raccourcis: RACCOURCIS }));
}

export function reponse(e: E, p: PhaseDetectiveLimites): Frag[] {
  if (p === "ligne") return [tx(`Ligne ${numeroLigneFausse(e)}`)];
  if (p === "erreur") return descriptionFragments(e.variante, e);
  return [lx(copie(e).valeur.latex)];
}

export const recap = reponse;

export function messageIllisible(e: E, p: PhaseDetectiveLimites): string {
  void p;
  if (copie(e).valeur.genre === "droite") return "Équation non reconnue : écris la droite avec x, par exemple 2x − 3 (ou y = 2x − 3). Cette saisie ne compte pas comme une tentative.";
  return "Limite non reconnue : écris un nombre exact (3/2, −1, 0) ou un infini (+∞, −∞, « inf »). Cette saisie ne compte pas comme une tentative.";
}

export const MESSAGE_APPROCHEE = "C'est une valeur approchée : donne la valeur exacte (fraction, par exemple 2/3). Cette saisie ne compte pas comme une tentative.";

export function aide1(e: E, p: PhaseDetectiveLimites): AideEcran {
  if (p === "ligne") return { texte: [tx("Contrôle les lignes l'une après l'autre : la règle employée est-elle juste ? Une ligne qui découle correctement d'une ligne fausse n'est pas « la » ligne fausse.")] };
  if (p === "erreur") {
    const k = numeroLigneFausse(e);
    return { texte: [tx(k === 1 ? "Refais toi-même la ligne 1 à partir de l'énoncé, sans regarder la copie, puis compare." : `Refais toi-même le passage de la ligne ${k - 1} à la ligne ${k}, sans regarder la copie, puis compare.`)] };
  }
  return copie(e).regleCours;
}

export function aide2(e: E, p: PhaseDetectiveLimites): AideEcran | null {
  const c = copie(e);
  if (p === "ligne") return { texte: [tx("Règle employée par chaque ligne : "), ...c.regles.map((r, i) => tx(`${i > 0 ? " ; " : ""}ligne ${i + 1} : ${r}`)), tx(". Laquelle est mal appliquée ?")] };
  if (p === "erreur") return c.regleCours;
  return c.aideCorrection;
}

export function explicationChoix(e: E, p: PhaseDetectiveLimites): string {
  if (p === "ligne") return `La première erreur est à la ligne ${numeroLigneFausse(e)} ; les lignes suivantes en découlent.`;
  return "";
}

