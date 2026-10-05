/**
 * Couche B (5e) — moteur de session pour 5gen6 ("Arcs et secteurs"). N'importe jamais rien de
 * `src/generateurs5e/` — voir `sessionArcsSecteurs.test.ts` pour la preuve avec des exercices
 * factices définis localement.
 *
 * UNE SEULE fonction de soumission (`soumettreReponseArcSecteur`) pour tous les écrans (les 3
 * quantités manquantes du mode "deuxVersTrois" ET l'unique écran du mode "conversion") — la cible
 * de l'écran courant est simplement lue depuis `exercice`/`phase`, aucune branche par écran
 * nécessaire (même esprit que "une seule pipeline" demandé par la spec pour la Couche A).
 */
import type { ExerciceArcSecteur, QuantiteArcSecteur } from "../core5e/arcsSecteurs.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesArcsSecteurs";
import type { EtatSessionArcSecteur, PhaseArcSecteur, ResultatExerciceArcSecteur } from "./typesArcsSecteurs";
import { verifierValeurArcSecteur } from "./verificationArcsSecteurs";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Chaque écran (des 2 modes) a exactement 2 niveaux d'aide — spec explicite pour les 2 modes. */
export const NIVEAU_AIDE_MAX_ARC_SECTEUR = 2;

function cibleActuelle(exercice: ExerciceArcSecteur, phase: PhaseArcSecteur): number {
  if (exercice.mode === "conversion") return exercice.valeurCible;
  return exercice.valeurs[phase as QuantiteArcSecteur];
}

function etatInitial(exercice: ExerciceArcSecteur): Pick<EtatSessionArcSecteur, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: {},
    revelesPartiels: {},
  };
}

export function demarrerSessionArcSecteur(reglages: ReglagesSession5e, generateur: () => ExerciceArcSecteur): EtatSessionArcSecteur {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionArcSecteur): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionArcSecteur): EtatSessionArcSecteur {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_ARC_SECTEUR) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionArcSecteur, resultat: ResultatExerciceArcSecteur): EtatSessionArcSecteur {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseArcSecteur(etat: EtatSessionArcSecteur, texte: string): EtatSessionArcSecteur {
  if (etat.terminee) throw new Error("soumettreReponseArcSecteur : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const cible = cibleActuelle(exercice, etat.phase);

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => verifierValeurArcSecteur(t, cible),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);

  if (exercice.mode === "conversion") {
    return cloturerExerciceOuSuivant(etat, { mode: "conversion", exercice, score, revele: etapeCourante.revelee });
  }

  const quantite = etat.phase as QuantiteArcSecteur;
  const scoresPartiels = { ...etat.scoresPartiels, [quantite]: score };
  const revelesPartiels = { ...etat.revelesPartiels, [quantite]: etapeCourante.revelee };
  const phaseSuivante = phaseApres(exercice, etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, { mode: "deuxVersTrois", exercice, scores: scoresPartiels, reveles: revelesPartiels });
  }

  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, revelesPartiels };
}
