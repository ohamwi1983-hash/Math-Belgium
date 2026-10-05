/**
 * Couche A (5e) — point d'entrée de 5gen13 ("Modéliser une fonction sinusoïdale en contexte").
 * Compose Phase 1 (4 techniques à fréquence comparable) et Phase 2.
 *
 * **Phase 2 jamais tirée pour la technique B1** — décision NÉCESSAIRE (pas seulement une
 * simplification), signalée explicitement : `phi` reste symbolique pour B1 (aucune donnée ne le
 * détermine, piège central de cette technique), donc f(t) n'est jamais complètement connue
 * numériquement — aucune des 3 questions de Phase 2 (qui exigent toutes de résoudre une équation en
 * t) n'aurait de sens sans φ numérique.
 *
 * **Phase 2 TOUJOURS présente ET TOUJOURS de type "resoudre" pour la technique B2**
 * (`prompt5gen13B1B2.md`) — décision structurelle, pas seulement textuelle : "construction du
 * modèle SUIVIE SYSTÉMATIQUEMENT (jamais optionnellement) de la résolution de f(t)=k... Ce n'est
 * pas une Phase 2 tirée séparément comme pour les autres sous-compétences — c'est la définition de
 * B2." Contrairement à "b3" (Phase 2 reste optionnelle, 3 types possibles, comportement INCHANGÉ) et
 * "donnee" (Phase 2 forcée mais son TYPE reste tiré aléatoirement parmi les 3, seule la présence est
 * forcée — sinon l'exercice n'aurait aucun écran).
 */
import type { DonneesPhase1, ExerciceModelisationSinusoide, QuestionPhase2, TechniquePhase1 } from "../../core5e/modelisationSinusoide.types";
import { genererDonneesB1 } from "./techniqueB1";
import { genererDonneesB2 } from "./techniqueB2";
import { genererDonneesB3 } from "./techniqueB3";
import { genererDonneesDonnee } from "./techniqueDonnee";
import { genererQuestionExtremum } from "./typeExtremum";
import { genererQuestionInequation } from "./typeInequation";
import { genererQuestionResoudre } from "./typeResoudre";

const TECHNIQUES: TechniquePhase1[] = ["b1", "b2", "b3", "donnee"];

export function tirerTechnique(): TechniquePhase1 {
  return TECHNIQUES[Math.floor(Math.random() * TECHNIQUES.length)];
}

const CONSTRUCTEURS_PHASE1: Record<TechniquePhase1, () => DonneesPhase1> = {
  b1: genererDonneesB1,
  b2: genererDonneesB2,
  b3: genererDonneesB3,
  donnee: genererDonneesDonnee,
};

export function construireAvecTechniqueId(technique: TechniquePhase1): DonneesPhase1 {
  return CONSTRUCTEURS_PHASE1[technique]();
}

/** Fenêtre = quelques périodes de la fonction (2 à 4), assez large pour offrir plusieurs
 * solutions/intervalles sans devenir illisible. */
const PERIODES_FENETRE_MIN = 2;
const PERIODES_FENETRE_MAX = 4;

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function genererFenetre(omega: number): number {
  const periode = (2 * Math.PI) / omega;
  return periode * entierAleatoire(PERIODES_FENETRE_MIN, PERIODES_FENETRE_MAX);
}

/** Présente une MAJORITÉ du temps (spec explicite : "certains exercices s'arrêtent à la
 * construction"), jamais systématiquement. */
const PROBABILITE_PHASE2 = 0.7;

const TYPES_PHASE2 = ["resoudre", "extremum", "inequation"] as const;

function construirePhase2(donnees: DonneesPhase1): QuestionPhase2 | null {
  if (donnees.technique === "b1") return null;
  // "b2" : Phase 2 TOUJOURS présente ET TOUJOURS de type "resoudre" — c'est la définition même de
  // cette technique (voir l'en-tête du fichier), jamais un tirage indépendant comme pour b3/donnee.
  if (donnees.technique === "b2") {
    const fenetre = genererFenetre(donnees.fonction.omega);
    return genererQuestionResoudre(donnees.fonction, fenetre);
  }
  // "donnee" saute la Phase 1 ENTIÈREMENT — sans Phase 2, l'exercice n'aurait alors AUCUN écran.
  // Phase 2 est donc FORCÉE pour cette seule technique (jamais un exercice vide), jamais tirée
  // "optionnelle" comme pour b3 — mais son TYPE, lui, reste tiré aléatoirement parmi les 3.
  if (donnees.technique !== "donnee" && Math.random() >= PROBABILITE_PHASE2) return null;

  const fenetre = genererFenetre(donnees.fonction.omega);
  const type = TYPES_PHASE2[Math.floor(Math.random() * TYPES_PHASE2.length)];
  switch (type) {
    case "resoudre":
      return genererQuestionResoudre(donnees.fonction, fenetre);
    case "extremum":
      return genererQuestionExtremum(donnees.fonction, fenetre);
    case "inequation":
      return genererQuestionInequation(donnees.fonction, fenetre);
  }
}

export type Phase2ChoixDev = "resoudre" | "extremum" | "inequation" | "aucune";

/** Force la technique de Phase 1 ET la présence/le type de Phase 2 plutôt que de les tirer
 * aléatoirement — voir le panneau dev-only (`SelecteurVarianteDev`). Respecte les 3 contraintes
 * structurelles déjà en place dans `construirePhase2` : Phase 2 toujours absente pour "b1" (φ
 * reste symbolique), toujours présente ET toujours "resoudre" pour "b2" (c'est la définition de
 * cette technique), toujours présente pour "donnee" (sinon l'exercice n'aurait aucun écran) — un
 * choix incompatible du panneau est donc silencieusement corrigé plutôt que de produire un
 * exercice invalide. */
export function construireAvecTechniqueEtPhase2(technique: TechniquePhase1, phase2Choix: Phase2ChoixDev): ExerciceModelisationSinusoide {
  const phase1 = construireAvecTechniqueId(technique);
  if (technique === "b1") return { phase1, phase2: null };
  if (technique === "b2") return { phase1, phase2: genererQuestionResoudre(phase1.fonction, genererFenetre(phase1.fonction.omega)) };
  const type = technique === "donnee" && phase2Choix === "aucune" ? TYPES_PHASE2[0] : phase2Choix;
  if (type === "aucune") return { phase1, phase2: null };
  const fenetre = genererFenetre(phase1.fonction.omega);
  switch (type) {
    case "resoudre":
      return { phase1, phase2: genererQuestionResoudre(phase1.fonction, fenetre) };
    case "extremum":
      return { phase1, phase2: genererQuestionExtremum(phase1.fonction, fenetre) };
    case "inequation":
      return { phase1, phase2: genererQuestionInequation(phase1.fonction, fenetre) };
  }
}

export function genererExerciceModelisationSinusoide(): ExerciceModelisationSinusoide {
  const phase1 = construireAvecTechniqueId(tirerTechnique());
  const phase2 = construirePhase2(phase1);
  return { phase1, phase2 };
}
