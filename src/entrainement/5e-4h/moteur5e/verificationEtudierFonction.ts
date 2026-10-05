/**
 * Couche B (5e) — vérification pour 5gen31 ("Étudier une fonction"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Branche "etudeLocale" : DÉLÈGUE la vérification à 5gen29 (`moteur5e/verificationEtudeLocale.ts`,
 * Couche B ↔ Couche B, import direct) — `domaineAttendu`/`tableauFPrimeAttendu`/
 * `tableauFSecondeAttendu`/`xDesExtremums`/`xDesInflexions`/`valeursFAuxExtremums`/
 * `valeursFAuxInflexions`/`valeurFEtudeLocale`/`deriveeFEtudeLocale`/`deriveeSecondeEtudeLocale`/
 * `verifierEnsembleReelGuide` tous réutilisés tels quels sur `exercice.noyau`.
 *
 * Branche "rationnelleAO" : RÉPLIQUE localement (jamais importée de `generateurs5e/`)
 * `valeurFRationnelleAO`/`deriveeFRationnelleAO`/`deriveeSecondeFRationnelleAO` — même patron que
 * `verificationEtudeLocale.ts` répliquant les évaluateurs de 5gen29. Réutilise
 * `construireTableauAttendu` (EXPORTÉE de `verificationEtudeLocale.ts`, générique depuis cette
 * tâche) pour le tableau f'/f'' de cette branche, sans dupliquer l'algorithme zone/racine.
 *
 * Écran "limites" (NEW) : réutilise DIRECTEMENT `diagnostiquerNombre`/`verifierSigne`
 * (`verificationLimites.ts`, 5gen20) et `diagnostiquerQuotient` (`verificationAsymptoteOblique.ts`,
 * 5gen21) — même patron que `verificationEtudeComplete.ts` (5gen24).
 */
import type { ClassificationExtremum, ClassificationInflexion, RacineEtudeLocale } from "../core5e/etudeLocale.types";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { ExerciceEtudierFonction, ExerciceRationnelleAO } from "../core5e/etudierFonction.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import {
  construireTableauAttendu,
  deriveeFEtudeLocale,
  deriveeSecondeEtudeLocale,
  diagnostiquerNombre,
  domaineAttendu as domaineAttenduEtudeLocale,
  tableauFPrimeAttendu as tableauFPrimeAttenduEtudeLocale,
  tableauFSecondeAttendu as tableauFSecondeAttenduEtudeLocale,
  valeurFEtudeLocale,
  valeurNumeriqueRacineEtudeLocale,
  valeursFAuxExtremums as valeursFAuxExtremumsEtudeLocale,
  valeursFAuxInflexions as valeursFAuxInflexionsEtudeLocale,
  verifierEnsembleReelGuide,
  xDesExtremums as xDesExtremumsEtudeLocale,
  xDesInflexions as xDesInflexionsEtudeLocale,
} from "./verificationEtudeLocale";
import type { TableauEtudeLocaleAttendu } from "./verificationEtudeLocale";
import { diagnostiquerQuotient } from "./verificationAsymptoteOblique";
import { verifierSigne } from "./verificationLimites";

export { diagnostiquerNombre, verifierSigne, diagnostiquerQuotient, verifierEnsembleReelGuide };

// ============================================================================
// Réplique locale de la Couche A, branche "rationnelleAO" — jamais importée.
// ============================================================================

export function valeurFRationnelleAO(exercice: ExerciceRationnelleAO, x: number): number {
  return exercice.a * x + exercice.b + exercice.c / (x - exercice.e);
}

export function deriveeFRationnelleAO(exercice: ExerciceRationnelleAO, x: number): number {
  return exercice.a - exercice.c / (x - exercice.e) ** 2;
}

export function deriveeSecondeFRationnelleAO(exercice: ExerciceRationnelleAO, x: number): number {
  return (2 * exercice.c) / (x - exercice.e) ** 3;
}

// ============================================================================
// Dispatch unifié sur les 2 branches — évite de répéter le `if` dans chaque fonction ci-dessous.
// ============================================================================

export function valeurF(exercice: ExerciceEtudierFonction, x: number): number {
  return exercice.famille === "rationnelleAO" ? valeurFRationnelleAO(exercice, x) : valeurFEtudeLocale(exercice.noyau, x);
}

export function deriveeF(exercice: ExerciceEtudierFonction, x: number): number {
  return exercice.famille === "rationnelleAO" ? deriveeFRationnelleAO(exercice, x) : deriveeFEtudeLocale(exercice.noyau, x);
}

export function deriveeSecondeF(exercice: ExerciceEtudierFonction, x: number): number {
  return exercice.famille === "rationnelleAO" ? deriveeSecondeFRationnelleAO(exercice, x) : deriveeSecondeEtudeLocale(exercice.noyau, x);
}

export function racinesFPrime(exercice: ExerciceEtudierFonction): RacineEtudeLocale[] {
  return exercice.famille === "rationnelleAO" ? exercice.racinesFPrime : exercice.noyau.racinesFPrime;
}

export function classificationFPrime(exercice: ExerciceEtudierFonction): ClassificationExtremum[] {
  return exercice.famille === "rationnelleAO" ? exercice.classificationFPrime : exercice.noyau.classificationFPrime;
}

/** Toujours vide pour "rationnelleAO" (f'' n'a jamais de racine réelle dans cette famille). */
export function racinesFSeconde(exercice: ExerciceEtudierFonction): RacineEtudeLocale[] {
  return exercice.famille === "rationnelleAO" ? [] : exercice.noyau.racinesFSeconde;
}

export function classificationFSeconde(exercice: ExerciceEtudierFonction): ClassificationInflexion[] {
  return exercice.famille === "rationnelleAO" ? [] : exercice.noyau.classificationFSeconde;
}

export function exclusionsCE(exercice: ExerciceEtudierFonction): number[] {
  return exercice.famille === "rationnelleAO" ? [exercice.e] : exercice.noyau.exclusionsCE;
}

/** Vrai ssi le domaine est restreint (écran "domaine" présent) — "rationnelleAO" (toujours 1 AV) ou
 * "rationnelleAvecCE" (toujours 2 AV) ; jamais "polynomiale"/"rationnelleSansCE" (domaine=ℝ). */
export function possedeDomaineRestreint(exercice: ExerciceEtudierFonction): boolean {
  return exclusionsCE(exercice).length > 0;
}

export function domaineAttendu(exercice: ExerciceEtudierFonction): EnsembleReelGuide {
  if (exercice.famille === "etudeLocale") return domaineAttenduEtudeLocale(exercice.noyau);
  return { forme: "prive_points", points: [exercice.e], morceaux: [] };
}

// ============================================================================
// Tableau de signes étendu (écrans "tableauFPrime"/"tableauFSeconde") — délégation directe pour
// "etudeLocale" (5gen29), construction via `construireTableauAttendu` (générique, EXPORTÉE de
// `verificationEtudeLocale.ts`) pour "rationnelleAO".
// ============================================================================

export function tableauFPrimeAttendu(exercice: ExerciceEtudierFonction): TableauEtudeLocaleAttendu {
  if (exercice.famille === "etudeLocale") return tableauFPrimeAttenduEtudeLocale(exercice.noyau);
  return construireTableauAttendu(exclusionsCE(exercice), racinesFPrime(exercice), classificationFPrime(exercice), (x) => deriveeF(exercice, x), { positif: "↗", negatif: "↘" });
}

export function tableauFSecondeAttendu(exercice: ExerciceEtudierFonction): TableauEtudeLocaleAttendu {
  if (exercice.famille === "etudeLocale") return tableauFSecondeAttenduEtudeLocale(exercice.noyau);
  return construireTableauAttendu(exclusionsCE(exercice), racinesFSeconde(exercice), classificationFSeconde(exercice), (x) => deriveeSecondeF(exercice, x), { positif: "∪", negatif: "∩" });
}

export interface ReponseTableauEtudierFonction {
  signes: (string | null)[];
  ligne2: (string | null)[];
}

export function verifierTableauEtudierFonction(reponse: ReponseTableauEtudierFonction, attendu: TableauEtudeLocaleAttendu): boolean {
  return (
    reponse.signes.length === attendu.signes.length &&
    reponse.signes.every((v, i) => v === attendu.signes[i]) &&
    reponse.ligne2.length === attendu.ligne2.length &&
    reponse.ligne2.every((v, i) => v === attendu.ligne2[i])
  );
}

// ============================================================================
// Points clés (extremums/inflexions) — délégation directe pour "etudeLocale", calcul direct sinon.
// ============================================================================

export function xDesExtremums(exercice: ExerciceEtudierFonction): number[] {
  if (exercice.famille === "etudeLocale") return xDesExtremumsEtudeLocale(exercice.noyau);
  return exercice.racinesFPrime.map(valeurNumeriqueRacineEtudeLocale);
}

export function xDesInflexions(exercice: ExerciceEtudierFonction): number[] {
  return exercice.famille === "etudeLocale" ? xDesInflexionsEtudeLocale(exercice.noyau) : [];
}

export function valeursFAuxExtremums(exercice: ExerciceEtudierFonction): number[] {
  if (exercice.famille === "etudeLocale") return valeursFAuxExtremumsEtudeLocale(exercice.noyau);
  return xDesExtremums(exercice).map((x) => valeurF(exercice, x));
}

export function valeursFAuxInflexions(exercice: ExerciceEtudierFonction): number[] {
  return exercice.famille === "etudeLocale" ? valeursFAuxInflexionsEtudeLocale(exercice.noyau) : [];
}

// ============================================================================
// Écran "limites" (NOUVEAU) — un slot par AV-côté + un/deux slot(s) pour les infinis, vérité
// terrain calculée DIRECTEMENT depuis les paramètres exacts de la famille (jamais de surprise
// numérique — formes algébriques simples), via évaluation numérique proche du bord ("cohérence
// interne", CLAUDE.md) plutôt qu'une re-dérivation symbolique par cas.
// ============================================================================

export type TypeAsymptotiqueEtudierFonction = "aucune" | "horizontale" | "obliqueEtVA";

export function typeAsymptotique(exercice: ExerciceEtudierFonction): TypeAsymptotiqueEtudierFonction {
  if (exercice.famille === "rationnelleAO") return "obliqueEtVA";
  return exercice.noyau.type === "polynomiale" ? "aucune" : "horizontale";
}

const EPS_VA = 1e-4;
const GRAND_X = 1e6;

function signeAt(exercice: ExerciceEtudierFonction, x: number): 1 | -1 {
  return valeurF(exercice, x) > 0 ? 1 : -1;
}

export type SlotLimiteEtudierFonction =
  | { kind: "va"; indexVA: number; position: number; cote: "gauche" | "droit"; cible: 1 | -1 }
  | { kind: "infiniSigne"; cote: "moins" | "plus"; cible: 1 | -1 }
  | { kind: "infiniHorizontale"; valeur: number }
  | { kind: "infiniOblique"; pente: number; ordonnee: number };

export function listeSlotsLimites(exercice: ExerciceEtudierFonction): SlotLimiteEtudierFonction[] {
  const slots: SlotLimiteEtudierFonction[] = [];
  exclusionsCE(exercice).forEach((position, indexVA) => {
    slots.push({ kind: "va", indexVA, position, cote: "gauche", cible: signeAt(exercice, position - EPS_VA) });
    slots.push({ kind: "va", indexVA, position, cote: "droit", cible: signeAt(exercice, position + EPS_VA) });
  });

  const type = typeAsymptotique(exercice);
  if (type === "aucune") {
    slots.push({ kind: "infiniSigne", cote: "moins", cible: signeAt(exercice, -GRAND_X) });
    slots.push({ kind: "infiniSigne", cote: "plus", cible: signeAt(exercice, GRAND_X) });
  } else if (type === "horizontale") {
    slots.push({ kind: "infiniHorizontale", valeur: 0 });
  } else {
    const ex = exercice as ExerciceRationnelleAO;
    slots.push({ kind: "infiniOblique", pente: ex.a, ordonnee: ex.b });
  }
  return slots;
}

/** Valeur soumise pour un slot — `1|-1` pour un slot "signe" (va/infiniSigne), `string` (texte
 * libre) pour un slot "horizontale"/"oblique". `null` = pas encore répondu. */
export type ValeurReponseSlotLimite = 1 | -1 | string | null;

export function diagnostiquerSlotLimite(slot: SlotLimiteEtudierFonction, valeur: ValeurReponseSlotLimite): boolean {
  if (slot.kind === "va" || slot.kind === "infiniSigne") return valeur === slot.cible;
  if (slot.kind === "infiniHorizontale") return typeof valeur === "string" && diagnostiquerNombre(valeur, slot.valeur) === "correct";
  return typeof valeur === "string" && diagnostiquerQuotient(valeur, slot.pente, slot.ordonnee) === "correct";
}

export function verifierLimitesEtudierFonction(reponses: ValeurReponseSlotLimite[], slots: SlotLimiteEtudierFonction[]): boolean {
  return reponses.length === slots.length && reponses.every((r, i) => diagnostiquerSlotLimite(slots[i], r));
}

// ============================================================================
// Écrans "calculerFPrime"/"calculerFSeconde" — différence finie centrée générique (technique
// extraite de `verificationFonctionDerivee.ts`/5gen27, réutilisable pour toute fonction réelle f,
// pas seulement `ExerciceFonctionDerivee` — voir décision documentée dans le rapport de tâche :
// `EtapeCalculerFonctionDerivee.tsx`/`formatFonctionDerivee.ts` sont trop couplés au contrat
// `TypeDerivee`/décompositions pour être réutilisés tels quels ici).
// ============================================================================

const DEBUT_APPEL_TRIG = /(?<![a-zA-Z])(sin|cos)\s*\(/i;
const GARDE_APPELS_TRIG_MAX = 10;
const TRIG_MATH: Record<"sin" | "cos", (x: number) => number> = { sin: Math.sin, cos: Math.cos };

interface AppelTrigTrouve {
  debut: number;
  fin: number;
  fonction: "sin" | "cos";
  interieur: string;
}

function trouverAppelTrig(expr: string): AppelTrigTrouve | null {
  const debutMatch = DEBUT_APPEL_TRIG.exec(expr);
  if (debutMatch === null) return null;
  const indexParenOuvrante = debutMatch.index + debutMatch[0].length - 1;
  let profondeur = 0;
  for (let i = indexParenOuvrante; i < expr.length; i++) {
    if (expr[i] === "(") profondeur++;
    else if (expr[i] === ")") {
      profondeur--;
      if (profondeur === 0) {
        return { debut: debutMatch.index, fin: i, fonction: debutMatch[1].toLowerCase() as "sin" | "cos", interieur: expr.slice(indexParenOuvrante + 1, i) };
      }
    }
  }
  return null;
}

/** Évalue `texte` en x=`xValeur`, sin/cos en RADIANS (jamais nécessaire dans ce générateur — les 4
 * familles sont purement algébriques — mais reprise pour rester cohérente avec le reste de la
 * plateforme si un futur usage l'exigeait). Même technique que `verificationFonctionDerivee.ts`. */
function evaluerRadians(texte: string, xValeur: number): number {
  let expr = texte.replace(/(?<![a-zA-Z])x(?![a-zA-Z])/g, `(${xValeur})`);
  let garde = 0;
  let appel: AppelTrigTrouve | null;
  while ((appel = trouverAppelTrig(expr)) && garde < GARDE_APPELS_TRIG_MAX) {
    const valeurInterieure = evaluerExpressionGenerale(appel.interieur, 0);
    const valeur = TRIG_MATH[appel.fonction](valeurInterieure);
    expr = expr.slice(0, appel.debut) + `(${valeur})` + expr.slice(appel.fin + 1);
    garde++;
  }
  return evaluerExpressionGenerale(expr, 0);
}

const EPS_DIFFERENCE_FINIE = 1e-5;
const TOLERANCE = 1e-3;
const MAGNITUDE_MAX_PLAUSIBLE = 1e6;
const MIN_POINTS_VALIDES = 3;

function pointValide(valeur: number): boolean {
  return Number.isFinite(valeur) && Math.abs(valeur) < MAGNITUDE_MAX_PLAUSIBLE;
}

/** Générique — `f` peut être n'importe quelle fonction réelle (jamais couplée à un contrat
 * d'exercice), `xEchantillons` fourni par l'appelant (doit déjà éviter les points hors domaine —
 * voir `echantillonsValides` ci-dessous). */
export function diagnostiquerDeriveeGenerique(texte: string, f: (x: number) => number, xEchantillons: number[]): StatutVerification {
  try {
    let auMoinsUnPoint = false;
    let nbValides = 0;
    for (const x of xEchantillons) {
      const gauche = f(x - EPS_DIFFERENCE_FINIE);
      const droite = f(x + EPS_DIFFERENCE_FINIE);
      if (!pointValide(gauche) || !pointValide(droite)) continue;
      const cible = (droite - gauche) / (2 * EPS_DIFFERENCE_FINIE);
      if (!pointValide(cible)) continue;
      nbValides++;
      auMoinsUnPoint = true;
      const valeurEntree = evaluerRadians(texte, x);
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

/** Pool générique de points d'échantillonnage, filtré pour rester à distance sûre (≥0.5) de toute
 * exclusion (AV) — évite tout pôle, quelle que soit la famille. */
const POOL_X: number[] = [0.7, -0.4, 1.3, -0.9, 2.2, -1.6, 3.1, -2.4, 1.05, -0.65, 2.85, -3.3, 4.2, -1.15, 0.35, -2.85];
const DISTANCE_MIN_EXCLUSION = 0.5;

export function echantillonsValides(exercice: ExerciceEtudierFonction): number[] {
  const exclusions = exclusionsCE(exercice);
  return POOL_X.filter((x) => exclusions.every((e) => Math.abs(x - e) >= DISTANCE_MIN_EXCLUSION));
}

export function diagnostiquerCalculerFPrime(texte: string, exercice: ExerciceEtudierFonction): StatutVerification {
  return diagnostiquerDeriveeGenerique(texte, (x) => valeurF(exercice, x), echantillonsValides(exercice));
}

export function diagnostiquerCalculerFSeconde(texte: string, exercice: ExerciceEtudierFonction): StatutVerification {
  return diagnostiquerDeriveeGenerique(texte, (x) => deriveeF(exercice, x), echantillonsValides(exercice));
}

// ============================================================================
// Écran "graphique" (placement de points par tap) — cibles réelles : chaque extremum, chaque
// inflexion (jamais pour "rationnelleAO"), plus TOUJOURS f(0) (jamais d'intersection avec l'axe
// des x demandée — hors périmètre du pipeline).
// ============================================================================

export interface PointCleEtudierFonction {
  id: string;
  label: string;
  x: number;
  y: number;
}

export function pointsClesEtudierFonction(exercice: ExerciceEtudierFonction): PointCleEtudierFonction[] {
  const points: PointCleEtudierFonction[] = [];
  const xExtremums = xDesExtremums(exercice);
  const yExtremums = valeursFAuxExtremums(exercice);
  xExtremums.forEach((x, i) => points.push({ id: `extremum-${i}`, label: `Point ${points.length + 1}`, x, y: yExtremums[i] }));
  const xInflexions = xDesInflexions(exercice);
  const yInflexions = valeursFAuxInflexions(exercice);
  xInflexions.forEach((x, i) => points.push({ id: `inflexion-${i}`, label: `Point ${points.length + 1}`, x, y: yInflexions[i] }));
  points.push({ id: "origine", label: `Point ${points.length + 1}`, x: 0, y: valeurF(exercice, 0) });
  return points;
}

/** Tolérance de proximité (unités du graphique) — cohérente avec les tolérances "lecture visuelle"
 * déjà établies cette semaine (5gen30 : ~0.3-0.5). Voir CLAUDE.md, "Annonce de précision = tolérance
 * réellement vérifiée" : annoncée dans `ui5e/formatEtudierFonction.ts` comme "à environ 0,4 unité
 * près sur le graphique", exactement cette constante. */
export const TOLERANCE_PLACEMENT_POINT = 0.4;

export function verifierPointPlace(cible: { x: number; y: number }, propose: { x: number; y: number }): boolean {
  const dist = Math.hypot(cible.x - propose.x, cible.y - propose.y);
  return dist <= TOLERANCE_PLACEMENT_POINT;
}
