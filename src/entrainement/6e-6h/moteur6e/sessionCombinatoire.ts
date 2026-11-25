import type { StatutVerification } from "../moteur/statutVerification";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Moteur de session COMMUN aux six générateurs du 6e ch. 7 (6gen43–6gen48, audit du chapitre,
 * lot B). Il remplace les six moteurs d'origine, identiques à leurs types près, qui violaient les
 * mêmes règles permanentes :
 * - une saisie illisible ou de mauvaise forme (`parse_error`) ne consomme JAMAIS de tentative ;
 * - un choix fermé n'a qu'UNE tentative (un 2e essai donnerait la réponse par élimination), un écran
 *   de champs en a trois ;
 * - aucun point : `score` du moteur de tentatives reste un marqueur interne (réussi / révélé).
 * Un exercice = une liste de phases (`phases`), parcourues dans l'ordre.
 */

export interface DefinitionSession<E, P extends string> {
  phases: (exercice: E) => P[];
  diagnostiquer: (exercice: E, phase: P, valeurs: string[]) => StatutVerification;
  /** Écran de choix fermé (une tentative). */
  estChoix: (exercice: E, phase: P) => boolean;
}

export const TENTATIVES_CHAMPS = 3;
export const NIVEAU_AIDE_MAX = 2;

export interface EtatSession<E, P extends string> {
  exercice: E;
  phases: P[];
  index: number;
  etape: EtatEtapeTentatives;
  niveauAide: number;
  /** Bilan des écrans clos (révélé ou non, aide utilisée). */
  clos: Partial<Record<P, { revele: boolean; aide: boolean }>>;
  terminee: boolean;
  /** Dernière clôture : réponse révélée (tentatives épuisées ou choix faux) ? */
  derniereRevelee: boolean;
}

export function demarrerSession<E, P extends string>(def: DefinitionSession<E, P>, exercice: E): EtatSession<E, P> {
  return { exercice, phases: def.phases(exercice), index: 0, etape: demarrerEtapeTentatives(), niveauAide: 0, clos: {}, terminee: false, derniereRevelee: false };
}

export function phaseCourante<E, P extends string>(etat: EtatSession<E, P>): P {
  return etat.phases[Math.min(etat.index, etat.phases.length - 1)];
}

export function tentativesMaxCourant<E, P extends string>(def: DefinitionSession<E, P>, etat: EtatSession<E, P>): number {
  return def.estChoix(etat.exercice, phaseCourante(etat)) ? 1 : TENTATIVES_CHAMPS;
}

export function activerAide<E, P extends string>(etat: EtatSession<E, P>): EtatSession<E, P> {
  if (etat.terminee || etat.niveauAide >= NIVEAU_AIDE_MAX) return etat;
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

/** Soumission d'un écran. Une saisie illisible rend l'état INCHANGÉ (aucune tentative). */
export function soumettre<E, P extends string>(def: DefinitionSession<E, P>, etat: EtatSession<E, P>, valeurs: string[]): EtatSession<E, P> {
  if (etat.terminee) return etat;
  const phase = phaseCourante(etat);
  const statut = def.diagnostiquer(etat.exercice, phase, valeurs);
  if (statut === "parse_error") return { ...etat, derniereRevelee: false };
  const etape = soumettreEtapeTentatives<string[]>(etat.etape, valeurs, {
    pointsDeBase: 100,
    tentativesMax: tentativesMaxCourant(def, etat),
    verifier: () => statut === "correct",
    revelerReponse: () => {},
  });
  if (!etape.terminee) return { ...etat, etape, derniereRevelee: false };
  const clos = { ...etat.clos, [phase]: { revele: etape.revelee, aide: etat.niveauAide > 0 } };
  const index = etat.index + 1;
  if (index >= etat.phases.length) return { ...etat, etape, clos, index: etat.phases.length - 1, terminee: true, derniereRevelee: etape.revelee };
  return { ...etat, etape: demarrerEtapeTentatives(), niveauAide: 0, clos, index, derniereRevelee: etape.revelee };
}
