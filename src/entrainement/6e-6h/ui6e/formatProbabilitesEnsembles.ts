import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceProbabilitesEnsembles } from "../core6e/probabilitesEnsembles.types";
import type { PhaseProbabilitesEnsembles, ResultatExerciceProbabilitesEnsembles } from "../moteur6e/typesProbabilitesEnsembles";
import { phasesPourExercice } from "../moteur6e/typesProbabilitesEnsembles";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen30`. Dispatch sur
 * `exercice.famille` PUIS `phase` (et le champ pertinent de l'exercice où besoin), même principe que
 * `formatCalculPrimitives.ts` (6gen23). Le placeholder standard `"(forme exacte ou décimale arrondie
 * au centième)"` (`docs/conventions-transversales.md`) annonce la tolérance RÉELLEMENT vérifiée
 * côté `moteur6e/verificationProbabilites.ts`/`verificationProbabilitesEnsembles.ts` (0,01) — jamais
 * une valeur inventée ici.
 *
 * **2 types d'écran** : à CHAMP(S) libre(s) (`champsEcran`, consommé par
 * `EtapeChampsProbabilitesEnsembles`) ou à CHOIX (`choixEcran`, boutons `.btn.toggle-active`,
 * consommé par `EtapeChoixProbabilitesEnsembles`) — `estEcranChoix(phase)` indique lequel des deux
 * `App6gen30.tsx` doit rendre. `aEcran3`/`bEcran4` sont les 2 seuls écrans à choix de ce générateur.
 */

export interface ChampDef {
  label: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface OptionChoix {
  id: string;
  label: string;
}

const ANNONCE_TOLERANCE = "(forme exacte ou décimale arrondie au centième)";

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible LaTeX pour un rationnel EXACT num/den — jamais de décimal (CLAUDE.md). */
export function formatFractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const signe = num < 0 !== den < 0 ? "-" : "";
  let n = Math.abs(num);
  let d = Math.abs(den);
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${signe}${n}` : `${signe}\\dfrac{${n}}{${d}}`;
}

// ============================================================================
// Famille A.
// ============================================================================

function nAetBbarA(ex: ExerciceFamilleA): number {
  return ex.nA - ex.nAetB;
}
function nAbaretBA(ex: ExerciceFamilleA): number {
  return ex.nB - ex.nAetB;
}
function nAbaretBbarA(ex: ExerciceFamilleA): number {
  return ex.denominateur - ex.nA - ex.nB + ex.nAetB;
}
function nAouBA(ex: ExerciceFamilleA): number {
  return ex.nA + ex.nB - ex.nAetB;
}

function consigneGeneraleA(ex: ExerciceFamilleA): string {
  return ex.contexte.texte;
}

function troisiemeDonneeLatexA(ex: ExerciceFamilleA): string {
  if (ex.troisiemeDonnee === "PAetB") return `P(A\\cap B)=${formatFractionLatex(ex.nAetB, ex.denominateur)}`;
  if (ex.troisiemeDonnee === "PAouB") return `P(A\\cup B)=${formatFractionLatex(nAouBA(ex), ex.denominateur)}`;
  return `P(\\overline{A}\\cap\\overline{B})=${formatFractionLatex(nAbaretBbarA(ex), ex.denominateur)}`;
}

function blocDonneesA(ex: ExerciceFamilleA): string[] {
  return [`P(A)=${formatFractionLatex(ex.nA, ex.denominateur)}`, `P(B)=${formatFractionLatex(ex.nB, ex.denominateur)}`, troisiemeDonneeLatexA(ex)];
}

/** Libellé + placeholder de la quantité MANQUANTE à l'écran 1 (voir
 * `moteur6e/verificationProbabilitesEnsembles.ts`, `valeurManquanteEcran1`, même dispatch). */
function champManquantA(ex: ExerciceFamilleA): ChampDef {
  return ex.troisiemeDonnee === "PAetB" ? { label: "P(A∪B) =", placeholder: `ex : 0,7 ${ANNONCE_TOLERANCE}` } : { label: "P(A∩B) =", placeholder: `ex : 0,2 ${ANNONCE_TOLERANCE}` };
}

function tableauCorrectA(ex: ExerciceFamilleA): string[] {
  return [`P(A\\cap B)=${formatFractionLatex(ex.nAetB, ex.denominateur)}`, `P(A\\cap\\overline{B})=${formatFractionLatex(nAetBbarA(ex), ex.denominateur)}`, `P(\\overline{A}\\cap B)=${formatFractionLatex(nAbaretBA(ex), ex.denominateur)}`, `P(\\overline{A}\\cap\\overline{B})=${formatFractionLatex(nAbaretBbarA(ex), ex.denominateur)}`];
}

/** Libellé/latex/valeur de la quantité demandée à l'écran 2 — factorisé ici (consigne, champ,
 * récapitulatif en dépendent tous les 3). */
function infoDemandeEcran2A(ex: ExerciceFamilleA): { libelle: string; latexGauche: string; valeur: number } {
  switch (ex.demandeEcran2) {
    case "AetBbar":
      return { libelle: "P(A∩B̄)", latexGauche: "P(A\\cap\\overline{B})", valeur: nAetBbarA(ex) / ex.denominateur };
    case "AbaretB":
      return { libelle: "P(Ā∩B)", latexGauche: "P(\\overline{A}\\cap B)", valeur: nAbaretBA(ex) / ex.denominateur };
    case "condAsachantB":
      return { libelle: "P(A|B)", latexGauche: "P(A|B)", valeur: ex.nAetB / ex.nB };
    case "condBsachantA":
      return { libelle: "P(B|A)", latexGauche: "P(B|A)", valeur: ex.nAetB / ex.nA };
  }
}

function consigneEcranA(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): string {
  if (phase === "aEcran1") return "Déduis la quantité manquante grâce à la relation d'inclusion-exclusion P(A∪B) = P(A) + P(B) − P(A∩B), puis complète les 4 cases du tableau à double entrée.";
  if (phase === "aEcran2") return `Calcule ${infoDemandeEcran2A(ex).libelle}, à partir du tableau CORRECT de l'étape précédente.`;
  if (ex.sousTypeEcran3 === "incompatibilite") return "Les événements A∩B̄ et Ā∩B sont-ils incompatibles ?";
  return "Compare P(A|B̄) et P(A|B) : lequel est le plus grand, ou sont-ils égaux ?";
}

function etatActuelA(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): string[] | null {
  if (phase === "aEcran1") return null;
  const table = tableauCorrectA(ex);
  if (phase === "aEcran2") return table;
  const { latexGauche, valeur } = infoDemandeEcran2A(ex);
  return [...table, `${latexGauche}=${formatDecimalCourt(valeur)}`];
}

/** Décimal court (2 décimales, virgule française) — pour l'affichage SEULEMENT (état actuel,
 * récapitulatif) : jamais la valeur de comparaison utilisée côté vérification, qui reste toujours
 * exacte (fraction). Nécessaire ici car certaines quantités de l'écran 2 (les probabilités
 * conditionnelles) ne sont pas garanties d'avoir `ex.denominateur` comme dénominateur naturel. */
function formatDecimalCourt(v: number): string {
  return String(Math.round(v * 100) / 100).replace(".", "{,}");
}

function champsA(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): ChampDef[] {
  if (phase === "aEcran1") {
    return [
      champManquantA(ex),
      { label: "P(A∩B) =", placeholder: `ex : 0,2 ${ANNONCE_TOLERANCE}` },
      { label: "P(A∩B̄) =", placeholder: `ex : 0,3 ${ANNONCE_TOLERANCE}` },
      { label: "P(Ā∩B) =", placeholder: `ex : 0,2 ${ANNONCE_TOLERANCE}` },
      { label: "P(Ā∩B̄) =", placeholder: `ex : 0,3 ${ANNONCE_TOLERANCE}` },
    ];
  }
  return [{ label: `${infoDemandeEcran2A(ex).libelle} =`, placeholder: `ex : 0,3 ${ANNONCE_TOLERANCE}` }];
}

function choixA(ex: ExerciceFamilleA): OptionChoix[] {
  if (ex.sousTypeEcran3 === "incompatibilite") {
    return [
      { id: "incompatibles", label: "Incompatibles" },
      { id: "non_incompatibles", label: "Non incompatibles" },
    ];
  }
  return [
    { id: "superieur", label: "P(A|B̄) > P(A|B)" },
    { id: "inferieur", label: "P(A|B̄) < P(A|B)" },
    { id: "egal", label: "P(A|B̄) = P(A|B)" },
  ];
}

function aideNiveau1A(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  if (phase === "aEcran1") return { texte: "Rappel de la relation d'inclusion-exclusion :", latex: "P(A\\cup B)=P(A)+P(B)-P(A\\cap B)" };
  if (phase === "aEcran2") return { texte: "Réutilise les 4 cases du tableau à double entrée — chaque probabilité dérivée se lit directement dans une case, ou se calcule comme le rapport de 2 cases (probabilité conditionnelle).", latex: null };
  if (ex.sousTypeEcran3 === "incompatibilite") return { texte: "Deux événements sont incompatibles si leur intersection est vide — une question LOGIQUE, indépendante des valeurs numériques.", latex: null };
  return { texte: "Calcule séparément P(A|B̄) et P(A|B) avant de les comparer — ne compare jamais deux probabilités conditionnelles sans les avoir d'abord calculées.", latex: null };
}

function aideNiveau2A(ex: ExerciceFamilleA, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  if (phase === "aEcran1") {
    const gauche = ex.troisiemeDonnee === "PAetB" ? `${formatFractionLatex(ex.nA, ex.denominateur)}+${formatFractionLatex(ex.nB, ex.denominateur)}-${formatFractionLatex(ex.nAetB, ex.denominateur)}` : `${formatFractionLatex(ex.nA, ex.denominateur)}+${formatFractionLatex(ex.nB, ex.denominateur)}-P(A\\cap B)=${formatFractionLatex(nAouBA(ex), ex.denominateur)}`;
    return { texte: "Équation posée, valeurs connues substituées (résolution non faite) :", latex: gauche };
  }
  if (phase === "aEcran2") return { texte: "Rappel : P(A∩B̄) = P(A)−P(A∩B) ; P(Ā∩B) = P(B)−P(A∩B) ; P(A|B) = P(A∩B)/P(B).", latex: null };
  if (ex.sousTypeEcran3 === "incompatibilite") return { texte: "A∩B̄ suppose A VRAI ; Ā∩B suppose A FAUX — contradiction directe, sans le moindre calcul nécessaire.", latex: null };
  return { texte: "Les deux membres, calculés séparément (comparaison non faite) :", latex: `P(A|\\overline{B})=${formatDecimalCourt(nAetBbarA(ex) / (ex.denominateur - ex.nB))}\\quad P(A|B)=${formatDecimalCourt(ex.nAetB / ex.nB)}` };
}

// ============================================================================
// Famille B.
// ============================================================================

function consigneGeneraleB(ex: ExerciceFamilleB): string {
  const situation = ex.sousType === "cartes" ? "On tire une carte au hasard dans un jeu de 52 cartes bien mélangé." : `On lance deux dés équilibrés à ${ex.facesParDe} faces.`;
  return `${situation} A : ${ex.eventA.label}. B : ${ex.eventB.label}.`;
}

function blocDonneesB(ex: ExerciceFamilleB): string[] {
  return [`n(\\Omega)=${ex.denominateur}`];
}

function infoDemandeEcran2B(ex: ExerciceFamilleB): { libelle: string; symbole: string } {
  return ex.demandeEcran2 === "intersection" ? { libelle: "P(A∩B)", symbole: "P(A\\cap B)" } : { libelle: "P(A∪B)", symbole: "P(A\\cup B)" };
}

function consigneEcranB(ex: ExerciceFamilleB, phase: PhaseProbabilitesEnsembles): string {
  if (phase === "bEcran1") return "Calcule la probabilité de chacun des deux événements A et B.";
  if (phase === "bEcran2") return ex.demandeEcran2 === "intersection" ? "Calcule P(A∩B) (dénombrement direct)." : "Calcule P(A∪B) — par inclusion-exclusion, ou par dénombrement direct.";
  if (phase === "bEcran3") return "Calcule la probabilité conditionnelle P(A|B), à partir des valeurs CORRECTES des étapes précédentes.";
  return "A et B sont-ils indépendants ? Vérifie NUMÉRIQUEMENT — ne te fie jamais à une impression.";
}

function etatActuelB(ex: ExerciceFamilleB, phase: PhaseProbabilitesEnsembles): string[] | null {
  if (phase === "bEcran1") return null;
  const base = [`P(A)=${formatFractionLatex(ex.eventA.count, ex.denominateur)}`, `P(B)=${formatFractionLatex(ex.eventB.count, ex.denominateur)}`];
  if (phase === "bEcran2") return base;
  const { symbole } = infoDemandeEcran2B(ex);
  const numEcran2 = ex.demandeEcran2 === "intersection" ? ex.countAetB : ex.eventA.count + ex.eventB.count - ex.countAetB;
  const avecEcran2 = [...base, `${symbole}=${formatFractionLatex(numEcran2, ex.denominateur)}`];
  if (phase === "bEcran3") return avecEcran2;
  return [...avecEcran2, `P(A|B)=${formatFractionLatex(ex.countAetB, ex.eventB.count)}`];
}

function champsB(ex: ExerciceFamilleB, phase: PhaseProbabilitesEnsembles): ChampDef[] {
  if (phase === "bEcran1") return [{ label: "P(A) =", placeholder: `ex : 0,5 ${ANNONCE_TOLERANCE}` }, { label: "P(B) =", placeholder: `ex : 0,25 ${ANNONCE_TOLERANCE}` }];
  if (phase === "bEcran2") return [{ label: `${infoDemandeEcran2B(ex).libelle} =`, placeholder: `ex : 0,1 ${ANNONCE_TOLERANCE}` }];
  return [{ label: "P(A|B) =", placeholder: `ex : 0,5 ${ANNONCE_TOLERANCE}` }];
}

function choixB(): OptionChoix[] {
  return [
    { id: "independants", label: "Indépendants" },
    { id: "non_independants", label: "Non indépendants" },
  ];
}

function aideNiveau1B(phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Compte les issues favorables à chaque événement, puis divise par la taille de l'univers Ω.", latex: null };
  if (phase === "bEcran2") return { texte: "Dénombre directement les issues communes à A et B, ou utilise l'inclusion-exclusion : P(A∪B)=P(A)+P(B)-P(A∩B).", latex: null };
  if (phase === "bEcran3") return { texte: "Rappel : P(A|B) = P(A∩B)/P(B).", latex: null };
  return { texte: "Deux événements sont indépendants si et seulement si P(A∩B) = P(A)·P(B) — une égalité NUMÉRIQUE à vérifier explicitement, jamais une intuition.", latex: null };
}

function aideNiveau2B(ex: ExerciceFamilleB, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  if (phase === "bEcran1") return { texte: "Effectifs favorables (division non faite) :", latex: `n(A)=${ex.eventA.count}\\quad n(B)=${ex.eventB.count}` };
  if (phase === "bEcran2") return { texte: "Effectif de l'intersection (division non faite) :", latex: `n(A\\cap B)=${ex.countAetB}` };
  if (phase === "bEcran3") return { texte: "Valeurs connues, rapport non calculé :", latex: `P(A\\cap B)=${formatFractionLatex(ex.countAetB, ex.denominateur)}\\quad P(B)=${formatFractionLatex(ex.eventB.count, ex.denominateur)}` };
  return { texte: "Les deux membres de l'égalité à comparer, calculés séparément :", latex: `P(A)\\cdot P(B)=${formatDecimalCourt((ex.eventA.count / ex.denominateur) * (ex.eventB.count / ex.denominateur))}\\quad P(A\\cap B)=${formatDecimalCourt(ex.countAetB / ex.denominateur)}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceProbabilitesEnsembles): string {
  return exercice.famille === "A" ? consigneGeneraleA(exercice) : consigneGeneraleB(exercice);
}

export function blocDonnees(exercice: ExerciceProbabilitesEnsembles): string[] {
  return exercice.famille === "A" ? blocDonneesA(exercice) : blocDonneesB(exercice);
}

export function consigneEcran(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): string {
  return exercice.famille === "A" ? consigneEcranA(exercice, phase) : consigneEcranB(exercice, phase);
}

export function etatActuel(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): string[] | null {
  return exercice.famille === "A" ? etatActuelA(exercice, phase) : etatActuelB(exercice, phase);
}

/** Vrai pour `aEcran3`/`bEcran4` — les 2 seuls écrans à CHOIX de ce générateur (voir en-tête de
 * fichier). `App6gen30.tsx` rend `EtapeChoixProbabilitesEnsembles` (via `choixEcran`) si vrai,
 * `EtapeChampsProbabilitesEnsembles` (via `champsEcran`) sinon. */
export function estEcranChoix(phase: PhaseProbabilitesEnsembles): boolean {
  return phase === "aEcran3" || phase === "bEcran4";
}

export function champsEcran(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): ChampDef[] {
  if (estEcranChoix(phase)) return [];
  return exercice.famille === "A" ? champsA(exercice, phase as "aEcran1" | "aEcran2") : champsB(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3");
}

export function choixEcran(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): OptionChoix[] {
  if (!estEcranChoix(phase)) return [];
  return exercice.famille === "A" ? choixA(exercice) : choixB();
}

export function aideNiveau1(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  return exercice.famille === "A" ? aideNiveau1A(exercice, phase) : aideNiveau1B(phase);
}

export function aideNiveau2(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): AideAvecLatex {
  return exercice.famille === "A" ? aideNiveau2A(exercice, phase) : aideNiveau2B(exercice, phase);
}

export const LIBELLE_PHASE: Record<PhaseProbabilitesEnsembles, string> = {
  aEcran1: "Étape 1 (tableau à double entrée)",
  aEcran2: "Étape 2 (probabilité dérivée)",
  aEcran3: "Étape 3 (déduction structurelle)",
  bEcran1: "Étape 1 (probabilités de base)",
  bEcran2: "Étape 2 (intersection/union)",
  bEcran3: "Étape 3 (probabilité conditionnelle)",
  bEcran4: "Étape 4 (indépendance)",
};

export const LIBELLE_FAMILLE: Record<ExerciceProbabilitesEnsembles["famille"], string> = {
  A: "A — Inclusion-exclusion, tableau à double entrée",
  B: "B — Cartes, dés et indépendance",
};

/** Récapitulatif final — réponse CORRECTE de chaque écran, jamais recalculée depuis la saisie élève
 * (CLAUDE.md). Pour un écran à champ(s), la/les valeur(s) attendue(s) en LaTeX ; pour un écran à
 * choix, le libellé textuel de l'option correcte (enrobé `\text{...}` pour rester un fragment KaTeX
 * comme le reste du récapitulatif). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return tableauCorrectA(exercice);
    if (phase === "aEcran2") {
      const { latexGauche, valeur } = infoDemandeEcran2A(exercice);
      return [`${latexGauche}=${formatDecimalCourt(valeur)}`];
    }
    if (exercice.sousTypeEcran3 === "incompatibilite") return ["\\text{Incompatibles}"];
    const diff = nAetBbarA(exercice) / (exercice.denominateur - exercice.nB) - exercice.nAetB / exercice.nB;
    const texte = Math.abs(diff) <= 0.01 ? "P(A|\\overline{B}) = P(A|B)" : diff > 0 ? "P(A|\\overline{B}) > P(A|B)" : "P(A|\\overline{B}) < P(A|B)";
    return [texte];
  }
  if (phase === "bEcran1") return [`P(A)=${formatFractionLatex(exercice.eventA.count, exercice.denominateur)}`, `P(B)=${formatFractionLatex(exercice.eventB.count, exercice.denominateur)}`];
  if (phase === "bEcran2") {
    const { symbole } = infoDemandeEcran2B(exercice);
    const num = exercice.demandeEcran2 === "intersection" ? exercice.countAetB : exercice.eventA.count + exercice.eventB.count - exercice.countAetB;
    return [`${symbole}=${formatFractionLatex(num, exercice.denominateur)}`];
  }
  if (phase === "bEcran3") return [`P(A|B)=${formatFractionLatex(exercice.countAetB, exercice.eventB.count)}`];
  const pA = exercice.eventA.count / exercice.denominateur;
  const pB = exercice.eventB.count / exercice.denominateur;
  const pAetB = exercice.countAetB / exercice.denominateur;
  return [Math.abs(pAetB - pA * pB) <= 0.01 ? "\\text{Indépendants}" : "\\text{Non indépendants}"];
}

/** Total points du récapitulatif final — maximum VARIABLE (300 pour la famille A, 400 pour la
 * famille B). */
export function calculerTotalPointsProbabilitesEnsembles(resultat: ResultatExerciceProbabilitesEnsembles): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
