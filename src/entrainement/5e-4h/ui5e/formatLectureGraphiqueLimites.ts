/**
 * Couche présentation (5e) — consignes/libellés/formatage pour 5gen22 ("Limites et asymptotes,
 * lecture graphique"). Pas de "bloc de données" KaTeX ici — la donnée EST le graphique
 * (`LectureGraphiqueLimitesGraph`), affiché directement par chaque écran.
 */
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import type { CibleAsymptote, CibleComportement, IdAsymptote, IdComportement, PhaseLectureGraphiqueLimites, SlotAsymptote } from "../moteur5e/typesLectureGraphiqueLimites";
import { listeAsymptotes, listeComportements } from "../moteur5e/typesLectureGraphiqueLimites";

export function consigneGenerale(): string {
  return "Lis les informations directement sur le graphique — aucun calcul n'est nécessaire.";
}

export const LIBELLE_PHASE_LECTURE_GRAPHIQUE: Record<PhaseLectureGraphiqueLimites, string> = {
  completerLimites: "Compléter les limites",
  nommerAsymptotes: "Nommer les asymptotes",
};

export function consignePhase(phase: PhaseLectureGraphiqueLimites): string {
  if (phase === "completerLimites") return "Complète chaque limite correspondant à un comportement visible sur le graphique.";
  return "Donne l'équation de chaque asymptote présente sur le graphique.";
}

// ============================================================================
// Écran 1 — libellé "lim_{x→...} f(x) =" par slot.
// ============================================================================

function formatCoteVA(position: number, cote: "gauche" | "droit"): string {
  return `${position}^{${cote === "gauche" ? "-" : "+"}}`;
}

export function labelComportementLatex(exercice: ExerciceLectureGraphiqueLimites, id: IdComportement): string {
  if (id.kind === "infini") {
    return `\\lim_{x\\to ${id.cote === "gauche" ? "-\\infty" : "+\\infty"}} f(x)=`;
  }
  const position = exercice.vas[id.index].position;
  return `\\lim_{x\\to ${formatCoteVA(position, id.cote)}} f(x)=`;
}

export function formatCibleComportementLatex(cible: CibleComportement): string {
  if (cible.kind === "infini") return cible.signe === 1 ? "+\\infty" : "-\\infty";
  return `${cible.valeur}`;
}

// ============================================================================
// Écran 2 — libellé "x=" / "y=" par slot.
// ============================================================================

export function labelAsymptoteLatex(slots: SlotAsymptote[], id: IdAsymptote): string {
  if (id.kind === "va") return "x=";
  if (id.kind === "oblique") return "y=";
  const distinctes = slots.some((s) => s.id.kind === "horizontale" && s.id.cote !== undefined);
  if (!distinctes) return "y=";
  return id.cote === "gauche" ? "y= (en -\\infty)" : "y= (en +\\infty)";
}

function formatMonomeLatex(coeff: number, degre: number, premier: boolean): string {
  if (coeff === 0) return "";
  const abs = Math.abs(coeff);
  const signe = coeff < 0 ? "-" : premier ? "" : "+";
  const variable = degre === 0 ? "" : "x";
  const coeffAffiche = abs === 1 && degre !== 0 ? "" : `${abs}`;
  return `${signe}${coeffAffiche}${variable}`;
}

function formatDroiteLatex(pente: number, ordonnee: number): string {
  const p = formatMonomeLatex(pente, 1, true);
  const o = formatMonomeLatex(ordonnee, 0, p === "");
  return p + o || "0";
}

export function formatCibleAsymptoteLatex(cible: CibleAsymptote): string {
  if (cible.kind === "verticale") return `${cible.x}`;
  if (cible.kind === "horizontale") return `${cible.y}`;
  return formatDroiteLatex(cible.pente, cible.ordonnee);
}

// ============================================================================
// Bloc "état actuel" (écran 2 seulement) — récapitule les limites confirmées à l'écran 1.
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceLectureGraphiqueLimites, phase: PhaseLectureGraphiqueLimites): string[] | null {
  if (phase !== "nommerAsymptotes") return null;
  return listeComportements(exercice).map((slot) => `${labelComportementLatex(exercice, slot.id)}${formatCibleComportementLatex(slot.cible)}`);
}

// ============================================================================
// Récapitulatif final — une ligne par écran RÉELLEMENT traversé.
// ============================================================================

export function formatReponseAttendueCompleterLimitesLatex(exercice: ExerciceLectureGraphiqueLimites): string[] {
  return listeComportements(exercice).map((slot) => `${labelComportementLatex(exercice, slot.id)}${formatCibleComportementLatex(slot.cible)}`);
}

export function formatReponseAttendueNommerAsymptotesLatex(exercice: ExerciceLectureGraphiqueLimites): string[] {
  const slots = listeAsymptotes(exercice);
  return slots.map((slot) => `${labelAsymptoteLatex(slots, slot.id)}${formatCibleAsymptoteLatex(slot.cible)}`);
}

export function formatReponseAttenduePhaseLatex(exercice: ExerciceLectureGraphiqueLimites, phase: PhaseLectureGraphiqueLimites): string[] {
  return phase === "completerLimites" ? formatReponseAttendueCompleterLimitesLatex(exercice) : formatReponseAttendueNommerAsymptotesLatex(exercice);
}
