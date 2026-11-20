import type { ExerciceDetectiveFonctions } from "../core5e/detectiveFonctions.types";
import { copie, descriptionFragments, DESCRIPTION_CORRECTE, nombreLignes } from "../moteur5e/modeleDetectiveFonctions";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { apercuEnsemble, RACCOURCIS_ENSEMBLE } from "../moteur5e/ensemblesReels";
import { saisieTrigVersLatex } from "../moteur5e/saisieTrig";

/**
 * Couche C — textes de `5gen58` « Détective d'erreurs : fonctions et composées » : consignes,
 * options, champ de l'écran 3, aides à deux niveaux, réponses. Source unique de l'écran, du papier
 * et du corrigé.
 */

type E = ExerciceDetectiveFonctions;
export type PhaseDetectiveFonctions = "ligne" | "erreur" | "correction";
export const PHASES: PhaseDetectiveFonctions[] = ["ligne", "erreur", "correction"];

export const CONSIGNE_GLOBALE = "Une seule ligne de cette résolution est fausse (les lignes suivantes en découlent). Trouve-la, explique l'erreur et corrige la résolution.";

export function consigneGenerale(e: E): Frag[] {
  return [tx("Un élève a résolu l'exercice suivant. "), ...copie(e).enonce, tx(" Une seule ligne de sa résolution est fausse ; les lignes suivantes en découlent.")];
}

export const numeroLigneFausse = (e: E): number => copie(e).ligneFausse + 1;

export function libelle(_e: E, p: PhaseDetectiveFonctions): string {
  return p === "ligne" ? "Ligne fausse" : p === "erreur" ? "Erreur" : "Correction";
}

export function consigne(e: E, p: PhaseDetectiveFonctions): Frag[] {
  if (p === "ligne") return [tx("Quelle ligne est fausse ? (la première ligne qui contient une erreur)")];
  if (p === "erreur") return [tx(`Quelle erreur a été commise à la ligne ${numeroLigneFausse(e)} ?`)];
  const v = copie(e).valeur;
  return [tx(`Corrige la résolution à partir de la ligne ${numeroLigneFausse(e)} : donne `), lx(v.labelLatex.replace(/=$/, "")), tx(v.genre === "expression" ? " (développée et réduite, ou toute écriture équivalente)." : ".")];
}

export function optionsLigne(e: E): OptionEcran[] {
  return Array.from({ length: nombreLignes(e) }, (_, i) => ({ id: `L${i + 1}`, fragments: [tx(`Ligne ${i + 1}`)] }));
}

export function optionsErreur(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }));
}

/** Aperçu d'un nombre (rien pour un entier simple). */
function apercuNombre(t: string): string | null {
  const l = saisieTrigVersLatex(t);
  return l && !/^-?[\d{},]+$/.test(l) ? l : null;
}

export function champ(e: E): ChampEcran {
  const v = copie(e).valeur;
  if (v.genre === "ensemble") return { label: v.label, labelLatex: v.labelLatex, placeholder: v.placeholder, apercuLatex: apercuEnsemble, raccourcis: RACCOURCIS_ENSEMBLE };
  if (v.genre === "expression") return { label: v.label, labelLatex: v.labelLatex, placeholder: v.placeholder, apercu: true };
  return { label: v.label, labelLatex: v.labelLatex, placeholder: v.placeholder, apercuLatex: apercuNombre };
}

export function reponse(e: E, p: PhaseDetectiveFonctions): Frag[] {
  if (p === "ligne") return [tx(`Ligne ${numeroLigneFausse(e)}`)];
  if (p === "erreur") return descriptionFragments(DESCRIPTION_CORRECTE[e.variante], e);
  return [lx(copie(e).valeur.latex)];
}

export const recap = reponse;

export function messageIllisible(e: E, p: PhaseDetectiveFonctions): string {
  void p;
  const g = copie(e).valeur.genre;
  if (g === "ensemble") return "Ensemble non reconnu : écris des intervalles avec leurs crochets, par exemple ]−∞ ; 3], [−2 ; 5], ℝ \\ {4} ou ∅. Cette saisie ne compte pas comme une tentative.";
  if (g === "expression") return "Expression non reconnue : vérifie les parenthèses, les signes et la place de x (par exemple 4x² − 12x + 10). Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre, par exemple 46 ou −7. Cette saisie ne compte pas comme une tentative.";
}

export function aide1(e: E, p: PhaseDetectiveFonctions): AideEcran {
  const c = copie(e);
  if (p === "ligne") return { texte: [tx("Contrôle les lignes l'une après l'autre : la règle employée est-elle juste ? Une ligne qui découle correctement d'une ligne fausse n'est pas « la » ligne fausse.")] };
  if (p === "erreur") {
    const k = numeroLigneFausse(e);
    return { texte: [tx(k === 1 ? "Refais toi-même la ligne 1 à partir de l'énoncé, sans regarder la copie, puis compare." : `Refais toi-même le passage de la ligne ${k - 1} à la ligne ${k}, sans regarder la copie, puis compare.`)] };
  }
  return c.regleCours;
}

export function aide2(e: E, p: PhaseDetectiveFonctions): AideEcran | null {
  const c = copie(e);
  if (p === "ligne") return { texte: [tx("Règle employée par chaque ligne : "), ...c.regles.map((r, i) => tx(`${i > 0 ? " ; " : ""}ligne ${i + 1} : ${r}`)), tx(". Laquelle est mal appliquée ?")] };
  if (p === "erreur") return c.regleCours;
  return c.aideCorrection;
}

export function explicationChoix(e: E, p: PhaseDetectiveFonctions): string {
  if (p === "ligne") return `La première erreur est à la ligne ${numeroLigneFausse(e)} ; les lignes suivantes en découlent.`;
  return "";
}
