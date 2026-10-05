import type { ExerciceSectionPlaneSolide, GenerateurExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Couche B — "Section plane d'un solide" (40e générateur, chapitre "Géométrie dans l'espace").
 *
 * **Nombre d'écrans NON connu à l'avance** — premier générateur du projet dans ce cas (spec, section
 * "Architecture") : contrairement aux 39 précédents (séquence de phases FIXE), la phase suivante est
 * ici toujours RECALCULÉE dynamiquement depuis l'état vivant de la session (`phaseDepuisEtat`,
 * `sessionSectionPlaneSolide.ts`) — jamais une séquence énumérée à l'avance. Une seule boucle
 * générique traite donc n'importe quel nombre d'itérations, sans dupliquer de code par itération
 * possible (2e question de l'architecture demandée par la spec).
 *
 * `connus`/`segmentsTraces` sont l'état vivant EXCLUSIF de la Couche B — jamais stockés sur
 * `ExerciceSectionPlaneSolide` (Couche A), qui ne porte que la vérité terrain COMPLÈTE et fixe du
 * polygone. Représentés en tableaux simples (jamais `Set` directement dans l'état, converti à la
 * demande par les fonctions pures de `verificationSectionPlaneSolide.ts`) — même style d'état
 * immuable simple que le reste du projet.
 *
 * **Garantie de terminaison** (3e question de l'architecture) : déjà assurée à la GÉNÉRATION, pas
 * ici — `simulationResoluble` (Couche A, `polygoneSection.ts`) rejette toute instance qui ne se
 * fermerait pas en un nombre borné d'itérations avant même qu'elle n'atteigne cette session ; ce
 * moteur peut donc supposer sans jamais le re-vérifier qu'au moins un coup (écran A ou écran B) est
 * toujours disponible tant que le polygone n'est pas fermé.
 */

export type PhaseSectionPlaneSolide = "segmentDirect" | "auxiliaireLignes" | "auxiliaireFace" | "conclusion";

/** Un score par action notée (segment direct, ou les 2 sous-étapes — lignes puis face — d'une
 * construction auxiliaire) — longueur toujours variable selon le nombre d'itérations réellement
 * traversées par cette instance, jamais un ensemble de champs nommés fixes comme les autres
 * générateurs du projet (impossible ici, le nombre d'écrans n'étant pas connu à l'avance). */
/** `revelees`/`niveauxAide` sont parallèles à `scores` (même index = même action notée) — capturés
 * au moment précis où chaque écran se clôt (jamais dérivés du score seul après coup), pour le
 * récapitulatif final coloré (`ResultatPanelSectionPlaneSolide.tsx`, `LigneRecap`/`statutRecap`) :
 * piège documenté CLAUDE.md, "une tentative ratée sans aide reste verte". */
export interface ResultatExerciceSectionPlaneSolide {
  scores: number[];
  scoreMoyen: number;
  revelees: boolean[];
  niveauxAide: number[];
}

export interface EtatSessionSectionPlaneSolide {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceSectionPlaneSolide;
  indexExercice: number;
  exerciceCourant: ExerciceSectionPlaneSolide;
  phase: PhaseSectionPlaneSolide;
  /** Ids des points de section déjà connus — toujours `idsDepart` (P,Q,R) au démarrage d'un
   * exercice, grandit UNIQUEMENT via une construction auxiliaire réussie (jamais via un segment
   * direct, qui ne fait que tracer un segment entre 2 points déjà connus). */
  connus: number[];
  /** Clés `"a-b"` (a<b, voir `cleSegment`) des segments de section déjà tracés. */
  segmentsTraces: string[];
  /** Les 2 identifiants de droite validés à l'étape "auxiliaireLignes" — portés jusqu'à l'étape
   * "auxiliaireFace" du même flux, jamais recalculés indépendamment ; `null` en dehors de ce flux. */
  ligneAuxiliaireChoisie: [string, string] | null;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE — un seul compteur, portant sur l'unité pédagogique COURANTE : remis à 0 à
   * chaque nouveau segment direct, et à chaque nouvelle construction auxiliaire (jamais entre les 2
   * sous-étapes "lignes"/"face" d'une MÊME construction — l'écran B partage ses 2 niveaux d'aide sur
   * l'ensemble du flux, spec section "Écran type B"). 2 niveaux max sur chaque type d'écran, aucune
   * aide sur "conclusion" (pas de bouton du tout, même convention que les autres écrans `max=0` du
   * projet). */
  niveauAide: number;
  /** Scores déjà clos de l'exercice EN COURS — accumulés au fil des itérations, agrégés en
   * `scoreMoyen` seulement à la fermeture du polygone (écran "conclusion"). `revelesAccumules`/
   * `niveauxAideAccumules` sont parallèles (même index), capturés à la clôture de chaque écran —
   * voir `ResultatExerciceSectionPlaneSolide`. */
  scoresAccumules: number[];
  revelesAccumules: boolean[];
  niveauxAideAccumules: number[];
  resultats: ResultatExerciceSectionPlaneSolide[];
  terminee: boolean;
}
