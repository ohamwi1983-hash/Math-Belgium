import type { ExerciceDVA } from "../core6e/detectiveVariablesAleatoires";
import { copie, descriptionFragments, nombreLignes } from "../moteur6e/modeleDetectiveVariablesAleatoires";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationDetectiveVariablesAleatoires";
import { correctionDetailleeDVA } from "../generateurs6e/detectiveVariablesAleatoires/corrigeDetaille";

/**
 * Couche C — textes de `6gen122` « Détective d'erreurs : variables aléatoires » : consignes, options,
 * champ de l'écran 3, aides à deux niveaux, réponses. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceDVA;
export type PhaseDVA = "ligne" | "erreur" | "correction";
export const PHASES: PhaseDVA[] = ["ligne", "erreur", "correction"];
const t = tx;
const l = lx;

export const CONSIGNE_GLOBALE = "Une seule ligne de cette résolution est fausse (les lignes suivantes en découlent). Trouve-la, explique l'erreur et corrige la résolution.";

export function consigneGenerale(e: E): Frag[] {
  return [t("Un élève a résolu l'exercice suivant. "), ...copie(e).enonce, t(" Une seule ligne de sa résolution est fausse ; les lignes suivantes en découlent.")];
}

export const numeroLigneFausse = (e: E): number => copie(e).ligneFausse + 1;

export function libelle(_e: E, p: PhaseDVA): string {
  return p === "ligne" ? "Ligne fausse" : p === "erreur" ? "Erreur" : "Correction";
}

const PRECISIONS: Record<string, string> = { exacte: "valeur exacte", dec4: "quatre décimales", pourcent: "en pourcentage", centieme: "au centième" };

export function consigne(e: E, p: PhaseDVA): Frag[] {
  if (p === "ligne") return [t("Quelle ligne est fausse ? (la première ligne qui contient une erreur)")];
  if (p === "erreur") return [t(`Quelle erreur a été commise à la ligne ${numeroLigneFausse(e)} ?`)];
  const c = copie(e);
  return [t(`Corrige la résolution à partir de la ligne ${numeroLigneFausse(e)} : donne `), ...c.demande, t(` (${PRECISIONS[c.precision]}).`)];
}

export function optionsLigne(e: E): OptionEcran[] {
  return Array.from({ length: nombreLignes(e) }, (_, i) => ({ id: `L${i + 1}`, fragments: [tx(`Ligne ${i + 1}`)] }));
}

export function optionsErreur(e: E): OptionEcran[] {
  return e.options.map((id) => ({ id, fragments: descriptionFragments(id, e) }));
}

export function champs(e: E): ChampEcran[] {
  const c = copie(e);
  const ph: Record<string, string> = { exacte: "valeur exacte", dec4: "quatre décimales", pourcent: "en %", centieme: "au centième" };
  return [{ label: "Valeur corrigée", labelLatex: c.precision === "pourcent" ? "\\%" : "=", placeholder: ph[c.precision]! }];
}

export function reponse(e: E, p: PhaseDVA): Frag[] {
  if (p === "ligne") return [t(`Ligne ${numeroLigneFausse(e)}`)];
  if (p === "erreur") return descriptionFragments(e.variante, e);
  const c = copie(e);
  return [...c.demande, t(" : "), l(c.valeurL)];
}

export const recap = reponse;

export function aide1(e: E, p: PhaseDVA): AideEcran {
  if (p === "ligne") return { texte: [t("Contrôle les lignes l'une après l'autre : la règle employée est-elle juste ? Une ligne qui découle correctement d'une ligne fausse n'est pas « la » ligne fausse.")] };
  if (p === "erreur") {
    const k = numeroLigneFausse(e);
    return { texte: [t(k === 1 ? "Refais toi-même la ligne 1 à partir de l'énoncé, sans regarder la copie, puis compare." : `Refais toi-même le passage de la ligne ${k - 1} à la ligne ${k}, sans regarder la copie, puis compare.`)] };
  }
  return copie(e).regleCours;
}

export function aide2(e: E, p: PhaseDVA): AideEcran | null {
  const c = copie(e);
  if (p === "ligne") return { texte: [t("Règle employée par chaque ligne : "), ...c.regles.map((r, i) => t(`${i > 0 ? " ; " : ""}ligne ${i + 1} : ${r}`)), t(". Laquelle est mal appliquée ?")] };
  if (p === "erreur") return c.regleCours;
  return c.aideCorrection;
}

export function explicationChoix(e: E, p: PhaseDVA): string {
  if (p === "ligne") return `La première erreur est à la ligne ${numeroLigneFausse(e)} ; les lignes suivantes en découlent.`;
  return "";
}

/** `6gen122` : ligne fausse (choix jugé ✗ / ✓), erreur (choix jugé, 4 descriptions), correction
 * (valeur, trois tentatives). */
export const DEFINITION_DVA: DefinitionEcrans<E, PhaseDVA> = {
  phases: () => PHASES,
  estChoix: (_e, p) => p !== "correction",
  mode: (e, p) => {
    if (p === "ligne") return { type: "choix", options: optionsLigne(e) };
    if (p === "erreur") return { type: "choix", options: optionsErreur(e) };
    return { type: "champs", champs: champs(e) };
  },
  libelle,
  consigneGenerale,
  copie: (e, p) => ({ lignes: copie(e).lignes, signalee: p === "ligne" ? null : copie(e).ligneFausse }),
  consigne,
  approchee,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e, p) => (p === "ligne" ? `L${numeroLigneFausse(e)}` : e.variante),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeDVA,
};
