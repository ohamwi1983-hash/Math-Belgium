/**
 * Couche présentation (5e) — consignes/labels/aides/LaTeX pour 5gen31 ("Étudier une fonction").
 * Dépend librement des couches inférieures (jamais l'inverse). Branche "etudeLocale" : réutilise
 * DIRECTEMENT `formatFDeXLatex`/`formatFPrimeDeXLatex`/`formatFSecondeDeXLatex`/`formatRacineLatex`
 * (`ui5e/formatEtudeLocale.ts`, 5gen29, présentation ↔ présentation légitime) appliquées à
 * `exercice.noyau`. Branche "rationnelleAO" : formatage propre (f(x)=ax+b+c/(x-e) et dérivées).
 */
import type { RacineEtudeLocale } from "../core5e/etudeLocale.types";
import type { ExerciceEtudierFonction, ExerciceRationnelleAO } from "../core5e/etudierFonction.types";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import { formatFDeXLatex as formatFDeXLatexEtudeLocale, formatFPrimeDeXLatex as formatFPrimeDeXLatexEtudeLocale, formatFSecondeDeXLatex as formatFSecondeDeXLatexEtudeLocale, formatRacineLatex } from "./formatEtudeLocale";
import type { EcranEtudierFonction } from "../moteur5e/typesEtudierFonction";
import type { SlotLimiteEtudierFonction } from "../moteur5e/verificationEtudierFonction";
import { domaineAttendu, exclusionsCE, listeSlotsLimites, pointsClesEtudierFonction, racinesFPrime, racinesFSeconde } from "../moteur5e/verificationEtudierFonction";

export { formatRacineLatex };

// ============================================================================
// Fragments LaTeX bas niveau — branche "rationnelleAO".
// ============================================================================

function formatAffineLatex(a: number, b: number): string {
  const coeffA = Math.abs(a) === 1 ? (a < 0 ? "-" : "") : `${a}`;
  const terme = `${coeffA}x`;
  if (b === 0) return terme;
  return b > 0 ? `${terme}+${b}` : `${terme}-${-b}`;
}

function formatDenomLatex(e: number): string {
  if (e === 0) return "x";
  return e > 0 ? `x-${e}` : `x+${-e}`;
}

/** "+\dfrac{|n|}{d}" ou "-\dfrac{|n|}{d}" — jamais "+(-k)" (convention transversale). */
function formatFractionSigneeLatex(numerateur: number, denomLatex: string): string {
  return numerateur >= 0 ? `+\\dfrac{${numerateur}}{${denomLatex}}` : `-\\dfrac{${-numerateur}}{${denomLatex}}`;
}

function formatFractionTeteLatex(numerateur: number, denomLatex: string): string {
  return numerateur >= 0 ? `\\dfrac{${numerateur}}{${denomLatex}}` : `-\\dfrac{${-numerateur}}{${denomLatex}}`;
}

function formatFDeXLatexRationnelleAO(ex: ExerciceRationnelleAO): string {
  return `f(x)=${formatAffineLatex(ex.a, ex.b)}${formatFractionSigneeLatex(ex.c, formatDenomLatex(ex.e))}`;
}

function formatFPrimeDeXLatexRationnelleAO(ex: ExerciceRationnelleAO): string {
  const denom = `\\left(${formatDenomLatex(ex.e)}\\right)^2`;
  return `f'(x)=${ex.a}${formatFractionSigneeLatex(-ex.c, denom)}`;
}

function formatFSecondeDeXLatexRationnelleAO(ex: ExerciceRationnelleAO): string {
  const denom = `\\left(${formatDenomLatex(ex.e)}\\right)^3`;
  return `f''(x)=${formatFractionTeteLatex(2 * ex.c, denom)}`;
}

// ============================================================================
// f(x)/f'(x)/f''(x) — dispatch sur les 2 branches.
// ============================================================================

export function formatFDeXLatex(exercice: ExerciceEtudierFonction): string {
  return exercice.famille === "rationnelleAO" ? formatFDeXLatexRationnelleAO(exercice) : formatFDeXLatexEtudeLocale(exercice.noyau);
}

export function formatFPrimeDeXLatex(exercice: ExerciceEtudierFonction): string {
  return exercice.famille === "rationnelleAO" ? formatFPrimeDeXLatexRationnelleAO(exercice) : formatFPrimeDeXLatexEtudeLocale(exercice.noyau);
}

export function formatFSecondeDeXLatex(exercice: ExerciceEtudierFonction): string {
  return exercice.famille === "rationnelleAO" ? formatFSecondeDeXLatexRationnelleAO(exercice) : formatFSecondeDeXLatexEtudeLocale(exercice.noyau);
}

/** Bloc de données affiché en tête de CHAQUE écran — uniquement f(x) : contrairement à 5gen29,
 * f'(x)/f''(x) ne sont JAMAIS données à l'avance (l'élève les calcule lui-même, écrans 3/5). */
export function formatTermesDonneesLatex(exercice: ExerciceEtudierFonction): string[] {
  return [formatFDeXLatex(exercice)];
}

// ============================================================================
// Consigne générale + objectif persistant.
// ============================================================================

export const CONSIGNE_GENERALE_ETUDIER_FONCTION =
  "Étudie complètement la fonction f ci-dessus : domaine, comportement aux bornes, dérivées, tableaux de variations et de concavité, puis place les points clés sur le graphique.";

export function questionFinaleEtudierFonction(): string {
  return "Objectif : étude complète de f.";
}

// ============================================================================
// Libellés/consignes par écran.
// ============================================================================

export const LIBELLE_ECRAN_ETUDIER_FONCTION: Record<EcranEtudierFonction, string> = {
  domaine: "Domaine de définition",
  limites: "Limites aux bornes et asymptotes",
  calculerFPrime: "Calcul de f'(x)",
  tableauFPrime: "Tableau de signes de f' et variations",
  calculerFSeconde: "Calcul de f''(x)",
  tableauFSeconde: "Tableau de signes de f'' et concavité",
  recap: "Récapitulatif",
  graphique: "Graphique — points clés",
};

export function consigneEcranEtudierFonction(ecran: EcranEtudierFonction): string {
  switch (ecran) {
    case "domaine":
      return "Le dénominateur de f ne peut jamais s'annuler — détermine le domaine de définition de f.";
    case "limites":
      return "Détermine le comportement de f à chaque borne de son domaine (asymptotes verticales) et en ±∞ (asymptote horizontale, oblique, ou aucune).";
    case "calculerFPrime":
      return "Dérive f(x) — utilise la règle de dérivation adaptée à la forme de f.";
    case "tableauFPrime":
      return "Complète le tableau de signes de f'(x), puis les variations de f qui en découlent à chaque zone et à chaque racine.";
    case "calculerFSeconde":
      return "Dérive f'(x) — même méthode qu'à l'écran précédent, appliquée cette fois à f'.";
    case "tableauFSeconde":
      return "Complète le tableau de signes de f''(x), puis la concavité de f qui en découle à chaque zone et à chaque racine.";
    case "recap":
      return "Voici la synthèse de ton étude — vérifie-la avant de passer au graphique.";
    case "graphique":
      return "Place chaque point demandé sur le graphique en tapant à l'endroit correspondant.";
  }
}

export function texteAideNiveau1EtudierFonction(ecran: EcranEtudierFonction): string {
  switch (ecran) {
    case "domaine":
      return "Cherche la ou les valeurs de x qui annulent le dénominateur de f.";
    case "limites":
      return "Près d'une AV, regarde le signe du dénominateur juste avant/après — le numérateur, lui, garde un signe fixe proche de cette valeur.";
    case "calculerFPrime":
      return "Identifie la forme de f (somme, produit, quotient, composée) avant de dériver.";
    case "tableauFPrime":
      return "PIÈGE : une racine de f' n'est un extremum QUE si le signe de f' change réellement de part et d'autre.";
    case "calculerFSeconde":
      return "Dérive f'(x) terme à terme, exactement comme à l'écran précédent.";
    case "tableauFSeconde":
      return "PIÈGE : ne confonds pas variations (issues de f') et concavité (issue de f'') — une racine de f'' n'est un point d'inflexion QUE si le signe change réellement autour d'elle.";
    case "recap":
      return "";
    case "graphique":
      return "Repère d'abord l'abscisse du point demandé sur l'axe des x, puis vise la hauteur correspondante.";
  }
}

export function texteAideNiveau2EtudierFonction(ecran: EcranEtudierFonction): string {
  switch (ecran) {
    case "domaine":
      return "Exemple : x-3=0 ⟺ x=3 ⟹ domf=ℝ\\{3}.";
    case "limites":
      return "Exemple : f(x)=1/(x-2), en x→2⁻ le dénominateur est négatif proche de 0 ⟹ f(x)→-∞.";
    case "calculerFPrime":
      return "Exemple : f(x)=x³+2x ⟹ f'(x)=3x²+2.";
    case "tableauFPrime":
      return "Exemple : f'(x)=6x² (racine double en 0) reste POSITIVE des 2 côtés de 0 — 'ni l'un ni l'autre'.";
    case "calculerFSeconde":
      return "Exemple : f'(x)=3x²+2 ⟹ f''(x)=6x.";
    case "tableauFSeconde":
      return "Exemple : f''(x)=12x change bien de signe en x=0 — c'est un vrai point d'inflexion.";
    case "recap":
      return "";
    case "graphique":
      return "Utilise les valeurs déjà trouvées dans les écrans précédents (extremums, points d'inflexion) — l'ordonnée à l'origine se calcule avec f(0).";
  }
}

// ============================================================================
// Écran "limites" — libellé LaTeX par slot.
// ============================================================================

export function formatLabelSlotLimite(slot: SlotLimiteEtudierFonction): string {
  switch (slot.kind) {
    case "va":
      return `\\lim_{x\\to ${slot.position}^${slot.cote === "gauche" ? "-" : "+"}} f(x)=\\,?`;
    case "infiniSigne":
      return `\\lim_{x\\to ${slot.cote === "moins" ? "-\\infty" : "+\\infty"}} f(x)=\\,?`;
    case "infiniHorizontale":
      return `\\lim_{x\\to \\pm\\infty} f(x)=\\,?`;
    case "infiniOblique":
      return `\\text{Équation de l'asymptote oblique (}x\\to\\pm\\infty\\text{)}`;
  }
}

// ============================================================================
// Formatage d'un `EnsembleReelGuide` déjà complet — petite fonction pure, réplique volontaire
// (jamais importée cross-générateur) de `formatEnsembleReelGuideLatex` (`formatEtudeLocale.ts`).
// ============================================================================

export function formatEnsembleReelGuideLatex(ensemble: EnsembleReelGuide): string {
  if (ensemble.forme === "reel") return "\\mathbb{R}";
  if (ensemble.forme === "prive_points") return `\\mathbb{R} \\setminus \\{${ensemble.points.join("\\,;\\,")}\\}`;
  return "\\mathbb{R}";
}

// ============================================================================
// En-têtes de colonnes du tableau étendu.
// ============================================================================

export function formatEnteteColonnesTableauEtudierFonction(exercice: ExerciceEtudierFonction, colonnes: { type: "zone" | "racine" | "exclusion"; index: number }[], mode: "fprime" | "fseconde"): string[] {
  const racines: RacineEtudeLocale[] = mode === "fprime" ? racinesFPrime(exercice) : racinesFSeconde(exercice);
  const exclusions = exclusionsCE(exercice);
  return colonnes.map((col) => {
    if (col.type === "racine") return formatRacineLatex(racines[col.index]);
    if (col.type === "exclusion") return `${exclusions[col.index]}`;
    return "";
  });
}

// ============================================================================
// Bloc "état actuel" — accumule les faits CONFIRMÉS des écrans déjà traversés.
// ============================================================================

export function formatTermesEtatActuelLatex(exercice: ExerciceEtudierFonction, phase: EcranEtudierFonction, ordre: EcranEtudierFonction[]): string[] | null {
  const index = ordre.indexOf(phase);
  if (index <= 0) return null;
  const termes: string[] = [];
  for (let i = 0; i < index; i++) {
    switch (ordre[i]) {
      case "domaine":
        termes.push(`domf=${formatEnsembleReelGuideLatex(domaineAttendu(exercice))}`);
        break;
      case "limites":
        termes.push("Comportement aux bornes : confirmé");
        break;
      case "calculerFPrime":
        termes.push(formatFPrimeDeXLatex(exercice));
        break;
      case "tableauFPrime":
        termes.push("Tableau de f' : confirmé");
        break;
      case "calculerFSeconde":
        termes.push(formatFSecondeDeXLatex(exercice));
        break;
      case "tableauFSeconde":
        termes.push("Tableau de f'' : confirmé");
        break;
      case "recap":
        termes.push("Synthèse consultée");
        break;
    }
  }
  return termes.length === 0 ? null : termes;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE, par écran RÉELLEMENT traversé (hors "recap"/"graphique",
// gérés séparément par le panneau — "recap" n'a pas de score, "graphique" a son propre affichage
// par point).
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceEtudierFonction, ecran: EcranEtudierFonction): string[] {
  switch (ecran) {
    case "domaine":
      return [`domf=${formatEnsembleReelGuideLatex(domaineAttendu(exercice))}`];
    case "limites": {
      const slots = listeSlotsLimites(exercice);
      return slots.map((slot) => `${formatLabelSlotLimite(slot).replace("=\\,?", "")}${formatLimiteCibleLatex(slot)}`);
    }
    case "calculerFPrime":
      return [formatFPrimeDeXLatex(exercice)];
    case "tableauFPrime":
      return ["Voir le tableau ci-dessus"];
    case "calculerFSeconde":
      return [formatFSecondeDeXLatex(exercice)];
    case "tableauFSeconde":
      return ["Voir le tableau ci-dessus"];
    case "recap":
      return [];
    case "graphique":
      return ["Voir le graphique ci-dessus"];
  }
}

export function formatLimiteCibleLatex(slot: SlotLimiteEtudierFonction): string {
  if (slot.kind === "va" || slot.kind === "infiniSigne") return slot.cible === 1 ? "+\\infty" : "-\\infty";
  if (slot.kind === "infiniHorizontale") return `${slot.valeur}`;
  const b = slot.ordonnee;
  return `${slot.pente}x${b >= 0 ? "+" : "-"}${Math.abs(b)}`;
}

// ============================================================================
// Écran "graphique" — labels des points clés.
// ============================================================================

export function labelPointCle(exercice: ExerciceEtudierFonction, id: string): string {
  if (id === "origine") return "L'ordonnée à l'origine (f(0))";
  const point = pointsClesEtudierFonction(exercice).find((p) => p.id === id);
  return point ? `Un point remarquable de f (${id.startsWith("extremum") ? "extremum" : "point d'inflexion"})` : "Un point de f";
}
