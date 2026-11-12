/**
 * Couche B (5e) — vérification pour 5gen30 ("Lecture graphique — dérivées et applications").
 * N'importe jamais rien de `src/generateurs5e/`.
 *
 * Réplique LOCALEMENT (jamais importée) les formules de dérivée des morceaux de
 * `generateurs5e/lectureGraphiqueDerivees/courbeNumerique.ts` — seul le SIGNE de f'/f'' dans chaque
 * zone d'un tableau est nécessaire ici ; les positions (extremums, paliers, points d'inflexion) sont
 * la vérité terrain stockée dans l'exercice.
 *
 * Réutilise DIRECTEMENT (Couche B ↔ Couche B) l'écran « nommer les asymptotes » de 5gen22
 * (`listeAsymptotes`, `diagnostiquerNommerAsymptotes`) et les tableaux de 5gen29
 * (`tableauEstComplet`, `verifierTableauEtudeLocale`).
 */
import type { ExerciceLectureGraphiqueDerivees, MorceauCourbeDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ColonneTableauEtudeLocale, ValeurLigne2Tableau, ValeurSigneTableau } from "../core5e/etudeLocale.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { listeAsymptotes } from "./typesLectureGraphiqueLimites";
import { diagnostiquerNommerAsymptotes, retirerPrefixeEquation } from "./verificationLectureGraphiqueLimites";
import type { ReponseTableauEtudeLocale, TableauEtudeLocaleAttendu } from "./verificationEtudeLocale";
import { tableauEstComplet, verifierTableauEtudeLocale } from "./verificationEtudeLocale";

export { listeAsymptotes, diagnostiquerNommerAsymptotes, tableauEstComplet, verifierTableauEtudeLocale };
export type { ReponseTableauEtudeLocale, TableauEtudeLocaleAttendu };

// ============================================================================
// Réplique locale des dérivées des morceaux (voir `courbeNumerique.ts`).
// ============================================================================

function deriveeMorceau(m: MorceauCourbeDerivees, x: number): number {
  switch (m.kind) {
    case "hermite": {
      const h = m.x1 - m.x0;
      const t = (x - m.x0) / h;
      const t2 = t * t;
      return ((6 * t2 - 6 * t) * m.y0) / h + (3 * t2 - 4 * t + 1) * m.s0 + ((-6 * t2 + 6 * t) * m.y1) / h + (3 * t2 - 2 * t) * m.s1;
    }
    case "expo":
      return m.pente + m.c * m.k * Math.exp(m.k * (x - m.xRef));
    case "divergence":
      return -m.coef / (x - m.a) ** 2;
    case "parabole":
      return 2 * m.coef * (x - m.sommet);
    case "quadratique":
      return m.m + 2 * m.b * (x - m.a);
  }
}

function deriveeSecondeMorceau(m: MorceauCourbeDerivees, x: number): number {
  switch (m.kind) {
    case "hermite": {
      const h = m.x1 - m.x0;
      const t = (x - m.x0) / h;
      return (((12 * t - 6) * m.y0) / h + (6 * t - 4) * m.s0 + ((-12 * t + 6) * m.y1) / h + (6 * t - 2) * m.s1) / h;
    }
    case "expo":
      return m.c * m.k * m.k * Math.exp(m.k * (x - m.xRef));
    case "divergence":
      return (2 * m.coef) / (x - m.a) ** 3;
    case "parabole":
    case "quadratique":
      return 2 * (m.kind === "parabole" ? m.coef : m.b);
  }
}

function morceauEn(morceaux: MorceauCourbeDerivees[], x: number): MorceauCourbeDerivees {
  let meilleur = morceaux[0];
  let distance = Infinity;
  for (const m of morceaux) {
    if (x >= m.x0 && x <= m.x1) return m;
    const d = x < m.x0 ? m.x0 - x : x - m.x1;
    if (d < distance) {
      distance = d;
      meilleur = m;
    }
  }
  return meilleur;
}

// ============================================================================
// Points où f' s'annule (extremums + paliers) — vérité terrain triée.
// ============================================================================

export interface PointTangenteHorizontale {
  position: number;
  valeur: number;
  classification: "max" | "min" | "ni_lun_ni_lautre";
}

export function pointsTangenteHorizontale(exercice: ExerciceLectureGraphiqueDerivees): PointTangenteHorizontale[] {
  return [
    ...exercice.extrema.map((e) => ({ position: e.position, valeur: e.valeur, classification: e.classification })),
    ...exercice.paliers.map((p) => ({ position: p.position, valeur: p.valeur, classification: "ni_lun_ni_lautre" as const })),
  ].sort((a, b) => a.position - b.position);
}

// ============================================================================
// Tableaux de signes (colonnes : points où f' (resp. f'') s'annule + AV).
// ============================================================================

function representantsZones(valeursTriees: number[]): number[] {
  if (valeursTriees.length === 0) return [0];
  const reps: number[] = [valeursTriees[0] - 1];
  for (let i = 0; i < valeursTriees.length - 1; i++) reps.push((valeursTriees[i] + valeursTriees[i + 1]) / 2);
  reps.push(valeursTriees[valeursTriees.length - 1] + 1);
  return reps;
}

function construireTableau(
  positions: number[],
  classification: ValeurLigne2Tableau[],
  exclusions: number[],
  evaluer: (x: number) => number,
  symboles: { positif: ValeurLigne2Tableau; negatif: ValeurLigne2Tableau },
): TableauEtudeLocaleAttendu {
  const marqueurs: { valeur: number; colonne: ColonneTableauEtudeLocale }[] = [
    ...positions.map((v, i) => ({ valeur: v, colonne: { type: "racine" as const, index: i } })),
    ...exclusions.map((v, i) => ({ valeur: v, colonne: { type: "exclusion" as const, index: i } })),
  ];
  marqueurs.sort((a, b) => a.valeur - b.valeur);
  const reps = representantsZones(marqueurs.map((m) => m.valeur));
  const colonnes: ColonneTableauEtudeLocale[] = [];
  const signes: ValeurSigneTableau[] = [];
  const ligne2: (ValeurLigne2Tableau | null)[] = [];
  const pousserZone = (i: number) => {
    const signe: ValeurSigneTableau = evaluer(reps[i]) > 0 ? "+" : "-";
    colonnes.push({ type: "zone", index: -1 });
    signes.push(signe);
    ligne2.push(signe === "+" ? symboles.positif : symboles.negatif);
  };
  marqueurs.forEach((m, i) => {
    pousserZone(i);
    colonnes.push(m.colonne);
    if (m.colonne.type === "racine") {
      signes.push("0");
      ligne2.push(classification[m.colonne.index]);
    } else {
      signes.push("∄");
      ligne2.push(null);
    }
  });
  pousserZone(reps.length - 1);
  return { colonnes, signes, ligne2 };
}

export function tableauFPrimeAttendu(exercice: ExerciceLectureGraphiqueDerivees): TableauEtudeLocaleAttendu {
  const points = pointsTangenteHorizontale(exercice);
  return construireTableau(
    points.map((p) => p.position),
    points.map((p) => p.classification),
    exercice.asymptotique.vas.map((va) => va.position),
    (x) => deriveeMorceau(morceauEn(exercice.morceaux, x), x),
    { positif: "↗", negatif: "↘" },
  );
}

export function tableauFSecondeAttendu(exercice: ExerciceLectureGraphiqueDerivees): TableauEtudeLocaleAttendu {
  return construireTableau(
    exercice.inflexions.map((p) => p.position),
    exercice.inflexions.map(() => "pi" as const),
    exercice.asymptotique.vas.map((va) => va.position),
    (x) => deriveeSecondeMorceau(morceauEn(exercice.morceaux, x), x),
    { positif: "∪", negatif: "∩" },
  );
}

// ============================================================================
// Lectures numériques — tolérances annoncées à l'écran (lecture sur un graphique quadrillé).
// ============================================================================

/** Abscisse d'un point à tangente horizontale (points clés placés sur la grille 0,5). */
export const TOLERANCE_POSITION_TANGENTE = 0.3;
/** Abscisse d'un point d'inflexion (changement de courbure moins net à l'œil). */
export const TOLERANCE_POSITION_INFLEXION = 0.5;
/** Ordonnée d'un extremum. */
export const TOLERANCE_VALEUR_EXTREMUM = 0.3;

/** Nombre lu : préfixe « x = », « y = », « f(…) = » ou « ≈ » toléré ; une lettre restante est une
 * écriture illisible (jamais évaluée en x = 0). */
export function lireNombre(texte: string): number | null {
  const t = retirerPrefixeEquation(texte.replace(/^\s*f\s*\([^)]*\)\s*[=≈]\s*/i, "").replace(/≈/g, "")).trim();
  if (t === "" || /[a-zA-Z]/.test(t)) return null;
  try {
    const v = evaluerExpressionGenerale(t, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function diagnostiquerValeurTolerance(texte: string, cible: number, tolerance: number): StatutVerification {
  const v = lireNombre(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= tolerance + 1e-9 ? "correct" : "not_equivalent";
}

export function diagnostiquerValeurExtremum(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeurTolerance(texte, cible, TOLERANCE_VALEUR_EXTREMUM);
}

/** Réponse « liste d'abscisses » : lignes libres (ordre indifférent) ou « aucun ». */
export interface ReponseListeAbscisses {
  aucun: boolean;
  valeurs: string[];
}

export interface DiagnosticListeAbscisses {
  /** Un statut par ligne (appariement glouton : une ligne correcte consomme une cible). */
  statuts: StatutVerification[];
  correct: boolean;
  /** « Aucun » coché à tort, ou l'inverse : verdict fermé faux, l'écran se clôt. */
  verdictAucunFaux: boolean;
  /** Au moins une ligne illisible : pas de tentative consommée. */
  illisible: boolean;
}

export function diagnostiquerListeAbscisses(reponse: ReponseListeAbscisses, cibles: number[], tolerance: number): DiagnosticListeAbscisses {
  const aucunAttendu = cibles.length === 0;
  if (reponse.aucun) return { statuts: [], correct: aucunAttendu, verdictAucunFaux: !aucunAttendu, illisible: false };
  const utilisees = new Set<number>();
  const statuts = reponse.valeurs.map((texte): StatutVerification => {
    const v = lireNombre(texte);
    if (v === null) return "parse_error";
    const i = cibles.findIndex((c, k) => !utilisees.has(k) && Math.abs(v - c) <= tolerance + 1e-9);
    if (i === -1) return "not_equivalent";
    utilisees.add(i);
    return "correct";
  });
  const correct = !aucunAttendu && reponse.valeurs.length === cibles.length && statuts.every((s) => s === "correct");
  return { statuts, correct, verdictAucunFaux: aucunAttendu, illisible: statuts.includes("parse_error") };
}

export function positionsTangenteHorizontale(exercice: ExerciceLectureGraphiqueDerivees): number[] {
  return pointsTangenteHorizontale(exercice).map((p) => p.position);
}
export function positionsInflexions(exercice: ExerciceLectureGraphiqueDerivees): number[] {
  return exercice.inflexions.map((p) => p.position);
}
