import type { ExerciceOptimisation, GenerateurExerciceOptimisation, VarianteOptimisation } from "../core/optimisation.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Séquence dépendant de la variante (aiguillage `etat.phase` combiné à `exercice.variante`, même
 * principe que "Paramètres de position", `typesMediane.ts`) — SÉQUENCES DISJOINTES, aucune phase
 * partagée entre "identification"/"contrainteEtGrandeur"/"systeme"/"domaine" (`modelisation`
 * uniquement) — mais "sommet"/"decision"/"interpretation" sont des noms de phase COMMUNS aux 2
 * variantes (le contenu de ces 3 écrans est strictement identique quelle que soit la variante, voir
 * `core/optimisation.types.ts`) :
 * - `"modelisation"` (7 écrans, `prompt-restructuration-architecture-modelisation.md` — remplace une
 *   architecture antérieure à 8 écrans, `contrainte → isolement → construction → domaine → ...`,
 *   avec une exception `rectangleInscrit` qui n'existe plus) : `identification →
 *   contrainteEtGrandeur → systeme → domaine → sommet → decision → interpretation` (terminale) —
 *   IDENTIQUE pour les 4 familles A/B/T/V, y compris `rectangleInscrit` (seul son RAISONNEMENT
 *   diffère à l'écran "contrainteEtGrandeur" — proportion géométrique plutôt que contrainte de
 *   somme — jamais sa séquence d'écrans). "identification" sauté (`phaseInitiale` mène directement à
 *   "contrainteEtGrandeur") quand `exercice.identificationXY` est `undefined` (x/y déjà nommés sans
 *   ambiguïté par certains skins).
 * - `"fonctionDonnee"` (3 écrans) : `sommet → decision → interpretation` (terminale) — fonction ET
 *   domaine déjà fournis, aucune dérivation.
 *
 * **Écran "contrainte"/"isolement" (ancienne architecture) — RETIRÉS de CETTE séquence** — la
 * fonction de vérification sous-jacente `diagnostiquerContrainte` (`moteur/verificationOptimisation.ts`)
 * reste inchangée, réutilisée par `diagnostiquerContrainteEtGrandeur` ci-dessus. Le 57e exercice
 * ("Équations/inéquations du second degré en contexte") réutilise désormais directement CE type-ci
 * (`identification`/`contrainteEtGrandeur`/`systeme`/`domaine`) pour SES PROPRES familles
 * exclusives, via SES PROPRES écrans/état de session (`typesEquationInequationSecondDegre.ts`) —
 * jamais l'ancien type "isolement"/"construction", entièrement retiré. */
export type PhaseOptimisation = "identification" | "contrainteEtGrandeur" | "systeme" | "domaine" | "sommet" | "decision" | "interpretation";

export interface ResultatExerciceOptimisation {
  /** Nécessaire pour que le résumé de session sache quels écrans ont eu lieu pour cet exercice
   * (même principe que `variante` dans `ResultatExerciceMediane`). */
  variante: VarianteOptimisation;
  /** `null` pour `fonctionDonnee` OU quand l'écran "identification" a été sauté pour ce skin (voir
   * `PhaseOptimisation` ci-dessus). */
  scoreIdentification: number | null;
  identificationRevele: boolean;
  niveauAideIdentification: number;
  /** `null` pour `fonctionDonnee` (écran absent de sa séquence). */
  scoreContrainteEtGrandeur: number | null;
  contrainteEtGrandeurRevele: boolean;
  niveauAideContrainteEtGrandeur: number;
  /** `null` pour `fonctionDonnee`. */
  scoreSysteme: number | null;
  systemeRevele: boolean;
  niveauAideSysteme: number;
  /** `null` pour `fonctionDonnee`. */
  scoreDomaine: number | null;
  domaineRevele: boolean;
  niveauAideDomaine: number;
  /** Toujours un `number` — présent sur les 2 variantes. */
  scoreSommet: number;
  sommetRevele: boolean;
  niveauAideSommet: number;
  scoreDecision: number;
  decisionRevele: boolean;
  niveauAideDecision: number;
  scoreInterpretation: number;
  interpretationRevele: boolean;
  niveauAideInterpretation: number;
}

export interface EtatSessionOptimisation {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceOptimisation;
  indexExercice: number;
  exerciceCourant: ExerciceOptimisation;
  phase: PhaseOptimisation;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE par écran (pénalité ADDITIVE -20 points par niveau atteint, appliquée au
   * niveau atteint au moment précis où l'écran se clôt — jamais rétroactivement). */
  niveauAideIdentification: number;
  niveauAideContrainteEtGrandeur: number;
  niveauAideSysteme: number;
  niveauAideDomaine: number;
  niveauAideSommet: number;
  niveauAideDecision: number;
  niveauAideInterpretation: number;
  /** Scores/révélations des écrans déjà clos, conservés jusqu'à la clôture finale de l'exercice. */
  scoreIdentificationExercice: number | null;
  identificationRevele: boolean;
  scoreContrainteEtGrandeurExercice: number | null;
  contrainteEtGrandeurRevele: boolean;
  scoreSystemeExercice: number | null;
  systemeRevele: boolean;
  scoreDomaineExercice: number | null;
  domaineRevele: boolean;
  scoreSommetExercice: number | null;
  sommetRevele: boolean;
  scoreDecisionExercice: number | null;
  decisionRevele: boolean;
  resultats: ResultatExerciceOptimisation[];
  terminee: boolean;
}
