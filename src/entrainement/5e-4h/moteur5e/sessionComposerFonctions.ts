/**
 * Couche B — moteur de session pour 5gen3 ("Composer f et g — expressions et domaines"). N'importe
 * jamais rien de `src/generateurs5e/` — voir `sessionComposerFonctions.test.ts` pour la preuve avec
 * un générateur factice.
 *
 * Séquence DYNAMIQUE (D.4, voir `typesComposerFonctions.ts::ordreComplet`) — remplace l'ancienne
 * séquence fixe à 5 écrans. Aide progressive additive par écran (-20 pts/niveau), même mécanique
 * que le reste de la plateforme, plafond UNIFORME sur les 5 formes d'écran possibles (pas de raison
 * de varier par nom de phase désormais que la séquence elle-même varie). Réutilise
 * `demarrerEtapeTentatives`/`soumettreEtapeTentatives` (cross-chantier, déjà établi).
 */
import type { CompositionDirigee, ExerciceComposerFonctions, GenerateurExerciceComposerFonctions } from "../core5e/composerFonctions.types";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import type { EtatSessionComposerFonctions, PhaseComposerFonctions, ResultatExerciceComposerFonctions } from "./typesComposerFonctions";
import { ordreComplet } from "./typesComposerFonctions";
import type { ReponseCondition } from "./verificationComposerFonctions";
import { verifierC1Direction, verifierC2Direction, verifierConditionsDirection, verifierDomaineDirection, verifierFormuleDirectionSimplifiee } from "./verificationComposerFonctions";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Plafond d'aide UNIFORME sur les 5 formes d'écran possibles (formule/conditions/c1/c2/domaine) —
 * la séquence étant désormais dynamique (2 à 10 écrans selon `sens`/richesse de chaque direction),
 * un plafond distinct par NOM de phase n'apporterait rien. L'ancien plafond `0` de l'écran
 * "comparaison" n'a plus lieu d'être, cet écran étant supprimé entièrement (D.2). */
export const NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS = 2;

function direction(exercice: ExerciceComposerFonctions, phase: PhaseComposerFonctions): CompositionDirigee {
  const dir = phase.endsWith("FRondG") ? exercice.fRondG : exercice.gRondF;
  if (dir === null) throw new Error(`direction : aucune composition disponible pour la phase "${phase}"`);
  return dir;
}

function etatInitial(
  exercice: ExerciceComposerFonctions,
): Pick<EtatSessionComposerFonctions, "exerciceCourant" | "ordre" | "indexPhase" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels"> {
  const ordre = ordreComplet(exercice);
  return {
    exerciceCourant: exercice,
    ordre,
    indexPhase: 0,
    phase: ordre[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: {},
    revelesPartiels: {},
  };
}

export function demarrerSessionComposerFonctions(reglages: ReglagesSession5e, generateur: GenerateurExerciceComposerFonctions): EtatSessionComposerFonctions {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionComposerFonctions): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionComposerFonctions): EtatSessionComposerFonctions {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_COMPOSER_FONCTIONS) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionComposerFonctions, resultat: ResultatExerciceComposerFonctions): EtatSessionComposerFonctions {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

/** Enregistre le score/la révélation de la phase qui vient de se clore, puis avance à la phase
 * suivante de `ordre` — ou clôture l'exercice si c'était la dernière. */
function apresPhase(etat: EtatSessionComposerFonctions, score: number, revele: boolean): EtatSessionComposerFonctions {
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const revelesPartiels = { ...etat.revelesPartiels, [etat.phase]: revele };
  const indexPhase = etat.indexPhase + 1;
  if (indexPhase >= etat.ordre.length) {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels, reveles: revelesPartiels });
  }
  return { ...etat, indexPhase, phase: etat.ordre[indexPhase], etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels, revelesPartiels };
}

/** Point d'implémentation UNIQUE partagé par les 5 formes d'écran (formule/conditions/c1/c2/
 * domaine) — `prefixeAttendu` garde que la session est bien sur UNE phase de ce type (l'une des 2
 * directions), jamais dupliqué 10 fois (une garde par nom de phase précis). */
function soumettreGenerique<T>(etat: EtatSessionComposerFonctions, prefixeAttendu: string, reponse: T, verifier: (dir: CompositionDirigee, r: T) => boolean): EtatSessionComposerFonctions {
  if (etat.terminee || !etat.phase.startsWith(prefixeAttendu)) throw new Error(`soumettreReponse : la session n'est pas sur un écran "${prefixeAttendu}"`);
  const dir = direction(etat.exerciceCourant, etat.phase);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(dir, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return apresPhase({ ...etat, etapeCourante }, score, etapeCourante.revelee);
}

/** Utilise le palier COMPLET (numérique + "simplifiée au maximum",
 * `verifierFormuleDirectionSimplifiee`) — une réponse mathématiquement correcte mais pas simplifiée
 * (`correct_non_simplifie`, `verificationComposerFonctions.ts`) compte comme INCORRECTE ici : la
 * tentative est consommée, le score pénalisé comme pour toute réponse fausse, l'élève ne peut pas
 * avancer sans réellement simplifier. `EtapeFormuleComposerFonctions.tsx` seul distingue ce cas
 * (message dédié) via `diagnostiquerFormuleDirectionSimplifiee`, appelé séparément côté présentation. */
export function soumettreReponseFormule(etat: EtatSessionComposerFonctions, texte: string): EtatSessionComposerFonctions {
  return soumettreGenerique(etat, "formule", texte, verifierFormuleDirectionSimplifiee);
}

export function soumettreReponseConditions(etat: EtatSessionComposerFonctions, reponse: ReponseCondition[]): EtatSessionComposerFonctions {
  return soumettreGenerique(etat, "conditions", reponse, verifierConditionsDirection);
}

export function soumettreReponseC1(etat: EtatSessionComposerFonctions, reponse: EnsembleReelGuide): EtatSessionComposerFonctions {
  return soumettreGenerique(etat, "c1", reponse, verifierC1Direction);
}

export function soumettreReponseC2(etat: EtatSessionComposerFonctions, reponse: EnsembleReelGuide): EtatSessionComposerFonctions {
  return soumettreGenerique(etat, "c2", reponse, verifierC2Direction);
}

export function soumettreReponseDomaine(etat: EtatSessionComposerFonctions, reponse: EnsembleReelGuide): EtatSessionComposerFonctions {
  return soumettreGenerique(etat, "domaine", reponse, verifierDomaineDirection);
}
