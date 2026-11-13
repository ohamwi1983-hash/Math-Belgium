import type { Axe, ExerciceTransformationsEnsembles, Intervalle } from "../core/transformationsEnsembles.types";
import { axeDe, chaine, ensembleDeDepart, memesBornes, memesCrochets } from "./modeleTransformationsEnsembles";

/**
 * Vérification de gen72. Écran 1 (classement) : choix fermé. Écrans 2 et 3 (suivre le domaine,
 * suivre l'ensemble image) : chaque ligne est comparée à l'intervalle CORRECT de la chaîne (jamais
 * à la ligne précédente de l'élève : une erreur ne se propage pas). Statuts distincts pour le
 * diagnostic : bornes fausses, ou bornes justes mais crochets faux (oubli de l'échange des crochets
 * d'une symétrie, crochet fermé sur ∞…).
 */

export type StatutIntervalle = "correct" | "bornes" | "crochets" | "parse_error";

/** Lecture d'une borne : entier, décimal (virgule ou point), fraction a/b, ±∞ (« ∞ », « inf »,
 * « infini », avec ou sans « + »). `null` si illisible. */
export function lireBorne(texte: string): number | null {
  const s = texte.trim().replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(",", ".").toLowerCase();
  if (s === "") return null;
  const infini = /^([+-]?)(∞|inf|infini|infinity)$/.exec(s);
  if (infini) return infini[1] === "-" ? -Infinity : Infinity;
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) return Number(s);
  const fraction = /^([+-]?\d+)\/(\d+)$/.exec(s);
  if (fraction && Number(fraction[2]) !== 0) return Number(fraction[1]) / Number(fraction[2]);
  return null;
}

/** Saisie d'un intervalle : crochets choisis (`null` = pas encore choisi) et bornes en texte.
 * `crochetGauche` : « [ » (fermé) ou « ] » (ouvert) ; `crochetDroit` : « ] » (fermé) ou « [ » (ouvert). */
export interface SaisieIntervalle {
  crochetGauche: "[" | "]" | null;
  gauche: string;
  droite: string;
  crochetDroit: "[" | "]" | null;
}

export const SAISIE_VIDE: SaisieIntervalle = { crochetGauche: null, gauche: "", droite: "", crochetDroit: null };

export function saisieComplete(s: SaisieIntervalle): boolean {
  return s.crochetGauche !== null && s.crochetDroit !== null && s.gauche.trim() !== "" && s.droite.trim() !== "";
}

/** Intervalle lu, ou `null` si une borne est illisible ou un crochet manque. */
export function lireIntervalle(s: SaisieIntervalle): Intervalle | null {
  const gauche = lireBorne(s.gauche);
  const droite = lireBorne(s.droite);
  if (gauche === null || droite === null || s.crochetGauche === null || s.crochetDroit === null) return null;
  return { gauche, gaucheFerme: s.crochetGauche === "[", droite, droiteFerme: s.crochetDroit === "]" };
}

export function diagnostiquerIntervalle(saisie: SaisieIntervalle, attendu: Intervalle): StatutIntervalle {
  const lu = lireIntervalle(saisie);
  if (!lu) return "parse_error";
  if (!memesBornes(lu, attendu)) return "bornes";
  return memesCrochets(lu, attendu) ? "correct" : "crochets";
}

/** Intervalles attendus de l'écran d'un axe : la chaîne, ou l'ensemble de départ s'il est inchangé. */
export function intervallesAttendus(e: ExerciceTransformationsEnsembles, axe: Axe): Intervalle[] {
  const c = chaine(e, axe);
  return c.length === 0 ? [ensembleDeDepart(e, axe)] : c;
}

export function diagnostiquerChaine(e: ExerciceTransformationsEnsembles, axe: Axe, saisies: SaisieIntervalle[]): StatutIntervalle[] {
  return intervallesAttendus(e, axe).map((attendu, i) => diagnostiquerIntervalle(saisies[i] ?? SAISIE_VIDE, attendu));
}

/** Écran 1 : l'axe choisi pour chaque transformation, dans l'ordre de l'énoncé. */
export function verifierClassement(e: ExerciceTransformationsEnsembles, choix: Axe[]): boolean {
  return e.transformations.every((t, i) => choix[i] === axeDe(t));
}
