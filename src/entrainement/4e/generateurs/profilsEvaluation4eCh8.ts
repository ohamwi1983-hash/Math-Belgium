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
 *   auxiliaires (≥ 1 : aucun raccourci). Parallélépipède 17/50/33 %, cube 14/48/38 %, prisme 69/31/0 %,
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

export function profilSectionPlaneSolide(e: ExerciceSectionPlaneSolide): ProfilInstance {
  return { casParticulier: null, forme: `${e.points.length}-cotes` };
}

// --- gen41 ---------------------------------------------------------------------------------------

export function profilOmbreSoleil(e: ExerciceOmbreSoleil): ProfilInstance {
  if (e.variante === "obstacle") return { casParticulier: null, forme: e.indexObstacleTouche === null ? "ombre-au-sol" : "ombre-sur-obstacle" };
  if (e.variante === "directionInconnue") return { casParticulier: null, forme: `${e.piquets.length}-sommets` };
  return { casParticulier: null };
}
