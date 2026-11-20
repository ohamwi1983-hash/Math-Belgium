import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import type { DefinitionEcrans } from "../ui5e/ecransTrigo.types";

/**
 * Moteur de session partagé des générateurs 5gen54–5gen57 (même patron que
 * `sessionModeliserSuite.ts`, 5gen47) : une tentative sur un choix fermé, trois sur un champ libre ;
 * une saisie illisible n'arrive jamais ici (l'écran l'arrête, aucune tentative consommée) ; deux
 * niveaux d'aide sur un champ, un sur un choix ; ni points ni pénalités affichés.
 */

const POINTS_DE_BASE = 100;
export const TENTATIVES_CHAMP = 3;

export interface EtatSessionEcrans<E, P extends string> {
  reglages: ReglagesSession5e;
  generateur: () => E;
  exerciceCourant: E;
  phase: P;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<P, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}

function etatExercice<E, P extends string>(def: DefinitionEcrans<E, P>, exercice: E) {
  return {
    exerciceCourant: exercice,
    phase: def.phases(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {} as Partial<Record<P, boolean>>,
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionEcrans<E, P extends string>(def: DefinitionEcrans<E, P>, reglages: ReglagesSession5e, generateur: () => E): EtatSessionEcrans<E, P> {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(def, generateur()) };
}

export function niveauAideMaxEcran<E, P extends string>(def: DefinitionEcrans<E, P>, etat: EtatSessionEcrans<E, P>): number {
  if (def.estChoix(etat.exerciceCourant, etat.phase)) return def.aidesChoixDeuxNiveaux && def.aide2(etat.exerciceCourant, etat.phase) ? 2 : 1;
  return def.aide2(etat.exerciceCourant, etat.phase) ? 2 : 1;
}

export function tentativesMaxEcran<E, P extends string>(def: DefinitionEcrans<E, P>, etat: EtatSessionEcrans<E, P>): number {
  return def.estChoix(etat.exerciceCourant, etat.phase) ? 1 : etat.reglages.tentativesMax;
}

export function activerAideEcran<E, P extends string>(def: DefinitionEcrans<E, P>, etat: EtatSessionEcrans<E, P>): EtatSessionEcrans<E, P> {
  if (etat.terminee || etat.niveauAide >= niveauAideMaxEcran(def, etat)) return etat;
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

/** Réponse juste : tous les statuts « correct ». */
export function reponseJuste<E, P extends string>(def: DefinitionEcrans<E, P>, e: E, phase: P, valeurs: string[]): boolean {
  const s = def.diagnostiquer(e, phase, valeurs);
  return s.length > 0 && s.every((x) => x === "correct");
}

export function soumettreEcran<E, P extends string>(def: DefinitionEcrans<E, P>, etat: EtatSessionEcrans<E, P>, valeurs: string[]): EtatSessionEcrans<E, P> {
  if (etat.terminee) return etat;
  const e = etat.exerciceCourant;
  const phase = etat.phase;
  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: tentativesMaxEcran(def, etat),
    verifier: (r) => reponseJuste(def, e, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };
  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const phases = def.phases(e);
  const i = phases.indexOf(phase);
  if (i === phases.length - 1) {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(def, etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phases[i + 1], revelesPartiels, derniereTransitionRevelee: revele };
}
