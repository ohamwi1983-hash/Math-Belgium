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
import { classificationFPrime, decalageVertical, domaineAttendu, exclusionsCE, listeSlotsLimites, pointsClesEtudierFonction, racinesFPrime, racinesFSeconde } from "../moteur5e/verificationEtudierFonction";
import type { PointCleEtudierFonction } from "../moteur5e/verificationEtudierFonction";

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
  if (exercice.famille === "rationnelleAO") return formatFDeXLatexRationnelleAO(exercice);
  const d = decalageVertical(exercice);
  const base = formatFDeXLatexEtudeLocale(exercice.noyau);
  return d === 0 ? base : `${base}${d > 0 ? "+" : "-"}${Math.abs(d)}`;
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
  "Étudie complètement la fonction f ci-dessous : domaine, comportement aux bornes, dérivées, tableaux de variations et de concavité, coordonnées des points remarquables, puis place ces points sur un graphique.";

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
  coordonnees: "Coordonnées des points remarquables",
  graphique: "Graphique — points remarquables",
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
      return "Voici la synthèse de ton étude : vérifie-la avant de calculer les coordonnées des points remarquables.";
    case "coordonnees":
      return "Calcule l'ordonnée de chaque point remarquable (valeur exacte ou arrondie au centième).";
    case "graphique":
      return "Place chaque point sur le graphique en tapant à l'endroit correspondant ; la courbe apparaîtra une fois tous les points placés.";
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
      return "Attention : une racine de f' n'est un extremum que si le signe de f' change de part et d'autre.";
    case "calculerFSeconde":
      return "Dérive f'(x) terme à terme, exactement comme à l'écran précédent.";
    case "tableauFSeconde":
      return "Attention : ne confonds pas variations (données par f') et concavité (donnée par f''). Une racine de f'' n'est un point d'inflexion que si le signe de f'' change autour d'elle.";
    case "recap":
      return "";
    case "coordonnees":
      return "L'ordonnée d'un point de la courbe s'obtient en remplaçant x par son abscisse dans l'expression de f.";
    case "graphique":
      return "Repère d'abord l'abscisse du point demandé sur l'axe des x, puis vise la hauteur correspondante.";
  }
}

/** Aide fragmentée — texte en français d'un côté, formule KaTeX de l'autre (jamais de formule
 * brute dans le texte), rendue via `<p>{aide.texte}</p> {aide.latex && <Katex expression={aide.latex} block />}`. */
export interface AideFragmentee {
  texte: string;
  latex: string | null;
}

export function texteAideNiveau2EtudierFonction(ecran: EcranEtudierFonction): AideFragmentee {
  switch (ecran) {
    case "domaine":
      return { texte: "Exemple :", latex: "x-3=0 \\iff x=3 \\;\\Rightarrow\\; \\text{dom}\\,f=\\mathbb{R}\\setminus\\{3\\}" };
    case "limites":
      return { texte: "Exemple :", latex: "f(x)=\\dfrac{1}{x-2}, \\text{ en } x\\to2^- \\text{ le dénominateur est négatif proche de } 0 \\;\\Rightarrow\\; f(x)\\to-\\infty" };
    case "calculerFPrime":
      return { texte: "Exemple :", latex: "f(x)=x^3+2x \\;\\Rightarrow\\; f'(x)=3x^2+2" };
    case "tableauFPrime":
      return {
        texte: "Exemple : f' s'annule en 0 mais reste positive des deux côtés (racine double), donc « ni l'un ni l'autre » :",
        latex: "f'(x)=6x^2",
      };
    case "calculerFSeconde":
      return { texte: "Exemple :", latex: "f'(x)=3x^2+2 \\;\\Rightarrow\\; f''(x)=6x" };
    case "tableauFSeconde":
      return {
        texte: "Exemple : change bien de signe en x=0 — c'est un vrai point d'inflexion :",
        latex: "f''(x)=12x",
      };
    case "recap":
      return { texte: "", latex: null };
    case "coordonnees":
      return { texte: "Exemple :", latex: "f(x)=x^3-3x \\;\\Rightarrow\\; f(1)=1-3=-2" };
    case "graphique":
      return { texte: "Utilise les valeurs déjà trouvées dans les écrans précédents (extremums, points d'inflexion) — l'ordonnée à l'origine se calcule avec f(0).", latex: null };
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
      return `\\text{AO : }y=\\,?`;
  }
}

// ============================================================================
// Formatage d'un `EnsembleReelGuide` déjà complet — petite fonction pure, réplique volontaire
// (jamais importée cross-générateur) de `formatEnsembleReelGuideLatex` (`formatEtudeLocale.ts`).
// ============================================================================

export function formatEnsembleReelGuideLatex(ensemble: EnsembleReelGuide): string {
  if (ensemble.forme === "reel") return "\\mathbb{R}";
  if (ensemble.forme === "prive_points") return ensemble.points.length === 0 ? "\\mathbb{R}" : `\\mathbb{R} \\setminus \\{${ensemble.points.join("\\,;\\,")}\\}`;
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

/** « dom f = … » (jamais « domf » en mode maths, lettres collées). */
export function formatDomaineLatex(exercice: ExerciceEtudierFonction): string {
  return `\\text{dom}\\,f=${formatEnsembleReelGuideLatex(domaineAttendu(exercice))}`;
}

const NATURE_EXTREMUM = { max: "maximum", min: "minimum", ni_lun_ni_lautre: "ni max ni min" } as const;

/** Résumé d'un tableau : nature de chaque racine (« x = 2 : maximum ») ou « aucune racine ». */
export function formatResumeTableauLatex(exercice: ExerciceEtudierFonction, mode: "fprime" | "fseconde"): string[] {
  if (mode === "fprime") {
    const racines = racinesFPrime(exercice);
    const classes = classificationFPrime(exercice);
    if (racines.length === 0) return ["\\text{f' ne s'annule pas}"];
    return racines.map((r, i) => `x=${formatRacineLatex(r)}\\ :\\ \\text{${NATURE_EXTREMUM[classes[i]]}}`);
  }
  const racines = racinesFSeconde(exercice);
  if (racines.length === 0) return ["\\text{aucun point d'inflexion}"];
  return racines.map((r) => `x=${formatRacineLatex(r)}\\ :\\ \\text{point d'inflexion}`);
}

/** Coordonnées d'un point remarquable, ordonnée arrondie au centième (virgule décimale). */
export function formatOrdonneeLatex(y: number): string {
  const r = Math.round(y * 100) / 100;
  return (Object.is(r, -0) ? 0 : r).toString().replace(".", "{,}");
}

export function formatAbscissePointLatex(point: PointCleEtudierFonction): string {
  return point.racine ? formatRacineLatex(point.racine) : formatOrdonneeLatex(point.x);
}

/** Libellé du champ de l'écran « coordonnées » : « Maximum : f(2) = ». */
export function formatLabelCoordonneeLatex(point: PointCleEtudierFonction): string {
  return `\\text{${point.label} : }f\\left(${formatAbscissePointLatex(point)}\\right)=`;
}

export function formatCoordonneesLatex(exercice: ExerciceEtudierFonction): string[] {
  return pointsClesEtudierFonction(exercice).map((p) => `\\text{${p.label} : }\\left(${formatAbscissePointLatex(p)}\\,;\\,${formatOrdonneeLatex(p.y)}\\right)`);
}

/** Termes de « Ce qu'on sait déjà » pour UN écran clos — les vraies valeurs, jamais « confirmé ». */
export function formatTermesEcranLatex(exercice: ExerciceEtudierFonction, ecran: EcranEtudierFonction): string[] {
  switch (ecran) {
    case "domaine":
      return [formatDomaineLatex(exercice)];
    case "limites":
    case "calculerFPrime":
    case "calculerFSeconde":
      return formatReponseAttenduePhaseLatex(exercice, ecran);
    case "tableauFPrime":
      return formatResumeTableauLatex(exercice, "fprime");
    case "tableauFSeconde":
      return formatResumeTableauLatex(exercice, "fseconde");
    case "recap":
      return [];
    case "coordonnees":
      return formatCoordonneesLatex(exercice);
    case "graphique":
      return [];
  }
}

/** Ancienne interface (flux plat cumulé) conservée pour les appelants existants. */
export function formatTermesEtatActuelLatex(exercice: ExerciceEtudierFonction, phase: EcranEtudierFonction, ordre: EcranEtudierFonction[]): string[] | null {
  const index = ordre.indexOf(phase);
  if (index <= 0) return null;
  const termes = ordre.slice(0, index).flatMap((e) => formatTermesEcranLatex(exercice, e));
  return termes.length === 0 ? null : termes;
}

// ============================================================================
// Réponse ATTENDUE, par écran.
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceEtudierFonction, ecran: EcranEtudierFonction): string[] {
  switch (ecran) {
    case "domaine":
      return [formatDomaineLatex(exercice)];
    case "limites": {
      const slots = listeSlotsLimites(exercice);
      return slots.map((slot) => `${formatLabelSlotLimite(slot).replace("\\,?", "")}${formatLimiteCibleLatex(slot)}`);
    }
    case "calculerFPrime":
      return [formatFPrimeDeXLatex(exercice)];
    case "tableauFPrime":
      return formatResumeTableauLatex(exercice, "fprime");
    case "calculerFSeconde":
      return [formatFSecondeDeXLatex(exercice)];
    case "tableauFSeconde":
      return formatResumeTableauLatex(exercice, "fseconde");
    case "recap":
      return [];
    case "coordonnees":
      return formatCoordonneesLatex(exercice);
    case "graphique":
      return formatCoordonneesLatex(exercice);
  }
}

export function formatLimiteCibleLatex(slot: SlotLimiteEtudierFonction): string {
  if (slot.kind === "va" || slot.kind === "infiniSigne") return slot.cible === 1 ? "+\\infty" : "-\\infty";
  if (slot.kind === "infiniHorizontale") return `${slot.valeur}`;
  const terme = slot.pente === 1 ? "x" : slot.pente === -1 ? "-x" : `${slot.pente}x`;
  const b = slot.ordonnee;
  return b === 0 ? terme : `${terme}${b > 0 ? "+" : "-"}${Math.abs(b)}`;
}

// ============================================================================
// Écran "graphique" — labels des points clés.
// ============================================================================

export function labelPointCle(exercice: ExerciceEtudierFonction, id: string): string {
  const point = pointsClesEtudierFonction(exercice).find((p) => p.id === id);
  return point ? `${point.label} (x = ${formatAbscissePointLatex(point).replace("{,}", ",")})` : "Un point de f";
}
