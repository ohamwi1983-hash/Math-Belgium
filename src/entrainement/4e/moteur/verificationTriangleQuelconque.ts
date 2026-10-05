/**
 * Couche B — vérification pour "Triangle quelconque" (chapitre 3, remplace "Aire d'un triangle
 * quelconque" à la position 19, `promptcreationgenerateur19trianglequelconque.md`). Contrairement à
 * l'ancien exercice, aucune étape "formule"/"substitution" symbolique ici — le prompt de création
 * ne demande qu'UN champ numérique par écran (la donnée manquante, puis l'aire), le raisonnement
 * intermédiaire étant porté par les aides progressives plutôt que par des étapes notées séparément.
 * Réutilise donc directement `diagnostiquerCalculNumeriqueTriangle`/`verifierCalculNumeriqueTriangle`
 * (`verificationTriangle.ts`) pour les deux champs — même tolérance que "Loi des sinus"/"Loi des
 * cosinus"/l'ancienne "Aire", cohérente avec la demande explicite du prompt.
 *
 * `aireDepuisPaire` recalcule directement `½·côté1·côté2·sin(angleCompris)` depuis les champs du
 * triangle plutôt que d'importer `aireTriangle` (`generateurs/triangle/resoudreTriangle.ts`) —
 * `src/moteur/` n'importe jamais depuis `src/generateurs/` (règle non négociable, voir CLAUDE.md),
 * même principe de petite fonction pure dupliquée que `verificationAire.ts::aireDepuisTriangle`.
 *
 * **Système d'unités** (`promptcorrectionsgenerateur19unitesnotation.md`) : une réponse numérique
 * n'est "correct" que si la valeur ET l'unité correspondent toutes deux à `exercice.unite` — jamais
 * la valeur seule. L'unité ne concerne que les LONGUEURS : `diagnostiquerDonneeManquante` l'ignore
 * totalement quand la donnée manquante est un angle (`alKashi`, toujours en degrés, aucun menu
 * déroulant côté présentation) ; `diagnostiquerAire` l'exige en revanche toujours, l'aire étant
 * toujours présente quelle que soit la configuration. Un mauvais choix d'unité (mais une valeur
 * numérique correcte) est un rejet structurel délibéré — `"not_equivalent"`, jamais `"parse_error"`.
 */
import type { ConfigurationTriangleQuelconque, ExerciceTriangleQuelconque, LettreTriangle, UniteLongueur } from "../core/triangleQuelconque.types";
import type { CoteTriangle, SommetTriangle } from "../core/triangle.types";
import type { StatutVerification } from "./statutVerification";
import { diagnostiquerCalculNumeriqueTriangle } from "./verificationTriangle";

function estCote(lettre: LettreTriangle): lettre is CoteTriangle {
  return lettre === "a" || lettre === "b" || lettre === "c";
}

/**
 * Les deux côtés + l'angle compris "directement disponibles" à l'écran 2 selon la configuration —
 * `loiSinus` : `a` (donné), `b` (retrouvé à l'écran 1), `C=180-A-B` (déductible trivialement des
 * deux angles déjà donnés) ; `alKashi` : `b`,`c` (donnés dès le départ), `A` (retrouvé à l'écran 1,
 * angle compris entre `b` et `c`). Mathématiquement, l'aire d'un triangle est invariante quel que
 * soit le couple choisi (`½ab·sinC = ½bc·sinA = ½ac·sinB`) — cette sélection ne pilote donc jamais
 * la valeur numérique attendue (toujours la même quelle que soit la configuration), seulement le
 * texte des aides/consignes (voir `formatTriangleQuelconque.ts`), pour rester cohérente avec les
 * données réellement connues sans calcul supplémentaire à ce stade.
 */
export interface DonneesFormuleAire {
  cote1: CoteTriangle;
  cote2: CoteTriangle;
  angleCompris: SommetTriangle;
}

const DONNEES_FORMULE_AIRE: Record<ConfigurationTriangleQuelconque, DonneesFormuleAire> = {
  loiSinus: { cote1: "a", cote2: "b", angleCompris: "C" },
  alKashi: { cote1: "b", cote2: "c", angleCompris: "A" },
};

export function donneesFormuleAire(exercice: ExerciceTriangleQuelconque): DonneesFormuleAire {
  return DONNEES_FORMULE_AIRE[exercice.configuration];
}

/** Valeur numérique attendue à l'écran 1 — la vraie valeur de la lettre manquante du triangle. */
export function valeurDonneeManquante(exercice: ExerciceTriangleQuelconque): number {
  return exercice.triangle[exercice.donneeManquante];
}

/** `unite` : ignorée (peut être `null`) quand la donnée manquante est un angle — sinon exigée
 * égale à `exercice.unite`. */
export function diagnostiquerDonneeManquante(
  exercice: ExerciceTriangleQuelconque,
  valeur: number,
  unite: UniteLongueur | null,
): StatutVerification {
  const statut = diagnostiquerCalculNumeriqueTriangle(valeur, valeurDonneeManquante(exercice));
  if (statut !== "correct") return statut;
  if (!estCote(exercice.donneeManquante)) return "correct";
  return unite === exercice.unite ? "correct" : "not_equivalent";
}

export function verifierDonneeManquante(exercice: ExerciceTriangleQuelconque, valeur: number, unite: UniteLongueur | null): boolean {
  return diagnostiquerDonneeManquante(exercice, valeur, unite) === "correct";
}

function aireDepuisPaire(exercice: ExerciceTriangleQuelconque): number {
  const { cote1, cote2, angleCompris } = donneesFormuleAire(exercice);
  const { triangle } = exercice;
  return 0.5 * triangle[cote1] * triangle[cote2] * Math.sin((triangle[angleCompris] * Math.PI) / 180);
}

/** Valeur numérique attendue à l'écran 2 — toujours la même quelle que soit la configuration
 * (identité mathématique, voir `DonneesFormuleAire`). */
export function valeurAire(exercice: ExerciceTriangleQuelconque): number {
  return aireDepuisPaire(exercice);
}

/** `unite` toujours exigée (jamais `null`) — l'aire est toujours présente, quelle que soit la
 * configuration, contrairement à la donnée manquante qui peut être un angle sans unité. */
export function diagnostiquerAire(exercice: ExerciceTriangleQuelconque, valeur: number, unite: UniteLongueur): StatutVerification {
  const statut = diagnostiquerCalculNumeriqueTriangle(valeur, valeurAire(exercice));
  if (statut !== "correct") return statut;
  return unite === exercice.unite ? "correct" : "not_equivalent";
}

export function verifierAire(exercice: ExerciceTriangleQuelconque, valeur: number, unite: UniteLongueur): boolean {
  return diagnostiquerAire(exercice, valeur, unite) === "correct";
}
