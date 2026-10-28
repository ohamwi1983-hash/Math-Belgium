/**
 * Couche B — moteur de session pour "Caractéristiques algébriques d'une fonction de référence".
 *
 * Ordre des 3 premières phases (audit gen13) : `ce → domaine → ordonnee`, aux DEUX niveaux —
 * l'existence de l'ordonnée à l'origine dépend du domaine (`inverse`/`racine_carree`), elle est donc
 * demandée une fois celui-ci établi, plus en tout premier.
 *
 * Niveau 1 : 6 à 8 phases selon la famille — `ce → domaine → ordonnee → parite → isolement →
 * [separation | debarrasser] → zeros` (étape intermédiaire absente si l'équation isolée n'a aucune
 * solution, voir `phaseApresIsolement`). `parite` (audit du chapitre 3) n'existe qu'à ce niveau —
 * voir `ReponseParite`/`pariteAttendue` (`core/caracteristiquesAlgebriques.types.ts`/
 * `verificationCaracteristiquesAlgebriques.ts`). Après `isolement`, chaque famille traverse EXACTEMENT une
 * des deux étapes intermédiaires : `separation` pour `valeur_absolue`/`carre`
 * (`necessiteSeparation`), `debarrasser` pour les 4 autres familles (`necessiteDebarrasser`,
 * `prompt-3-ameliorations-finales.md`, point 2) — jamais aucune des deux, jamais les deux à la
 * fois. Comportement strictement inchangé depuis l'introduction du niveau 2.
 *
 * Niveau 2 (`prompt-niveau2caracteristiquesalgebriques.md`, corrigé par
 * `prompt-corrections-niveau2-tests.md` puis par `prompt-corrections-niveau2-vague2.md` — cette 2e
 * vague retire ENTIÈREMENT l'ancien mécanisme reconnaissance/champ1/champ2/factorisation, qui
 * subsistait encore pour `inverse`/`racine_carree` malgré son retrait déjà acté pour `carre` en 1re
 * vague) — après `isolement`, dispatch sur la famille (voir `phaseApresIsolement` ci-dessous et
 * `core/caracteristiquesAlgebriques.types.ts` pour le détail complet de chaque séquence) :
 * - `carre`/`cube` : `zeros` directement après `isolement` — `isolement` y demande de DÉVELOPPER
 *   `[base](P1)` et de regrouper tous les termes d'un même côté (jamais d'isoler
 *   `[base](P1)=-k(x)`), vérifié contre le polynôme du 2nd degré déjà embarqué (`zeros.enonce`,
 *   `carre`) ou par échantillonnage numérique (`cube`, aucun polynôme embarqué) — `isolement` EST
 *   l'étape "regroupe" pour ces deux familles, aucune étape séparée nécessaire.
 * - `inverse` : `isolement → regroupe → zeros` — `isolement` garde son sens habituel (isoler
 *   `[base](P1)=-k(x)`), puis `regroupe` demande de multiplier par le dénominateur et de regrouper,
 *   vérifié via `verifierIsolement` (exercice "méthode la plus rapide") contre le polynôme du 2nd
 *   degré déjà embarqué (`exercice.zeros`).
 * - `racine_carree` : `isolement → validite → regroupe → zeros → validationSolution×N` —
 *   `regroupe` (l'ancienne étape `elevationCarre`, renommée pour partager le même nom de phase que
 *   `inverse`/`racine_cubique`) demande d'élever chaque membre au carré et de regrouper, vérifié
 *   via `verifierIsolement` contre le même polynôme embarqué (`exercice.zeros`) ; `zeros`, à cette
 *   position, demande les racines CANDIDATES (non filtrées) plutôt que les zéros finaux — la
 *   validation Oui/Non par candidat, qui filtre, n'a pas encore eu lieu (`prompt-corrections-
 *   niveau2-vague3.md`, point 2 — corrige l'ordre précédent, où l'élève validait une solution avant
 *   même de l'avoir lui-même déterminée) ; `validationSolution` clôture désormais l'exercice pour
 *   cette famille, réutilisant le score de "zéros" déjà stocké dans l'état.
 * - `valeur_absolue` : `isolement → validite → resolutionBranches → validationSolution×2 → zeros`
 *   (inchangé — pas d'étape "regroupe" ici, le regroupement est implicite dans
 *   `resolutionBranches`).
 * - `racine_cubique` : `isolement → regroupe → zeros` — `isolement` garde son sens habituel
 *   (isoler `∛(P1) = -k(x)`), puis `regroupe` demande d'élever au cube et de regrouper, vérifié par
 *   échantillonnage numérique contre le polynôme réellement obtenu (`verifierRegroupe`, JAMAIS
 *   contre `f(x)` lui-même — voir sa section dédiée pour la distinction avec `cube`).
 * `zeros` accepte pour `carre`/`inverse`/`racine_cubique`/`cube` deux conventions de comptage
 * équivalentes en cas de racine multiple (racine double, ou triple, ou double+simple) — voir
 * `verifierZerosNiveau1`. Toutes les 6 familles niveau 2 atteignent `zeros`, mais seules 5 s'y
 * CLÔTURENT (`carre`/`inverse`/`valeur_absolue`/`racine_cubique`/`cube`) — `racine_carree` fait
 * exception depuis `prompt-corrections-niveau2-vague3.md` (point 2) : `zeros` y précède
 * `validationSolution`, qui clôture l'exercice à sa place.
 *
 * N'importe jamais rien de `src/generateurs/` (voir `sessionCaracteristiquesAlgebriques.test.ts`,
 * générateurs factices locaux). Aucun bouton "Aide" sur les écrans d'origine — "parite" (audit du
 * chapitre 3) fait exception, demande explicite de l'utilisateur ("c'est que lorsqu'on active
 * l'aide qu'on a ce message") : le rappel de méthode, d'abord affiché en permanence, n'apparaît
 * plus que derrière `BoutonAide` (1 seul niveau, `NIVEAU_AIDE_MAX_PARITE`), même mécanisme
 * (`activerAideSuivante`) que les autres générateurs à aide de ce
 * chantier (ex. `sessionDistanceDroite.ts`, `sessionColinearite.ts`).
 */
import type {
  ExerciceCaracteristiquesAlgebriques,
  PhaseCaracteristiquesAlgebriques,
  ReponseCE,
  ReponseCondition,
  ReponseDebarrasser,
  ReponseDomaine,
  ReponseExistence,
  ReponseIsolement,
  ReponseParite,
  ReponseResolutionBranches,
  ReponseSeparation,
  ReponseValidationSolution,
  ReponseZerosCaracteristiques,
  GenerateurExerciceCaracteristiquesAlgebriques,
} from "../core/caracteristiquesAlgebriques.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import {
  brancheEstValide,
  equationIsoleeAdmetSolution,
  necessiteRegroupe,
  necessiteSeparation,
  necessiteValidite,
  racineRespecteCondition,
  racinesAValiderRacineCarree,
  verifierCENiveau1,
  verifierConditionValidite,
  verifierDebarrasserNiveau1,
  verifierDomaineNiveau1,
  verifierIsolementNiveau1,
  verifierOrdonneeNiveau1,
  verifierParite,
  verifierRegroupe,
  verifierResolutionBranches,
  verifierSeparationNiveau1,
  verifierValidationSolution,
  verifierZerosCandidatsRacineCarree,
  verifierZerosNiveau1,
} from "./verificationCaracteristiquesAlgebriques";
import type { EtatSessionCaracteristiquesAlgebriques, ResultatExerciceCaracteristiquesAlgebriques } from "./typesCaracteristiquesAlgebriques";

const POINTS_DE_BASE = 100;

/** Aides — 1 niveau unique par écran (un rappel de méthode, rien à graduer) : "parite" (audit du
 * chapitre 3), puis CE/isolement/séparation/débarrasser/zéros (audit gen13). Les écrans propres au
 * niveau 2 (validite, regroupe, resolutionBranches, validationSolution) et domaine/ordonnée n'en ont
 * pas. */
export const NIVEAU_AIDE_MAX_PARITE = 1;
export const NIVEAU_AIDE_MAX_CE = 1;
export const NIVEAU_AIDE_MAX_ISOLEMENT = 1;
export const NIVEAU_AIDE_MAX_SEPARATION = 1;
export const NIVEAU_AIDE_MAX_DEBARRASSER = 1;
export const NIVEAU_AIDE_MAX_ZEROS = 1;

type ChampNiveauAide =
  | "niveauAideParite"
  | "niveauAideCE"
  | "niveauAideIsolement"
  | "niveauAideSeparation"
  | "niveauAideDebarrasser"
  | "niveauAideZeros";

/** Écran → (champ de niveau d'aide, plafond). Une phase absente n'a aucune aide. */
const AIDE_PAR_PHASE: Partial<Record<PhaseCaracteristiquesAlgebriques, { champ: ChampNiveauAide; max: number }>> = {
  parite: { champ: "niveauAideParite", max: NIVEAU_AIDE_MAX_PARITE },
  ce: { champ: "niveauAideCE", max: NIVEAU_AIDE_MAX_CE },
  isolement: { champ: "niveauAideIsolement", max: NIVEAU_AIDE_MAX_ISOLEMENT },
  separation: { champ: "niveauAideSeparation", max: NIVEAU_AIDE_MAX_SEPARATION },
  debarrasser: { champ: "niveauAideDebarrasser", max: NIVEAU_AIDE_MAX_DEBARRASSER },
  zeros: { champ: "niveauAideZeros", max: NIVEAU_AIDE_MAX_ZEROS },
};

function etatInitialTransitoire(): Pick<
  EtatSessionCaracteristiquesAlgebriques,
  | "phase"
  | "etapeCourante"
  | "scoreOrdonneeExercice"
  | "ordonneeRevele"
  | "scoreCEExercice"
  | "ceRevele"
  | "scoreDomaineExercice"
  | "domaineRevele"
  | "scorePariteExercice"
  | "pariteRevele"
  | ChampNiveauAide
  | "scoreIsolementExercice"
  | "isolementRevele"
  | "scoreSeparationExercice"
  | "separationRevele"
  | "scoreDebarrasserExercice"
  | "debarrasserRevele"
  | "scoreValiditeExercice"
  | "validiteRevele"
  | "scoreRegroupeExercice"
  | "regroupeRevele"
  | "scoresValidationSolutionExercice"
  | "scoreResolutionBranchesExercice"
  | "resolutionBranchesRevele"
  | "scoreZerosExercice"
  | "zerosRevele"
> {
  return {
    phase: "ce",
    etapeCourante: demarrerEtapeTentatives(),
    scoreOrdonneeExercice: null,
    ordonneeRevele: false,
    scoreCEExercice: null,
    ceRevele: false,
    scoreDomaineExercice: null,
    domaineRevele: false,
    scorePariteExercice: null,
    pariteRevele: false,
    niveauAideParite: 0,
    niveauAideCE: 0,
    niveauAideIsolement: 0,
    niveauAideSeparation: 0,
    niveauAideDebarrasser: 0,
    niveauAideZeros: 0,
    scoreIsolementExercice: null,
    isolementRevele: false,
    scoreSeparationExercice: null,
    separationRevele: false,
    scoreDebarrasserExercice: null,
    debarrasserRevele: false,
    scoreValiditeExercice: null,
    validiteRevele: false,
    scoreRegroupeExercice: null,
    regroupeRevele: false,
    scoresValidationSolutionExercice: [],
    scoreResolutionBranchesExercice: null,
    resolutionBranchesRevele: false,
    scoreZerosExercice: null,
    zerosRevele: false,
  };
}

export function demarrerSessionCaracteristiquesAlgebriques(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceCaracteristiquesAlgebriques,
): EtatSessionCaracteristiquesAlgebriques {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    ...etatInitialTransitoire(),
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionCaracteristiquesAlgebriques): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
  };
}

function construireResultat(
  etat: EtatSessionCaracteristiquesAlgebriques,
  scoreZerosFinal: number,
  zerosReveleFinal: boolean,
): ResultatExerciceCaracteristiquesAlgebriques {
  return {
    scoreOrdonnee: etat.scoreOrdonneeExercice as number,
    ordonneeRevele: etat.ordonneeRevele,
    scoreCE: etat.scoreCEExercice as number,
    ceRevele: etat.ceRevele,
    scoreDomaine: etat.scoreDomaineExercice as number,
    domaineRevele: etat.domaineRevele,
    scoreParite: etat.scorePariteExercice,
    pariteRevele: etat.pariteRevele,
    niveauAideParite: etat.niveauAideParite,
    niveauAideCE: etat.niveauAideCE,
    niveauAideIsolement: etat.niveauAideIsolement,
    niveauAideSeparation: etat.niveauAideSeparation,
    niveauAideDebarrasser: etat.niveauAideDebarrasser,
    niveauAideZeros: etat.niveauAideZeros,
    scoreIsolement: etat.scoreIsolementExercice as number,
    isolementRevele: etat.isolementRevele,
    scoreSeparation: etat.scoreSeparationExercice,
    separationRevele: etat.separationRevele,
    scoreDebarrasser: etat.scoreDebarrasserExercice,
    debarrasserRevele: etat.debarrasserRevele,
    scoreValidite: etat.scoreValiditeExercice,
    validiteRevele: etat.validiteRevele,
    scoreRegroupe: etat.scoreRegroupeExercice,
    regroupeRevele: etat.regroupeRevele,
    scoresValidationSolution: etat.scoresValidationSolutionExercice,
    scoreResolutionBranches: etat.scoreResolutionBranchesExercice,
    resolutionBranchesRevele: etat.resolutionBranchesRevele,
    scoreZeros: scoreZerosFinal,
    zerosRevele: zerosReveleFinal,
  };
}

/** Clôture l'exercice en cours et avance au suivant, ou termine la session. */
function cloturerExerciceOuSuivant(
  etat: EtatSessionCaracteristiquesAlgebriques,
  resultat: ResultatExerciceCaracteristiquesAlgebriques,
): EtatSessionCaracteristiquesAlgebriques {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: etat.generateur(),
    ...etatInitialTransitoire(),
  };
}

/** Étape "ordonnée à l'origine" : après domaine (son existence en dépend). */
export function soumettreReponseOrdonnee(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseExistence,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "ordonnee") {
    throw new Error("soumettreReponseOrdonnee : la session n'est pas à l'étape ordonnee");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseExistence>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierOrdonneeNiveau1(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    // "parite" (audit du chapitre 3) n'existe qu'au niveau 1 — un exercice niveau 2 va directement
    // à "isolement".
    phase: etat.exerciceCourant.niveau === "niveau1" ? "parite" : "isolement",
    scoreOrdonneeExercice: etapeCourante.score,
    ordonneeRevele: etapeCourante.revelee,
  };
}

/** Étape "conditions d'existence" : toujours la première. */
export function soumettreReponseCE(etat: EtatSessionCaracteristiquesAlgebriques, reponse: ReponseCE): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "ce") {
    throw new Error("soumettreReponseCE : la session n'est pas à l'étape ce");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseCE>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCENiveau1(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "domaine",
    scoreCEExercice: etapeCourante.score as number,
    ceRevele: etapeCourante.revelee,
  };
}

/** Étape "domaine de définition" : après CE. */
export function soumettreReponseDomaine(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseDomaine,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "domaine") {
    throw new Error("soumettreReponseDomaine : la session n'est pas à l'étape domaine");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseDomaine>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDomaineNiveau1(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "ordonnee",
    scoreDomaineExercice: etapeCourante.score,
    domaineRevele: etapeCourante.revelee,
  };
}

/** Étape "parité" (niveau 1 UNIQUEMENT, audit du chapitre 3) : après ordonnée, avant isolement —
 * voir `ReponseParite`/`pariteAttendue` pour le détail complet. */
export function soumettreReponseParite(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseParite,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "parite") {
    throw new Error("soumettreReponseParite : la session n'est pas à l'étape parite");
  }
  const exercice = etat.exerciceCourant;
  if (exercice.niveau !== "niveau1") {
    throw new Error("soumettreReponseParite : cette étape n'existe qu'au niveau 1");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseParite>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierParite(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = etapeCourante.score as number;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "isolement",
    scorePariteExercice: score,
    pariteRevele: etapeCourante.revelee,
  };
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée, si
 * l'écran courant n'a aucune aide (`AIDE_PAR_PHASE`), ou si son niveau maximal est déjà atteint.
 * Même principe que `activerAideSuivante` des autres générateurs à aide de ce chantier. */
export function activerAideSuivante(etat: EtatSessionCaracteristiquesAlgebriques): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  const aide = AIDE_PAR_PHASE[etat.phase];
  if (!aide) {
    throw new Error("activerAideSuivante : cet écran n'a aucune aide");
  }
  if (etat[aide.champ] >= aide.max) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, [aide.champ]: etat[aide.champ] + 1 };
}

/**
 * Phase suivant "isolement" — dispatch niveau/famille (voir le commentaire de tête de fichier).
 * `carre`/`cube` vont directement à "zeros" (`isolement` EST l'étape "regroupe" pour ces deux
 * familles) ; `inverse`/`racine_cubique` passent par la nouvelle étape "regroupe"
 * (`prompt-corrections-niveau2-vague2.md`) ; `racine_carree`/`valeur_absolue` passent par
 * "validite" comme avant.
 */
function phaseApresIsolement(exercice: ExerciceCaracteristiquesAlgebriques): PhaseCaracteristiquesAlgebriques {
  if (exercice.niveau === "niveau1") {
    // `[base](P1) = K` avec K<0 pour `carre`/`valeur_absolue`/`racine_carree` : aucune solution, à
    // conclure dès l'isolement (un carré, une valeur absolue ou une racine ne vaut jamais un
    // négatif) — séparer ou "se débarrasser de" n'aurait aucun sens (séparation : √K non défini ;
    // débarrasser : aucune racine attendue). Direction "zeros" (réponse "aucun").
    if (!equationIsoleeAdmetSolution(exercice)) return "zeros";
    return necessiteSeparation(exercice) ? "separation" : "debarrasser";
  }
  switch (exercice.famille) {
    case "carre":
    case "cube":
      return "zeros";
    case "inverse":
    case "racine_cubique":
      return "regroupe";
    case "racine_carree":
    case "valeur_absolue":
      return "validite";
  }
}

/** Étape "isolement" : après domaine. */
export function soumettreReponseIsolement(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseIsolement | string,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "isolement") {
    throw new Error("soumettreReponseIsolement : la session n'est pas à l'étape isolement");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseIsolement | string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIsolementNiveau1(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresIsolement(etat.exerciceCourant),
    scoreIsolementExercice: etapeCourante.score as number,
    isolementRevele: etapeCourante.revelee,
  };
}

/** Étape "séparation" (niveau 1, `valeur_absolue`/`carre` uniquement) : après isolement. */
export function soumettreReponseSeparation(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseSeparation,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "separation") {
    throw new Error("soumettreReponseSeparation : la session n'est pas à l'étape separation");
  }
  const exercice = etat.exerciceCourant;
  if (exercice.niveau !== "niveau1") {
    throw new Error("soumettreReponseSeparation : cette étape n'existe qu'au niveau 1");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseSeparation>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSeparationNiveau1(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "zeros",
    scoreSeparationExercice: etapeCourante.score as number,
    separationRevele: etapeCourante.revelee,
  };
}

/** Étape "se débarrasser de..." (niveau 1, `inverse`/`racine_carree`/`racine_cubique`/`cube`
 * uniquement) : après isolement, miroir de "séparation" pour les 2 autres familles. */
export function soumettreReponseDebarrasser(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseDebarrasser | string,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "debarrasser") {
    throw new Error("soumettreReponseDebarrasser : la session n'est pas à l'étape debarrasser");
  }
  const exercice = etat.exerciceCourant;
  if (exercice.niveau !== "niveau1") {
    throw new Error("soumettreReponseDebarrasser : cette étape n'existe qu'au niveau 1");
  }

  const texte = typeof reponse === "string" ? reponse : reponse.texte;
  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDebarrasserNiveau1(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "zeros",
    scoreDebarrasserExercice: etapeCourante.score as number,
    debarrasserRevele: etapeCourante.revelee,
  };
}

/** Étape "condition de validité de l'équation" (niveau 2, `racine_carree`/`valeur_absolue`
 * uniquement) : après isolement. */
export function soumettreReponseValidite(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseCondition,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "validite") {
    throw new Error("soumettreReponseValidite : la session n'est pas à l'étape validite");
  }
  const exercice = etat.exerciceCourant;
  if (!necessiteValidite(exercice)) {
    throw new Error("soumettreReponseValidite : cet exercice n'a pas d'étape de validité");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseCondition>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierConditionValidite(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: exercice.famille === "valeur_absolue" ? "resolutionBranches" : "regroupe",
    scoreValiditeExercice: etapeCourante.score,
    validiteRevele: etapeCourante.revelee,
  };
}

/**
 * Étape "regroupe" (niveau 2, `inverse`/`racine_carree`/`racine_cubique` uniquement) — un champ
 * libre où l'élève écrit l'équation obtenue après avoir éliminé la fonction de référence
 * (multiplier par le dénominateur, élever au carré, élever au cube — `prompt-corrections-niveau2-
 * vague2.md`, point 2), vérifiée via `verifierRegroupe`. Phase suivante : toujours `zeros`
 * (`prompt-corrections-niveau2-vague3.md`, point 2 — corrige l'ordre pour `racine_carree`, qui
 * transitionnait auparavant directement vers `validationSolution` : l'élève validait alors une
 * solution Oui/Non avant même d'avoir lui-même déterminé les valeurs candidates. `zeros`, à cette
 * position pour `racine_carree`, demande désormais ces candidats — voir `soumettreReponseZeros` —
 * puis transitionne lui-même vers `validationSolution`).
 */
export function soumettreReponseRegroupe(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseIsolement | string,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "regroupe") {
    throw new Error("soumettreReponseRegroupe : la session n'est pas à l'étape regroupe");
  }
  const exercice = etat.exerciceCourant;
  if (!necessiteRegroupe(exercice)) {
    throw new Error("soumettreReponseRegroupe : cet exercice n'a pas d'étape regroupe");
  }

  const texte = typeof reponse === "string" ? reponse : reponse.texte;
  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRegroupe(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "zeros",
    scoreRegroupeExercice: etapeCourante.score,
    regroupeRevele: etapeCourante.revelee,
  };
}

/** Étape "résolution des branches" (niveau 2, `valeur_absolue` uniquement) : les deux racines
 * algébriques, une par branche, soumises ensemble. */
export function soumettreReponseResolutionBranches(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseResolutionBranches,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "resolutionBranches") {
    throw new Error("soumettreReponseResolutionBranches : la session n'est pas à l'étape resolutionBranches");
  }
  const exercice = etat.exerciceCourant;
  if (!(exercice.niveau === "niveau2" && exercice.famille === "valeur_absolue")) {
    throw new Error("soumettreReponseResolutionBranches : cet exercice n'a pas de branches à résoudre");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseResolutionBranches>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierResolutionBranches(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "validationSolution",
    scoreResolutionBranchesExercice: etapeCourante.score,
    resolutionBranchesRevele: etapeCourante.revelee,
  };
}

/** Nombre de solutions/branches à valider (niveau 2, `racine_carree`/`valeur_absolue` uniquement) —
 * l'index courant de `soumettreReponseValidationSolution` est dérivé de
 * `scoresValidationSolutionExercice.length`, jamais un compteur séparé (même principe que
 * `signeIrreductible`, exercice "tableau de signes à plusieurs facteurs"). */
function nombreSolutionsAValider(exercice: ExerciceCaracteristiquesAlgebriques): number {
  if (exercice.niveau !== "niveau2") return 0;
  if (exercice.famille === "racine_carree") return racinesAValiderRacineCarree(exercice).length;
  if (exercice.famille === "valeur_absolue") return 2;
  return 0;
}

/** Étape "validation d'une solution" (niveau 2, `racine_carree`/`valeur_absolue`) — répétée une
 * fois par solution/branche restante. Reste sur cette même phase tant qu'il en reste. Une fois
 * toutes traitées : clôture l'exercice pour `racine_carree` (dont l'étape "zéros" — les candidats —
 * a déjà eu lieu AVANT cette boucle, voir `soumettreReponseZeros`,
 * `prompt-corrections-niveau2-vague3.md`, point 2) en réutilisant le score déjà stocké
 * (`scoreZerosExercice`/`zerosRevele`) ; passe à "zeros" pour `valeur_absolue`, inchangé — l'écran
 * "zéros" final (filtré) y suit encore la validation. */
export function soumettreReponseValidationSolution(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseValidationSolution,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "validationSolution") {
    throw new Error("soumettreReponseValidationSolution : la session n'est pas à l'étape validationSolution");
  }
  const exercice = etat.exerciceCourant;
  const total = nombreSolutionsAValider(exercice);
  const indexCourant = etat.scoresValidationSolutionExercice.length;
  if (indexCourant >= total || exercice.niveau !== "niveau2") {
    throw new Error("soumettreReponseValidationSolution : aucune solution restante à valider");
  }

  const attendu =
    exercice.famille === "racine_carree"
      ? racineRespecteCondition(exercice, racinesAValiderRacineCarree(exercice)[indexCourant])
      : exercice.famille === "valeur_absolue"
        ? brancheEstValide(exercice, indexCourant as 0 | 1)
        : (() => {
            throw new Error("soumettreReponseValidationSolution : famille inattendue pour cette étape");
          })();

  const etapeCourante = soumettreEtapeTentatives<ReponseValidationSolution>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierValidationSolution(attendu, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const scoresValidationSolutionExercice = [...etat.scoresValidationSolutionExercice, etapeCourante.score as number];
  const encoreDesSolutions = scoresValidationSolutionExercice.length < total;

  if (encoreDesSolutions) {
    return { ...etat, etapeCourante: demarrerEtapeTentatives(), phase: "validationSolution", scoresValidationSolutionExercice };
  }

  if (exercice.famille === "racine_carree") {
    const etatMisAJour = { ...etat, scoresValidationSolutionExercice };
    return cloturerExerciceOuSuivant(
      etatMisAJour,
      construireResultat(etatMisAJour, etat.scoreZerosExercice as number, etat.zerosRevele),
    );
  }

  return { ...etat, etapeCourante: demarrerEtapeTentatives(), phase: "zeros", scoresValidationSolutionExercice };
}

/**
 * Étape "zéros" : la finale pour 5 des 6 familles niveau 2 (et niveau 1) — clôture l'exercice et
 * agrège les scores, vérifiée contre les zéros ATTENDUS (finaux, filtrés le cas échéant).
 * `racine_carree` (niveau 2) fait exception depuis `prompt-corrections-niveau2-vague3.md`, point 2 :
 * cette phase y précède désormais "validationSolution" (ordre corrigé — l'élève ne peut pas valider
 * une solution qu'il n'a pas encore lui-même trouvée), donc elle demande les racines CANDIDATES
 * (non filtrées, `verifierZerosCandidatsRacineCarree`) plutôt que les zéros finaux, stocke son score
 * dans l'état (`scoreZerosExercice`/`zerosRevele`, repris à la clôture différée par
 * `soumettreReponseValidationSolution`) et transitionne vers "validationSolution" au lieu de clore.
 */
export function soumettreReponseZeros(
  etat: EtatSessionCaracteristiquesAlgebriques,
  reponse: ReponseZerosCaracteristiques,
): EtatSessionCaracteristiquesAlgebriques {
  if (etat.terminee || etat.phase !== "zeros") {
    throw new Error("soumettreReponseZeros : la session n'est pas à l'étape zeros");
  }
  const exercice = etat.exerciceCourant;
  const candidatsAvantValidation = exercice.niveau === "niveau2" && exercice.famille === "racine_carree";

  const etapeCourante = soumettreEtapeTentatives<ReponseZerosCaracteristiques>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => (candidatsAvantValidation ? verifierZerosCandidatsRacineCarree(exercice, r) : verifierZerosNiveau1(exercice, r)),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const scoreZeros = etapeCourante.score as number;

  if (candidatsAvantValidation) {
    return {
      ...etat,
      etapeCourante: demarrerEtapeTentatives(),
      phase: "validationSolution",
      scoreZerosExercice: scoreZeros,
      zerosRevele: etapeCourante.revelee,
    };
  }

  return cloturerExerciceOuSuivant(etat, construireResultat(etat, scoreZeros, etapeCourante.revelee));
}
