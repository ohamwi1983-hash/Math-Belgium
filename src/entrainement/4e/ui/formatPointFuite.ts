import type { EtapeConstructionFuite, ExercicePointFuite, Pt } from "../core/pointFuite.types";
import { distance, distanceDroite } from "../generateurs/pointFuite/geometrieFuite";

/**
 * Textes de gen105 (« Perspective centrale : point de fuite ») — UNE source pour l'écran et le
 * papier (adaptateur `generateurs/pointFuite/exportEvaluation.ts`). Vocabulaire du cours (sections
 * `fenetre-durer` et `point-de-fuite`) : vitre, ligne d'horizon, fuyante, point de fuite, parallèle
 * à la vitre ; seules les fuyantes convergent, les verticales et les horizontales de face restent
 * parallèles, les longueurs ne sont pas conservées.
 */

/** Tolérance de placement, en carreaux (≈ 10 px à l'écran à 1280 px, 8 px sur téléphone). */
export const TOLERANCE_PLACEMENT = 0.3;
export const TENTATIVES_PLACEMENT = 3;

export function titresEcrans(e: ExercicePointFuite): string[] {
  return [`Étape 1 — placer ${e.etapes[0].cible}`, `Étape 2 — placer ${e.etapes[1].cible}`, "Étape 3 — l'affirmation vraie"];
}

export const CONSIGNE_AFFIRMATIONS = "Parmi ces trois affirmations, une seule est vraie. Laquelle ?";

export const AIDES_AFFIRMATIONS = [
  "Sur le dessin, seules les fuyantes (les droites qui s'éloignent de la vitre) convergent vers un point de fuite. Les droites parallèles à la vitre — verticales, horizontales de face — restent parallèles.",
  "La perspective centrale ne conserve pas les longueurs : ce qui est loin est dessiné plus petit, sans l'être dans la réalité.",
];

export type DiagnosticPlacement = "horizon" | "horizon-mais-pas-fuyantes" | "support0" | "support1" | "aucun";

export interface VerificationPlacement {
  correct: boolean;
  diagnostic: DiagnosticPlacement | null;
}

export function verifierPlacement(e: ExercicePointFuite, etape: EtapeConstructionFuite, p: Pt): VerificationPlacement {
  if (distance(p, etape.position) <= TOLERANCE_PLACEMENT) return { correct: true, diagnostic: null };
  const surHorizon = Math.abs(p.y - e.horizon) <= TOLERANCE_PLACEMENT;
  if (etape.surHorizon && !surHorizon) return { correct: false, diagnostic: "horizon" };
  const [s0, s1] = etape.supports;
  const sur0 = distanceDroite(s0.a, s0.b, p) <= TOLERANCE_PLACEMENT;
  const sur1 = distanceDroite(s1.a, s1.b, p) <= TOLERANCE_PLACEMENT;
  if (sur0 && !sur1) return { correct: false, diagnostic: "support0" };
  if (sur1 && !sur0) return { correct: false, diagnostic: "support1" };
  if (etape.surHorizon && surHorizon) return { correct: false, diagnostic: "horizon-mais-pas-fuyantes" };
  return { correct: false, diagnostic: "aucun" };
}

export function messageDiagnostic(etape: EtapeConstructionFuite, d: DiagnosticPlacement): string {
  const [s0, s1] = etape.supports;
  switch (d) {
    case "horizon":
      return "Un point de fuite est toujours sur la ligne d'horizon : ton point n'y est pas.";
    case "horizon-mais-pas-fuyantes":
      return "Ton point est bien sur la ligne d'horizon, mais les droites dessinées, prolongées, ne passent pas par lui.";
    case "support0":
      return `Ton point est bien sur ${s0.description}, mais pas sur ${s1.description}.`;
    case "support1":
      return `Ton point est bien sur ${s1.description}, mais pas sur ${s0.description}.`;
    case "aucun":
      return `Ce n'est pas le point ${etape.cible}. Trace d'abord les deux droites qui le portent : ${etape.cible} est leur point de rencontre.`;
  }
}

/** Réponse attendue d'un écran de construction (révélée, fiche de l'historique, corrigé). */
export function reponseConstruction(etape: EtapeConstructionFuite): string {
  return `${etape.cible} est le point de rencontre de ${etape.supports[0].description} et de ${etape.supports[1].description}.`;
}

export function indexAffirmationVraie(e: ExercicePointFuite): number {
  return e.affirmations.findIndex((a) => a.vraie);
}

export function texteAffirmation(e: ExercicePointFuite, i: number): string {
  return `${i + 1}) ${e.affirmations[i]!.texte}`;
}

export function reponseAffirmations(e: ExercicePointFuite): string {
  const i = indexAffirmationVraie(e);
  return `L'affirmation ${i + 1} est vraie : « ${e.affirmations[i]!.texte} »`;
}

/** Explication des trois affirmations (après validation, corrigé). */
export function explicationsAffirmations(e: ExercicePointFuite): string[] {
  return e.affirmations.map((a, i) => `${i + 1}) ${a.vraie ? "Vrai" : "Faux"} : ${a.explication}`);
}

/** Réponse brève (page « Je vérifie », barème). */
export function reponseBreveTexte(e: ExercicePointFuite): string {
  const [a, b] = e.etapes;
  return `a) ${reponseConstruction(a)} ${reponseConstruction(b)} b) Affirmation ${indexAffirmationVraie(e) + 1}.`;
}
