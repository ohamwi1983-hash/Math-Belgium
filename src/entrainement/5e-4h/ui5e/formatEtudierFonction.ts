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
import { formatFDeXLatex as formatFDeXLatexEtudeLocale, formatFPrimeDeXLatex as formatFPrimeDeXLatexEtudeLocale, formatFSecondeDeXLatex as formatFSecondeDeXLatexEtudeLocale, formatRacineLatex, radicalSimplifieLatex } from "./formatEtudeLocale";
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
  tableauFPrime: "Tableau de signes de f′ et variations",
  calculerFSeconde: "Calcul de f''(x)",
  tableauFSeconde: "Tableau de signes de f″ et concavité",
  recap: "Récapitulatif",
  coordonnees: "Coordonnées des points remarquables",
  graphique: "Graphique — points remarquables",
};

export function consigneEcranEtudierFonction(ecran: EcranEtudierFonction): string {
  switch (ecran) {
    case "domaine":
      return "Détermine le domaine de définition de f : quelles valeurs de x faut-il exclure ?";
    case "limites":
      return "Détermine le comportement de f à chaque borne de son domaine (asymptotes verticales) et en ±∞ (asymptote horizontale, oblique, ou aucune).";
    case "calculerFPrime":
      return "Dérive f(x) — utilise la règle de dérivation adaptée à la forme de f.";
    case "tableauFPrime":
      return "Complète le tableau de signes de f′(x), puis les variations de f qui en découlent à chaque zone et à chaque racine.";
    case "calculerFSeconde":
      return "Dérive f′(x) — même méthode qu'à l'écran précédent, appliquée cette fois à f′.";
    case "tableauFSeconde":
      return "Complète le tableau de signes de f″(x), puis la concavité de f qui en découle à chaque zone et à chaque racine.";
    case "recap":
      return "Voici la synthèse de ton étude : vérifie-la avant de calculer les coordonnées des points remarquables.";
    case "coordonnees":
      return "Calcule l'ordonnée exacte de chaque point remarquable (entier, fraction ou racine, par exemple 5/3 ou 2 − 4√2).";
    case "graphique":
      return "Place chaque point sur le graphique en tapant à l'endroit correspondant ; la courbe apparaîtra une fois tous les points placés.";
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

/** Ordonnée EXACTE d'un point remarquable (lot C, question 4) : p/q + k√r. Polynomiale en x = e ± √r
 * (zéros de f′ = 3a[(x − e)² − r]) : f(e) − 2ar·(±√r) ; rationnelle c/((x − e)² + k) en e ± √(k/3) :
 * 3c/(4k) ; asymptote oblique en e ± √r (c = a·r) : ae + b ± 2a√r ; abscisse rationnelle : calcul
 * dans ℚ. Décalage vertical compris. */
export interface OrdonneeExacte {
  n: number;
  d: number;
  /** Coefficient de √r (0 si rationnelle). */
  k: number;
  r: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function fraction(n: number, d: number): { n: number; d: number } {
  const g = pgcd(n, d) * (d < 0 ? -1 : 1);
  return { n: n / g, d: d / g };
}

function plus(x: { n: number; d: number }, y: { n: number; d: number }) {
  return fraction(x.n * y.d + y.n * x.d, x.d * y.d);
}

export function ordonneeExacte(exercice: ExerciceEtudierFonction, point: PointCleEtudierFonction): OrdonneeExacte {
  const dec = { n: decalageVertical(exercice), d: 1 };
  const R = point.racine;
  const xq = R && R.exact ? fraction(R.valeur.num, R.valeur.den) : R ? null : fraction(Math.round(point.x * 1e6), 1e6);
  if (exercice.famille === "rationnelleAO") {
    const { a, b, c, e } = exercice;
    if (xq) {
      const v = plus(fraction(a * xq.n + b * xq.d, xq.d), fraction(c * xq.d, xq.n - e * xq.d));
      return { ...v, k: 0, r: 1 };
    }
    const irr = R as { centre: number; radicande: number; signe: 1 | -1 };
    return { n: a * irr.centre + b, d: 1, k: 2 * a * irr.signe, r: irr.radicande };
  }
  const nyau = exercice.noyau;
  if (nyau.type === "polynomiale") {
    const { a, b, c, d } = nyau;
    if (xq) {
      const { n: p, d: q } = xq;
      return { ...plus(fraction(a * p ** 3 + b * p * p * q + c * p * q * q + d * q ** 3, q ** 3), dec), k: 0, r: 1 };
    }
    const irr = R as { centre: number; radicande: number; signe: 1 | -1 };
    const e = irr.centre;
    return { ...plus({ n: a * e ** 3 + b * e * e + c * e + d, d: 1 }, dec), k: -2 * a * irr.radicande * irr.signe, r: irr.radicande };
  }
  const { c, e, k } = nyau;
  if (xq) {
    const { n: p, d: q } = xq;
    return { ...plus(fraction(c * q * q, (p - e * q) ** 2 + k * q * q), dec), k: 0, r: 1 };
  }
  return { ...plus(fraction(3 * c, 4 * k), dec), k: 0, r: 1 };
}

export function formatOrdonneeExacteLatex(o: OrdonneeExacte): string {
  const rat = o.d === 1 ? `${o.n}` : o.n < 0 ? `-\\dfrac{${-o.n}}{${o.d}}` : `\\dfrac{${o.n}}{${o.d}}`;
  if (o.k === 0) return rat;
  const rad = radicalSimplifieLatex(o.k, o.r);
  if (o.n === 0) return `${o.k < 0 ? "-" : ""}${rad}`;
  return `${rat}${o.k < 0 ? "-" : "+"}${rad}`;
}

/** Ordonnée exacte (écran « coordonnées », réponse attendue, corrigé) — « f(e ± √r) = A ± B√r ». */
export function formatOrdonneePointLatex(exercice: ExerciceEtudierFonction, point: PointCleEtudierFonction): string {
  return formatOrdonneeExacteLatex(ordonneeExacte(exercice, point));
}

export function formatAbscissePointLatex(point: PointCleEtudierFonction): string {
  return point.racine ? formatRacineLatex(point.racine) : formatOrdonneeLatex(point.x);
}

/** Libellé du champ de l'écran « coordonnées » : « Maximum : f(2) = ». */
export function formatLabelCoordonneeLatex(point: PointCleEtudierFonction): string {
  return `\\text{${point.label} : }f\\left(${formatAbscissePointLatex(point)}\\right)=`;
}

export function formatCoordonneesLatex(exercice: ExerciceEtudierFonction): string[] {
  return pointsClesEtudierFonction(exercice).map((p) => `\\text{${p.label} : }\\left(${formatAbscissePointLatex(p)}\\,;\\,${formatOrdonneePointLatex(exercice, p)}\\right)`);
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
