/**
 * Couche B — moteur de session pour l'exercice "tableau de signes à plusieurs facteurs" (18,
 * série 1). Séquence : traite `exercice.facteurs` STRICTEMENT dans l'ordre du tableau, un facteur
 * à la fois (`indexFacteurExercice`) — racineLineaire pour un facteur linéaire ; methodeFacteur
 * (5 choix, dont "Non factorisable" — promptgenerateur5signesProduit.md point 9) puis, selon la
 * VRAIE nature du facteur, factorisationChamp1→factorisationChamp2→[factorisationFactorisation]
 * ou signeIrreductible pour un facteur quadratique — voir typesSignesProduit.ts pour le détail
 * complet. Une fois tous les facteurs traités : grille → intervalle. Réutilise telles quelles
 * verifierChampPrincipal/verifierRacines (verification.ts, exercice "méthode la plus rapide") sur
 * le facteur factorisable embarqué, et verifierSolutionSignesProduit (verificationSignesProduit.ts)
 * sur exercice.solution. N'importe jamais rien de src/generateurs : voir
 * sessionSignesProduit.test.ts pour la preuve avec des générateurs factices minimaux.
 */
import type { Categorie } from "../core/generateur.types";
import type { SigneA } from "../core/inequation.types";
import type {
  ExerciceSignesProduit,
  FacteurQuadratiqueIrreductible,
  GenerateurExerciceSignesProduit,
  Grille,
  SolutionEnsembleProduit,
} from "../core/signesProduit.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierChampPrincipal, verifierFactorisationCasGeneral, verifierRacines } from "./verification";
import { diagnostiquerReductionCoefficients } from "./verificationSimplification";
import { exerciceSimplifie, necessiteSimplification } from "./simplificationEquation";
import {
  verifierGrille,
  verifierMethodeFacteur,
  verifierRacineLineaire,
  verifierSigneIrreductible,
  verifierSolutionSignesProduit,
} from "./verificationSignesProduit";
import type { EtatSessionSignesProduit, PhaseSignesProduit, ResultatExerciceSignesProduit } from "./typesSignesProduit";

const POINTS_DE_BASE = 100;

/** Le facteur quadratique factorisable de l'exercice, s'il existe (au plus 1 — voir generateurs/signesProduit/index.ts). */
function facteurFactorisable(exercice: ExerciceSignesProduit) {
  const facteur = exercice.facteurs.find((f) => f.type === "quadratique_factorisable");
  return facteur?.type === "quadratique_factorisable" ? facteur.exercice : undefined;
}

/** Les facteurs quadratiques irréductibles de l'exercice, dans l'ordre de exercice.facteurs (0, 1 ou 2). */
function facteursIrreductibles(exercice: ExerciceSignesProduit): FacteurQuadratiqueIrreductible[] {
  return exercice.facteurs.filter((f): f is FacteurQuadratiqueIrreductible => f.type === "quadratique_irreductible");
}

/**
 * Phase de départ pour un facteur donné : racineLineaire pour un facteur linéaire ;
 * reductionFacteur pour un facteur quadratique factorisable dont pgcd(|a|,|b|,|c|)>1 (nouvelle,
 * jamais pour un facteur irréductible — jamais factorisé, ni pour un facteur linéaire — un seul
 * coefficient k) ; methodeFacteur sinon, pour tout facteur quadratique.
 */
function phasePourFacteur(facteur: ExerciceSignesProduit["facteurs"][number]): PhaseSignesProduit {
  if (facteur.type === "lineaire") return "racineLineaire";
  if (facteur.type === "quadratique_factorisable" && necessiteSimplification(facteur.exercice)) return "reductionFacteur";
  return "methodeFacteur";
}

/** Phase à adopter une fois le facteur à `index` (0-based) entièrement traité — grille si plus aucun facteur ne reste. */
function phaseApresFacteur(exercice: ExerciceSignesProduit, index: number): PhaseSignesProduit {
  const suivant = exercice.facteurs[index];
  return suivant ? phasePourFacteur(suivant) : "grille";
}

function phaseInitiale(exercice: ExerciceSignesProduit): PhaseSignesProduit {
  return phasePourFacteur(exercice.facteurs[0]);
}

const ETAT_TRANSITOIRE_VIERGE = {
  indexFacteurExercice: 0,
  scoresRacineLineaireExercice: [],
  scoresMethodeExercice: [],
  methodeRevelees: [],
  scoreReductionFacteurExercice: null,
  scoreFactorisationChamp1Exercice: null,
  scoreFactorisationChamp2Exercice: null,
  scoreFactorisationFactorisationExercice: null,
  scoresSigneIrreductibleExercice: [],
  scoreGrilleExercice: null,
  grilleRevelee: false,
  aideUtilisee: false,
  aideReductionFacteurUtilisee: false,
  aideFactorisationChamp1Utilisee: false,
  aideFactorisationChamp2Utilisee: false,
  aideFactorisationFactorisationUtilisee: false,
  aideGrilleTableauUtilisee: false,
} as const;

export function demarrerSessionSignesProduit(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceSignesProduit,
): EtatSessionSignesProduit {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_VIERGE,
    scoresRacineLineaireExercice: [],
    scoresMethodeExercice: [],
    methodeRevelees: [],
    scoresSigneIrreductibleExercice: [],
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionSignesProduit): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function garderPhase(etat: EtatSessionSignesProduit, phase: PhaseSignesProduit, nomFonction: string): void {
  if (etat.terminee || etat.phase !== phase) {
    throw new Error(`${nomFonction} : la session n'est pas à l'étape ${phase}`);
  }
}

/** Étape "racineLineaire" (promptgenerateur5signesProduit.md, point 10) : la racine du facteur linéaire courant. */
export function soumettreReponseRacineLineaire(etat: EtatSessionSignesProduit, reponse: number): EtatSessionSignesProduit {
  garderPhase(etat, "racineLineaire", "soumettreReponseRacineLineaire");
  const facteur = etat.exerciceCourant.facteurs[etat.indexFacteurExercice];
  if (!facteur || facteur.type !== "lineaire") {
    throw new Error("soumettreReponseRacineLineaire : le facteur courant n'est pas linéaire");
  }

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacineLineaire(r, facteur),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const scoresRacineLineaireExercice = [...etat.scoresRacineLineaireExercice, etapeCourante.score as number];
  const indexFacteurExercice = etat.indexFacteurExercice + 1;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresFacteur(etat.exerciceCourant, indexFacteurExercice),
    indexFacteurExercice,
    scoresRacineLineaireExercice,
  };
}

/**
 * Étape "reductionFacteur" (facteur quadratique factorisable courant uniquement, quand
 * pgcd(|a|,|b|,|c|)>1 — voir phasePourFacteur) : réduit ce facteur à coefficients premiers entre
 * eux AVANT sa méthode/factorisation — même principe que soumettreReponseDenomReduction (gen3).
 * Remplace le facteur dans `exercice.facteurs` par sa version réduite une fois confirmée :
 * methodeFacteur et les étapes suivantes travaillent alors sur cette version (grille/intervalle
 * compris, via exercice.facteurs).
 */
export function soumettreReponseReductionFacteur(etat: EtatSessionSignesProduit, reponse: string): EtatSessionSignesProduit {
  garderPhase(etat, "reductionFacteur", "soumettreReponseReductionFacteur");
  const facteur = etat.exerciceCourant.facteurs[etat.indexFacteurExercice];
  if (!facteur || facteur.type !== "quadratique_factorisable") {
    throw new Error("soumettreReponseReductionFacteur : le facteur courant n'est pas quadratique factorisable");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerReductionCoefficients(facteur.exercice, r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const facteurs = etat.exerciceCourant.facteurs.map((f, i) =>
    i === etat.indexFacteurExercice ? { type: "quadratique_factorisable" as const, exercice: exerciceSimplifie(facteur.exercice) } : f,
  );

  return {
    ...etat,
    exerciceCourant: { ...etat.exerciceCourant, facteurs },
    etapeCourante: demarrerEtapeTentatives(),
    phase: "methodeFacteur",
    scoreReductionFacteurExercice: etat.aideReductionFacteurUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "reductionFacteur" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideReductionFacteur(etat: EtatSessionSignesProduit): EtatSessionSignesProduit {
  garderPhase(etat, "reductionFacteur", "activerAideReductionFacteur");
  return { ...etat, aideReductionFacteurUtilisee: true };
}

/**
 * Étape "methodeFacteur" (promptgenerateur5signesProduit.md, point 9) : 5 choix pour tout facteur
 * quadratique (les 4 méthodes historiques + "irreductible"/"Non factorisable"). La transition
 * suivante dépend de la VRAIE nature du facteur, jamais du choix de l'élève (même principe que le
 * reste du projet) : factorisationChamp1 s'il est réellement factorisable, signeIrreductible s'il
 * est réellement irréductible.
 */
export function soumettreChoixMethodeFacteur(etat: EtatSessionSignesProduit, choix: Categorie): EtatSessionSignesProduit {
  garderPhase(etat, "methodeFacteur", "soumettreChoixMethodeFacteur");
  const facteur = etat.exerciceCourant.facteurs[etat.indexFacteurExercice];
  if (!facteur || facteur.type === "lineaire") {
    throw new Error("soumettreChoixMethodeFacteur : le facteur courant n'est pas quadratique");
  }

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => verifierMethodeFacteur(c, facteur),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const scoresMethodeExercice = [...etat.scoresMethodeExercice, etapeCourante.score as number];
  const methodeRevelees = [...etat.methodeRevelees, etapeCourante.revelee];
  const phase: PhaseSignesProduit = facteur.type === "quadratique_factorisable" ? "factorisationChamp1" : "signeIrreductible";

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase,
    scoresMethodeExercice,
    methodeRevelees,
  };
}

/** Étape "factorisationChamp1" : "Factorise l'équation" ou "Δ =" selon la catégorie retenue. */
export function soumettreReponseFactorisationChamp1(
  etat: EtatSessionSignesProduit,
  reponse: string,
): EtatSessionSignesProduit {
  garderPhase(etat, "factorisationChamp1", "soumettreReponseFactorisationChamp1");
  const facteur = facteurFactorisable(etat.exerciceCourant);
  if (!facteur) throw new Error("soumettreReponseFactorisationChamp1 : cet exercice n'a pas de facteur factorisable");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(facteur, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "factorisationChamp2",
    scoreFactorisationChamp1Exercice: etat.aideFactorisationChamp1Utilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "factorisationChamp1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideFactorisationChamp1(etat: EtatSessionSignesProduit): EtatSessionSignesProduit {
  garderPhase(etat, "factorisationChamp1", "activerAideFactorisationChamp1");
  return { ...etat, aideFactorisationChamp1Utilisee: true };
}

/** Étape "factorisationChamp2" : les 2 racines du facteur factorisable. */
export function soumettreReponseFactorisationChamp2(
  etat: EtatSessionSignesProduit,
  racines: [number, number],
): EtatSessionSignesProduit {
  garderPhase(etat, "factorisationChamp2", "soumettreReponseFactorisationChamp2");
  const facteur = facteurFactorisable(etat.exerciceCourant);
  if (!facteur) throw new Error("soumettreReponseFactorisationChamp2 : cet exercice n'a pas de facteur factorisable");

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, racines, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, facteur),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const scoreFactorisationChamp2Exercice = etat.aideFactorisationChamp2Utilisee
    ? (etapeCourante.score as number) * 0.5
    : etapeCourante.score;

  if (facteur.categorie === "cas_general") {
    return {
      ...etat,
      etapeCourante: demarrerEtapeTentatives(),
      phase: "factorisationFactorisation",
      scoreFactorisationChamp2Exercice,
    };
  }

  const indexFacteurExercice = etat.indexFacteurExercice + 1;
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresFacteur(etat.exerciceCourant, indexFacteurExercice),
    indexFacteurExercice,
    scoreFactorisationChamp2Exercice,
  };
}

/** Active le bouton "Aide" de l'étape "factorisationChamp2" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideFactorisationChamp2(etat: EtatSessionSignesProduit): EtatSessionSignesProduit {
  garderPhase(etat, "factorisationChamp2", "activerAideFactorisationChamp2");
  return { ...etat, aideFactorisationChamp2Utilisee: true };
}

/**
 * Étape "factorisationFactorisation" (facteur factorisable cas_general uniquement,
 * prompt-corrections-etat-actuel-et-duplication.md point 1) : a(x-x1)(x-x2) à partir des racines
 * trouvées à l'étape précédente — même step que l'exercice 1.
 */
export function soumettreReponseFactorisationFactorisation(
  etat: EtatSessionSignesProduit,
  reponse: string,
): EtatSessionSignesProduit {
  garderPhase(etat, "factorisationFactorisation", "soumettreReponseFactorisationFactorisation");
  const facteur = facteurFactorisable(etat.exerciceCourant);
  if (!facteur) throw new Error("soumettreReponseFactorisationFactorisation : cet exercice n'a pas de facteur factorisable");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFactorisationCasGeneral(facteur, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const indexFacteurExercice = etat.indexFacteurExercice + 1;
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresFacteur(etat.exerciceCourant, indexFacteurExercice),
    indexFacteurExercice,
    scoreFactorisationFactorisationExercice: etat.aideFactorisationFactorisationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "factorisationFactorisation" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideFactorisationFactorisation(etat: EtatSessionSignesProduit): EtatSessionSignesProduit {
  garderPhase(etat, "factorisationFactorisation", "activerAideFactorisationFactorisation");
  return { ...etat, aideFactorisationFactorisationUtilisee: true };
}

/**
 * Étape "signeIrreductible" : atteinte une fois que "methodeFacteur" a confirmé (à raison ou à
 * tort) que le facteur courant est réellement irréductible — l'index dans `facteursIrreductibles`
 * est `scoresSigneIrreductibleExercice.length`, jamais un compteur séparé (même principe que
 * `recapitulatif.ts`).
 */
export function soumettreReponseSigneIrreductible(
  etat: EtatSessionSignesProduit,
  reponse: SigneA,
): EtatSessionSignesProduit {
  garderPhase(etat, "signeIrreductible", "soumettreReponseSigneIrreductible");
  const irreductibles = facteursIrreductibles(etat.exerciceCourant);
  const indexCourant = etat.scoresSigneIrreductibleExercice.length;
  const facteurCourant = irreductibles[indexCourant];
  if (!facteurCourant) throw new Error("soumettreReponseSigneIrreductible : aucun facteur irréductible restant à traiter");

  const etapeCourante = soumettreEtapeTentatives<SigneA>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSigneIrreductible(r, facteurCourant),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const scoresSigneIrreductibleExercice = [...etat.scoresSigneIrreductibleExercice, etapeCourante.score as number];
  const indexFacteurExercice = etat.indexFacteurExercice + 1;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresFacteur(etat.exerciceCourant, indexFacteurExercice),
    indexFacteurExercice,
    scoresSigneIrreductibleExercice,
  };
}

/** Étape "grille" : toute la grille en une seule tentative (tout ou rien — section 3 de la spec). */
export function soumettreReponseGrille(etat: EtatSessionSignesProduit, reponse: Grille): EtatSessionSignesProduit {
  garderPhase(etat, "grille", "soumettreReponseGrille");

  const etapeCourante = soumettreEtapeTentatives<Grille>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierGrille(r, etat.exerciceCourant.grille),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "intervalle",
    scoreGrilleExercice: etat.aideGrilleTableauUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    grilleRevelee: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "grille" (tableau de signes) — révélation à sens unique, ×0,5 sur le score. */
export function activerAideGrilleTableau(etat: EtatSessionSignesProduit): EtatSessionSignesProduit {
  garderPhase(etat, "grille", "activerAideGrilleTableau");
  return { ...etat, aideGrilleTableauUtilisee: true };
}

/**
 * Active le bouton "Aide" pour l'étape intervalle en cours (prompt-refonte-tableau-signes.md,
 * section 6) : révélation à sens unique (jamais de retour à false pour cet exercice), applique
 * ×0,5 au score final de cette étape dans soumettreReponseIntervalle, quel que soit le nombre de
 * tentatives déjà utilisées ou à venir — même principe que activerAideIntervalle (sessionInequation.ts).
 */
export function activerAideGrilleSolution(etat: EtatSessionSignesProduit): EtatSessionSignesProduit {
  if (etat.terminee || etat.phase !== "intervalle") {
    throw new Error("activerAideGrilleSolution : la session n'est pas à l'étape intervalle");
  }
  return { ...etat, aideUtilisee: true };
}

/** Étape "intervalle" : finale, clôture l'exercice et agrège tous les scores. */
export function soumettreReponseIntervalle(
  etat: EtatSessionSignesProduit,
  reponse: SolutionEnsembleProduit,
): EtatSessionSignesProduit {
  garderPhase(etat, "intervalle", "soumettreReponseIntervalle");

  const etapeCourante = soumettreEtapeTentatives<SolutionEnsembleProduit>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSolutionSignesProduit(r, etat.exerciceCourant.solution),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const scoreIntervalle = etat.aideUtilisee ? (etapeCourante.score as number) * 0.5 : (etapeCourante.score as number);

  const resultat: ResultatExerciceSignesProduit = {
    scoresRacineLineaire: etat.scoresRacineLineaireExercice,
    scoresMethode: etat.scoresMethodeExercice,
    methodeRevelees: etat.methodeRevelees,
    scoreReductionFacteur: etat.scoreReductionFacteurExercice,
    aideReductionFacteurUtilisee: etat.aideReductionFacteurUtilisee,
    scoreFactorisationChamp1: etat.scoreFactorisationChamp1Exercice,
    aideFactorisationChamp1Utilisee: etat.aideFactorisationChamp1Utilisee,
    scoreFactorisationChamp2: etat.scoreFactorisationChamp2Exercice,
    aideFactorisationChamp2Utilisee: etat.aideFactorisationChamp2Utilisee,
    scoreFactorisationFactorisation: etat.scoreFactorisationFactorisationExercice,
    aideFactorisationFactorisationUtilisee: etat.aideFactorisationFactorisationUtilisee,
    scoresSigneIrreductible: etat.scoresSigneIrreductibleExercice,
    scoreGrille: etat.scoreGrilleExercice as number,
    grilleRevelee: etat.grilleRevelee,
    aideGrilleTableauUtilisee: etat.aideGrilleTableauUtilisee,
    scoreIntervalle,
    intervalleRevele: etapeCourante.revelee,
    aideIntervalleUtilisee: etat.aideUtilisee,
  };

  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  const exerciceCourant = etat.generateur();
  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_VIERGE,
    scoresRacineLineaireExercice: [],
    scoresMethodeExercice: [],
    methodeRevelees: [],
    scoresSigneIrreductibleExercice: [],
  };
}
