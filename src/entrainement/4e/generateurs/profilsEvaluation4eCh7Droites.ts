/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs « droites » du chapitre 7 de 4e (« Géométrie analytique plane », gen42–gen48).
 * Décisions de l'utilisateur (voir `.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ») :
 * par défaut une évaluation ne tire que des exercices COMPLETS ; un cas particulier ne sort que si
 * le professeur coche la case de la variante (le même dans toutes les séries) ; un VERDICT n'est
 * jamais un cas particulier.
 *
 * Mesures (5 000 tirages par variante, `scratchpad/refonte-4e-ch7a/mesure.txt`) — voir chaque
 * profil. Le cas particulier commun est la droite PARALLÈLE À UN AXE (horizontale y = k ou verticale
 * x = k) : vecteur directeur à une composante nulle, équation, tracé, caractéristiques ou distance
 * se lisent alors sans calcul (raccourci du cours). Les verdicts — forme explicite possible ou non
 * (gen42), relation parallèles / perpendiculaires / aucune (gen45), sécantes / parallèles distinctes
 * / confondues (gen48) — ne sont JAMAIS filtrés : ils deviennent une `forme`, recopiée d'une série à
 * l'autre (même charge de travail), jamais imposée à l'intérieur d'une série.
 *
 * `calcul` : seulement gen46, quand un ANGLE est demandé (angle remarquable 0°, 45°, 90°, 135° →
 * valeur exacte ; pente quelconque → arctan à la calculatrice). Les autres générateurs n'ont que des
 * valeurs exactes (entiers, fractions, radicaux) : `calcul` absent, la calculatrice n'y est jamais un
 * critère de tirage.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { Composantes } from "../core/vecteur.types";
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import type { ExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import type { ExerciceConstructionDroite } from "../core/constructionDroite.types";
import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import type { ExerciceIntersectionDroites } from "../core/intersectionDroites.types";

function paralleleAxe(v: Composantes): boolean {
  return v.x === 0 || v.y === 0;
}

const CAS_AXE = "parallele-axe";

export const LIBELLE_CAS_PARALLELE_AXE = "Inclure un cas particulier (droite parallèle à un axe : horizontale ou verticale)";

/** gen42 — équation d'une droite. Cas particulier : droite parallèle à un axe dont la forme demandée
 * EXISTE (y = p, x = q, ou cartésienne / paramétrique) — mesure : ≈ 50 % des variantes « angle »
 * (angles remarquables 0°, 45°, 90°, 135°), ≈ 6 à 9 % des autres (piège « forme impossible »
 * excepté). Une droite verticale à écrire « y = mx + p » (ou horizontale « x = ny + q ») est le
 * VERDICT « impossible » : jamais un cas, seulement une `forme` (forme demandée + issue). */
export function profilEquationDroite(e: ExerciceEquationDroite): ProfilInstance {
  return {
    casParticulier: e.possible && paralleleAxe(e.vecteur) ? CAS_AXE : null,
    forme: e.possible ? e.formeCible : `${e.formeCible}-impossible`,
  };
}

/** gen43 — lecture graphique. Cas particulier : droite horizontale ou verticale (≈ 25 %). */
export function profilLectureGraphiqueDroite(e: ExerciceLectureGraphiqueDroite): ProfilInstance {
  return { casParticulier: paralleleAxe(e.vecteur) ? CAS_AXE : null };
}

/** gen44 — tracer une droite. Cas particulier : droite parallèle à un axe (≈ 15 %, `PROBABILITE_
 * PARALLELE_AXE`). */
export function profilConstructionDroite(e: ExerciceConstructionDroite): ProfilInstance {
  return { casParticulier: paralleleAxe(e.vecteur) ? CAS_AXE : null };
}

/** gen45 — relations entre droites. Cas particulier : droite de référence parallèle à un axe
 * (≈ 20 %) — la parallèle ou la perpendiculaire s'écrit alors immédiatement. Reconnaissance : la
 * relation trouvée (parallèles / perpendiculaires / aucune) est un verdict → `forme`. */
export function profilRelationsDroites(e: ExerciceRelationsDroites): ProfilInstance {
  return {
    casParticulier: paralleleAxe(e.vecteurReference) ? CAS_AXE : null,
    forme: e.famille === "reconnaissance" ? (e.relation ?? undefined) : undefined,
  };
}

/** gen46 — caractéristiques d'une droite. Cas particulier : droite horizontale ou verticale
 * (≈ 20 %, angles 0° et 90°). `forme` : caractéristique demandée (pente, angle avec Ox, angle avec
 * Oy — tirée au hasard dans chaque variante). `calcul` : angle demandé d'une droite à pente
 * quelconque → calculatrice (arctan) ; angle remarquable → exacte ; pente demandée → sans objet. */
export function profilCaracteristiquesDroite(e: ExerciceCaracteristiquesDroite): ProfilInstance {
  const angleDemande = e.caracteristiqueDemandee !== "pente";
  const remarquable = Number.isInteger(e.angleDeg);
  return {
    casParticulier: paralleleAxe(e.vecteur) ? CAS_AXE : null,
    forme: e.caracteristiqueDemandee,
    calcul: angleDemande ? (remarquable ? "exacte" : "calculatrice") : undefined,
  };
}

/** gen47 — distance d'un point à une droite / entre deux parallèles. Cas particulier : droite(s)
 * horizontale(s) ou verticale(s) (≈ 20 %, `PROBABILITE_DROITE_AXIALE`) — la distance est alors
 * l'écart des abscisses ou des ordonnées (raccourci du cours). */
export function profilDistanceDroite(e: ExerciceDistanceDroite): ProfilInstance {
  return { casParticulier: paralleleAxe(e.vecteurNormal) ? CAS_AXE : null };
}

/** gen48 — intersection de deux droites. Aucun raccourci mesuré (vecteurs directeurs toujours à deux
 * composantes non nulles). La conclusion (sécantes / parallèles distinctes / confondues) est un
 * verdict → `forme` seulement. */
export function profilIntersectionDroites(e: ExerciceIntersectionDroites): ProfilInstance {
  return { casParticulier: null, forme: e.conclusion };
}
