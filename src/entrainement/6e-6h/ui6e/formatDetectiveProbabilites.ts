import type { ExerciceDetectiveProba } from "../core6e/detectiveProbabilites";
import { copie, descriptionFragments, nombreL, nombreLignes } from "../moteur6e/modeleDetectiveProbabilites";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";

/**
 * Couche C — textes de `6gen163` « Détective d'erreurs : probabilités » : consignes, options, champ de
 * l'écran 3, aides à deux niveaux, réponses. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceDetectiveProba;
export type PhaseDetectiveProba = "ligne" | "erreur" | "correction";
export const PHASES: PhaseDetectiveProba[] = ["ligne", "erreur", "correction"];

export const CONSIGNE_GLOBALE = "Une seule ligne de cette résolution est fausse (les lignes suivantes en découlent). Trouve-la, explique l'erreur et corrige la résolution.";

export function consigneGenerale(e: E): Frag[] {
  return [tx("Un élève a résolu l'exercice suivant. "), ...copie(e).enonce, tx(" Une seule ligne de sa résolution est fausse ; les lignes suivantes en découlent.")];
}

export const numeroLigneFausse = (e: E): number => copie(e).ligneFausse + 1;

export function libelle(_e: E, p: PhaseDetectiveProba): string {
  return p === "ligne" ? "Ligne fausse" : p === "erreur" ? "Erreur" : "Correction";
}

export function consigne(e: E, p: PhaseDetectiveProba): Frag[] {
  if (p === "ligne") return [tx("Quelle ligne est fausse ? (la première ligne qui contient une erreur)")];
  if (p === "erreur") return [tx(`Quelle erreur a été commise à la ligne ${numeroLigneFausse(e)} ?`)];
  return [tx(`Corrige la résolution à partir de la ligne ${numeroLigneFausse(e)} : donne la probabilité cherchée (valeur exacte).`)];
}

export function optionsLigne(e: E): OptionEcran[] {
  return Array.from({ length: nombreLignes(e) }, (_, i) => ({ id: `L${i + 1}`, fragments: [tx(`Ligne ${i + 1}`)] }));
}

export function optionsErreur(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }));
}

export function champs(e: E): ChampEcran[] {
  return [{ label: "Probabilité cherchée", labelLatex: "P=", placeholder: copie(e).decimal ? "ex. : 0,25" : "ex. : 3/8" }];
}

export function reponse(e: E, p: PhaseDetectiveProba): Frag[] {
  if (p === "ligne") return [tx(`Ligne ${numeroLigneFausse(e)}`)];
  if (p === "erreur") return descriptionFragments(e.variante, e);
  const c = copie(e);
  return [lx(`P=${nombreL(c, c.valeur)}`)];
}

export const recap = reponse;

export function messageIllisible(): string {
  return "Probabilité non reconnue : écris un nombre exact, par exemple 3/8 ou 0,25. Cette saisie ne compte pas comme une tentative.";
}

export function aide1(e: E, p: PhaseDetectiveProba): AideEcran {
  if (p === "ligne") return { texte: [tx("Contrôle les lignes l'une après l'autre : la règle employée est-elle juste ? Une ligne qui découle correctement d'une ligne fausse n'est pas « la » ligne fausse.")] };
  if (p === "erreur") {
    const k = numeroLigneFausse(e);
    return { texte: [tx(k === 1 ? "Refais toi-même la ligne 1 à partir de l'énoncé, sans regarder la copie, puis compare." : `Refais toi-même le passage de la ligne ${k - 1} à la ligne ${k}, sans regarder la copie, puis compare.`)] };
  }
  return copie(e).regleCours;
}

export function aide2(e: E, p: PhaseDetectiveProba): AideEcran | null {
  const c = copie(e);
  if (p === "ligne") return { texte: [tx("Règle employée par chaque ligne : "), ...c.regles.map((r, i) => tx(`${i > 0 ? " ; " : ""}ligne ${i + 1} : ${r}`)), tx(". Laquelle est mal appliquée ?")] };
  if (p === "erreur") return c.regleCours;
  return c.aideCorrection;
}

export function explicationChoix(e: E, p: PhaseDetectiveProba): string {
  if (p === "ligne") return `La première erreur est à la ligne ${numeroLigneFausse(e)} ; les lignes suivantes en découlent.`;
  return "";
}
