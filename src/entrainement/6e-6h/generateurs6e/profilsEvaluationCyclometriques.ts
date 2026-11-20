/**
 * Profils d'instance et groupes « à verdict » (tirage équilibré des évaluations) des générateurs
 * 6gen1–6gen5 du chapitre 1 de 6e (« Fonctions réciproques & cyclométriques ») — lot E de l'audit
 * du chapitre. Règles : `.claude/rules/feuilles-evaluations.md`, section « Tirage équilibré ».
 *
 * - `forme` = type de question reproduit d'une série à l'autre (famille ou variante, plus le
 *   sous-type structurel), JAMAIS le verdict : ni « injective ? » (6gen1 : e) toujours injective et
 *   f) jamais forment une seule forme, a) et c) sont injectives une fois sur deux), ni « existe ? »
 *   (6gen2), ni l'issue du tri des candidates (6gen3), ni la parité ou les extremums (6gen5).
 * - Cas particulier (décision de l'utilisateur, audit V3) : 6gen3 « aucune solution » réglée en une
 *   ligne (variante 3, a(x − h)² égal à un négatif). L'ensemble vide obtenu APRÈS le rejet des
 *   candidates (variantes 2 et 4) est l'issue de l'écran « À accepter / À rejeter » : un verdict,
 *   jamais filtré.
 * - Groupes à verdict (décisions V1, V2) : 6gen1 `groupe_injectivite` (a, c, e, f), 6gen2
 *   `groupe_existence_arc_trig` et `groupe_existence_trig_arc` (le nom de la variante dit
 *   « existe » ou « n'existe pas » ; « existe » doublé dans le second pour un verdict 50/50).
 * - Tout est exact (6gen5 E : constantes multiples de π) : aucun `calcul`.
 */
import type { GroupeVerdict, ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceInjectiviteFonctions } from "../core6e/injectiviteFonctions.types";
import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";
import type { ExerciceEquationsCyclometriques } from "../core6e/equationsCyclometriques.types";
import type { ExerciceDeriveesCyclometriques } from "../core6e/deriveesCyclometriques.types";
import type { ExerciceGraphiquesCyclometriques } from "../core6e/graphiquesCyclometriques.types";

/** 6gen1 — la famille, sauf e) et f) réunies (leur verdict est constant). */
export function profilInjectiviteFonctions(e: ExerciceInjectiviteFonctions): ProfilInstance {
  const f = e.parametres.famille;
  if (f === "puissanceAffine" || f === "puissanceMonome") return { casParticulier: null, forme: "puissance" };
  if (f === "homographique" || f === "quadratique") return { casParticulier: null, forme: "homographique-ou-quadratique" };
  return { casParticulier: null, forme: f };
}

export const GROUPES_VERDICT_INJECTIVITE: GroupeVerdict[] = [
  { id: "groupe_injectivite", label: "Injective ou non : a), c), e), f) (verdict tiré)", variantes: ["puissanceAffine", "puissanceMonome", "homographique", "quadratique"] },
];

/** 6gen2 — la mécanique de calcul (lecture directe, arc∘trig, trig∘arc), jamais l'existence. */
export function profilFonctionsCyclometriques(e: ExerciceFonctionsCyclometriques): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}

export const GROUPES_VERDICT_FONCTIONS_CYCLOMETRIQUES: GroupeVerdict[] = [
  { id: "groupe_existence_arc_trig", label: "2. arcfonction(trig(θ)) — existe ou non (verdict tiré)", variantes: ["arcTrig_existe", "arcTrig_inexistant"] },
  {
    id: "groupe_existence_trig_arc",
    label: "3. trig(arcfonction(n)) — existe ou non (verdict tiré)",
    variantes: ["trigArc_existe", "trigArc_causeDomaine", "trigArc_existe", "trigArc_causePiSur2"],
  },
];

export const LIBELLE_CAS_EQUATIONS_CYCLOMETRIQUES = "Inclure un cas particulier (équation sans solution réglée en une ligne)";

/** 6gen3 — variante (sous-cas en variante 4) ; « aucune solution » de la variante 3 = cas particulier. */
export function profilEquationsCyclometriques(e: ExerciceEquationsCyclometriques): ProfilInstance {
  if (e.variante === "arcfonctionsDifferentes") return { casParticulier: null, forme: `4:${e.sousCas}` };
  if (e.variante === "angleQuadratique") return { casParticulier: e.candidats.length === 0 ? "aucune-solution" : null, forme: e.variante };
  return { casParticulier: null, forme: e.variante };
}

/** 6gen4 — famille, plus la fonction intérieure (A) et le sous-cas (G). */
export function profilDeriveesCyclometriques(e: ExerciceDeriveesCyclometriques): ProfilInstance {
  if (e.famille === "A") return { casParticulier: null, forme: `A:${e.uType}` };
  if (e.famille === "G") return { casParticulier: null, forme: `G:${e.sousCas}` };
  return { casParticulier: null, forme: e.famille };
}

/** 6gen5 — famille (le graphique, la parité et les extremums sont des verdicts). */
export function profilGraphiquesCyclometriques(e: ExerciceGraphiquesCyclometriques): ProfilInstance {
  return { casParticulier: null, forme: e.famille };
}
