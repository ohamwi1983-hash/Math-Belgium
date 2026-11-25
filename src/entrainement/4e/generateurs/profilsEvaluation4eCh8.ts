/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * des générateurs du chapitre 8 de 4e (« Géométrie dans l'espace », gen39–gen41). Décisions de
 * l'utilisateur : voir `.claude/rules/feuilles-evaluations.md`, « Tirage équilibré ». Aucun calcul
 * dans ce chapitre (reconnaissance et construction) → `calcul` toujours sans objet.
 *
 * Mesures (5 000 tirages par variante ; 2 000 pour gen40, scratchpad refonte-4e-ch8/sonde.ts) :
 * - gen39 — la droite passe par 0, 1 ou 2 milieux d'arête (incluse 31/34/35 %, parallèle 51/0/49 %,
 *   sécante 30/36/35 %). Sécante : dans 39 % des cas l'un des DEUX points qui définissent la droite
 *   est lui-même dans le plan — le point de percée est alors donné d'office (raccourci : cas
 *   particulier) ; sinon (61 %) il faut le chercher sur une arête/diagonale ou un autre sommet. La
 *   position relative (incluse/parallèle/sécante) est un VERDICT : jamais un cas particulier.
 * - gen40 — 3 points sur 3 arêtes ; la section a k = 4, 5 ou 6 côtés et demande toujours k − 3 points
 *   auxiliaires (≥ 1) ; la variante « triangle » (k = 3, aucun point auxiliaire) est le cas particulier. Parallélépipède 17/50/33 %, cube 14/48/38 %, prisme 69/31/0 %,
 *   tétraèdre 100 % k = 4. Le nombre de côtés fixe la longueur de la construction → `forme`, pour que
 *   toutes les séries aient la même charge de travail.
 * - gen41 — obstacle : l'ombre s'arrête au sol (30 %) ou sur un obstacle (70 %) : c'est la réponse
 *   (verdict), pas un cas particulier, mais la construction n'a pas la même longueur → `forme`
 *   (même issue dans toutes les séries, fixée par la série A). Direction inconnue : 2 sommets à
 *   projeter (97 %) ou 3 (3 %) → `forme`. Variante simple : rien à équilibrer.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExercicePositionDroitePlan } from "../core/positionDroitePlan.types";
import type { ExerciceSectionPlaneSolide } from "../core/sectionPlaneSolide.types";
import type { ExerciceOmbreSoleil } from "../core/ombreSoleil.types";
import { pointAppartientAuPlan } from "./solide3D/geometrieEspace";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

// --- gen39 ---------------------------------------------------------------------------------------

/** Marqueur d'ABSENCE du paramètre « milieu d'arête sur la droite » (droite définie par 2 sommets). */
export const SANS_MILIEU_GEN39 = "sans-milieu";
export const CAS_PERCEE_SUR_LA_DROITE = "percee-sur-la-droite";

export const PARAMETRES_POSITION_DROITE_PLAN = [{ id: SANS_MILIEU_GEN39, label: "Droite passant par un milieu d'arête (I, J)" }];

/** Groupe « à verdict » (audit 4e ch. 8, lot D, G4) : le nom de chaque variante de gen39 EST la
 * position cherchée — dans le panneau d'ÉVALUATION seulement, une rangée tire la variante réelle de
 * chaque question au hasard, équilibrée et différente d'une série à l'autre. Codes inchangés. */
export const GROUPES_VERDICT_POSITION_DROITE_PLAN = [
  { id: "groupe_position", label: "Position d'une droite et d'un plan (incluse, parallèle ou sécante, tirée au hasard)", variantes: ["incluse", "parallele", "secante"] },
];

export const LIBELLE_CAS_POSITION_DROITE_PLAN = "Inclure un cas direct : droite sécante qui perce le plan en l'un de ses deux points nommés";

/** L'un des deux points qui définissent la droite est-il dans le plan ? (sécante → percée immédiate) */
function unPointDeLaDroiteDansLePlan(e: ExercicePositionDroitePlan): boolean {
  const plan = e.plan.map((n) => e.solide.sommets[n]) as [ExercicePositionDroitePlan["solide"]["sommets"][string], ExercicePositionDroitePlan["solide"]["sommets"][string], ExercicePositionDroitePlan["solide"]["sommets"][string]];
  const position = (nom: string) => e.solide.sommets[nom] ?? e.pointsNommes.find((p) => p.nom === nom)!.position;
  return e.droite.some((nom) => pointAppartientAuPlan(position(nom), plan));
}

export function profilPositionDroitePlan(e: ExercicePositionDroitePlan): ProfilInstance {
  return {
    casParticulier: cas([e.pointsNommes.length === 0 && SANS_MILIEU_GEN39, e.classification === "secante" && unPointDeLaDroiteDansLePlan(e) && CAS_PERCEE_SUR_LA_DROITE]),
  };
}

// --- gen40 ---------------------------------------------------------------------------------------

/** Section triangulaire (variante « triangle », audit 4e ch. 8, lot D) : trois côtés tracés
 * directement, aucun point auxiliaire — un RACCOURCI, donc un cas particulier (jamais un verdict à
 * décider : le triangle se voit dès que P, Q, R entourent un sommet). */
export const CAS_SECTION_TRIANGLE = "triangle";

export const LIBELLE_CAS_SECTION_PLANE_SOLIDE = "Inclure un cas direct : section triangulaire (P, Q, R autour d'un sommet, aucun point auxiliaire)";

/** Variantes du manuel (point dans une face, prolongement d'une arête, plan parallèle) : une section
 * triangulaire n'y est PAS un raccourci (point donné à exploiter, parallèles à tracer) — jamais le cas
 * particulier « triangle » ; `forme` préfixée par la variante (même charge dans toutes les séries). */
export function profilSectionPlaneSolide(e: ExerciceSectionPlaneSolide): ProfilInstance {
  if (e.variante) return { casParticulier: null, forme: `${e.variante}-${e.points.length}-cotes` };
  return { casParticulier: e.points.length === 3 ? CAS_SECTION_TRIANGLE : null, forme: `${e.points.length}-cotes` };
}

// --- gen41 ---------------------------------------------------------------------------------------

export function profilOmbreSoleil(e: ExerciceOmbreSoleil): ProfilInstance {
  // Variante obstacle : savoir si l'ombre tombe au sol ou sur un obstacle est ce que l'élève DÉCIDE
  // (écrans direction/point) — un verdict, donc jamais dans `forme` (décision de l'utilisateur). Le
  // générateur tire déjà cette issue avant sa boucle de rejet (`cibleSol`).
  if (e.variante === "obstacle") return { casParticulier: null, forme: e.variante };
  if (e.variante === "directionInconnue") return { casParticulier: null, forme: `${e.piquets.length}-sommets` };
  // Solide posé au sol (manuel 4e ch. 8) : la forme du solide (cube, pavé, pyramide) est visible
  // dans l'énoncé, jamais un verdict.
  if (e.variante === "solidePose") return { casParticulier: null, forme: e.forme };
  return { casParticulier: null };
}
