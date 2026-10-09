import type { ExerciceBinomialeSequenceOrdonnee } from "../core6e/binomialeSequenceOrdonnee.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesBinomialeSequenceOrdonnee";
import type { EtatSessionBinomialeSequenceOrdonnee, PhaseBinomialeSequenceOrdonnee, ResultatExerciceBinomialeSequenceOrdonnee } from "./typesBinomialeSequenceOrdonnee";
import { verifierEcran } from "./verificationBinomialeSequenceOrdonnee";

/**
 * Couche B (6e) — moteur de session pour `6gen48`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionBinomialeSequenceOrdonnee.test.ts` (fixtures locales) et
 * `generateurs6e/binomialeSequenceOrdonnee/session.integration.test.ts` pour le seul fichier
 * autorisé. Mirroir structurel de `sessionDenombrementFondamental.ts` (6gen43), jamais importé
 * (chaque générateur garde son propre moteur de session — CLAUDE.md, "Pas de moteur de session
 * unifié").
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur les écrans qui en prévoient — `max=0` ailleurs (voir
 * `ui6e/formatBinomialeSequenceOrdonnee.ts`, `niveauAideMaxEcran`). */
export const NIVEAU_AIDE_MAX = 2;

/**
 * Compteur GLOBAL au module (jamais réinitialisé par exercice/session — voir `generationId` dans
 * `typesBinomialeSequenceOrdonnee.ts` pour le contrat complet) — **bug trouvé et corrigé pendant la
 * vérification Playwright** : `App6gen48.tsx` clé son écran sur `key={phase}` (mirroir 6gen43) ;
 * or la famille B démarre TOUJOURS sur la MÊME phase `"bEcran1"` quel que soit `k`∈{3,4,5} (nombre
 * de champs affichés = `k`, VARIABLE). Scénario reproduit (`repro-B.js`, script Playwright dédié,
 * ~20 à 30% des tirages) : l'exercice INITIAL de la page tiré aléatoirement tombe sur une famille B
 * avec un `k` donné (phase déjà `"bEcran1"`), puis l'élève (ou le panneau dev) relance un AUTRE
 * exercice de famille B avec un `k` DIFFÉRENT — `phaseInitiale` redonne `"bEcran1"`, la clé React ne
 * change PAS, React RÉUTILISE l'instance du composant écran existante (ne la démonte/remonte pas),
 * et son état interne `valeurs: string[]` (dimensionné pour l'ANCIEN `k`) reste bloqué à son
 * ANCIENNE longueur — le 4ᵉ/5ᵉ champ saisi par l'élève est alors silencieusement ignoré
 * (`setValeurs(prev => prev.map(...))` ne peut jamais AGRANDIR `prev`), la soumission compare un
 * tableau tronqué à `e.denominateurs` et rejette une réponse pourtant intégralement correcte.
 * Fix : `generationId`, incrémenté ICI à chaque tirage d'exercice (démarrage ET exercice suivant ET
 * relance dev), fait partie de la clé React (`key={`${generationId}-${phase}`}`, `App6gen48.tsx`)
 * — garantit un REMONTAGE (donc une réinitialisation propre de `valeurs`) à chaque nouvel exercice,
 * même quand 2 exercices consécutifs partagent la même phase de départ.
 */
let prochainGenerationId = 0;

function etatInitial(exercice: ExerciceBinomialeSequenceOrdonnee): Pick<EtatSessionBinomialeSequenceOrdonnee, "exerciceCourant" | "phase" | "generationId" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), generationId: prochainGenerationId++, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionBinomialeSequenceOrdonnee(reglages: ReglagesSession6e, generateur: () => ExerciceBinomialeSequenceOrdonnee): EtatSessionBinomialeSequenceOrdonnee {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionBinomialeSequenceOrdonnee): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionBinomialeSequenceOrdonnee): EtatSessionBinomialeSequenceOrdonnee {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionBinomialeSequenceOrdonnee, resultat: ResultatExerciceBinomialeSequenceOrdonnee): EtatSessionBinomialeSequenceOrdonnee {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionBinomialeSequenceOrdonnee, valeurs: string[]): EtatSessionBinomialeSequenceOrdonnee {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phaseCourante = etat.phase;

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcran(exercice, phaseCourante, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels: Partial<Record<PhaseBinomialeSequenceOrdonnee, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceBinomialeSequenceOrdonnee = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
