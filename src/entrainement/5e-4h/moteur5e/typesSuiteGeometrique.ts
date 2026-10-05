/**
 * Couche B (5e) — types pour 5gen15 ("Suites géométriques, formule générale et termes"). REFONTE
 * (`prompt5gen15refontefamillesbonus.md`, miroir direct de `typesSuiteArithmetique.ts`, 5gen14).
 *
 * "principal" garde sa complication propre : elle peut produire 1 OU 2 branches valides
 * (`statutQ==="double"`, exposant/écart d'indices pair, ±q toutes deux valides — voir
 * `core5e/suitesGeometriques.types.ts`), le spec demande explicitement de "dupliquer le pipeline
 * pour chaque branche" dans ce cas. `StatutQ="aucune"` est devenu mathématiquement impossible sous
 * la nouvelle construction (q toujours choisi en premier) et a donc disparu : `ordrePrincipal` n'a
 * plus de sortie anticipée.
 *
 * Modélisation retenue pour la duplication B1/B2 (documentée ici plutôt que devinée en aval) : PAS
 * de composite `{phase,branche}` — chaque phase potentiellement dupliquée existe en 3 variantes de
 * string littéral (`formuleGenerale`/`formuleGeneraleB1`/`formuleGeneraleB2`), gardant `scores:
 * Partial<Record<Phase,number>>` PLAT (même principe que 5gen13/5gen14).
 *
 * Écran "trouverQ" n'est JAMAIS dupliqué (même dans le cas "double") : l'élève y soumet les 2
 * valeurs de q sur UN SEUL écran add-as-needed — c'est la duplication des écrans SUIVANTS (formule
 * générale, termes proches, terme éloigné, Sn, S∞) qui matérialise les "2 suites valides distinctes".
 * Écran "trouverU1" n'existe (et n'est dupliqué) que pour les combos où u1 est réellement à DÉRIVER
 * ("q_up" — jamais double, q déjà connu — et "up_um" — peut être double) ; pour "u1_up", u1 est déjà
 * DONNÉ (même valeur pour les 2 branches), donc aucun écran "trouverU1" n'existe même quand
 * statutQ==="double".
 *
 * Les 3 nouvelles familles bonus ("algebriqueTermeGeneral"/"algebriqueSommeSn"/"algebriqueRangN")
 * partagent des phases COMMUNES (même rôle d'écran — poser l'équation/isoler x/en déduire les
 * grandeurs — seule la formule mobilisée diffère, dispatchée par `exercice.famille`/`sousCas` côté
 * `ui5e`/moteur), miroir exact de 5gen14. Le sous-cas B de "algebriqueSommeSn" a une séquence
 * DIFFÉRENTE (`ORDRE_SOMME_SN_B_GEOMETRIQUE`, miroir du sous-cas D de 5gen14) — calcule S_n d'abord
 * (aucune inconnue), pose l'équation Sn(x)=[valeur trouvée], puis résout x — pas d'écran "en
 * déduire" final.
 */
import type { ExerciceSuiteGeometrique } from "../core5e/suitesGeometriques.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseSuiteGeometrique =
  | "trouverQ"
  | "trouverU1"
  | "trouverU1B1"
  | "trouverU1B2"
  | "formuleGenerale"
  | "formuleGeneraleB1"
  | "formuleGeneraleB2"
  | "termesProches"
  | "termesProchesB1"
  | "termesProchesB2"
  | "termeEloigne"
  | "termeEloigneB1"
  | "termeEloigneB2"
  | "sommeSn"
  | "sommeSnB1"
  | "sommeSnB2"
  | "sommeInfinie"
  | "sommeInfinieB1"
  | "sommeInfinieB2"
  | "poserEquationAlgebrique"
  | "resoudreXAlgebrique"
  | "calculerTermesAlgebrique"
  | "calculerSn"
  | "poserEquationRangN"
  | "resoudreRangN";

function ordrePrincipal(exercice: Extract<ExerciceSuiteGeometrique, { famille: "principal" }>): PhaseSuiteGeometrique[] {
  const combo = exercice.donnees.combo;
  const phases: PhaseSuiteGeometrique[] = [];

  if (combo === "u1_up" || combo === "up_um") {
    phases.push("trouverQ");
  }

  const double = exercice.statutQ === "double";
  const suffixes: readonly ("" | "B1" | "B2")[] = double ? ["B1", "B2"] : [""];

  for (const suf of suffixes) {
    if (combo === "q_up" || combo === "up_um") {
      phases.push((suf === "" ? "trouverU1" : `trouverU1${suf}`) as PhaseSuiteGeometrique);
    }
    phases.push((suf === "" ? "formuleGenerale" : `formuleGenerale${suf}`) as PhaseSuiteGeometrique);
    phases.push((suf === "" ? "termesProches" : `termesProches${suf}`) as PhaseSuiteGeometrique);
    phases.push((suf === "" ? "termeEloigne" : `termeEloigne${suf}`) as PhaseSuiteGeometrique);
    phases.push((suf === "" ? "sommeSn" : `sommeSn${suf}`) as PhaseSuiteGeometrique);
    phases.push((suf === "" ? "sommeInfinie" : `sommeInfinie${suf}`) as PhaseSuiteGeometrique);
  }

  return phases;
}

const ORDRE_ALGEBRIQUE: PhaseSuiteGeometrique[] = ["poserEquationAlgebrique", "resoudreXAlgebrique", "calculerTermesAlgebrique"];
/** Sous-cas B de la famille "algebriqueSommeSn" — mécanique DIFFÉRENTE (voir
 * `core5e/suitesGeometriques.types.ts`, doc de `ExerciceAlgebriqueSommeSnB`) : S_n est calculée
 * D'ABORD (aucune inconnue), PUIS l'équation Sn(x)=[valeur trouvée] est posée, PUIS résolue — pas
 * d'écran "en déduire" final (S_n déjà connue numériquement dès le premier écran). */
const ORDRE_SOMME_SN_B: PhaseSuiteGeometrique[] = ["calculerSn", "poserEquationAlgebrique", "resoudreXAlgebrique"];
const ORDRE_RANG_N: PhaseSuiteGeometrique[] = ["poserEquationRangN", "resoudreRangN"];

function ordreAlgebrique(exercice: Extract<ExerciceSuiteGeometrique, { famille: "algebriqueTermeGeneral" | "algebriqueSommeSn" }>): PhaseSuiteGeometrique[] {
  if (exercice.famille === "algebriqueSommeSn" && exercice.sousCas === "B") return ORDRE_SOMME_SN_B;
  return ORDRE_ALGEBRIQUE;
}

export function ordreComplet(exercice: ExerciceSuiteGeometrique): PhaseSuiteGeometrique[] {
  switch (exercice.famille) {
    case "principal":
      return ordrePrincipal(exercice);
    case "algebriqueTermeGeneral":
    case "algebriqueSommeSn":
      return ordreAlgebrique(exercice);
    case "algebriqueRangN":
      return ORDRE_RANG_N;
  }
}

export function phaseInitiale(exercice: ExerciceSuiteGeometrique): PhaseSuiteGeometrique {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceSuiteGeometrique, phase: PhaseSuiteGeometrique): PhaseSuiteGeometrique | "termine" {
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceSuiteGeometrique {
  exercice: ExerciceSuiteGeometrique;
  scores: Partial<Record<PhaseSuiteGeometrique, number>>;
}

export interface EtatSessionSuiteGeometrique {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceSuiteGeometrique;
  exerciceCourant: ExerciceSuiteGeometrique;
  phase: PhaseSuiteGeometrique;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseSuiteGeometrique, number>>;
  indexExercice: number;
  resultats: ResultatExerciceSuiteGeometrique[];
  terminee: boolean;
  /** Statut `revelee` POST-soumission du DERNIER écran clos (A.1) — `etapeCourante.revelee` au
   * moment où `terminerEtape` lit l'état est structurellement toujours `false` (nouvel écran tout
   * juste démarré), donc ce champ est la seule source fiable pour colorer la ligne du récap. */
  derniereEtapeRevelee: boolean;
}
