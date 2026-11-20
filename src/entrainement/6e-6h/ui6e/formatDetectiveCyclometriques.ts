import type { ExerciceDetectiveCyclo } from "../core6e/detectiveCyclometriques.types";
import { copie, descriptionFragments } from "../moteur6e/modeleDetectiveCyclometriques";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransExp.types";
import { lx, tx } from "./ecransExp.types";

/**
 * Couche C — textes de `6gen152` « Le détective d'erreurs : réciproques et arcfonctions » :
 * consignes, options, champs, aides à deux niveaux, réponses. Source unique de l'écran, du papier et
 * du corrigé (même patron que 6gen144).
 */

type E = ExerciceDetectiveCyclo;
export type PhaseDetectiveCyclo = "ligne" | "erreur" | "correction";
export const PHASES: PhaseDetectiveCyclo[] = ["ligne", "erreur", "correction"];
const t = tx;
const l = lx;

export const CONSIGNE_GLOBALE = "Une seule ligne de cette résolution est fausse (les lignes suivantes en découlent). Trouve-la, explique l'erreur et corrige la résolution.";

export function consigneGenerale(e: E): Frag[] {
  return [t("Un élève a résolu l'exercice suivant. "), ...copie(e).enonce, t(" Une seule ligne de sa résolution est fausse ; les lignes suivantes en découlent.")];
}

export const numeroLigneFausse = (e: E): number => copie(e).ligneFausse + 1;

export function consigne(e: E, phase: PhaseDetectiveCyclo): Frag[] {
  const k = numeroLigneFausse(e);
  if (phase === "ligne") return [t("Quelle ligne est fausse ? (la première ligne qui contient une erreur)")];
  if (phase === "erreur") return [t(`Quelle erreur a été commise à la ligne ${k} ?`)];
  const v = copie(e).valeurs;
  return [t(`Corrige la résolution à partir de la ligne ${k} : donne `), ...v.flatMap((x, i) => [...(i > 0 ? [t(" et ")] : []), l(x.labelLatex.replace(/=$/, ""))]), t(v.some((x) => x.genre === "nombre" || x.genre === "fonction") ? (v.length > 1 ? " (valeurs exactes)." : " (valeur exacte).") : ".")];
}

export function libelle(_e: E, phase: PhaseDetectiveCyclo): string {
  return phase === "ligne" ? "Ligne fausse" : phase === "erreur" ? "Erreur" : "Correction";
}

export function optionsLigne(e: E): OptionEcran[] {
  return copie(e).lignes.map((_, i) => ({ id: `L${i + 1}`, fragments: [t(`Ligne ${i + 1}`)] }));
}

export function optionsErreur(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }));
}

export function champs(e: E): ChampEcran[] {
  return copie(e).valeurs.map((v) => ({ label: v.label, labelLatex: v.labelLatex, placeholder: v.placeholder, apercu: v.genre === "fonction" }));
}

export function reponse(e: E, phase: PhaseDetectiveCyclo): Frag[] {
  if (phase === "ligne") return [t(`Ligne ${numeroLigneFausse(e)}`)];
  if (phase === "erreur") return descriptionFragments(e.variante, e);
  return copie(e).valeurs.flatMap((v, i) => [...(i > 0 ? [t(" ; ")] : []), l(v.latex)]);
}

export const recap = reponse;

export function messageIllisible(e: E, phase: PhaseDetectiveCyclo): string {
  void phase;
  const genres = new Set(copie(e).valeurs.map((v) => v.genre));
  if (genres.has("fonction")) return "Je n'arrive pas à lire ta réponse (exemples d'écritures acceptées : −6/sqrt(1−36x²), 6/(1+36x²), (x+7)/6, 2√3/3). Cela ne compte pas comme une tentative.";
  if (genres.has("ensemble")) return "Je n'arrive pas à lire ton ensemble (exemples : 2 ; −1, ou 5, ou ∅ s'il n'y a pas de solution). Cela ne compte pas comme une tentative.";
  if (genres.has("intervalle")) return "Je n'arrive pas à lire une borne (exemples : −1/3, 2−π/2, π). Cela ne compte pas comme une tentative.";
  return "Je n'arrive pas à lire ta réponse (exemples : 7π/12, −π/4, 3/2). Cela ne compte pas comme une tentative.";
}

export function aide1(e: E, phase: PhaseDetectiveCyclo): AideEcran {
  const c = copie(e);
  if (phase === "ligne") return { texte: [t("Contrôle les lignes l'une après l'autre : la règle employée est-elle juste ? Une ligne qui découle correctement d'une ligne fausse n'est pas « la » ligne fausse.")] };
  if (phase === "erreur") {
    const k = numeroLigneFausse(e);
    return { texte: [t(k === 1 ? "Refais toi-même le calcul de la ligne 1 à partir de l'énoncé, sans regarder la copie, puis compare." : `Refais toi-même le passage de la ligne ${k - 1} à la ligne ${k}, sans regarder la copie, puis compare.`)] };
  }
  return c.regleCours;
}

export function aide2(e: E, phase: PhaseDetectiveCyclo): AideEcran | null {
  const c = copie(e);
  if (phase === "ligne") return { texte: [t("Règle employée par chaque ligne : "), ...c.regles.map((r, i) => t(`${i > 0 ? " ; " : ""}ligne ${i + 1} : ${r}`)), t(". Laquelle est mal appliquée ?")] };
  if (phase === "erreur") return c.regleCours;
  return c.aideCorrection;
}

export function explicationChoix(e: E, phase: PhaseDetectiveCyclo): string {
  if (phase === "ligne") return `La première erreur est à la ligne ${numeroLigneFausse(e)} ; les lignes suivantes en découlent.`;
  return "";
}
