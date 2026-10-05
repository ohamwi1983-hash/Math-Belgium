import type { Arcfonction, PointCercleTrig, Trigfonction } from "./cyclometrique.types";

/**
 * Couche core (6e) — contrat pour `6gen2` ("Valeurs cyclométriques : existence et calcul",
 * REFONTE TOTALE — chapitre 1). 3 variantes structurellement différentes, fusionnées dans un seul
 * ÉCRAN (jamais affichées séparément à l'élève) — union discriminée, jamais un seul type à champs
 * `| null` génériques. Chaque variante expose néanmoins la même paire `existe`/`valeurLatex`+
 * `valeurNumerique` (`null` ssi `!existe`), consommée UNIFORMÉMENT par la Couche B
 * (`moteur6e/verificationFonctionsCyclometriques.ts`) — c'est ce qui permet un écran unique
 * générique quelle que soit la variante réellement tirée.
 */
export type VarianteFonctionsCyclometriques = "directe" | "arcTrig" | "trigArc";

/** 2 causes d'inexistence INDÉPENDANTES pour la variante "trigArc" (trigfonction(arcfonction(n))) —
 * jamais l'une sans l'autre dans le générateur, voir `generateurs6e/fonctionsCyclometriques/index.ts` :
 * - "horsDomaine" : le nombre de départ n'est pas dans le domaine de l'arcfonction (arcsin/arccos
 *   seulement — [-1;1] — arctan est toujours définie sur ℝ, ne peut jamais déclencher cette cause).
 * - "anglePiSur2" : PROPRE à tan∘arccos et tan∘arcsin — le nombre de départ est pourtant valide,
 *   mais l'angle intermédiaire arcfonction(nombre) vaut exactement ±π/2, où tan est indéfinie.
 *   sin∘arcfonction / cos∘arcfonction n'ont JAMAIS cette cause (sin/cos définis pour tout réel). */
export type CauseInexistenceTrigArc = "horsDomaine" | "anglePiSur2";

/** Variante 1 — lecture directe, arcfonction(nombre) = valeur. Le nombre est TOUJOURS dans le
 * domaine de l'arcfonction par construction (tiré de sa propre banque remarquable) — jamais de
 * cas "n'existe pas" pour cette variante (`existe` figé à `true`, jamais un simple `boolean`, pour
 * documenter cette garantie dans le TYPE lui-même). */
export interface ExerciceCycloDirecte {
  variante: "directe";
  arcfonction: Arcfonction;
  nombreLatex: string;
  nombreNumerique: number;
  existe: true;
  valeurLatex: string;
  valeurNumerique: number;
}

/** Variante 2 — composite arcfonction(trigfonction(θ)) : `θ` est DONNÉ (l'énoncé), le calcul
 * intermédiaire trigfonction(θ) n'est JAMAIS montré ni noté séparément (un seul écran, une seule
 * réponse finale). `existe=false` ssi `arcfonction∈{arcsin,arccos}` et la valeur intermédiaire
 * sort de `[-1;1]` — possible seulement si `trigfonction==="tan"` (sin/cos toujours bornés). */
export interface ExerciceCycloArcTrig {
  variante: "arcTrig";
  arcfonction: Arcfonction;
  trigfonction: Trigfonction;
  theta: PointCercleTrig;
  existe: boolean;
  /** `null` ssi `!existe`. */
  valeurLatex: string | null;
  valeurNumerique: number | null;
}

/** Variante 3 — composite trigfonction(arcfonction(nombre)) : `nombre` est DONNÉ (l'énoncé),
 * l'angle intermédiaire arcfonction(nombre) n'est JAMAIS montré ni noté séparément. NOUVEAUTÉ
 * CENTRALE du spec : 2 causes d'inexistence INDÉPENDANTES, voir `CauseInexistenceTrigArc`. */
export interface ExerciceCycloTrigArc {
  variante: "trigArc";
  trigfonction: Trigfonction;
  arcfonction: Arcfonction;
  nombreLatex: string;
  nombreNumerique: number;
  existe: boolean;
  /** `null` ssi `existe`. */
  causeInexistence: CauseInexistenceTrigArc | null;
  /** `null` ssi `!existe`. */
  valeurLatex: string | null;
  valeurNumerique: number | null;
}

export type ExerciceFonctionsCyclometriques = ExerciceCycloDirecte | ExerciceCycloArcTrig | ExerciceCycloTrigArc;

export type GenerateurExerciceFonctionsCyclometriques = () => ExerciceFonctionsCyclometriques;
