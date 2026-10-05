/**
 * Couche B (5e) — vérification pour 5gen34 ("Extrema en contexte borné"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Réplique localement (jamais importées) `evalPoly`/`derivativeCoeffs`/`classifierExtrema`
 * (`generateurs5e/extremaBornes/index.ts`) — même patron que `verificationEtudeLocale.ts`
 * répliquant `generateurs5e/etudeLocale/index.ts`.
 *
 * Réutilise DIRECTEMENT `diagnostiquerNombre` (5gen21/5gen28/5gen29, Couche B↔B) pour tout champ
 * numérique — tolérance unique déjà partagée par la quasi-totalité du chantier. Toutes les valeurs
 * de CE générateur sont cependant des entiers EXACTS par construction (voir
 * `core5e/extremaBornes.types.ts`) — la tolérance n'entre en jeu que pour absorber une écriture
 * élève non simplifiée (ex. "12.0" ou "24/2"), jamais un arrondi réel.
 */
import type { ClassificationExtremumBorne, ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { ColonneTableauEtudeLocale, ValeurLigne2Tableau, ValeurSigneTableau } from "../core5e/etudeLocale.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre } from "./verificationAsymptoteOblique";

export { diagnostiquerNombre };

// ============================================================================
// Réplique locale de la Couche A — jamais importée.
// ============================================================================

export function evalPoly(coeffs: number[], t: number): number {
  let s = 0;
  for (let i = 0; i < coeffs.length; i++) s += coeffs[i] * Math.pow(t, i);
  return s;
}

export function derivativeCoeffs(coeffs: number[]): number[] {
  const d: number[] = [];
  for (let i = 1; i < coeffs.length; i++) d.push(coeffs[i] * i);
  return d;
}

export function valeurFExtremaBornes(exercice: ExerciceExtremaBornes, t: number): number {
  return evalPoly(exercice.coeffs, t);
}

export function deriveeFExtremaBornes(exercice: ExerciceExtremaBornes, t: number): number {
  return evalPoly(derivativeCoeffs(exercice.coeffs), t);
}

// ============================================================================
// Écran "deriver" — champ symbolique f'(t), différence finie centrée de `valeurFExtremaBornes`
// (JAMAIS une 2e formule symbolique dérivée à la main côté moteur), même technique que
// `diagnostiquerCalculerDerivee` (`verificationFonctionDerivee.ts`, 5gen27). Variable "t" (jamais
// "x") — substitution textuelle AVANT délégation à `evaluerExpressionGenerale` (qui ne reconnaît
// que "x" comme identifiant de variable).
// ============================================================================

const EPS_DIFFERENCE_FINIE = 1e-4;
const TOLERANCE = 1e-2;
const MIN_POINTS_VALIDES = 3;
const MAGNITUDE_MAX_PLAUSIBLE = 1e9;

function pointValide(v: number): boolean {
  return Number.isFinite(v) && Math.abs(v) < MAGNITUDE_MAX_PLAUSIBLE;
}

/** Points d'échantillonnage à L'INTÉRIEUR de ]0;T[ (le contexte narratif n'a de sens que là),
 * fractions non "rondes" de T pour éviter de tomber exactement sur une racine entière de f'. */
const FRACTIONS_T = [0.137, 0.271, 0.413, 0.586, 0.734, 0.862, 0.219, 0.647];

function evaluerSubstitueT(texte: string, tValeur: number): number {
  const substitue = texte.replace(/(?<![a-zA-Z])t(?![a-zA-Z])/gi, `(${tValeur})`);
  return evaluerExpressionGenerale(substitue, 0);
}

function deriveeParDifferenceFinie(exercice: ExerciceExtremaBornes, t: number): number | null {
  const gauche = valeurFExtremaBornes(exercice, t - EPS_DIFFERENCE_FINIE);
  const droite = valeurFExtremaBornes(exercice, t + EPS_DIFFERENCE_FINIE);
  if (!pointValide(gauche) || !pointValide(droite)) return null;
  return (droite - gauche) / (2 * EPS_DIFFERENCE_FINIE);
}

export function diagnostiquerCalculerDeriveeBorne(texte: string, exercice: ExerciceExtremaBornes): StatutVerification {
  try {
    let auMoinsUnPoint = false;
    let nbValides = 0;
    for (const frac of FRACTIONS_T) {
      const t = frac * exercice.T;
      const cible = deriveeParDifferenceFinie(exercice, t);
      if (cible === null || !pointValide(cible)) continue;
      nbValides++;
      auMoinsUnPoint = true;
      const valeurEntree = evaluerSubstitueT(texte, t);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      const ecart = Math.abs(valeurEntree - cible);
      const toleranceRelative = Math.max(TOLERANCE, Math.abs(cible) * TOLERANCE);
      if (ecart > toleranceRelative) return "not_equivalent";
    }
    return auMoinsUnPoint && nbValides >= MIN_POINTS_VALIDES ? "correct" : "parse_error";
  } catch {
    return "parse_error";
  }
}

// ============================================================================
// Écran "tableauFPrime" — tableau de signes étendu, colonnes zone/racine UNIQUEMENT (jamais
// d'exclusion, domaine [0;T] toujours entier réel) — mêmes types que `TableauEtudeLocaleBuilder`/
// `TableauEtudeLocaleRecap` (5gen29, réutilisés TEL QUEL, voir CLAUDE.md/App5gen34.tsx), jamais
// importés depuis `verificationEtudeLocale.ts` (indépendance totale des 2 générateurs).
// ============================================================================

export interface TableauFPrimeBorneAttendu {
  colonnes: ColonneTableauEtudeLocale[];
  signes: ValeurSigneTableau[];
  ligne2: (ValeurLigne2Tableau | null)[];
}

export interface ReponseTableauFPrimeBorne {
  signes: (ValeurSigneTableau | null)[];
  ligne2: (ValeurLigne2Tableau | null)[];
}

function representantsZonesRacines(racinesTriees: number[]): number[] {
  const reps: number[] = [racinesTriees[0] - 1];
  for (let i = 0; i < racinesTriees.length - 1; i++) reps.push((racinesTriees[i] + racinesTriees[i + 1]) / 2);
  reps.push(racinesTriees[racinesTriees.length - 1] + 1);
  return reps;
}

export function tableauFPrimeBorneAttendu(exercice: ExerciceExtremaBornes): TableauFPrimeBorneAttendu {
  const racines = exercice.racinesFPrime;
  const reps = representantsZonesRacines(racines);
  const deriv = derivativeCoeffs(exercice.coeffs);
  const colonnes: ColonneTableauEtudeLocale[] = [];
  const signes: ValeurSigneTableau[] = [];
  const ligne2: (ValeurLigne2Tableau | null)[] = [];

  function pousserZone(indexRep: number) {
    const positif = evalPoly(deriv, reps[indexRep]) > 0;
    colonnes.push({ type: "zone", index: -1 });
    signes.push(positif ? "+" : "-");
    ligne2.push(positif ? "↗" : "↘");
  }

  racines.forEach((_, i) => {
    pousserZone(i);
    colonnes.push({ type: "racine", index: i });
    signes.push("0");
    ligne2.push(exercice.classificationFPrime[i]);
  });
  pousserZone(racines.length);

  return { colonnes, signes, ligne2 };
}

export function tableauFPrimeBorneEstComplet(reponse: ReponseTableauFPrimeBorne, attendu: TableauFPrimeBorneAttendu): boolean {
  return reponse.signes.length === attendu.signes.length && reponse.signes.every((v) => v !== null) && reponse.ligne2.length === attendu.ligne2.length && reponse.ligne2.every((v) => v !== null);
}

export function verifierTableauFPrimeBorne(reponse: ReponseTableauFPrimeBorne, attendu: TableauFPrimeBorneAttendu): boolean {
  return (
    reponse.signes.length === attendu.signes.length &&
    reponse.signes.every((v, i) => v === attendu.signes[i]) &&
    reponse.ligne2.length === attendu.ligne2.length &&
    reponse.ligne2.every((v, i) => v === attendu.ligne2[i])
  );
}

// ============================================================================
// Écrans "valeursExtremums"/"valeursBornes" — N champs numériques vérifiés comme un ENSEMBLE (ordre
// indifférent), même patron que `verifierEnsembleNumerique`/`diagnostiquerChampParmiCibles`
// (5gen29) — répliqué ici (jamais importé, indépendance des 2 générateurs).
// ============================================================================

export function diagnostiquerChampParmiCiblesBorne(texte: string, cibles: number[]): StatutVerification {
  if (cibles.length === 0) return "parse_error";
  const base = diagnostiquerNombre(texte, cibles[0]);
  if (base === "parse_error") return "parse_error";
  if (base === "correct") return "correct";
  return cibles.some((c) => diagnostiquerNombre(texte, c) === "correct") ? "correct" : "not_equivalent";
}

export function verifierEnsembleNumeriqueBorne(reponses: string[], cibles: number[]): boolean {
  if (reponses.length !== cibles.length) return false;
  const restantes = [...cibles];
  for (const rep of reponses) {
    const idx = restantes.findIndex((v) => diagnostiquerNombre(rep, v) === "correct");
    if (idx === -1) return false;
    restantes.splice(idx, 1);
  }
  return restantes.length === 0;
}

function xDesExtremumsBorne(exercice: ExerciceExtremaBornes): number[] {
  return exercice.racinesFPrime;
}

export function valeursFAuxExtremumsBorne(exercice: ExerciceExtremaBornes): number[] {
  return xDesExtremumsBorne(exercice).map((t) => valeurFExtremaBornes(exercice, t));
}

export function valeursFAuxBornes(exercice: ExerciceExtremaBornes): number[] {
  return [valeurFExtremaBornes(exercice, 0), valeurFExtremaBornes(exercice, exercice.T)];
}

// ============================================================================
// Écran "comparaison" — LE piège central : identifier, PARMI TOUTES les valeurs candidates
// (extrema locaux confirmés à l'écran 3 + bornes confirmées à l'écran 4), laquelle est le MAXIMUM
// ABSOLU et laquelle est le MINIMUM ABSOLU. Vérité terrain recalculée directement depuis
// `exercice.coeffs` (vérification par cohérence interne, CLAUDE.md), jamais depuis un champ
// pré-calculé/stocké à la génération.
// ============================================================================

export interface CandidatComparaisonBorne {
  t: number;
  valeur: number;
  /** "extremum" (racine de f', classification jointe) ou "borne" (t=0 ou t=T). */
  origine: "extremum" | "borne";
  classification: ClassificationExtremumBorne | null;
}

export function candidatsComparaisonBorne(exercice: ExerciceExtremaBornes): CandidatComparaisonBorne[] {
  const extrema: CandidatComparaisonBorne[] = exercice.racinesFPrime.map((t, i) => ({
    t,
    valeur: valeurFExtremaBornes(exercice, t),
    origine: "extremum" as const,
    classification: exercice.classificationFPrime[i],
  }));
  const bornes: CandidatComparaisonBorne[] = [
    { t: 0, valeur: valeurFExtremaBornes(exercice, 0), origine: "borne", classification: null },
    { t: exercice.T, valeur: valeurFExtremaBornes(exercice, exercice.T), origine: "borne", classification: null },
  ];
  return [...bornes.slice(0, 1), ...extrema, ...bornes.slice(1)].sort((a, b) => a.t - b.t);
}

export function indexMaxAbsoluBorne(exercice: ExerciceExtremaBornes): number {
  const candidats = candidatsComparaisonBorne(exercice);
  let meilleur = 0;
  for (let i = 1; i < candidats.length; i++) if (candidats[i].valeur > candidats[meilleur].valeur) meilleur = i;
  return meilleur;
}

export function indexMinAbsoluBorne(exercice: ExerciceExtremaBornes): number {
  const candidats = candidatsComparaisonBorne(exercice);
  let meilleur = 0;
  for (let i = 1; i < candidats.length; i++) if (candidats[i].valeur < candidats[meilleur].valeur) meilleur = i;
  return meilleur;
}

export interface ReponseComparaisonBorne {
  indexMax: number;
  indexMin: number;
}

export function verifierComparaisonBorne(reponse: ReponseComparaisonBorne, exercice: ExerciceExtremaBornes): boolean {
  return reponse.indexMax === indexMaxAbsoluBorne(exercice) && reponse.indexMin === indexMinAbsoluBorne(exercice);
}
