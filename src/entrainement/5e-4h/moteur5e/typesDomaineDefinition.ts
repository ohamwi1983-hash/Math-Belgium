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
export function niveauAideMaxCE(exercice: ExerciceDomaineDefinition): number {
  if (exercice.famille === "pasDeCE") return 0;
  // "fractionSousRacine" a normalement 2 paliers d'aide sur l'écran "ce", mais `texteAideCE`
  // (`ui5e/formatDomaineDefinition.ts`) ne retourne qu'un seul texte générique dès que
  // `aucuneCE===true` (~10% des instances de cette famille) — sans ce garde, le bouton "Aide
  // supplémentaire" restait cliquable/pénalisant pour un niveau 2 vide (B.3, audit 18 générateurs).
  if (exercice.famille === "fractionSousRacine") return exercice.aucuneCE ? 1 : 2;
  if (exercice.famille === "racineSurFraction") return 2;
  return 1;
}

export function niveauAideMaxResolution(): number {
  // Aucun texte d'aide spécifié pour l'écran "resolution" par la spec (ni le tableau de signes de
  // "fractionSousRacine" — son aide vit sur l'écran "domf" suivant — ni les 2 sous-conditions de
  // "racineSurFraction"/"racineSurD") — jamais atteinte pour les autres familles (écran sauté).
  return 0;
}

export function niveauAideMaxDomf(exercice: ExerciceDomaineDefinition): number {
  return exercice.famille === "fractionSousRacine" && !exercice.aucuneCE ? 1 : 0;
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
