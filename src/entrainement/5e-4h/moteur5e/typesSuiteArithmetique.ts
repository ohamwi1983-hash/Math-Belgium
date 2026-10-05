/**
 * Couche B (5e) — types pour 5gen14 ("Suites arithmétiques, formule générale et termes"). 5
 * familles STRUCTURELLEMENT DISJOINTES (`ExerciceSuiteArithmetique`, core) — `ordreComplet`
 * dispatche par `exercice.famille` puis construit la séquence RÉELLE de cette instance :
 *
 * - "principal" : `trouverR`/`trouverU1` PRÉSENTS OU ABSENTS selon le combo (jamais les deux
 *   absents à la fois pour "up_uq"/"un_sn"), puis toujours `formuleGenerale→termesProches→
 *   termeEloigne→sommeSn`. **Ordre `trouverR`/`trouverU1` INVERSÉ pour le combo "un_sn"**
 *   (u1=2Sn/n-un DOIT être trouvé AVANT r=(un-u1)/(n-1), contrairement aux 3 autres combos où r se
 *   trouve toujours en premier) — décision explicite documentée ici, pas un oubli : voir CLAUDE.md
 *   section 5gen14 pour la justification complète.
 * - "coherence" : `coherenceJugement` TOUJOURS en premier ; si `coherent===false`, séquence
 *   terminée là (aucune suite valide, rien à calculer) ; si `coherent===true`, `trouverU1` (r déjà
 *   donné) puis la même queue que "principal" (`formuleGenerale→...→sommeSn`).
 * - "algebriqueTermeGeneral"/"algebriqueSommeSn" (sous-cas A/B/C) : séquence FIXE à 3 écrans, PHASES
 *   PARTAGÉES entre les 2 familles (même rôle d'écran — poser l'équation/isoler x/calculer les
 *   grandeurs algébriques — seule la formule mobilisée diffère, dispatchée par `exercice.famille`/
 *   `sousCas` côté `ui5e`/moteur, même principe que `trouverR`/`trouverU1` déjà partagées entre
 *   "principal"/"coherence").
 * - "algebriqueSommeSn" sous-cas D : séquence DIFFÉRENTE à 3 écrans (`ORDRE_SOMME_SN_D`) — calcule
 *   S_n d'abord (aucune inconnue), pose l'équation Sn(x)=[valeur trouvée], puis résout x — pas
 *   d'écran "en déduire" final.
 * - "algebriqueRangN" : séquence FIXE à 2 écrans, jamais de saut.
 *
 * `ResultatExerciceSuiteArithmetique.scores: Partial<Record<PhaseSuiteArithmetique,number>>` — même
 * principe que 5gen13 (`ResultatExerciceModelisationSinusoide`) : l'espace combinatoire (5 familles
 * × 5 combos × ordre parfois inversé) rend un type à champs fixes par combinaison impraticable.
 */
import type { ComboSuiteArithmetique, DonneesSuiteArithmetique, ExerciceSuiteArithmetique } from "../core5e/suitesArithmetiques.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseSuiteArithmetique =
  | "trouverR"
  | "trouverU1"
  | "formuleGenerale"
  | "termesProches"
  | "termeEloigne"
  | "sommeSn"
  | "coherenceJugement"
  | "calculerSn"
  | "poserEquationAlgebrique"
  | "resoudreXAlgebrique"
  | "calculerTermesAlgebrique"
  | "poserEquationRangN"
  | "resoudreRangN";

function ordreResolutionPourCombo(combo: ComboSuiteArithmetique): PhaseSuiteArithmetique[] {
  switch (combo) {
    case "direct":
      return [];
    case "u1_up":
      return ["trouverR"];
    case "r_up":
      return ["trouverU1"];
    case "up_uq":
      return ["trouverR", "trouverU1"];
    case "un_sn":
      // Ordre INVERSÉ — voir l'en-tête de fichier.
      return ["trouverU1", "trouverR"];
  }
}

const QUEUE_PRINCIPALE: PhaseSuiteArithmetique[] = ["formuleGenerale", "termesProches", "termeEloigne", "sommeSn"];

function ordrePrincipal(donnees: DonneesSuiteArithmetique): PhaseSuiteArithmetique[] {
  return [...ordreResolutionPourCombo(donnees.combo), ...QUEUE_PRINCIPALE];
}

function ordreCoherence(coherent: boolean): PhaseSuiteArithmetique[] {
  return coherent ? ["coherenceJugement", "trouverU1", ...QUEUE_PRINCIPALE] : ["coherenceJugement"];
}

const ORDRE_ALGEBRIQUE: PhaseSuiteArithmetique[] = ["poserEquationAlgebrique", "resoudreXAlgebrique", "calculerTermesAlgebrique"];
/** Sous-cas D de la famille "algebriqueSommeSn" — mécanique DIFFÉRENTE (voir
 * `core5e/suitesArithmetiques.types.ts`, doc de `ExerciceAlgebriqueSommeSnD`) : S_n est calculée
 * D'ABORD (aucune inconnue), PUIS l'équation Sn(x)=[valeur trouvée] est posée, PUIS résolue — pas
 * d'écran "en déduire" final (S_n déjà connue numériquement dès le premier écran). */
const ORDRE_SOMME_SN_D: PhaseSuiteArithmetique[] = ["calculerSn", "poserEquationAlgebrique", "resoudreXAlgebrique"];
const ORDRE_RANG_N: PhaseSuiteArithmetique[] = ["poserEquationRangN", "resoudreRangN"];

export function ordreComplet(exercice: ExerciceSuiteArithmetique): PhaseSuiteArithmetique[] {
  switch (exercice.famille) {
    case "principal":
      return ordrePrincipal(exercice.donnees);
    case "coherence":
      return ordreCoherence(exercice.coherent);
    case "algebriqueTermeGeneral":
      return ORDRE_ALGEBRIQUE;
    case "algebriqueSommeSn":
      return exercice.sousCas === "D" ? ORDRE_SOMME_SN_D : ORDRE_ALGEBRIQUE;
    case "algebriqueRangN":
      return ORDRE_RANG_N;
  }
}

export function phaseInitiale(exercice: ExerciceSuiteArithmetique): PhaseSuiteArithmetique {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceSuiteArithmetique, phase: PhaseSuiteArithmetique): PhaseSuiteArithmetique | "termine" {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceSuiteArithmetique {
  exercice: ExerciceSuiteArithmetique;
  scores: Partial<Record<PhaseSuiteArithmetique, number>>;
}

export interface EtatSessionSuiteArithmetique {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceSuiteArithmetique;
  exerciceCourant: ExerciceSuiteArithmetique;
  phase: PhaseSuiteArithmetique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseSuiteArithmetique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceSuiteArithmetique[];
  terminee: boolean;
  /** Capture POST-soumission de `etapeCourante.revelee` de la dernière phase close (voir A.1,
   * `sessionSuiteArithmetique.ts`) — `etat.etapeCourante.revelee` lu côté UI avant soumission est
   * structurellement toujours `false` (l'écran vient de démarrer), ce qui rendait le récap final
   * systématiquement vert. */
  derniereEtapeRevelee: boolean;
}
