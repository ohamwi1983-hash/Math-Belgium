import type { ExerciceDetectiveDerivees } from "../core5e/detectiveDerivees.types";
import { copie, descriptionFragments, droiteL, nombreLignes, reponseExtremums } from "../moteur5e/modeleDetectiveDerivees";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";

/**
 * Couche C — textes de `5gen72` « Détective d'erreurs : dérivées » : consignes, options, champs de
 * l'écran 3, aides à deux niveaux, réponses. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceDetectiveDerivees;
export type PhaseDetectiveDerivees = "ligne" | "erreur" | "correction";
export const PHASES: PhaseDetectiveDerivees[] = ["ligne", "erreur", "correction"];

export const CONSIGNE_GLOBALE = "Une seule ligne de cette résolution est fausse (les lignes suivantes en découlent). Trouve-la, explique l'erreur et corrige la résolution.";

export function consigneGenerale(e: E): Frag[] {
  return [tx("Un élève a résolu l'exercice suivant. "), ...copie(e).enonce, tx(" Une seule ligne de sa résolution est fausse ; les lignes suivantes en découlent.")];
}

export const numeroLigneFausse = (e: E): number => copie(e).ligneFausse + 1;

export function libelle(_e: E, p: PhaseDetectiveDerivees): string {
  return p === "ligne" ? "Ligne fausse" : p === "erreur" ? "Erreur" : "Correction";
}

export function consigne(e: E, p: PhaseDetectiveDerivees): Frag[] {
  if (p === "ligne") return [tx("Quelle ligne est fausse ? (la première ligne qui contient une erreur)")];
  if (p === "erreur") return [tx(`Quelle erreur a été commise à la ligne ${numeroLigneFausse(e)} ?`)];
  if (copie(e).valeur.genre === "droite") return [tx(`Corrige la résolution à partir de la ligne ${numeroLigneFausse(e)} : donne une équation de la tangente.`)];
  return [tx(`Corrige la résolution à partir de la ligne ${numeroLigneFausse(e)} : donne l'abscisse du maximum local et celle du minimum local de f (écris « aucun » s'il n'y en a pas).`)];
}

export function optionsLigne(e: E): OptionEcran[] {
  return Array.from({ length: nombreLignes(e) }, (_, i) => ({ id: `L${i + 1}`, fragments: [tx(`Ligne ${i + 1}`)] }));
}

export function optionsErreur(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }));
}

const RACCOURCIS_EXT = [
  { libelle: "aucun", texte: "aucun" },
  { libelle: "−", texte: "−" },
];

export function champs(e: E): ChampEcran[] {
  if (copie(e).valeur.genre === "droite") return [{ label: "Tangente", labelLatex: "y=", placeholder: "ex. : 3x − 1/2", apercu: true }];
  return [
    { label: "Abscisse du maximum local", labelLatex: "x_{\\max}=", placeholder: "ex. : −2 ou aucun", raccourcis: RACCOURCIS_EXT },
    { label: "Abscisse du minimum local", labelLatex: "x_{\\min}=", placeholder: "ex. : 3 ou aucun", raccourcis: RACCOURCIS_EXT },
  ];
}

export function reponse(e: E, p: PhaseDetectiveDerivees): Frag[] {
  if (p === "ligne") return [tx(`Ligne ${numeroLigneFausse(e)}`)];
  if (p === "erreur") return descriptionFragments(e.variante, e);
  const v = copie(e).valeur;
  if (v.genre === "droite") return [lx(`y=${droiteL(v.droite)}`)];
  return reponseExtremums(v);
}

export const recap = reponse;

export function messageIllisible(e: E, p: PhaseDetectiveDerivees): string {
  void p;
  if (copie(e).valeur.genre === "droite") return "Équation non reconnue : écris la droite avec x, par exemple 3x − 1/2 (ou y = 3x − 1/2). Cette saisie ne compte pas comme une tentative.";
  return "Abscisse non reconnue : écris un nombre (−2, 3, 1/2) ou « aucun ». Cette saisie ne compte pas comme une tentative.";
}

export function aide1(e: E, p: PhaseDetectiveDerivees): AideEcran {
  if (p === "ligne") return { texte: [tx("Contrôle les lignes l'une après l'autre : la règle employée est-elle juste ? Une ligne qui découle correctement d'une ligne fausse n'est pas « la » ligne fausse.")] };
  if (p === "erreur") {
    const k = numeroLigneFausse(e);
    return { texte: [tx(k === 1 ? "Refais toi-même la ligne 1 à partir de l'énoncé, sans regarder la copie, puis compare." : `Refais toi-même le passage de la ligne ${k - 1} à la ligne ${k}, sans regarder la copie, puis compare.`)] };
  }
  return copie(e).regleCours;
}

export function aide2(e: E, p: PhaseDetectiveDerivees): AideEcran | null {
  const c = copie(e);
  if (p === "ligne") return { texte: [tx("Règle employée par chaque ligne : "), ...c.regles.map((r, i) => tx(`${i > 0 ? " ; " : ""}ligne ${i + 1} : ${r}`)), tx(". Laquelle est mal appliquée ?")] };
  if (p === "erreur") return c.regleCours;
  return c.aideCorrection;
}

export function explicationChoix(e: E, p: PhaseDetectiveDerivees): string {
  if (p === "ligne") return `La première erreur est à la ligne ${numeroLigneFausse(e)} ; les lignes suivantes en découlent.`;
  return "";
}
