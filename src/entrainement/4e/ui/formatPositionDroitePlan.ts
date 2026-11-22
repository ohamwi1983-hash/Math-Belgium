import type { CandidatSecantePositionDroitePlan, ConclusionPositionDroitePlan, ExercicePositionDroitePlan, ReponseJustificationPositionDroitePlan } from "../core/positionDroitePlan.types";
import type { Point3D } from "../core/geometrieEspace.types";
import { distance3D, EPSILON_3D, intersectionDeuxDroites3D, pointAppartientAuPlan, pointSurSegmentOuvert, points3Colineaires, sontParalleles3D, soustraire3D } from "../moteur/geometrieEspace";
import {
  pointsFigureDansLePlan,
  positionPointNomme,
  verifierReponseParallele,
  verifierReponseSecante,
} from "../moteur/verificationPositionDroitePlan";

/**
 * Présentation — "Position d'une droite par rapport à un plan". Terminologie interdite dans tout
 * texte affiché à l'élève : "critère de colinéarité", "produit scalaire" (le calcul interne peut les utiliser
 * mathématiquement — `moteur/geometrieEspace.ts` — mais jamais nommés ainsi ici).
 */

export const LIBELLE_CLASSIFICATION: Record<ConclusionPositionDroitePlan, string> = {
  incluse: "Incluse dans le plan",
  parallele: "Parallèle au plan",
  secante: "Sécante au plan",
};

export function libelleClassification(classification: ConclusionPositionDroitePlan): string {
  return LIBELLE_CLASSIFICATION[classification];
}

export function libelleDroite(exercice: ExercicePositionDroitePlan): string {
  return `(${exercice.droite[0]}${exercice.droite[1]})`;
}

export function libellePlan(exercice: ExercicePositionDroitePlan): string {
  return `(${exercice.plan[0]}${exercice.plan[1]}${exercice.plan[2]})`;
}

/** Définition des milieux nommés, ex. « I est le milieu de [EF]. » — vide s'il n'y en a pas. */
export function textePointsNommes(exercice: ExercicePositionDroitePlan): string {
  return exercice.pointsNommes.map((p) => `${p.nom} est le milieu de [${p.milieuDe[0]}${p.milieuDe[1]}].`).join(" ");
}

/** Phrase de position complète, ex. « la droite (IG) est sécante au plan (BCF) ». */
export function phrasePosition(exercice: ExercicePositionDroitePlan): string {
  return `la droite ${libelleDroite(exercice)} est ${LIBELLE_CLASSIFICATION[exercice.classification].toLowerCase()} ${libellePlan(exercice)}`;
}

export function libelleCandidatSecante(candidat: CandidatSecantePositionDroitePlan): string {
  if (candidat.type === "sommet") return `le sommet ${candidat.nom}`;
  if (candidat.type === "point") return `le point ${candidat.nom}`;
  return candidat.label;
}

// --- Écran 1 : Classification --------------------------------------------------------------------

export const TEXTE_AIDE_CLASSIFICATION_NIVEAU1 =
  "Rappel de la méthode : (1) les 2 points de la droite appartiennent-ils tous les deux au plan ? " +
  "Si oui → incluse. (2) Sinon, la droite est-elle parallèle à une arête ou une diagonale du plan ? " +
  "Si oui → parallèle. (3) Sinon → sécante.";

/** Aide 2 : la méthode APPLIQUÉE à la figure, sans trancher (audit chapitre 8) — avant, elle disait
 * si chaque point de la droite était dans le plan, ce qui donnait la réponse dans 2 cas sur 3. */
export function texteAideClassificationNiveau2(exercice: ExercicePositionDroitePlan): string {
  return (
    `Le plan ${libellePlan(exercice)} est la surface colorée : il contient d'autres points que les 3 lettres de son nom, ` +
    `et il se prolonge au-delà du solide. Repère tous les sommets et points nommés qui sont dedans, puis regarde où sont ` +
    `${exercice.droite[0]} et ${exercice.droite[1]}. S'ils ne sont pas tous les deux dans le plan, compare la direction de la droite ` +
    `${libelleDroite(exercice)} à celles des arêtes et des diagonales du plan.`
  );
}

/** Appartenance de chaque point de la droite au plan — utilisée par la CORRECTION exportée (jamais
 * comme aide à l'écran, voir `texteAideClassificationNiveau2`). */
export function texteFaitsAppartenance(exercice: ExercicePositionDroitePlan): string {
  const planPoints = exercice.plan.map((nom) => exercice.solide.sommets[nom]) as [
    (typeof exercice.solide.sommets)[string],
    (typeof exercice.solide.sommets)[string],
    (typeof exercice.solide.sommets)[string],
  ];
  return exercice.droite
    .map((nom) => `Le point ${nom} ${pointAppartientAuPlan(positionPointNomme(exercice, nom)!, planPoints) ? "appartient" : "n'appartient pas"} au plan ${libellePlan(exercice)}.`)
    .join(" ");
}

// --- Écran 2 : Justification structurée -----------------------------------------------------------

export const TEXTE_AIDE_JUSTIFICATION: Record<ConclusionPositionDroitePlan, string> = {
  incluse:
    "Un plan contient bien plus que les 3 points de son nom : toutes les arêtes de la figure qui sont dans ce plan y sont entières, avec leurs extrémités et leurs milieux.",
  parallele: "Une droite est parallèle à un plan si elle est parallèle à une droite de ce plan (une arête ou une diagonale).",
  secante:
    "Une droite sécante à un plan le traverse en un seul point — ici, il tombe sur un sommet, sur un point nommé, ou à l'intérieur d'une arête ou d'une diagonale.",
};

export function texteAideJustification(classification: ConclusionPositionDroitePlan): string {
  return TEXTE_AIDE_JUSTIFICATION[classification];
}

export function consigneJustification(exercice: ExercicePositionDroitePlan): string {
  if (exercice.classification === "incluse") return `Sélectionne tous les points nommés de la figure qui appartiennent au plan ${libellePlan(exercice)}.`;
  // « parallèle à », comme le cours (§ 4, § 7) — plus « même direction que » (audit 4e ch. 8, imprécision 12).
  if (exercice.classification === "parallele") return `Sélectionne l'arête ou la diagonale du plan ${libellePlan(exercice)} qui est parallèle à la droite ${libelleDroite(exercice)}.`;
  return `Où la droite ${libelleDroite(exercice)} perce-t-elle le plan ${libellePlan(exercice)} ?`;
}

/** Réponse attendue de l'écran 2 — toujours dérivée de `exercice` : pour "incluse", la liste des
 * points de la figure dans le plan ; pour "parallele"/"secante", le candidat dont l'index vérifie
 * réellement la vérification géométrique (l'ordre des candidats est mélangé). */
export function texteReponseJustificationAttendue(exercice: ExercicePositionDroitePlan): string {
  if (exercice.classification === "incluse") {
    return pointsFigureDansLePlan(exercice).join(", ");
  }
  if (exercice.classification === "parallele") {
    const index = exercice.candidatsParallele.findIndex((_, i) => verifierReponseParallele(exercice, i));
    return index >= 0 ? exercice.candidatsParallele[index].label : "";
  }
  const index = exercice.candidatsSecante.findIndex((_, i) => verifierReponseSecante(exercice, i));
  return index >= 0 ? libelleCandidatSecante(exercice.candidatsSecante[index]) : "";
}

/** Le segment du plan parallèle à la droite (cas « parallèle »), celui que vérifie l'écran. */
export function segmentParalleleAttendu(exercice: ExercicePositionDroitePlan): [string, string] | null {
  const index = exercice.candidatsParallele.findIndex((_, i) => verifierReponseParallele(exercice, i));
  return index >= 0 ? exercice.candidatsParallele[index].sommets : null;
}

/** Index du candidat juste de l'écran 2 (parallèle / sécante), `null` pour « incluse ». */
export function indexCandidatJuste(exercice: ExercicePositionDroitePlan): number | null {
  if (exercice.classification === "parallele") return exercice.candidatsParallele.findIndex((_, i) => verifierReponseParallele(exercice, i));
  if (exercice.classification === "secante") return exercice.candidatsSecante.findIndex((_, i) => verifierReponseSecante(exercice, i));
  return null;
}

// --- Écran 2 : aide de niveau 2 et messages ciblés (audit 4e ch. 8, lot B) -------------------------

function pointsDuPlanNomme(e: ExercicePositionDroitePlan): [Point3D, Point3D, Point3D] {
  return e.plan.map((n) => e.solide.sommets[n]) as [Point3D, Point3D, Point3D];
}

function dansLePlan(e: ExercicePositionDroitePlan, nom: string): boolean {
  return pointAppartientAuPlan(positionPointNomme(e, nom)!, pointsDuPlanNomme(e));
}

function extremites(e: ExercicePositionDroitePlan): [Point3D, Point3D] {
  return [positionPointNomme(e, e.droite[0])!, positionPointNomme(e, e.droite[1])!];
}

/** Faces du solide qui contiennent la droite (ses deux points). */
function facesContenantLaDroite(e: ExercicePositionDroitePlan): string[][] {
  const [a, b] = extremites(e);
  return e.solide.faces.filter((face) => {
    const pts = face.slice(0, 3).map((n) => e.solide.sommets[n]) as [Point3D, Point3D, Point3D];
    return pointAppartientAuPlan(a, pts) && pointAppartientAuPlan(b, pts);
  });
}

/** Segment dont un point nommé est le milieu (« I est le milieu de [EF] »), `null` pour un sommet. */
function milieuDe(e: ExercicePositionDroitePlan, nom: string): [string, string] | null {
  return e.pointsNommes.find((p) => p.nom === nom)?.milieuDe ?? null;
}

/** Aide 2 de l'écran « justification » : la méthode POSÉE pour l'instance (jamais la réponse). */
export function texteAideJustificationNiveau2(e: ExercicePositionDroitePlan): string {
  const pl = libellePlan(e);
  const d = libelleDroite(e);
  const [x, y] = e.droite;
  if (e.classification === "incluse") {
    const n = pointsFigureDansLePlan(e).length;
    const parcours = `Passe en revue chaque point nommé de la figure : est-il un sommet de la surface colorée, ou le milieu d'une de ses arêtes ? Le plan ${pl} se prolonge au-delà de la surface colorée.`;
    return n > 3 ? `Le plan ${pl} contient ${n} points nommés de la figure, dont ${e.plan.join(", ")}. ${parcours}` : parcours;
  }
  if (e.classification === "parallele") {
    const mx = milieuDe(e, x);
    const my = milieuDe(e, y);
    if (mx && my) {
      return `${x} est le milieu de [${mx.join("")}] et ${y} celui de [${my.join("")}] : repère la figure plane qui les contient (un triangle dont ${d} est une droite des milieux, ou un parallélogramme dont ce sont les milieux de deux côtés opposés). Elle donne une droite parallèle à ${d} ; cherche celle qui est dans le plan ${pl}.`;
    }
    return `Cherche un parallélogramme de la figure (une face, ou un rectangle qui traverse le solide) dont [${x}${y}] est un côté : son côté opposé est parallèle à ${d}. Il doit être dans le plan ${pl}.`;
  }
  const faces = facesContenantLaDroite(e);
  if (faces.length > 0) {
    return `La droite ${d} est dans la face (${faces[0]!.join("")}) : le point de percée est donc sur la droite commune à cette face et au plan ${pl}. Repère les points du plan ${pl} qui sont sur cette face.`;
  }
  return `Le point de percée est à la fois sur la droite ${d}, prolongée si besoin, et dans le plan ${pl}. Pour chaque proposition, vérifie d'abord qu'elle peut être sur ${d} : un sommet aligné avec ${x} et ${y}, ou une arête que ${d} rencontre vraiment (pas seulement sur le dessin).`;
}

/** Message d'un choix de position faux (écran 1, une tentative) — il explique le choix, sans donner
 * la justification attendue à l'écran 2. */
export function messageClassificationFausse(e: ExercicePositionDroitePlan, choisi: ConclusionPositionDroitePlan): string {
  const pl = libellePlan(e);
  const d = libelleDroite(e);
  const [x, y] = e.droite;
  const hors = e.droite.find((n) => !dansLePlan(e, n)) ?? x;
  const tete = "Ce n'était pas le bon choix : ";
  if (e.classification === "incluse") return `${tete}${x} et ${y} sont tous les deux dans le plan ${pl}, donc toute la droite ${d} y est incluse (on ne la dit alors ni parallèle ni sécante).`;
  if (choisi === "incluse") return `${tete}${hors} n'est pas dans le plan ${pl}. Une droite incluse a ses deux points dans le plan.`;
  if (e.classification === "parallele") return `${tete}la droite ${d} est parallèle à une droite du plan ${pl} : elle ne le rencontre jamais, même prolongée. Un croisement de traits sur le dessin n'est pas un point commun.`;
  return `${tete}aucune droite du plan ${pl} n'est parallèle à ${d} : la droite perce le plan en un seul point.`;
}

/** Message d'une justification fausse (choix parmi des candidats, une tentative). */
export function messageJustificationFausse(e: ExercicePositionDroitePlan, reponse: ReponseJustificationPositionDroitePlan): string | null {
  const pl = libellePlan(e);
  const d = libelleDroite(e);
  const [a, b] = extremites(e);
  if (reponse.type === "parallele") {
    const c = e.candidatsParallele[reponse.indexCandidat];
    if (!c) return null;
    const [p, q] = c.sommets.map((n) => e.solide.sommets[n]) as [Point3D, Point3D];
    const nom = `(${c.sommets.join("")})`;
    const secantes = intersectionDeuxDroites3D([a, b], [p, q]) !== null;
    return `Ce n'était pas la bonne droite : ${nom} n'est pas parallèle à ${d}. ${secantes ? "Ces deux droites se coupent (elles sont dans un même plan sans être parallèles)." : "Ces deux droites sont gauches : aucun plan ne les contient toutes les deux, même si leurs traits semblent se croiser sur le dessin."}`;
  }
  if (reponse.type === "secante") {
    const c = e.candidatsSecante[reponse.indexCandidat];
    if (!c) return null;
    const tete = "Ce n'est pas le point de percée : ";
    if (c.type === "sommet" || c.type === "point") {
      const s = positionPointNomme(e, c.nom)!;
      if (points3Colineaires(a, b, s)) return `${tete}${c.nom} est bien sur la droite ${d}, mais il n'est pas dans le plan ${pl}.`;
      if (pointAppartientAuPlan(s, pointsDuPlanNomme(e))) return `${tete}${c.nom} est dans le plan ${pl}, mais pas sur la droite ${d}. Le point de percée est sur les deux.`;
      return `${tete}${c.nom} n'est ni sur la droite ${d} ni dans le plan ${pl}.`;
    }
    const [p, q] = c.sommets.map((n) => e.solide.sommets[n]) as [Point3D, Point3D];
    const seg = `[${c.sommets.join("")}]`;
    const droiteSeg = `(${c.sommets.join("")})`;
    if (sontParalleles3D(soustraire3D(b, a), soustraire3D(q, p))) return `${tete}la droite ${d} est parallèle à ${droiteSeg} : elle ne rencontre pas ${seg}.`;
    const x = intersectionDeuxDroites3D([a, b], [p, q]);
    if (!x) return `${tete}la droite ${d} ne rencontre pas ${seg} : sur le dessin leurs traits se croisent peut-être, mais ces deux droites sont gauches.`;
    const bout = c.sommets.find((n) => distance3D(e.solide.sommets[n], x) < EPSILON_3D);
    if (bout) return `${tete}la droite ${d} passe par ${bout}, extrémité de ${seg}, mais ${bout} n'est pas dans le plan ${pl}.`;
    if (!pointSurSegmentOuvert(x, p, q)) return `${tete}la droite ${d} coupe la droite ${droiteSeg} en dehors du segment ${seg}.`;
    return `${tete}la droite ${d} rencontre bien ${seg}, mais en un point qui n'est pas dans le plan ${pl}.`;
  }
  return null;
}

/** Message ciblé d'une sélection « incluse » fausse (trois tentatives) — sans dire quels points. */
export function cibleSelectionIncluse(e: ExercicePositionDroitePlan, points: string[]): string {
  const attendus = pointsFigureDansLePlan(e);
  if (points.some((n) => !attendus.includes(n))) return `Au moins un des points choisis n'est pas dans le plan ${libellePlan(e)}.`;
  return `Il manque des points : le plan ${libellePlan(e)} en contient d'autres (sommets de la surface colorée, milieux de ses arêtes).`;
}
