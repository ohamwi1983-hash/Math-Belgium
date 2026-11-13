import type { ReglagesSession } from "../core/session.types";
import type { SolutionEnsemble } from "../core/inequation.types";
import type { ExerciceProblemesFonctionsReference } from "../core/problemesFonctionsReference.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives, type EtatEtapeTentatives } from "./etapeTentatives";
import { diagnostiquerFonction, diagnostiquerQuestion, verifierChoix } from "./problemesFonctionsReference";
import { aidesDomaine, aidesFonction, aidesInterpretation, aidesQuestion } from "../ui/formatProblemesFonctionsReference";

/**
 * Session de gen68 : 4 écrans fixes (fonction → domaine → question concrète → interprétation).
 * Écrans 1 et 3 : saisie libre, `tentativesMax` essais. Écrans 2 et 4 : choix fermés, UNE seule
 * tentative (convention : un choix fermé ne se rejoue pas). Aucun point affiché : `pointsDeBase`
 * n'est qu'un paramètre technique de `etapeTentatives`.
 */

export type PhaseProblemesFonctionsReference = "fonction" | "domaine" | "question" | "interpretation";

export const PHASES: PhaseProblemesFonctionsReference[] = ["fonction", "domaine", "question", "interpretation"];

export interface EtatSessionProblemesFonctionsReference {
  reglages: ReglagesSession;
  exerciceCourant: ExerciceProblemesFonctionsReference;
  phase: PhaseProblemesFonctionsReference;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  aideUtilisee: Record<PhaseProblemesFonctionsReference, boolean>;
  revele: Record<PhaseProblemesFonctionsReference, boolean>;
  terminee: boolean;
}

const AUCUN = { fonction: false, domaine: false, question: false, interpretation: false };

export function demarrerSessionProblemesFonctionsReference(
  reglages: ReglagesSession,
  generer: () => ExerciceProblemesFonctionsReference,
): EtatSessionProblemesFonctionsReference {
  return {
    reglages,
    exerciceCourant: generer(),
    phase: "fonction",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    aideUtilisee: { ...AUCUN },
    revele: { ...AUCUN },
    terminee: false,
  };
}

export function niveauAideMax(etat: EtatSessionProblemesFonctionsReference): number {
  const e = etat.exerciceCourant;
  switch (etat.phase) {
    case "fonction":
      return aidesFonction(e).length;
    case "domaine":
      return aidesDomaine(e).length;
    case "question":
      return aidesQuestion(e).length;
    case "interpretation":
      return aidesInterpretation(e).length;
  }
}

export function activerAide(etat: EtatSessionProblemesFonctionsReference): EtatSessionProblemesFonctionsReference {
  if (etat.niveauAide >= niveauAideMax(etat)) return etat;
  return { ...etat, niveauAide: etat.niveauAide + 1, aideUtilisee: { ...etat.aideUtilisee, [etat.phase]: true } };
}

function soumettre<T>(etat: EtatSessionProblemesFonctionsReference, reponse: T, verifier: (r: T) => boolean, tentativesMax: number): EtatSessionProblemesFonctionsReference {
  let revele = false;
  const etape = soumettreEtapeTentatives(etat.etapeCourante, reponse, {
    pointsDeBase: 1,
    tentativesMax,
    verifier,
    revelerReponse: () => {
      revele = true;
    },
  });
  if (!etape.terminee) return { ...etat, etapeCourante: etape };
  const index = PHASES.indexOf(etat.phase);
  const suivante = PHASES[index + 1];
  const revelees = { ...etat.revele, [etat.phase]: revele };
  if (!suivante) return { ...etat, etapeCourante: etape, revele: revelees, terminee: true };
  return { ...etat, phase: suivante, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, revele: revelees };
}

export function soumettreFonction(etat: EtatSessionProblemesFonctionsReference, saisie: string): EtatSessionProblemesFonctionsReference {
  return soumettre(etat, saisie, (s) => diagnostiquerFonction(s, etat.exerciceCourant) === "correct", etat.reglages.tentativesMax);
}

export function soumettreDomaine(etat: EtatSessionProblemesFonctionsReference, indexOption: number): EtatSessionProblemesFonctionsReference {
  return soumettre(etat, indexOption, verifierChoix, 1);
}

export function soumettreQuestion(etat: EtatSessionProblemesFonctionsReference, saisie: SolutionEnsemble): EtatSessionProblemesFonctionsReference {
  return soumettre(etat, saisie, (s) => diagnostiquerQuestion(s, etat.exerciceCourant) === "correct", etat.reglages.tentativesMax);
}

export function soumettreInterpretation(etat: EtatSessionProblemesFonctionsReference, indexOption: number): EtatSessionProblemesFonctionsReference {
  return soumettre(etat, indexOption, verifierChoix, 1);
}
