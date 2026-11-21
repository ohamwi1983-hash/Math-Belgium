/**
 * Moteur de la famille « position de la courbe par rapport à son asymptote » de 5gen21 (5e ch. 4,
 * lots B–D). Quatre écrans, les MÊMES pour les trois verdicts (niveau et durée constants) :
 * 1. `numerateurEcart` — numérateur R(x) de f(x) − (ax + b) = R(x)/D(x) (champ, 3 tentatives) ;
 * 2. `verdictPosition` — au-dessus / en dessous / recoupe (choix fermé, 1 tentative) ;
 * 3. `pointRecoupement` — coordonnées du point commun, ou « aucun » (champs, 3 tentatives) ;
 * 4. `cotesApproche` — côté par lequel la courbe s'approche de d en −∞ et en +∞ (choix fermés,
 *    1 tentative).
 * Une saisie illisible (ou une valeur approchée d'un nombre exact) est refusée ICI : l'état revient
 * inchangé, aucune tentative consommée (règle commune, modèle du 5e ch. 1).
 */
import type { ExercicePositionAsymptote, VerdictPosition } from "../core5e/asymptoteOblique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import { diagnostiquerValeurExacte, egalAuPolynome, expressionIllisible, nombreExactRefuse, nombreIllisible } from "./saisieLimites";

export type PhasePositionAsymptote = "numerateurEcart" | "verdictPosition" | "pointRecoupement" | "cotesApproche";

export const ORDRE_POSITION: PhasePositionAsymptote[] = ["numerateurEcart", "verdictPosition", "pointRecoupement", "cotesApproche"];

export type Cote = "dessus" | "dessous";

export interface ReponsePointRecoupement {
  aucun: boolean;
  x: string;
  y: string;
}

export interface ReponseCotes {
  moinsInfini: Cote;
  plusInfini: Cote;
}

export interface EtatSessionPositionAsymptote {
  reglages: ReglagesSession5e;
  generateur: () => ExercicePositionAsymptote;
  exerciceCourant: ExercicePositionAsymptote;
  phase: PhasePositionAsymptote;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhasePositionAsymptote, number>>;
  revelesPartiels: Partial<Record<PhasePositionAsymptote, boolean>>;
  indexExercice: number;
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}

export const NIVEAU_AIDE_MAX_POSITION = 2;
const POINTS = 100;

/** Phases à choix fermé : une seule tentative. */
export function tentativesMaxPosition(etat: EtatSessionPositionAsymptote): number {
  return etat.phase === "verdictPosition" || etat.phase === "cotesApproche" ? 1 : etat.reglages.tentativesMax;
}

// ----------------------------------------------------------------------------
// Réponses attendues (une seule source : écran, aides, papier, corrigé).
// ----------------------------------------------------------------------------

/** x₀ et y₀ du point de recoupement (null si la courbe ne recoupe pas d). */
export function pointRecoupementAttendu(e: ExercicePositionAsymptote): { x: number; y: number } | null {
  if (e.verdict !== "recoupe") return null;
  const x = -e.s / e.r;
  return { x: x === 0 ? 0 : x, y: e.a * x + e.b };
}

/** Signe de R(x) (donc de f(x) − (ax + b)) en +∞ et en −∞. */
export function cotesAttendus(e: ExercicePositionAsymptote): ReponseCotes {
  const c = (signe: number): Cote => (signe > 0 ? "dessus" : "dessous");
  if (e.r === 0) return { moinsInfini: c(e.s), plusInfini: c(e.s) };
  return { moinsInfini: c(-e.r), plusInfini: c(e.r) };
}

export function verifierNumerateurEcart(e: ExercicePositionAsymptote, brut: string): boolean {
  return egalAuPolynome(brut, [e.s, e.r]);
}

export function verifierPoint(e: ExercicePositionAsymptote, r: ReponsePointRecoupement): boolean {
  const attendu = pointRecoupementAttendu(e);
  if (!attendu) return r.aucun;
  if (r.aucun) return false;
  return diagnostiquerValeurExacte(r.x, attendu.x) === "correct" && diagnostiquerValeurExacte(r.y, attendu.y) === "correct";
}

/** Saisie du point refusée sans tentative : un champ vide ou illisible quand « aucun » n'est pas choisi. */
export function pointIllisible(e: ExercicePositionAsymptote, r: ReponsePointRecoupement): boolean {
  if (r.aucun) return false;
  const attendu = pointRecoupementAttendu(e);
  if (r.x.trim() === "" || r.y.trim() === "") return true;
  if (!attendu) return nombreIllisible(r.x) || nombreIllisible(r.y);
  return nombreExactRefuse(r.x, attendu.x) || nombreExactRefuse(r.y, attendu.y);
}

// ----------------------------------------------------------------------------
// Session.
// ----------------------------------------------------------------------------

function etatExercice(e: ExercicePositionAsymptote) {
  return { exerciceCourant: e, phase: ORDRE_POSITION[0], etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, revelesPartiels: {} };
}

export function demarrerSessionPositionAsymptote(reglages: ReglagesSession5e, generateur: () => ExercicePositionAsymptote): EtatSessionPositionAsymptote {
  return { reglages, generateur, indexExercice: 0, terminee: false, derniereEtapeRevelee: false, ...etatExercice(generateur()) };
}

export function activerAidePosition(etat: EtatSessionPositionAsymptote): EtatSessionPositionAsymptote {
  if (etat.terminee || etat.niveauAide >= NIVEAU_AIDE_MAX_POSITION) return etat;
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function soumettre<T>(etat: EtatSessionPositionAsymptote, phase: PhasePositionAsymptote, reponse: T, verifier: (r: T) => boolean): EtatSessionPositionAsymptote {
  if (etat.terminee || etat.phase !== phase) throw new Error(`soumettre : la session n'est pas à l'étape ${phase}`);
  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, { pointsDeBase: POINTS, tentativesMax: tentativesMaxPosition(etat), verifier, revelerReponse: () => {} });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  const revele = etapeCourante.revelee;
  const scoresPartiels = { ...etat.scoresPartiels, [phase]: etapeCourante.score as number };
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const i = ORDRE_POSITION.indexOf(phase);
  if (i === ORDRE_POSITION.length - 1) {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) return { ...etat, etapeCourante, scoresPartiels, revelesPartiels, indexExercice, terminee: true, derniereEtapeRevelee: revele };
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereEtapeRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: ORDRE_POSITION[i + 1], scoresPartiels, revelesPartiels, derniereEtapeRevelee: revele };
}

export function soumettreNumerateurEcart(etat: EtatSessionPositionAsymptote, brut: string): EtatSessionPositionAsymptote {
  if (expressionIllisible(brut)) return etat;
  return soumettre(etat, "numerateurEcart", brut, (b) => verifierNumerateurEcart(etat.exerciceCourant, b));
}

export function soumettreVerdictPosition(etat: EtatSessionPositionAsymptote, choix: VerdictPosition): EtatSessionPositionAsymptote {
  return soumettre(etat, "verdictPosition", choix, (c) => c === etat.exerciceCourant.verdict);
}

export function soumettrePointRecoupement(etat: EtatSessionPositionAsymptote, reponse: ReponsePointRecoupement): EtatSessionPositionAsymptote {
  if (pointIllisible(etat.exerciceCourant, reponse)) return etat;
  return soumettre(etat, "pointRecoupement", reponse, (r) => verifierPoint(etat.exerciceCourant, r));
}

export function soumettreCotes(etat: EtatSessionPositionAsymptote, reponse: ReponseCotes): EtatSessionPositionAsymptote {
  const attendu = cotesAttendus(etat.exerciceCourant);
  return soumettre(etat, "cotesApproche", reponse, (r) => r.moinsInfini === attendu.moinsInfini && r.plusInfini === attendu.plusInfini);
}
