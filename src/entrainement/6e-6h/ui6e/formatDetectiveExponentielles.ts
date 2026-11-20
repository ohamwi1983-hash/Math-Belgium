import type { ExerciceDetectiveExp } from "../core6e/detectiveExponentielles.types";
import { copie, descriptionFragments, DESCRIPTION_CORRECTE, LIGNES_PAR_SCENARIO } from "../moteur6e/modeleDetectiveExponentielles";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransExp.types";
import { lx, tx } from "./ecransExp.types";

/**
 * Couche C — textes de 6gen144 « Le détective d'erreurs : exponentielles » : consignes, options,
 * champs, aides à deux niveaux, réponses. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceDetectiveExp;
export type PhaseDetectiveExp = "ligne" | "erreur" | "correction";
export const PHASES: PhaseDetectiveExp[] = ["ligne", "erreur", "correction"];

export const CONSIGNE_GLOBALE = "Une seule ligne de cette résolution est fausse (les lignes suivantes en découlent). Trouve-la, explique l'erreur et corrige la résolution.";

export function consigneGenerale(e: E): Frag[] {
  return [tx("Un élève a résolu l'exercice suivant. "), ...copie(e).enonce, tx(" Une seule ligne de sa résolution est fausse ; les lignes suivantes en découlent.")];
}

export const numeroLigneFausse = (e: E): number => copie(e).ligneFausse + 1;

export function consigne(e: E, phase: PhaseDetectiveExp): Frag[] {
  const k = numeroLigneFausse(e);
  if (phase === "ligne") return [tx("Quelle ligne est fausse ? (la première ligne qui contient une erreur)")];
  if (phase === "erreur") return [tx(`Quelle erreur a été commise à la ligne ${k} ?`)];
  const v = copie(e).valeurs;
  return [tx(`Corrige la résolution à partir de la ligne ${k} : donne `), ...v.flatMap((x, i) => [...(i > 0 ? [tx(" et ")] : []), lx(x.labelLatex.replace(/=$/, ""))]), tx(v.some((x) => x.genre === "nombre" || x.genre === "fonction") ? " (valeurs exactes)." : ".")];
}

export function libelle(_e: E, phase: PhaseDetectiveExp): string {
  return phase === "ligne" ? "Ligne fausse" : phase === "erreur" ? "Erreur" : "Correction";
}

export function optionsLigne(e: E): OptionEcran[] {
  return Array.from({ length: LIGNES_PAR_SCENARIO[e.scenario] }, (_, i) => ({ id: `L${i + 1}`, fragments: [tx(`Ligne ${i + 1}`)] }));
}

export function optionsErreur(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }));
}

export function champs(e: E): ChampEcran[] {
  return copie(e).valeurs.map((v) => ({ label: v.label, labelLatex: v.labelLatex, placeholder: v.placeholder }));
}

export function reponse(e: E, phase: PhaseDetectiveExp): Frag[] {
  if (phase === "ligne") return [tx(`Ligne ${numeroLigneFausse(e)}`)];
  if (phase === "erreur") return descriptionFragments(DESCRIPTION_CORRECTE[e.variante], e);
  return copie(e).valeurs.flatMap((v, i) => [...(i > 0 ? [tx(" ; ")] : []), lx(v.latex)]);
}

export const recap = reponse;

export function messageIllisible(e: E, phase: PhaseDetectiveExp): string {
  void phase;
  const genres = new Set(copie(e).valeurs.map((v) => v.genre));
  if (genres.has("fonction")) return "Je n'arrive pas à lire ta réponse (exemples d'écritures acceptées : 6*ln(2)*2^(3x−3), −10e^(−2x), 6ln2). Cela ne compte pas comme une tentative.";
  if (genres.has("ensemble")) return "Je n'arrive pas à lire ton ensemble (exemples : 2 ; −1, ou 5/3, ou ∅ s'il n'y a pas de solution). Cela ne compte pas comme une tentative.";
  if (genres.has("intervalle")) return "Je n'arrive pas à lire une borne (exemples : −∞, 3/2, −4). Cela ne compte pas comme une tentative.";
  if (genres.has("limite")) return "Je n'arrive pas à lire ta réponse (exemples : 0, 3/2, +∞, -inf). Cela ne compte pas comme une tentative.";
  return "Je n'arrive pas à lire ta réponse (exemples : 0,85 ; 12282,5 ; 3/2). Cela ne compte pas comme une tentative.";
}

export function aide1(e: E, phase: PhaseDetectiveExp): AideEcran {
  const c = copie(e);
  if (phase === "ligne") return { texte: [tx("Contrôle les lignes l'une après l'autre : la règle employée est-elle juste ? Une ligne qui découle correctement d'une ligne fausse n'est pas « la » ligne fausse.")] };
  if (phase === "erreur") {
    const k = numeroLigneFausse(e);
    return { texte: [tx(k === 1 ? "Refais toi-même le calcul de la ligne 1 à partir de l'énoncé, sans regarder la copie, puis compare." : `Refais toi-même le passage de la ligne ${k - 1} à la ligne ${k}, sans regarder la copie, puis compare.`)] };
  }
  return c.regleCours;
}

export function aide2(e: E, phase: PhaseDetectiveExp): AideEcran | null {
  const c = copie(e);
  if (phase === "ligne") return { texte: [tx("Règle employée par chaque ligne : "), ...c.regles.flatMap((r, i) => [tx(`${i > 0 ? " ; " : ""}ligne ${i + 1} : ${r}`)]), tx(". Laquelle est mal appliquée ?")] };
  if (phase === "erreur") return c.regleCours;
  return c.aideCorrection;
}

export function explicationChoix(e: E, phase: PhaseDetectiveExp): string {
  if (phase === "ligne") return `La première erreur est à la ligne ${numeroLigneFausse(e)} ; les lignes suivantes en découlent.`;
  return "";
}
