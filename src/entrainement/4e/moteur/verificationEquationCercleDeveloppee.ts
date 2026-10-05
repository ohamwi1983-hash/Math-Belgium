/**
 * Couche B — vérification pour "Centre et rayon d'un cercle depuis l'équation développée".
 *
 * Écrans 1 (regroupement/factorisation du coefficient commun) et 2 (complétion du carré) sont
 * tous deux des reformulations ALGÉBRIQUEMENT IDENTIQUES à l'équation développée de l'exercice
 * (jamais une forme intermédiaire différente à chaque écran) : k(x²+(bx/k)x) + k(y²+(by/k)y) = c
 * et k(x-a)²+k(y-b)² = k·r² s'expandent tous deux exactement en kx²+ky²+bx·x+by·y=c. Les deux
 * écrans réutilisent donc la MÊME cible de comparaison (`k,bx,by,c` de l'exercice, la seule vérité
 * du contrat), via `diagnostiquerEquivalenceQuadratiqueXY` déjà éprouvé et testé pour "Équation
 * d'un cercle (non développée) à partir d'un graphe" (`verificationEquationCercle.ts`,
 * moteur→moteur, réutilisé tel quel plutôt que redéveloppé — voir son en-tête pour la
 * justification mathématique du sondage par ratio). Sondage centré sur le centre RÉEL de
 * l'exercice (toujours connu, contrairement à `verificationEquationCercle.ts` qui reçoit le sien
 * en paramètre séparé) — même choix qu'un point d'échantillonnage bien conditionné.
 *
 * ## Garde structurelle (écrans 1 et 2) — `promptcorrectiongen50gen52verificationstructurelle.md`
 *
 * L'équivalence algébrique seule ne suffit PAS à distinguer une réponse authentiquement regroupée/
 * complétée d'une recopie (même reformulée/réordonnée/mise à l'échelle) de l'équation de départ —
 * les deux sont algébriquement identiques par construction (voir ci-dessus). Une garde structurelle
 * est donc appliquée EN PLUS de `diagnostiquerEquivalenceQuadratiqueXY`, jamais à sa place :
 * `estStructureRegroupementValide`/`estStructureCompletionValide` (ci-dessous) exigent respectivement
 * une somme de 2 groupes parenthésés `coefficient·(...)`, un en x un en y, chacun contenant le carré
 * de sa variable explicitement (`x²`/`y²` nu, pas encore complété) — et une somme de 2 carrés
 * parfaits explicites `coefficient·(variable±p)²`, un en x un en y. Primitives d'analyse d'arbre
 * (`flattenAdditif`, `classifierGroupeRegroupementXY`, `classifierCarreParfaitXY`...) exportées par
 * `verificationEquationCercle.ts` (moteur→moteur, partagées à l'identique par
 * `verificationEquationParaboleDeveloppee.ts`, dont la composition attendue diffère — 1 seul groupe
 * plutôt que 2, voir ce fichier) — voir son en-tête pour la justification complète de cette
 * approche (même principe que `estUnProduitAvecXExplicite`, exercice 1 : exiger la forme demandée,
 * jamais une simple équivalence numérique globale).
 *
 * Écran 3 : centre (statut à 3 valeurs classique, 2 champs numériques indépendants) + rayon (champ
 * de texte libre, parsé symboliquement via `evaluerExpressionGenerale` — module frère, jamais
 * dupliqué, même principe que `verificationUnSansLautre.ts` pour une réponse purement numérique
 * pouvant contenir une racine). Rayon jamais confondu avec r² — le piège central de l'exercice
 * (même principe que `verificationEquationCercle.ts`, écran "rayon"). Cet écran n'a AUCUNE forme
 * intermédiaire à recopier (valeurs numériques finales), donc pas concerné par la garde structurelle.
 */
import type { ExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import type { StatutVerification } from "./statutVerification";
import type { NoeudXY } from "./verificationEquationCercle";
import {
  classifierCarreParfaitXY,
  classifierGroupeRegroupementXY,
  diagnostiquerEquivalenceQuadratiqueXY,
  flattenAdditif,
  parserEquationXY,
} from "./verificationEquationCercle";

/** `kx²+ky²+bx·x+by·y-c` — la référence de vérité PARTAGÉE par les écrans 1 ET 2 (les deux formes
 * intermédiaires sont chacune, par construction, algébriquement identiques à l'équation
 * développée elle-même — voir l'en-tête de fichier). */
function cibleDeveloppee(x: number, y: number, exercice: ExerciceEquationCercleDeveloppee): number {
  const { k, bx, by, c } = exercice;
  return k * x * x + k * y * y + bx * x + by * y - c;
}

/** Vrai si `cote` (un des deux membres de l'équation, gauche OU droite — l'élève peut légitimement
 * écrire la constante en premier) est une somme de 2 groupes coefficient·(...) couvrant chacun une
 * variable différente, avec le carré de cette variable explicitement présent (pas encore complété). */
function estStructureRegroupementValide(cote: NoeudXY): boolean {
  const termes = flattenAdditif(cote);
  if (termes.length !== 2) return false;
  const [c1, c2] = termes.map((t) => classifierGroupeRegroupementXY(t.terme));
  return c1 !== null && c2 !== null && c1 !== c2;
}

/** Même principe que `estStructureRegroupementValide`, mais exige 2 carrés parfaits explicites
 * `coefficient·(variable±p)²` plutôt que 2 groupes non encore complétés. */
function estStructureCompletionValide(cote: NoeudXY): boolean {
  const termes = flattenAdditif(cote);
  if (termes.length !== 2) return false;
  const [c1, c2] = termes.map((t) => classifierCarreParfaitXY(t.terme));
  return c1 !== null && c2 !== null && c1 !== c2;
}

/** Applique `verifieStructure` à n'importe lequel des 2 membres de `texte` — `false` si le texte
 * n'est même pas parseable comme équation à 2 variables (ne devrait jamais arriver ici : appelé
 * uniquement après que `diagnostiquerEquivalenceQuadratiqueXY` a déjà confirmé "correct", qui
 * implique un parsing réussi — défense en profondeur, jamais atteint en usage normal). */
function uneStructureValide(texte: string, verifieStructure: (cote: NoeudXY) => boolean): boolean {
  const equation = parserEquationXY(texte);
  if (!equation) return false;
  return verifieStructure(equation.gauche) || verifieStructure(equation.droite);
}

export function diagnostiquerRegroupement(exercice: ExerciceEquationCercleDeveloppee, texte: string): StatutVerification {
  const { x: x0, y: y0 } = exercice.centre;
  const equivalence = diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => cibleDeveloppee(x, y, exercice));
  if (equivalence !== "correct") return equivalence;
  return uneStructureValide(texte, estStructureRegroupementValide) ? "correct" : "not_equivalent";
}

export function verifierRegroupement(exercice: ExerciceEquationCercleDeveloppee, texte: string): boolean {
  return diagnostiquerRegroupement(exercice, texte) === "correct";
}

export function diagnostiquerCompletionCarre(exercice: ExerciceEquationCercleDeveloppee, texte: string): StatutVerification {
  const { x: x0, y: y0 } = exercice.centre;
  const equivalence = diagnostiquerEquivalenceQuadratiqueXY(texte, x0, y0, (x, y) => cibleDeveloppee(x, y, exercice));
  if (equivalence !== "correct") return equivalence;
  return uneStructureValide(texte, estStructureCompletionValide) ? "correct" : "not_equivalent";
}

export function verifierCompletionCarre(exercice: ExerciceEquationCercleDeveloppee, texte: string): boolean {
  return diagnostiquerCompletionCarre(exercice, texte) === "correct";
}

// ============================================================================
// Écran 3 — centre (2 champs numériques) + rayon (texte libre, parsé symboliquement).
// `statutNumeriqueSimple`/`combinerStatutsSimple` DUPLIQUÉS depuis `verificationEquationCercle.ts`
// plutôt qu'importés — ce module reste volontairement autonome pour cette petite fonction pure,
// même principe que le reste du projet.
// ============================================================================

/** Tolérance UNIQUE pour centre ET rayon = arrondi au centième (`0.01/2`) — harmonisée depuis 2
 * constantes distinctes (`TOLERANCE_CENTRE=0.01` vs `TOLERANCE_RAYON=0.005`) sans justification
 * documentée entre elles (audit de traçabilité de précision). Le centre est toujours entier OU
 * demi-entier par construction (`generateurs/equationCercleDeveloppee/index.ts`, `a = A/2, b = B/2`)
 * — donc toujours une décimale exacte, jamais réellement affecté par la valeur exacte de cette
 * tolérance —, le rayon peut être irrationnel (variante "irrationnel") — c'est la marge qui compte
 * réellement, désormais cohérente pour les deux champs du même écran. */
const TOLERANCE_CENTRE_RAYON = 0.005;

function statutNumeriqueSimple(valeur: number, cible: number, tolerance: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
}

function combinerStatutsSimple(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

export interface ReponseCentre {
  x: number;
  y: number;
}

export function diagnostiquerCentre(exercice: ExerciceEquationCercleDeveloppee, reponse: ReponseCentre): StatutVerification {
  return combinerStatutsSimple(
    statutNumeriqueSimple(reponse.x, exercice.centre.x, TOLERANCE_CENTRE_RAYON),
    statutNumeriqueSimple(reponse.y, exercice.centre.y, TOLERANCE_CENTRE_RAYON),
  );
}

export function verifierCentre(exercice: ExerciceEquationCercleDeveloppee, reponse: ReponseCentre): boolean {
  return diagnostiquerCentre(exercice, reponse) === "correct";
}

/** Toujours le RAYON lui-même (jamais r² — le piège central), parsé symboliquement : accepte aussi
 * bien "2.5" que "sqrt(8.25)" ou "sqrt(33)/2". */
export function diagnostiquerRayon(exercice: ExerciceEquationCercleDeveloppee, texte: string): StatutVerification {
  let valeur: number;
  try {
    valeur = evaluerExpressionGenerale(texte, 0);
  } catch {
    return "parse_error";
  }
  return statutNumeriqueSimple(valeur, exercice.rayon, TOLERANCE_CENTRE_RAYON);
}

export function verifierRayon(exercice: ExerciceEquationCercleDeveloppee, texte: string): boolean {
  return diagnostiquerRayon(exercice, texte) === "correct";
}

/** Regroupe centre + rayon pour l'écran 3, qui combine les deux dans une seule note (même principe
 * que "Forme canonique et transformations" : statut textuel prioritaire en cas de `parse_error`,
 * jamais un simple `&&` booléen qui masquerait cette information — voir CLAUDE.md, "Statut de
 * vérification à 3 valeurs", point 4). Renvoyé en 2 champs séparés (pas fusionné) : l'appelant a
 * besoin de savoir lequel des deux a échoué pour le retour visuel rouge par champ. */
export function diagnostiquerCentreRayon(
  exercice: ExerciceEquationCercleDeveloppee,
  reponseCentre: ReponseCentre,
  texteRayon: string,
): { centre: StatutVerification; rayon: StatutVerification } {
  return {
    centre: diagnostiquerCentre(exercice, reponseCentre),
    rayon: diagnostiquerRayon(exercice, texteRayon),
  };
}

export function verifierCentreRayon(exercice: ExerciceEquationCercleDeveloppee, reponseCentre: ReponseCentre, texteRayon: string): boolean {
  const { centre, rayon } = diagnostiquerCentreRayon(exercice, reponseCentre, texteRayon);
  return centre === "correct" && rayon === "correct";
}
