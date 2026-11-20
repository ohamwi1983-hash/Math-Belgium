import type { ExerciceDomaineDefinition, GenerateurExerciceDomaineDefinition } from "../core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * 3 phases FIXES dans l'ordre — `resolution` SAUTÉE dès que `exercice.aucuneCE === true` (principe
 * unifié 1.10, transversal — jamais limité à la seule famille dédiée "pasDeCE", dont `aucuneCE`
 * vaut toujours `true` par construction) **OU** dès que la famille/instance n'a qu'UNE seule CE
 * (`domf === resolution` littéralement) — un écran "resolution" distinct du domf serait alors un pur
 * doublon (point 2/3/5/7, "Écran 3 supprimé, comme toute famille à une seule CE") : `ce` mène alors
 * directement à `domf`, qui redemande la même chose sous l'angle "domaine de définition". Seules
 * 2 familles/sous-cas gardent un authentique écran "resolution" séparé : "fractionSousRacine"
 * (le tableau de signes, jamais un doublon du domf) et "racineSurFraction" structure "racineSurD"
 * (2 CE indépendantes à résoudre avant de les combiner en domf). Jamais de 4e phase distincte pour
 * la grille de "fractionSousRacine" : la grille EST l'écran "resolution" de cette famille (même nom
 * de phase, contenu différent selon `exercice.famille`, décidé côté présentation).
 */
export type PhaseDomaineDefinition = "ce" | "resolution" | "domf" | "termine";

export function phaseApresCE(exercice: ExerciceDomaineDefinition): PhaseDomaineDefinition {
  if (exercice.aucuneCE) return "domf";
  if (exercice.famille === "fractionSousRacine") return "resolution";
  if (exercice.famille === "racineSurFraction" && exercice.structure === "racineSurD") return "resolution";
  return "domf";
}

/**
 * Plafonds d'aide, PAR FAMILLE/INSTANCE (jamais des constantes globales) — voir CLAUDE.md section
 * 5gen1 pour le détail complet par famille/écran. "pasDeCE" : aucune aide nulle part (0 partout,
 * spécifique à cette famille). Les autres familles concentrent leur aide sur l'écran "ce" (1 ou 2
 * paliers selon le nombre de conditions à identifier) ; l'écran "resolution"/"domf" n'a d'aide que
 * pour "fractionSousRacine" (surlignage vert du tableau, 1 palier, écran "domf" uniquement).
 */
/** Audit 5e ch. 1 (lot B) : DEUX niveaux d'aide sur chaque écran, pour toutes les familles (« pas
 * de CE » comprise) — niveau 1 la propriété du cours, niveau 2 son application à l'instance
 * (`ui5e/retoursFonctions1.ts` : `aidesCE5gen1`, `aidesResolution5gen1`, `aidesDomf5gen1`). */
export const NIVEAU_AIDE_MAX_5GEN1 = 2;

export function niveauAideMaxCE(_exercice: ExerciceDomaineDefinition): number {
  return NIVEAU_AIDE_MAX_5GEN1;
}

export function niveauAideMaxResolution(_exercice?: ExerciceDomaineDefinition): number {
  return NIVEAU_AIDE_MAX_5GEN1;
}

export function niveauAideMaxDomf(_exercice: ExerciceDomaineDefinition): number {
  return NIVEAU_AIDE_MAX_5GEN1;
}

export interface ResultatExerciceDomaineDefinition {
  exercice: ExerciceDomaineDefinition;
  scoreCE: number;
  ceRevele: boolean;
  /** Niveau d'aide réellement utilisé à l'écran "ce" — pilote le code couleur du récapitulatif
   * final (point 1.7) : vert si `0`, orange si `>0` (et pas révélé), rouge si révélé. */
  niveauAideCE: number;
  /** `null` uniquement pour les familles/instances sans écran "resolution" séparé (voir `phaseApresCE`). */
  scoreResolution: number | null;
  resolutionRevele: boolean;
  niveauAideResolution: number | null;
  scoreDomf: number;
  domfRevele: boolean;
  niveauAideDomf: number;
}

export interface EtatSessionDomaineDefinition {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceDomaineDefinition;
  exerciceCourant: ExerciceDomaineDefinition;
  phase: PhaseDomaineDefinition;
  etapeCourante: EtatEtapeTentatives;
  niveauAideCE: number;
  niveauAideResolution: number;
  niveauAideDomf: number;
  scoreCEExercice: number | null;
  ceRevele: boolean;
  scoreResolutionExercice: number | null;
  resolutionRevele: boolean;
  indexExercice: number;
  resultats: ResultatExerciceDomaineDefinition[];
  terminee: boolean;
}
