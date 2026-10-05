/**
 * Couche B — vérification de "Lieux géométriques : intersection", REFONTE COMPLÈTE
 * (`promptgen54refontecomplete.md`) sur 3 écrans communs aux 3 grandes variantes.
 *
 * **Écran 1 — Identification** : pour chacun des 2 lieux, un choix catégoriel (droite/cercle/
 * parabole) PUIS des champs numériques adaptés au choix — jamais de saisie libre, donc jamais de
 * `parse_error` sur le choix lui-même (uniquement possible sur un champ numérique non fini, ex.
 * NaN). Un choix de type erroné rend l'écran `not_equivalent` directement, sans même comparer les
 * champs (qui décrivent alors la forme choisie, pas celle du lieu réel).
 *
 * **Écran 2 — Équations** : 2 champs de texte libre, un par lieu, vérifiés par équivalence
 * algébrique en RÉUTILISANT DIRECTEMENT les moteurs déjà en place pour chaque type de lieu — jamais
 * redéveloppés : `diagnostiquerEquationDroiteLibre` (`verificationDroite.ts`), `diagnostiquerEquationCercle`
 * (`verificationEquationCercle.ts`), `diagnostiquerEquation` (`verificationEquationParabole.ts`, en
 * construisant un `ExerciceEquationParabole` minimal depuis le `LieuParabole` — le sommet n'est pas
 * stocké sur `LieuParabole`, dérivé ici via la même convention signée que `p`).
 *
 * **Écran 3 — Résolution** : choix catégoriel "Aucun"/"Au moins un" puis, si "Au moins un", les
 * points d'intersection en saisie add-as-needed — vérifiés par correspondance à l'ENSEMBLE réel des
 * points de l'exercice (`exercice.points`, référence fixée à la génération — la géométrie de cet
 * exercice n'a AUCUNE "cohérence interne" à la `verificationConstructionParabole.ts`, tout est figé
 * d'avance), ORDRE INDIFFÉRENT entre les 2 points du cas "2 points" (rien dans l'énoncé ne
 * distingue un "premier" et un "second" point) : essaie les 2 appariements possibles et retient le
 * meilleur, jamais un ordre imposé arbitrairement. Soumettre deux fois le même point (le piège
 * explicite du prompt, "ne trouver qu'une seule racine au lieu de deux") ne peut jamais valider les
 * 2 champs simultanément, quel que soit l'appariement essayé, puisque les 2 points réels sont
 * garantis distincts par construction (`verifierPointsFinisDistincts`,
 * `generateurs/lieuxGeometriques/index.test.ts`).
 */
import type { DroiteImplicite } from "../core/droite.types";
import type { ExerciceEquationParabole } from "../core/equationParabole.types";
import type { ExerciceLieuxGeometriques, Lieu, LieuDroite, LieuParabole, NombrePointsIntersection } from "../core/lieuxGeometriques.types";
import type { Point } from "../core/vecteur.types";
import type { StatutVerification } from "./statutVerification";
import { diagnostiquerEquationDroiteLibre, combinerStatuts, statutNumerique } from "./verificationDroite";
import { diagnostiquerEquationCercle } from "./verificationEquationCercle";
import { diagnostiquerEquation as diagnostiquerEquationParabole } from "./verificationEquationParabole";

// ============================================================================
// Écran 1 — Identification (choix catégoriel + champs numériques adaptés)
// ============================================================================

export type ReponseIdentificationLieu =
  | { type: "droite"; m: number; p: number }
  | { type: "cercle"; x0: number; y0: number; rayon: number }
  | { type: "parabole"; xF: number; yF: number; p: number };

/** Un choix de type erroné rend l'écran `not_equivalent` sans même regarder les champs — ils
 * décrivent alors la forme CHOISIE, pas le lieu réel, donc rien de sensé à comparer. */
export function diagnostiquerIdentificationLieu(lieu: Lieu, reponse: ReponseIdentificationLieu): StatutVerification {
  if (reponse.type !== lieu.type) return "not_equivalent";
  if (lieu.type === "droite" && reponse.type === "droite") {
    return combinerStatuts(statutNumerique(reponse.m, lieu.m), statutNumerique(reponse.p, lieu.p));
  }
  if (lieu.type === "cercle" && reponse.type === "cercle") {
    return combinerStatuts(statutNumerique(reponse.x0, lieu.centre.x), statutNumerique(reponse.y0, lieu.centre.y), statutNumerique(reponse.rayon, lieu.rayon));
  }
  if (lieu.type === "parabole" && reponse.type === "parabole") {
    return combinerStatuts(statutNumerique(reponse.xF, lieu.foyer.x), statutNumerique(reponse.yF, lieu.foyer.y), statutNumerique(reponse.p, lieu.p));
  }
  /* istanbul ignore next -- inatteignable : les 3 branches ci-dessus couvrent les 3 seuls types de Lieu */
  return "not_equivalent";
}

export interface ReponseIdentification {
  lieu1: ReponseIdentificationLieu;
  lieu2: ReponseIdentificationLieu;
}

/** Vérification PAR ENSEMBLE, pas par position fixe (`promptgen53gen54corrections.md`, B.4) —
 * l'élève n'a aucune raison de savoir lequel des 2 blocs de saisie doit recevoir la description du
 * "premier" ou du "second" lieu de l'énoncé (l'énoncé lui-même ne distingue d'ailleurs plus les 2
 * lieux par un rang, voir B.1) : essaie les 2 appariements possibles (direct et échangé) et retient
 * celui qui valide les 2 blocs simultanément — jamais un ordre imposé arbitrairement. Même principe
 * que `statutEnsemblePoints` (écran "résolution", ci-dessous).
 */
export function diagnostiquerIdentification(exercice: ExerciceLieuxGeometriques, reponse: ReponseIdentification): StatutVerification {
  const direct = combinerStatuts(diagnostiquerIdentificationLieu(exercice.lieu1, reponse.lieu1), diagnostiquerIdentificationLieu(exercice.lieu2, reponse.lieu2));
  if (direct === "correct") return direct;
  const echange = combinerStatuts(diagnostiquerIdentificationLieu(exercice.lieu2, reponse.lieu1), diagnostiquerIdentificationLieu(exercice.lieu1, reponse.lieu2));
  if (echange === "correct") return echange;
  if (direct === "parse_error" || echange === "parse_error") return "parse_error";
  return "not_equivalent";
}

export function verifierIdentification(exercice: ExerciceLieuxGeometriques, reponse: ReponseIdentification): boolean {
  return diagnostiquerIdentification(exercice, reponse) === "correct";
}

// ============================================================================
// Écran 2 — Équations (texte libre, réutilise les moteurs existants sans redévelopper)
// ============================================================================

/** `y=mx+p` ⟺ `m·x-y+p=0` — même formule que `impliciteDepuisLieuDroite`
 * (`generateurs/lieuxGeometriques/geometrieConique.ts`), DUPLIQUÉE ici côté Couche B (règle
 * d'architecture non négociable, `src/moteur/` n'importe jamais `src/generateurs/`), même principe
 * que `pointDepuisImpliciteDroite` déjà dupliquée dans ce même fichier frère `verificationDroite.ts`. */
function impliciteDepuisLieuDroiteMoteur(droite: LieuDroite): DroiteImplicite {
  return { a: droite.m, b: -1, c: droite.p };
}

/** `LieuParabole` ne stocke pas le sommet (seulement foyer/directrice/p) — dérivé ici via la MÊME
 * convention signée que `ExerciceEquationParabole.p` (`core/equationParabole.types.ts`) :
 * `sommetAxis = foyerAxis - p/2`. Construit un `ExerciceEquationParabole` minimal pour réutiliser
 * `diagnostiquerEquation` (`verificationEquationParabole.ts`) tel quel, jamais une seconde
 * implémentation de la cible quadratique de la parabole. */
function exerciceEquationParaboleDepuisLieu(parabole: LieuParabole): ExerciceEquationParabole {
  const sommet: Point =
    parabole.orientation === "vertical"
      ? { x: parabole.foyer.x, y: parabole.foyer.y - parabole.p / 2 }
      : { x: parabole.foyer.x - parabole.p / 2, y: parabole.foyer.y };
  return { variante: parabole.orientation, sommet, foyer: parabole.foyer, p: parabole.p };
}

export function diagnostiquerEquationLieu(lieu: Lieu, texte: string): StatutVerification {
  switch (lieu.type) {
    case "droite":
      return diagnostiquerEquationDroiteLibre(texte, impliciteDepuisLieuDroiteMoteur(lieu));
    case "cercle":
      return diagnostiquerEquationCercle(texte, lieu.centre.x, lieu.centre.y, lieu.rayon * lieu.rayon);
    case "parabole":
      return diagnostiquerEquationParabole(exerciceEquationParaboleDepuisLieu(lieu), texte);
  }
}

export interface ReponseEquations {
  texteLieu1: string;
  texteLieu2: string;
}

export function diagnostiquerEquations(exercice: ExerciceLieuxGeometriques, reponse: ReponseEquations): StatutVerification {
  return combinerStatuts(diagnostiquerEquationLieu(exercice.lieu1, reponse.texteLieu1), diagnostiquerEquationLieu(exercice.lieu2, reponse.texteLieu2));
}

export function verifierEquations(exercice: ExerciceLieuxGeometriques, reponse: ReponseEquations): boolean {
  return diagnostiquerEquations(exercice, reponse) === "correct";
}

// ============================================================================
// Écran 3 — Résolution (catégorie "Aucun"/"Au moins un" + ensemble de points add-as-needed)
// ============================================================================

export interface ReponseResolutionLieuxGeometriques {
  auMoinsUn: boolean;
  /** Ignoré si `auMoinsUn===false` (aucun champ affiché côté écran dans ce cas). */
  points: Point[];
}

function statutPoint(point: Point, cible: Point): StatutVerification {
  return combinerStatuts(statutNumerique(point.x, cible.x), statutNumerique(point.y, cible.y));
}

/** Choix catégoriel — jamais `parse_error`, un simple bouton. */
function statutCategorieResolution(exercice: ExerciceLieuxGeometriques, auMoinsUn: boolean): StatutVerification {
  return auMoinsUn === (exercice.nombrePoints !== 0) ? "correct" : "not_equivalent";
}

/** Vérifie que l'ENSEMBLE des points soumis correspond EXACTEMENT à l'ensemble réel — ni en trop ni
 * manquant, ORDRE INDIFFÉRENT (au plus 2 points, donc au plus 2 appariements à essayer). */
function statutEnsemblePoints(soumis: Point[], reels: Point[]): StatutVerification {
  if (soumis.length !== reels.length) return "not_equivalent";
  if (reels.length === 0) return "correct";
  if (reels.length === 1) return statutPoint(soumis[0]!, reels[0]!);
  const direct = combinerStatuts(statutPoint(soumis[0]!, reels[0]!), statutPoint(soumis[1]!, reels[1]!));
  if (direct === "correct") return direct;
  const inverse = combinerStatuts(statutPoint(soumis[0]!, reels[1]!), statutPoint(soumis[1]!, reels[0]!));
  if (inverse === "correct") return inverse;
  if (direct === "parse_error" || inverse === "parse_error") return "parse_error";
  return "not_equivalent";
}

export function diagnostiquerResolution(exercice: ExerciceLieuxGeometriques, reponse: ReponseResolutionLieuxGeometriques): StatutVerification {
  const statutCategorie = statutCategorieResolution(exercice, reponse.auMoinsUn);
  if (exercice.nombrePoints === 0 || statutCategorie !== "correct") return statutCategorie;
  return combinerStatuts(statutCategorie, statutEnsemblePoints(reponse.points, exercice.points));
}

export function verifierResolution(exercice: ExerciceLieuxGeometriques, reponse: ReponseResolutionLieuxGeometriques): boolean {
  return diagnostiquerResolution(exercice, reponse) === "correct";
}

export type { NombrePointsIntersection };
