import type { ExerciceLongueurArc, ExerciceLongueurArcA, ExerciceLongueurArcB, ExerciceLongueurArcC } from "../core6e/longueurArc.types";
import type { PhaseLongueurArc, ResultatExerciceLongueurArc } from "../moteur6e/typesLongueurArc";
import { phasesPourExercice } from "../moteur6e/typesLongueurArc";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen28`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatCalculAires.ts`/`formatCalculPrimitives.ts`,
 * jamais importé (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin (bug déjà rencontré et corrigé sur 6gen23/6gen26, voir en-tête
 * `ui6e/formatCalculAires.ts`)** — n'a en fait JAMAIS d'occasion de se produire ici : n∈{2,3,4},
 * k∈{1,2,3}, a,b entiers POSITIFS par construction (voir `core6e/longueurArc.types.ts`) — aucun
 * coefficient de signe variable n'entre dans le formatage LaTeX de ce générateur (contrairement à
 * 6gen23/6gen26, où un `TermeA.coef` tiré négativement OBLIGE à assembler signe+magnitude
 * ensemble). Testé explicitement malgré tout (`formatLongueurArc.test.ts`, "régression — aucun
 * signe orphelin...") — discipline systématique du chantier, jamais supposée acquise sans preuve.
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

const FORMULE_LONGUEUR_ARC_TEXTE = "L = ∫[a;b] √(1+f'(x)²) dx";
const FORMULE_LONGUEUR_ARC_LATEX = "L=\\int_{a}^{b}\\sqrt{1+f'(x)^2}\\,dx";

/** x^exposant, divisé par `denom` SEULEMENT si `denom≠1` (évite une fraction "sur 1" inutile,
 * ex. n=2 dans la famille A où n−1=1). */
function fracPuissanceX(exposant: number, denom: number): string {
  const corps = `x^{${exposant}}`;
  return denom === 1 ? corps : `\\frac{${corps}}{${denom}}`;
}

// ============================================================================
// Famille A — Racine parfaite par construction.
// ============================================================================

function formuleFA(n: number): string {
  return `\\frac{1}{2}\\left(${fracPuissanceX(n + 1, n + 1)}+${fracPuissanceX(1 - n, n - 1)}\\right)`;
}
function formuleFPrimeA(n: number): string {
  return `\\frac{1}{2}\\left(x^{${n}}-x^{-${n}}\\right)`;
}
function formuleRacineSimplifieeA(n: number): string {
  return `\\frac{1}{2}\\left(x^{${n}}+x^{-${n}}\\right)`;
}
function formuleFPrimeCarreDeveloppeA(n: number): string {
  return `\\frac{1}{4}\\left(x^{${2 * n}}-2+x^{${-2 * n}}\\right)`;
}

export function consigneGeneraleA(): string {
  return `On considère la fonction f définie ci-dessous. On veut calculer la longueur de l'arc de sa courbe entre x=a et x=b, donnée par ${FORMULE_LONGUEUR_ARC_TEXTE}.`;
}
export function blocDonneesA(exercice: ExerciceLongueurArcA): string[] {
  return [FORMULE_LONGUEUR_ARC_LATEX, `f(x)=${formuleFA(exercice.n)}`, `a=${exercice.a}\\text{, }b=${exercice.b}`];
}
export function consigneEcranA(phase: PhaseLongueurArc): string {
  if (phase === "aEcran1") return "Calcule f'(x).";
  if (phase === "aEcran2") return "Calcule 1+f'(x)² et simplifie √(1+f'(x)²), à partir de f'(x) confirmé à l'étape précédente.";
  return "Calcule la longueur de l'arc L, à partir de la forme simplifiée confirmée à l'étape précédente.";
}
export function etatActuelA(exercice: ExerciceLongueurArcA, phase: PhaseLongueurArc): string[] | null {
  const lignes: string[] = [];
  if (phase === "aEcran2" || phase === "aEcran3") lignes.push(`f'(x)=${formuleFPrimeA(exercice.n)}`);
  if (phase === "aEcran3") lignes.push(`\\sqrt{1+f'(x)^2}=${formuleRacineSimplifieeA(exercice.n)}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsA(phase: PhaseLongueurArc): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "f'(x) =", placeholder: "ex : 0.5*(x^3-x^(-3))" }];
  if (phase === "aEcran2") return [{ type: "texte", label: "√(1+f'(x)²) simplifiée =", placeholder: "ex : 0.5*(x^3+x^(-3))" }];
  return [{ type: "texte", label: "L =", placeholder: "ex : 12.5" }];
}
export function niveauAideMaxA(phase: PhaseLongueurArc): number {
  return phase === "aEcran2" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "aEcran2") return { texte: "Dans un exercice de longueur d'arc, 1+f'(x)² est presque toujours construit pour être un carré parfait — cherche à regrouper l'expression sous cette forme avant de désespérer, plutôt que de laisser une racine non simplifiable.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2A(exercice: ExerciceLongueurArcA, phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "aEcran2") return { texte: "Développement de f'(x)² (regroupement final non fait) :", latex: `f'(x)^2=${formuleFPrimeCarreDeveloppeA(exercice.n)}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille B — Substitution t=√(x²+k²), bornes construites.
// ============================================================================

function formuleFB(k: number): string {
  return k === 1 ? "\\ln(x)" : `${k}\\ln(x)`;
}
function racineExacte(carre: number): string {
  return `\\sqrt{${carre}}`;
}
function formuleIntegrandeEnTB(k: number): string {
  return `\\dfrac{t^{2}}{t^{2}-${k * k}}`;
}
function formulePrimitiveEnTB(k: number): string {
  return `t+\\dfrac{${k}}{2}\\ln\\left|\\dfrac{t-${k}}{t+${k}}\\right|`;
}

export function consigneGeneraleB(): string {
  return `On considère la fonction f définie ci-dessous. On veut calculer la longueur de l'arc de sa courbe entre x=a et x=b, donnée par ${FORMULE_LONGUEUR_ARC_TEXTE}.`;
}
export function blocDonneesB(exercice: ExerciceLongueurArcB): string[] {
  return [FORMULE_LONGUEUR_ARC_LATEX, `f(x)=${formuleFB(exercice.k)}`, `a=${racineExacte(exercice.t1 * exercice.t1 - exercice.k * exercice.k)}\\text{, }b=${racineExacte(exercice.t2 * exercice.t2 - exercice.k * exercice.k)}`];
}
export function consigneEcranB(phase: PhaseLongueurArc): string {
  if (phase === "bEcran1") return "Pose t=√(x²+k²) et calcule les 2 valeurs de t correspondant aux bornes x=a et x=b données ci-dessus.";
  if (phase === "bEcran2") return "Exprime x·dx en fonction de t·dt (dérive t²=x²+k²), puis réécris complètement l'intégrale en fonction de t uniquement.";
  if (phase === "bEcran3") return "Décompose t²/(t²−k²)=1+k²/(t²−k²) et intègre (fractions simples), à partir de la forme confirmée à l'étape précédente.";
  return "Évalue la primitive entre les bornes en t confirmées à l'étape 1, à partir de la primitive confirmée à l'étape précédente.";
}
export function etatActuelB(exercice: ExerciceLongueurArcB, phase: PhaseLongueurArc): string[] | null {
  const bornesT = `t_1=${exercice.t1}\\text{, }t_2=${exercice.t2}`;
  const lignes: string[] = [];
  if (phase === "bEcran2" || phase === "bEcran3" || phase === "bEcran4") lignes.push(bornesT);
  if (phase === "bEcran3" || phase === "bEcran4") lignes.push(`\\text{Intégrande en }t\\text{ confirmé : }${formuleIntegrandeEnTB(exercice.k)}`);
  if (phase === "bEcran4") lignes.push(`\\text{Primitive en }t\\text{ confirmée : }${formulePrimitiveEnTB(exercice.k)}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsB(phase: PhaseLongueurArc): ChampDef[] {
  if (phase === "bEcran1")
    return [
      { type: "texte", label: "t (en x=a) =", placeholder: "ex : 2" },
      { type: "texte", label: "t (en x=b) =", placeholder: "ex : 4" },
    ];
  if (phase === "bEcran2") return [{ type: "texte", label: "Intégrale réécrite en t (intégrande) =", placeholder: "ex : t^2/(t^2-1)" }];
  if (phase === "bEcran3") return [{ type: "texte", label: "Primitive en t =", placeholder: "ex : t+0.5*ln(abs((t-1)/(t+1)))" }];
  return [{ type: "texte", label: "L =", placeholder: "ex : 2.3" }];
}
export function niveauAideMaxB(phase: PhaseLongueurArc): number {
  return phase === "bEcran1" ? 2 : 0;
}
export function aideNiveau1B(phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Calcule t directement depuis x avec t=√(x²+k²) — remplace simplement x et k par leurs valeurs à chaque borne, aucune inversion nécessaire.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2B(exercice: ExerciceLongueurArcB, phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Équation pour la borne a (calcul non fait) :", latex: `t^2=a^2+${exercice.k}^2` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — Cas simple, substitution directe.
// ============================================================================

export function consigneGeneraleC(): string {
  return `On considère la fonction f définie ci-dessous. On veut calculer la longueur de l'arc de sa courbe entre x=a et x=b, donnée par ${FORMULE_LONGUEUR_ARC_TEXTE}.`;
}
export function blocDonneesC(exercice: ExerciceLongueurArcC): string[] {
  return [FORMULE_LONGUEUR_ARC_LATEX, `f(x)=x^{\\frac{3}{2}}`, `a=${exercice.a}\\text{, }b=${exercice.b}`];
}
export function consigneEcranC(phase: PhaseLongueurArc): string {
  if (phase === "cEcran1") return "Calcule f'(x), puis 1+f'(x)².";
  if (phase === "cEcran2") return "Pose une substitution simple (u=1+f'(x)²) et intègre √(1+f'(x)²), à partir de la forme confirmée à l'étape précédente.";
  return "Évalue la primitive entre les bornes [a;b], à partir de la primitive confirmée à l'étape précédente.";
}
export function etatActuelC(phase: PhaseLongueurArc): string[] | null {
  const lignes: string[] = [];
  if (phase === "cEcran2" || phase === "cEcran3") lignes.push(`1+f'(x)^2=1+\\dfrac{9}{4}x`);
  if (phase === "cEcran3") lignes.push(`\\text{Primitive confirmée : }\\dfrac{8}{27}\\left(1+\\dfrac{9}{4}x\\right)^{\\frac{3}{2}}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsC(phase: PhaseLongueurArc): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "texte", label: "1+f'(x)² =", placeholder: "ex : 1+2.25*x" }];
  if (phase === "cEcran2") return [{ type: "texte", label: "Primitive de √(1+f'(x)²) =", placeholder: "ex : (8/27)*(1+2.25*x)^1.5" }];
  return [{ type: "texte", label: "L =", placeholder: "ex : 9.37" }];
}
export function niveauAideMaxC(phase: PhaseLongueurArc): number {
  return phase === "cEcran2" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Reconnais la forme composée √(affine) — elle se primitive comme n'importe quelle fonction composée √(u(x)), une technique déjà connue.", latex: null };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Substitution posée (intégration non faite) :", latex: `u=1+\\dfrac{9}{4}x\\text{, }du=\\dfrac{9}{4}dx` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceLongueurArc): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
  }
}

export function blocDonnees(exercice: ExerciceLongueurArc): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
  }
}

export function consigneEcran(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(phase);
    case "C":
      return consigneEcranC(phase);
  }
}

export function etatActuel(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(phase);
  }
}

export function champsEcran(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
  }
}

export function aideNiveau1(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(phase);
    case "C":
      return aideNiveau1C(phase);
  }
}

export function aideNiveau2(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseLongueurArc, string> = {
  aEcran1: "Étape 1 (f'(x))",
  aEcran2: "Étape 2 (racine simplifiée)",
  aEcran3: "Étape 3 (longueur)",
  bEcran1: "Étape 1 (bornes en t)",
  bEcran2: "Étape 2 (intégrale en t)",
  bEcran3: "Étape 3 (primitive en t)",
  bEcran4: "Étape 4 (longueur)",
  cEcran1: "Étape 1 (1+f'(x)²)",
  cEcran2: "Étape 2 (primitive)",
  cEcran3: "Étape 3 (longueur)",
};

export const LIBELLE_FAMILLE: Record<ExerciceLongueurArc["famille"], string> = {
  A: "A — Racine parfaite par construction",
  B: "B — Substitution t=√(x²+k²)",
  C: "C — Cas simple, substitution directe",
};

/** Arrondi à 3 décimales pour affichage (récapitulatif) — jamais utilisé pour la vérification
 * (qui reste exacte, tolérance `moteur6e/`). */
function valeurArrondie(x: number): number {
  return Math.round(x * 1000) / 1000;
}
function nombreLatex(x: number): string {
  return `\\approx ${valeurArrondie(x)}`;
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [`f'(x)=${formuleFPrimeA(exercice.n)}`];
    if (phase === "aEcran2") return [`\\sqrt{1+f'(x)^2}=${formuleRacineSimplifieeA(exercice.n)}`];
    const longueur = exercice.primitiveReference(exercice.b) - exercice.primitiveReference(exercice.a);
    return [`L${nombreLatex(longueur)}`];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`t_1=${exercice.t1}\\text{, }t_2=${exercice.t2}`];
    if (phase === "bEcran2") return [formuleIntegrandeEnTB(exercice.k)];
    if (phase === "bEcran3") return [formulePrimitiveEnTB(exercice.k)];
    const longueur = exercice.primitiveEnTReference(exercice.t2) - exercice.primitiveEnTReference(exercice.t1);
    return [`L${nombreLatex(longueur)}`];
  }
  // Famille C.
  if (phase === "cEcran1") return [`1+f'(x)^2=1+\\dfrac{9}{4}x`];
  if (phase === "cEcran2") return [`\\dfrac{8}{27}\\left(1+\\dfrac{9}{4}x\\right)^{\\frac{3}{2}}`];
  const longueur = exercice.primitiveReference(exercice.b) - exercice.primitiveReference(exercice.a);
  return [`L${nombreLatex(longueur)}`];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice : 3 pour A/C, 4 pour B). */
export function calculerTotalPointsLongueurArc(resultat: ResultatExerciceLongueurArc): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
