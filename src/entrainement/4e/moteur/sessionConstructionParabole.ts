/**
 * Couche B — moteur de session de `gen53` (même patron que `sessionAireTriangleSinus.ts`) :
 * l'écran courant, ses tentatives, son niveau d'aide et ce qui est déjà construit. Aucun point ni
 * pénalité. Trois tentatives par écran : chaque écran comporte un geste continu (glisser l'équerre,
 * ouvrir le compas) ou un ordre à donner.
 */
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import {
  ACQUIS_INITIAL,
  appliquerEcran,
  ecransConstructionParabole,
  type AcquisConstruction,
  type EcranConstructionParabole,
  type VerificationEcran,
} from "./modeleConstructionParabole";

export const TENTATIVES_MAX_CONSTRUCTION = 3;
export const NIVEAU_AIDE_MAX_CONSTRUCTION = 2;

export interface EtatConstructionParabole {
  exercice: ExerciceConstructionParabole;
  ecran: number;
  tentativesUtilisees: number;
  niveauAide: number;
  acquis: AcquisConstruction;
}

export function demarrer(exercice: ExerciceConstructionParabole): EtatConstructionParabole {
  return { exercice, ecran: 0, tentativesUtilisees: 0, niveauAide: 0, acquis: ACQUIS_INITIAL };
}

export function ecranCourant(etat: EtatConstructionParabole): EcranConstructionParabole {
  return ecransConstructionParabole(etat.exercice)[etat.ecran]!;
}

export function nombreEcrans(etat: EtatConstructionParabole): number {
  return ecransConstructionParabole(etat.exercice).length;
}

export interface ResultatSoumission {
  etat: EtatConstructionParabole;
  clos: boolean;
  revele: boolean;
}

/** Soumet la vérification d'un écran de construction. À la clôture (réussite ou tentatives
 * épuisées), l'acquis est mis à jour tout de suite : la figure montre le résultat pendant la
 * validation. */
export function soumettre(etat: EtatConstructionParabole, verification: VerificationEcran): ResultatSoumission {
  const ecran = ecranCourant(etat);
  if (verification.correct) {
    return { etat: { ...etat, acquis: appliquerEcran(etat.exercice, ecran, etat.acquis, verification) }, clos: true, revele: false };
  }
  const tentativesUtilisees = etat.tentativesUtilisees + 1;
  const epuise = tentativesUtilisees >= TENTATIVES_MAX_CONSTRUCTION;
  const acquis = epuise ? appliquerEcran(etat.exercice, ecran, etat.acquis, verification) : etat.acquis;
  return { etat: { ...etat, tentativesUtilisees, acquis }, clos: epuise, revele: epuise };
}

export function activerAide(etat: EtatConstructionParabole): EtatConstructionParabole {
  return { ...etat, niveauAide: Math.min(NIVEAU_AIDE_MAX_CONSTRUCTION, etat.niveauAide + 1) };
}

export function ecranSuivant(etat: EtatConstructionParabole): EtatConstructionParabole {
  return { ...etat, ecran: etat.ecran + 1, tentativesUtilisees: 0, niveauAide: 0 };
}
