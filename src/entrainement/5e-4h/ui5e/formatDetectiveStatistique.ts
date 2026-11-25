import type { ExerciceDetectiveStat } from "../core5e/detectiveStatistique";
import { copie, descriptionFragments, nombreLignes } from "../moteur5e/modeleDetectiveStatistique";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { droiteL, nL } from "./nombresStatLotH2";

/**
 * Couche C — textes de `5gen81` « Détective d'erreurs : statistique à deux variables » : consignes,
 * options, champs de l'écran 3, aides à deux niveaux, réponses. Source unique de l'écran, du papier et
 * du corrigé.
 */

type E = ExerciceDetectiveStat;
export type PhaseDetectiveStat = "ligne" | "erreur" | "correction";
export const PHASES: PhaseDetectiveStat[] = ["ligne", "erreur", "correction"];

export const CONSIGNE_GLOBALE = "Une seule ligne de cette résolution est fausse (les lignes suivantes en découlent). Trouve-la, explique l'erreur et corrige la résolution.";

export function consigneGenerale(e: E): Frag[] {
  return [tx("Un élève a résolu l'exercice suivant. "), ...copie(e).enonce, tx(" Une seule ligne de sa résolution est fausse ; les lignes suivantes en découlent.")];
}

export const numeroLigneFausse = (e: E): number => copie(e).ligneFausse + 1;

export function libelle(_e: E, p: PhaseDetectiveStat): string {
  return p === "ligne" ? "Ligne fausse" : p === "erreur" ? "Erreur" : "Correction";
}

export function consigne(e: E, p: PhaseDetectiveStat): Frag[] {
  const k = numeroLigneFausse(e);
  if (p === "ligne") return [tx("Quelle ligne est fausse ? (la première ligne qui contient une erreur)")];
  if (p === "erreur") return [tx(`Quelle erreur a été commise à la ligne ${k} ?`)];
  const v = copie(e).valeur;
  if (v.genre === "droite") return [tx(`Corrige la résolution à partir de la ligne ${k} : donne l'équation de la droite (coefficients exacts ou arrondis au centième).`)];
  if (v.genre === "point") return [tx(`Corrige la résolution à partir de la ligne ${k} : donne les coordonnées du point moyen G.`)];
  if (v.genre === "r") return [tx(`Corrige la résolution à partir de la ligne ${k} : donne le coefficient de corrélation r, au centième.`)];
  return [tx(`Corrige la conclusion de l'élève : quelle phrase faut-il écrire à partir de la ligne ${k} ?`)];
}

export function optionsLigne(e: E): OptionEcran[] {
  return Array.from({ length: nombreLignes(e) }, (_, i) => ({ id: `L${i + 1}`, fragments: [tx(`Ligne ${i + 1}`)] }));
}

export function optionsErreur(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: descriptionFragments(id) }));
}

export function optionsCorrection(e: E): OptionEcran[] {
  const v = copie(e).valeur;
  if (v.genre !== "choix") return [];
  return e.ordreCorrection.map((k) => ({ id: `C${k}`, fragments: v.options[k]! }));
}

export function champs(e: E): ChampEcran[] {
  const v = copie(e).valeur;
  if (v.genre === "droite") return [{ label: "Droite", labelLatex: "y=", placeholder: "ex. : 1,25x + 3,5", apercu: true }];
  if (v.genre === "point")
    return [
      { label: "x̄", labelLatex: "\\bar{x}=", placeholder: "ex. : 6,5" },
      { label: "ȳ", labelLatex: "\\bar{y}=", placeholder: "ex. : 12,25" },
    ];
  return [{ label: "r", labelLatex: "r=", placeholder: "ex. : 0,87" }];
}

export function reponse(e: E, p: PhaseDetectiveStat): Frag[] {
  if (p === "ligne") return [tx(`Ligne ${numeroLigneFausse(e)}`)];
  if (p === "erreur") return descriptionFragments(e.variante);
  const v = copie(e).valeur;
  if (v.genre === "droite") return [lx(droiteL(v.a, v.b, 2, 2).replace("=", Math.abs(v.a * 100 - Math.round(v.a * 100)) > 1e-7 || Math.abs(v.b * 100 - Math.round(v.b * 100)) > 1e-7 ? "\\approx " : "="))];
  if (v.genre === "point") return [lx(`G(${nL(v.x, 2)}\\,;${nL(v.y, 2)})`)];
  if (v.genre === "r") return [lx(`r\\approx ${nL(v.r, 2, true)}`)];
  return v.options[0]!;
}

export const recap = reponse;

export function messageIllisible(e: E, _p: PhaseDetectiveStat): string {
  const v = copie(e).valeur;
  if (v.genre === "droite") return "Équation non reconnue : écris la droite avec x, par exemple 1,25x + 3,5 (ou y = 1,25x + 3,5). Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre comme 6,5 ou −0,87 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

export function aide1(e: E, p: PhaseDetectiveStat): AideEcran {
  if (p === "ligne") return { texte: [tx("Contrôle les lignes l'une après l'autre : la règle employée est-elle juste ? Une ligne qui découle correctement d'une ligne fausse n'est pas « la » ligne fausse.")] };
  if (p === "erreur") {
    const k = numeroLigneFausse(e);
    return { texte: [tx(k === 1 ? "Refais toi-même la ligne 1 à partir de l'énoncé, sans regarder la copie, puis compare." : `Refais toi-même la ligne ${k}, sans regarder la copie, puis compare.`)] };
  }
  return copie(e).regleCours;
}

export function aide2(e: E, p: PhaseDetectiveStat): AideEcran | null {
  const c = copie(e);
  if (p === "ligne") return { texte: [tx("Règle employée par chaque ligne : "), ...c.regles.map((r, i) => tx(`${i > 0 ? " ; " : ""}ligne ${i + 1} : ${r}`)), tx(". Laquelle est mal appliquée ?")] };
  if (p === "erreur") return c.regleCours;
  return c.aideCorrection;
}

export function explicationChoix(e: E, p: PhaseDetectiveStat): string {
  if (p === "ligne") return `La première erreur est à la ligne ${numeroLigneFausse(e)} ; les lignes suivantes en découlent.`;
  return "";
}
