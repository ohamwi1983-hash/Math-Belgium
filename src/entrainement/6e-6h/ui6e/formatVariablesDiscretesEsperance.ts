import type { EvenementLoiA, ExerciceEsperanceA, ExerciceEsperanceB, ExerciceEsperanceC, ExerciceVariablesDiscretesEsperance } from "../core6e/variablesDiscretesEsperance.types";
import type { PhaseVariablesDiscretesEsperance, ResultatExerciceVariablesDiscretesEsperance } from "../moteur6e/typesVariablesDiscretesEsperance";
import { phasesPourExercice } from "../moteur6e/typesVariablesDiscretesEsperance";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen49`. Dispatch sur
 * `exercice.famille` PUIS `sousType` (B/C) PUIS `phase`, mirroir `formatDenombrementFondamental.ts`
 * (6gen43).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide / texte français en mode maths** (bug déjà
 * rencontré et corrigé sur plusieurs générateurs 6e, documenté par CLAUDE.md) — toute clause en
 * français mêlée à du LaTeX passe TOUJOURS par `\text{...}`, jamais du texte brut en mode maths ;
 * chaque phrase française reste un fragment `string[]` COURT (jamais une phrase longue dans un
 * seul bloc `\text{...}`, voir le bug n°2 documenté par `6gen51`). Couverture de régression :
 * `formatVariablesDiscretesEsperance.test.ts`, scan sur de nombreux tirages aléatoires.
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

function champTexte(label: string, placeholder: string): ChampDef {
  return { type: "texte", label, placeholder };
}

// ============================================================================
// Petits formateurs numériques/LaTeX partagés.
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction EXACTE irréductible en LaTeX (jamais de décimal, convention CLAUDE.md) — utilisée pour
 * toute probabilité, stockée en fraction num/den exacte sur le core. */
export function fractionLatex(num: number, den: number): string {
  let n = num;
  let d = den;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  if (d === 1) return `${n}`;
  return n < 0 ? `-\\dfrac{${-n}}{${d}}` : `\\dfrac{${n}}{${d}}`;
}

function formatDecimal(v: number, decimales: number): string {
  return v.toFixed(decimales).replace(".", "{,}");
}

/** Un nombre proche d'un entier s'affiche en entier (jamais "3,00") ; sinon décimal à 2 décimales. */
function nombreLatex(v: number): string {
  if (Math.abs(v - Math.round(v)) < 1e-9) return `${Math.round(v)}`;
  return formatDecimal(v, 2);
}

/** `valeur − m`, signe géré explicitement (jamais de double signe orphelin "--", voir bug n°3 de
 * `6gen51`) — réutilisée pour le gain net ("gainBrut−m", famille C "imposer") ET pour E(m)
 * ("esperanceBrute−m"). */
export function expressionMoinsMLatex(valeur: number): string {
  if (Math.abs(valeur) < 1e-9) return "-m";
  const texte = nombreLatex(Math.abs(valeur));
  return valeur > 0 ? `${texte}-m` : `-${texte}-m`;
}

// ============================================================================
// Famille A — Loi discrète donnée : cumuls et événements contraires.
// ============================================================================

/** Table `x_i`/`p_i` en LaTeX (array 2 lignes) — `p_i` toujours en fraction irréductible. */
function tableLoiLatexA(e: ExerciceEsperanceA): string {
  const colonnes = "c".repeat(e.xs.length);
  const ligneX = e.xs.map((x) => `${x}`).join(" & ");
  const ligneP = e.psNumerateurs.map((num) => fractionLatex(num, e.psDenominateur)).join(" & ");
  return `\\begin{array}{c|${colonnes}}x_i & ${ligneX}\\\\\\hline p_i & ${ligneP}\\end{array}`;
}

/** Notation compacte KaTeX d'un événement — `X\geq k`/`X\leq k`/`X=k`/`k_1\leq X\leq k_2`. */
export function libelleEvenementLatexA(e: EvenementLoiA, xs: number[]): string {
  switch (e.type) {
    case "auMoins":
      return `X\\geq ${xs[e.iMin]}`;
    case "auPlus":
      return `X\\leq ${xs[e.iMin]}`;
    case "exact":
      return `X=${xs[e.iMin]}`;
    case "intervalle":
      return `${xs[e.iMin]}\\leq X\\leq ${xs[e.iMax ?? e.iMin]}`;
  }
}

/** Même notation, texte BRUT (jamais du LaTeX) — pour un `label` de `ChampDef` (rendu tel quel,
 * jamais passé par KaTeX, voir `EtapeChampsVariablesDiscretesEsperance.tsx`). */
function libelleEvenementTexteA(e: EvenementLoiA, xs: number[]): string {
  switch (e.type) {
    case "auMoins":
      return `X ≥ ${xs[e.iMin]}`;
    case "auPlus":
      return `X ≤ ${xs[e.iMin]}`;
    case "exact":
      return `X = ${xs[e.iMin]}`;
    case "intervalle":
      return `${xs[e.iMin]} ≤ X ≤ ${xs[e.iMax ?? e.iMin]}`;
  }
}

/** Ensemble d'indices couverts par un événement — TOUJOURS un intervalle contigu de `xs` (voir
 * en-tête `generateurs6e/variablesDiscretesEsperance/familleA.ts`) — notation compacte quel que
 * soit le nombre de valeurs couvertes. */
function plageLatexA(indices: number[], xs: number[]): string {
  if (indices.length === 1) return `X=${xs[indices[0]]}`;
  return `${xs[indices[0]]}\\leq X\\leq ${xs[indices[indices.length - 1]]}`;
}

export function consigneGeneraleA(): string {
  return "Voici la loi de probabilité d'une variable aléatoire discrète X. Calcule les 2 probabilités demandées, puis détermine si les 2 événements considérés sont contraires.";
}

export function blocDonneesA(e: ExerciceEsperanceA): string[] {
  return [tableLoiLatexA(e), `\\text{Événement 1 : }${libelleEvenementLatexA(e.evenement1, e.xs)}`, `\\text{Événement 2 : }${libelleEvenementLatexA(e.evenement2, e.xs)}`];
}

export function consigneEcranA(phase: PhaseVariablesDiscretesEsperance): string {
  if (phase === "aEcran1") return "Identifie les valeurs de xᵢ incluses dans l'événement 1, puis additionne les pᵢ correspondants.";
  if (phase === "aEcran2") return "Fais de même pour l'événement 2.";
  return "Les 2 événements ci-dessus sont-ils contraires ?";
}

export function etatActuelA(e: ExerciceEsperanceA, phase: PhaseVariablesDiscretesEsperance): string[] | null {
  if (phase === "aEcran2") return [`P(${libelleEvenementLatexA(e.evenement1, e.xs)})=${fractionLatex(e.probabilite1Numerateur, e.psDenominateur)}\\text{ (confirmée)}`];
  if (phase === "aEcran3") {
    return [
      `P(${libelleEvenementLatexA(e.evenement1, e.xs)})=${fractionLatex(e.probabilite1Numerateur, e.psDenominateur)}\\text{ (confirmée)}`,
      `P(${libelleEvenementLatexA(e.evenement2, e.xs)})=${fractionLatex(e.probabilite2Numerateur, e.psDenominateur)}\\text{ (confirmée)}`,
    ];
  }
  return null;
}

export function champsA(e: ExerciceEsperanceA, phase: PhaseVariablesDiscretesEsperance): ChampDef[] {
  if (phase === "aEcran1") return [champTexte(`P(${libelleEvenementTexteA(e.evenement1, e.xs)}) =`, "ex : 0,6 ou 3/5")];
  if (phase === "aEcran2") return [champTexte(`P(${libelleEvenementTexteA(e.evenement2, e.xs)}) =`, "ex : 0,4 ou 2/5")];
  return [
    {
      type: "choix",
      label: "Les 2 événements sont =",
      options: [
        { valeur: "contraires", label: "Contraires" },
        { valeur: "non_contraires", label: "Non contraires" },
      ],
    },
  ];
}

export function niveauAideMaxA(phase: PhaseVariablesDiscretesEsperance): number {
  return phase === "aEcran3" ? 2 : 0;
}

export function aideNiveau1A(): AideAvecLatex {
  return { texte: "Deux événements sont contraires seulement si leur intersection est VIDE ET si leur union est l'univers complet — pas seulement si leurs probabilités semblent complémentaires.", latex: null };
}

export function aideNiveau2A(e: ExerciceEsperanceA): AideAvecLatex {
  const plage1 = plageLatexA(e.indices1, e.xs);
  const plage2 = plageLatexA(e.indices2, e.xs);
  return { texte: "Valeurs couvertes par chacun des 2 événements (chevauchement éventuel non signalé, à toi de le repérer) :", latex: `${plage1}\\text{ (év. 1) ; }${plage2}\\text{ (év. 2)}` };
}

// ============================================================================
// Famille B — Construire une loi de probabilité et calculer l'espérance.
// ============================================================================

export function consigneGeneraleB(): string {
  return "Construis la loi de probabilité complète de X, puis calcule son espérance E(X) = Σ xᵢ·pᵢ.";
}

export function blocDonneesB(e: ExerciceEsperanceB): string[] {
  if (e.sousType === "contexteDirect") {
    const lignes = e.issues.map((issue) => `\\text{${issue.label} : gain }${issue.valeur}\\text{, effectif }${issue.effectif}\\text{ sur }${e.totalEffectifs}`);
    return [...e.phraseContexte, ...lignes];
  }
  return [`N=${e.N}\\text{ (population totale)}`, `K=${e.K}\\text{ (favorables)}`, `n=${e.n}\\text{ (tirages sans remise)}`, "X=\\text{nombre de succès parmi les tirages}"];
}

export function consigneEcranB(e: ExerciceEsperanceB, phase: PhaseVariablesDiscretesEsperance): string {
  if (phase === "bEcran1") {
    return e.sousType === "contexteDirect"
      ? "Pour chaque résultat possible, reporte sa valeur (déjà connue du contexte) et calcule sa probabilité à partir des effectifs."
      : "Pour chaque valeur possible de k, reporte k et calcule P(X=k) avec la formule hypergéométrique.";
  }
  return "Calcule l'espérance E(X) = Σ xᵢ·pᵢ à partir de la loi CONFIRMÉE de l'étape précédente.";
}

function tableLoiConfirmeeLatexB(e: ExerciceEsperanceB): string {
  const colonnes = "c".repeat(e.loi.length);
  const ligneX = e.loi.map((l) => `${l.valeur}`).join(" & ");
  const ligneP = e.loi.map((l) => fractionLatex(l.probabiliteNumerateur, l.probabiliteDenominateur)).join(" & ");
  return `\\begin{array}{c|${colonnes}}x_i & ${ligneX}\\\\\\hline p_i & ${ligneP}\\end{array}`;
}

export function etatActuelB(e: ExerciceEsperanceB, phase: PhaseVariablesDiscretesEsperance): string[] | null {
  if (phase === "bEcran2") return [`${tableLoiConfirmeeLatexB(e)}\\text{ (confirmée)}`];
  return null;
}

export function champsB(e: ExerciceEsperanceB, phase: PhaseVariablesDiscretesEsperance): ChampDef[] {
  if (phase === "bEcran1") {
    if (e.sousType === "contexteDirect") {
      return e.issues.flatMap((issue) => [champTexte(`${issue.label} — gain =`, "ex : 5"), champTexte(`${issue.label} — p =`, "ex : 0,3 ou 3/10")]);
    }
    return e.loi.flatMap((_, i) => [champTexte(`k n°${i + 1} — k =`, "ex : 1"), champTexte(`k n°${i + 1} — P(X=k) =`, "ex : 0,45 ou 9/20")]);
  }
  return [champTexte("E(X) =", "ex : 1,2")];
}

export function niveauAideMaxB(e: ExerciceEsperanceB, phase: PhaseVariablesDiscretesEsperance): number {
  return e.sousType === "hypergeometrique" && phase === "bEcran1" ? 2 : 0;
}

export function aideNiveau1B(): AideAvecLatex {
  return { texte: "Rappel de la formule hypergéométrique, pour chaque valeur de k possible :", latex: "P(X=k)=\\dfrac{C(K,k)\\cdot C(N-K,n-k)}{C(N,n)}" };
}

export function aideNiveau2B(e: ExerciceEsperanceB): AideAvecLatex {
  if (e.sousType !== "hypergeometrique") return AUCUNE_AIDE;
  const premiere = e.loi[0];
  return { texte: "Une des valeurs de la table déjà calculée (les autres restent à toi) :", latex: `P(X=${premiere.valeur})=${fractionLatex(premiere.probabiliteNumerateur, premiere.probabiliteDenominateur)}` };
}

// ============================================================================
// Famille C — Jeu équitable, espérance nulle.
// ============================================================================

export function consigneGeneraleC(sousType: ExerciceEsperanceC["sousType"]): string {
  if (sousType === "verifier") return "Calcule l'espérance de gain net E, puis conclus si le jeu est favorable au joueur, défavorable, ou équitable.";
  return "Un joueur doit payer une mise m pour jouer (à soustraire de chaque gain). Détermine la valeur de m qui rend le jeu équitable (E=0).";
}

export function blocDonneesC(e: ExerciceEsperanceC): string[] {
  const lignes = e.issues.map((issue) => `\\text{${issue.label} : gain brut }${issue.gainBrut}\\text{, probabilité }${fractionLatex(issue.probabiliteNumerateur, issue.probabiliteDenominateur)}`);
  const base = [...e.phraseContexte, ...lignes];
  if (e.sousType === "imposer") base.push("\\text{Mise à payer pour jouer : }m\\text{ (inconnue)}");
  return base;
}

export function consigneEcranC(phase: PhaseVariablesDiscretesEsperance): string {
  switch (phase) {
    case "cVerifierEcran1":
      return "Établis la loi du gain net (ici, gain net = gain brut) : reporte, pour chaque issue, son gain net et sa probabilité.";
    case "cVerifierEcran2":
      return "Calcule l'espérance E = Σ pᵢ·gainᵢ à partir de la loi CONFIRMÉE de l'étape précédente.";
    case "cImposerEcran1":
      return "Établis la loi du gain net EN FONCTION DE m (gain net = gain brut − m) : reporte, pour chaque issue, l'expression du gain net et sa probabilité.";
    case "cImposerEcran2":
      return "Calcule l'expression de E(m) = Σ pᵢ·(gain net)ᵢ, en fonction de m, à partir de la loi CONFIRMÉE de l'étape précédente.";
    default:
      return "Résous E(m)=0 pour trouver la valeur de m qui rend le jeu équitable, à partir de l'expression CONFIRMÉE de l'étape précédente.";
  }
}

/** ACCUMULE les écrans déjà confirmés (correctif transversal — voir CLAUDE.md/`docs/historique-
 * 6e.md`, même bug que sur `6gen1`/`6gen58` : `cImposerEcran3` omettait la loi(m) confirmée de
 * `cImposerEcran1`, ne montrant que l'espérance E(m) de `cImposerEcran2`). Plus ancien en premier. */
export function etatActuelC(e: ExerciceEsperanceC, phase: PhaseVariablesDiscretesEsperance): string[] | null {
  if (phase === "cVerifierEcran2") {
    const lignes = e.issues.map((issue) => `${issue.gainBrut}\\text{ (p=}${fractionLatex(issue.probabiliteNumerateur, issue.probabiliteDenominateur)}\\text{)}`);
    return [`\\text{Loi confirmée : }${lignes.join("\\text{, }")}`];
  }
  if (phase === "cImposerEcran2" || phase === "cImposerEcran3") {
    const lignes = e.issues.map((issue) => `${expressionMoinsMLatex(issue.gainBrut)}\\text{ (p=}${fractionLatex(issue.probabiliteNumerateur, issue.probabiliteDenominateur)}\\text{)}`);
    const ligneLoi = `\\text{Loi confirmée (étape 1) : }${lignes.join("\\text{, }")}`;
    if (phase === "cImposerEcran2") return [ligneLoi];
    return [ligneLoi, `E(m)=${expressionMoinsMLatex(e.esperanceBrute)}\\text{ (confirmée, étape 2)}`];
  }
  return null;
}

export function champsC(e: ExerciceEsperanceC, phase: PhaseVariablesDiscretesEsperance): ChampDef[] {
  switch (phase) {
    case "cVerifierEcran1":
      return e.issues.flatMap((issue) => [champTexte(`${issue.label} — net =`, "ex : 10"), champTexte(`${issue.label} — p =`, "ex : 0,4 ou 2/5")]);
    case "cVerifierEcran2":
      return [champTexte("E =", "ex : 1")];
    case "cImposerEcran1":
      return e.issues.flatMap((issue) => [champTexte(`${issue.label} — net(m) =`, "ex : 8-m"), champTexte(`${issue.label} — p =`, "ex : 0,5 ou 1/2")]);
    case "cImposerEcran2":
      return [champTexte("E(m) =", "ex : 2-m")];
    default:
      return [champTexte("m =", "ex : 2")];
  }
}

export function niveauAideMaxC(phase: PhaseVariablesDiscretesEsperance): number {
  return phase === "cVerifierEcran2" ? 2 : 0;
}

export function aideNiveau1C(): AideAvecLatex {
  return { texte: "Rappel : E>0 signifie que le jeu est favorable au joueur, E<0 défavorable, E=0 équitable.", latex: null };
}

export function aideNiveau2C(e: ExerciceEsperanceC): AideAvecLatex {
  return { texte: "Valeur de E déjà calculée (à toi de conclure sur le caractère favorable/défavorable/équitable) :", latex: nombreLatex(e.esperanceBrute) };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceVariablesDiscretesEsperance): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC(exercice.sousType);
  }
}

export function blocDonnees(exercice: ExerciceVariablesDiscretesEsperance): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
  }
}

export function consigneEcran(exercice: ExerciceVariablesDiscretesEsperance, phase: PhaseVariablesDiscretesEsperance): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
  }
}

export function etatActuel(exercice: ExerciceVariablesDiscretesEsperance, phase: PhaseVariablesDiscretesEsperance): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceVariablesDiscretesEsperance, phase: PhaseVariablesDiscretesEsperance): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(exercice, phase);
    case "B":
      return champsB(exercice, phase);
    case "C":
      return champsC(exercice, phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceVariablesDiscretesEsperance, phase: PhaseVariablesDiscretesEsperance): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(exercice, phase);
    case "C":
      return niveauAideMaxC(phase);
  }
}

export function aideNiveau1(exercice: ExerciceVariablesDiscretesEsperance, phase: PhaseVariablesDiscretesEsperance): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A();
    case "B":
      return aideNiveau1B();
    case "C":
      return aideNiveau1C();
  }
}

export function aideNiveau2(exercice: ExerciceVariablesDiscretesEsperance, phase: PhaseVariablesDiscretesEsperance): AideAvecLatex {
  if (niveauAideMaxEcran(exercice, phase) === 0) return AUCUNE_AIDE;
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice);
    case "B":
      return aideNiveau2B(exercice);
    case "C":
      return aideNiveau2C(exercice);
  }
}

export const LIBELLE_PHASE: Record<PhaseVariablesDiscretesEsperance, string> = {
  aEcran1: "Étape 1 (P(événement 1))",
  aEcran2: "Étape 2 (P(événement 2))",
  aEcran3: "Étape 3 (contraires ?)",
  bEcran1: "Étape 1 (loi complète)",
  bEcran2: "Étape 2 (espérance)",
  cVerifierEcran1: "Étape 1 (loi du gain net)",
  cVerifierEcran2: "Étape 2 (espérance E)",
  cImposerEcran1: "Étape 1 (loi du gain net en fonction de m)",
  cImposerEcran2: "Étape 2 (E(m))",
  cImposerEcran3: "Étape 3 (m pour E=0)",
};

export const LIBELLE_FAMILLE: Record<ExerciceVariablesDiscretesEsperance["famille"], string> = {
  A: "A — Loi donnée : cumuls et événements contraires",
  B: "B — Construire la loi et calculer E(X)",
  C: "C — Jeu équitable, espérance nulle",
};

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceVariablesDiscretesEsperance, phase: PhaseVariablesDiscretesEsperance): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [fractionLatex(exercice.probabilite1Numerateur, exercice.psDenominateur)];
    if (phase === "aEcran2") return [fractionLatex(exercice.probabilite2Numerateur, exercice.psDenominateur)];
    return [exercice.contraires ? "\\text{Contraires}" : "\\text{Non contraires}"];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return exercice.loi.map((l) => `${l.valeur}:\\,${fractionLatex(l.probabiliteNumerateur, l.probabiliteDenominateur)}`);
    return [nombreLatex(exercice.esperance)];
  }
  // famille C
  if (phase === "cVerifierEcran1" || phase === "cImposerEcran1") {
    return exercice.issues.map((issue) => {
      const gainNet = exercice.sousType === "verifier" ? `${issue.gainBrut}` : expressionMoinsMLatex(issue.gainBrut);
      return `${gainNet}:\\,${fractionLatex(issue.probabiliteNumerateur, issue.probabiliteDenominateur)}`;
    });
  }
  if (phase === "cVerifierEcran2") return [nombreLatex(exercice.esperanceBrute)];
  if (phase === "cImposerEcran2") return [expressionMoinsMLatex(exercice.esperanceBrute)];
  return [nombreLatex(exercice.mSolution)];
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés par CET exercice). */
export function calculerTotalPointsVariablesDiscretesEsperance(resultat: ResultatExerciceVariablesDiscretesEsperance): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}
