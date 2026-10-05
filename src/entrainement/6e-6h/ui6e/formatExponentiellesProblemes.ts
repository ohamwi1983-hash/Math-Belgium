import type { ExerciceExpoProbA, ExerciceExpoProbB, ExerciceExpoProbC, ExerciceExpoProbD, ExerciceExpoProbE, ExerciceExpoProbF, ExerciceExpoProbG, ExerciceExponentiellesProblemes } from "../core6e/exponentiellesProblemes.types";
import { CONTEXTES_A_DOUBLEMENT, CONTEXTES_A_EVALUER, CONTEXTES_B, CONTEXTES_C, CONTEXTES_D, CONTEXTES_E, CONTEXTES_F, CONTEXTES_G } from "../generateurs6e/exponentiellesProblemes/contextes";
import type { PhaseExponentiellesProblemes, ResultatExerciceExponentiellesProblemes } from "../moteur6e/typesExponentiellesProblemes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen12`. `src/ui6e/` peut
 * dépendre de `src/generateurs6e/` (même principe que `formatEquationsExponentielles.ts`, 6gen9)
 * — réutilise les bassins de contextes pour résoudre `contexteId` en texte français, jamais pour
 * re-DÉRIVER une donnée déjà calculée à la génération.
 *
 * **Contrairement à 6gen9** (`CONSIGNE_GENERALE` une chaîne fixe), la consigne générale de 6gen12
 * est l'énoncé CONTEXTUALISÉ complet (population/placement/condensateur...) — donc une FONCTION de
 * l'exercice, jamais une constante. Dispatch PAR FAMILLE PUIS PAR PHASE, même décision que
 * `formatEquationsExponentielles.ts`/`formatLimitesExponentielles.ts`.
 *
 * Toute aide qui embarque un symbole LaTeX est retournée en `AideAvecLatex {texte, latex}` —
 * jamais interpolée en texte brut (piège documenté à plusieurs reprises sur ce chantier).
 */

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Décimal FRANÇAIS (virgule) arrondi à `decimales` décimales — pour l'AFFICHAGE seulement (aides,
 * bloc "état actuel", récapitulatif) : jamais la valeur de comparaison utilisée par
 * `moteur6e/verificationExponentiellesProblemes.ts`, qui reste toujours la valeur EXACTE. */
function formatDecimal(v: number, decimales = 2): string {
  const f = Math.pow(10, decimales);
  const r = Math.round(v * f) / f;
  return String(r).replace(".", "{,}").replace("-{,}", "-0{,}");
}

/** Même arrondi que `formatDecimal`, mais pour une chaîne rendue en PROSE PURE (`consigneEcran`,
 * jamais passée à KaTeX) — une virgule simple, jamais les accolades LaTeX `{,}` qui s'afficheraient
 * littéralement à l'écran. */
function formatDecimalTexte(v: number, decimales = 2): string {
  const f = Math.pow(10, decimales);
  const r = Math.round(v * f) / f;
  return String(r).replace(".", ",");
}

/** `base^{exposant}` LaTeX, sauf si `exposant===1` (retourne `base` seul) — même primitive que
 * `formatLimitesExponentielles.ts`/`formatDomaineDeriveeExponentielles.ts` (chapitre 2), dupliquée
 * ici plutôt que partagée (chaque générateur garde son propre module `ui6e`, CLAUDE.md
 * "architecture"). Nécessaire pour la famille E (`t^{n-1}` littéral `t^{1}` quand `n=2`, un des 3
 * tirages possibles de `N_POOL` — piège déjà corrigé pour 6gen6/6gen7, reproduit ici sans garde). */
function formatPuissance(base: string, exposant: number): string {
  return exposant === 1 ? base : `${base}^{${exposant}}`;
}

function contexteA(exercice: ExerciceExpoProbA) {
  return exercice.sousType === "evaluer" ? CONTEXTES_A_EVALUER.find((c) => c.id === exercice.contexteId)! : CONTEXTES_A_DOUBLEMENT.find((c) => c.id === exercice.contexteId)!;
}
function contexteB(exercice: ExerciceExpoProbB) {
  return CONTEXTES_B.find((c) => c.id === exercice.contexteId)!;
}
function contexteC(exercice: ExerciceExpoProbC) {
  return CONTEXTES_C.find((c) => c.id === exercice.contexteId)!;
}
function contexteD(exercice: ExerciceExpoProbD) {
  return CONTEXTES_D.find((c) => c.id === exercice.contexteId)!;
}

/** Modèle complet de la famille D, `T(t)=L+C·r^t`, avec un signe correctement géré pour `C`
 * (signé par construction, "approche par le haut/par le bas") — piège trouvé par vérification
 * Playwright : un `C` négatif donnait littéralement "20+-25·0,8^t" (double signe), jamais
 * "20-25·0,8^t", contrairement à la convention "jamais de signe non simplifié à l'écran"
 * (CLAUDE.md). Même principe que `formatModeleG`/`formatSoustraction` ci-dessus. */
function formatModeleD(exercice: ExerciceExpoProbD): string {
  const signe = exercice.C < 0 ? "-" : "+";
  return `${formatDecimal(exercice.L, 1)}${signe}${formatDecimal(Math.abs(exercice.C), 1)}\\cdot ${formatDecimal(exercice.r, 3)}^{\\,t}`;
}
function contexteE(exercice: ExerciceExpoProbE) {
  return CONTEXTES_E.find((c) => c.id === exercice.contexteId)!;
}
function contexteF(exercice: ExerciceExpoProbF) {
  return CONTEXTES_F.find((c) => c.id === exercice.contexteId)!;
}
function contexteG(exercice: ExerciceExpoProbG) {
  return CONTEXTES_G.find((c) => c.id === exercice.contexteId)!;
}

/** "gauche-droite", en omettant le "-0" quand `droite` vaut 0 (famille G, `k∈{0,1,2}` — piège
 * trouvé par vérification Playwright : `f(t)=2+e^{0-2t}` s'affichait littéralement pour `k=0`,
 * jamais simplifié en `e^{-2t}`, contrairement à la convention "jamais de coefficient nul affiché"
 * déjà en place ailleurs sur la plateforme, voir `formatSommeTermes` de
 * `formatEquationsExponentielles.ts`). */
function formatSoustraction(gaucheTexte: string, droite: number): string {
  return droite === 0 ? gaucheTexte : `${gaucheTexte}-${droite}`;
}

/** Exposant `k-at` de la famille G, en omettant le "0-" quand `k=0`. */
function formatExposantG(k: number, aTexte: string): string {
  return k === 0 ? `-${aTexte}t` : `${k}-${aTexte}t`;
}

/** Modèle complet de la famille G, `f(t)=c+e^{k-at}`, en omettant le "0+" quand `c=0` ET le "-0"
 * dans l'exposant quand `k=0` — même piège que `formatSoustraction` ci-dessus. */
function formatModeleG(c: number, k: number, aTexte: string): string {
  const base = `e^{${formatExposantG(k, aTexte)}}`;
  return c === 0 ? base : `${c}+${base}`;
}

// ============================================================================
// Famille A.
// ============================================================================

function consigneGeneraleA(exercice: ExerciceExpoProbA): string {
  return exercice.sousType === "evaluer" ? contexteA(exercice).phrase(exercice.Q0, exercice.p) : (contexteA(exercice) as (typeof CONTEXTES_A_DOUBLEMENT)[number]).phrase(exercice.T);
}

function blocDonneesA(exercice: ExerciceExpoProbA): string[] {
  if (exercice.sousType === "evaluer") return [`Q_0 = ${exercice.Q0}`, `p = ${exercice.p}\\,\\%`, `n = ${exercice.n}\\ (${contexteA(exercice).unite})`];
  return [`T = ${exercice.T}\\ (${contexteA(exercice).unite})`, `k = ${exercice.k}`];
}

function etatActuelA(exercice: ExerciceExpoProbA, phase: "aEcran1" | "aEcran2"): string[] | null {
  if (phase === "aEcran1") return null;
  return exercice.sousType === "evaluer" ? [`Q(t) = ${exercice.Q0}\\cdot ${formatDecimal(exercice.r, 3)}^{\\,t}`] : [`${exercice.T}-t`];
}

function consigneEcranA(exercice: ExerciceExpoProbA, phase: "aEcran1" | "aEcran2"): string {
  if (phase === "aEcran1") {
    return exercice.sousType === "evaluer" ? "Pose le modèle Q(t), en fonction de t, qui décrit cette évolution." : "Reculer d'une période divise la quantité par 2. Exprime, en fonction de t, le nombre de reculs qui séparent l'instant t de l'instant de référence T.";
  }
  return exercice.sousType === "evaluer" ? "À partir du modèle CORRECT de l'étape précédente, calcule la valeur au temps demandé (arrondie)." : `Déduis l'instant t où la quantité valait 1/2^${exercice.k} de sa valeur en T.`;
}

function aideA1(exercice: ExerciceExpoProbA, phase: "aEcran1" | "aEcran2"): AideAvecLatex {
  if (phase === "aEcran1") {
    return exercice.sousType === "evaluer"
      ? { texte: "Rappel : une hausse de p % correspond à un facteur multiplicateur r=1+p/100 ; une baisse de p % correspond à r=1-p/100.", latex: null }
      : { texte: "Rappel : reculer d'une période divise la quantité par 2 — le nombre de reculs entre l'instant t et T est T−t.", latex: null };
  }
  return exercice.sousType === "evaluer" ? { texte: "Substitue t=n dans le modèle correct de l'étape précédente, puis calcule.", latex: null } : { texte: "Un recul d'une période correspond exactement à une division par 2.", latex: null };
}

function aideA2(exercice: ExerciceExpoProbA, phase: "aEcran1" | "aEcran2"): AideAvecLatex {
  if (phase === "aEcran1") {
    return exercice.sousType === "evaluer" ? { texte: "Taux déjà calculé (modèle non posé) :", latex: `r = ${formatDecimal(exercice.r, 3)}` } : { texte: "Modèle amorcé (le −t final reste à toi) :", latex: `T-t = ${exercice.T}-\\ldots` };
  }
  return exercice.sousType === "evaluer" ? { texte: "Calcul intermédiaire (reste à multiplier par Q0) :", latex: `r^{n} = ${formatDecimal(Math.pow(exercice.r, exercice.n), 3)}` } : { texte: "Nombre de reculs nécessaires :", latex: `k = ${exercice.k}` };
}

function formatReponseA(exercice: ExerciceExpoProbA, phase: "aEcran1" | "aEcran2"): string[] {
  if (phase === "aEcran1") return exercice.sousType === "evaluer" ? [`Q(t) = ${exercice.Q0}\\cdot ${formatDecimal(exercice.r, 3)}^{\\,t}`] : [`${exercice.T}-t`];
  return exercice.sousType === "evaluer" ? [formatDecimal(exercice.valeurFinale, 0)] : [formatDecimal(exercice.t, 0)];
}

// ============================================================================
// Famille B.
// ============================================================================

function consigneGeneraleB(exercice: ExerciceExpoProbB): string {
  return contexteB(exercice).phrase(exercice.Q0, exercice.p);
}

function blocDonneesB(exercice: ExerciceExpoProbB): string[] {
  return [`Q_0 = ${exercice.Q0}`, `p = ${exercice.p}\\,\\%`];
}

// Correctif transversal (même bug que 6gen1, voir CLAUDE.md/`docs/historique-6e.md`) : `bEcran3`/
// `bEcran4` ne montraient QUE le fait de l'écran immédiatement précédent — ACCUMULE désormais,
// plus ancien en premier. Audit de suivi (familles E/G, `docs/historique-6e.md`) : `bEcran4` ne
// rappelait encore que reste(t)/complément(t) (écrans 1/2), jamais complément(n) — la valeur
// numérique CONFIRMÉE à `bEcran3` — laissant le bloc incomplet dès le 4e écran ; corrigé pour
// accumuler VRAIMENT les 3 écrans précédents, jamais seulement les 2 premiers.
function etatActuelB(exercice: ExerciceExpoProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): string[] | null {
  if (phase === "bEcran1") return null;
  const reste = `\\text{reste}(t) = ${exercice.Q0}\\cdot ${formatDecimal(exercice.q, 3)}^{\\,t}\\ \\text{(étape 1)}`;
  const complement = `\\text{complément}(t) = ${exercice.Q0}\\cdot(1-${formatDecimal(exercice.q, 3)}^{\\,t})\\ \\text{(étape 2)}`;
  if (phase === "bEcran2") return [reste];
  const complementN = `\\text{complément}(${exercice.n}) \\approx ${formatDecimal(exercice.complementN, 1)}\\ \\text{(étape 3)}`;
  if (phase === "bEcran3") return [reste, complement];
  return [reste, complement, complementN];
}

function consigneEcranB(exercice: ExerciceExpoProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): string {
  const ctx = contexteB(exercice);
  switch (phase) {
    case "bEcran1":
      return `Pose l'expression de reste(t) — ${ctx.nomReste}, en fonction de t.`;
    case "bEcran2":
      return `À partir du reste(t) CORRECT de l'étape précédente, écris l'expression de complément(t) = Q0 − reste(t) — ${ctx.nomComplement}.`;
    case "bEcran3":
      return `Calcule complément(${exercice.n}) (arrondi).`;
    case "bEcran4":
      return `À partir de l'expression CORRECTE de l'étape 2, détermine à partir de quel temps t le complément atteint Q0 − ${formatDecimalTexte(exercice.toleranceSeuil, 1)} (arrondi).`;
  }
}

function aideB1(_exercice: ExerciceExpoProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): AideAvecLatex {
  switch (phase) {
    case "bEcran1":
      return { texte: "Rappel : ce qui décroît réellement en pourcentage constant, c'est ce qu'il RESTE — pas ce qui a déjà progressé.", latex: null };
    case "bEcran2":
      return { texte: "La quantité demandée n'est pas directement le modèle posé à l'étape 1 — c'est ce qui a été RETIRÉ de la quantité initiale.", latex: null };
    case "bEcran3":
      return { texte: "Substitue t=n dans le complément(t) CORRECT de l'étape précédente.", latex: null };
    case "bEcran4":
      return { texte: "Pose l'équation complément(t)=Q0−tolérance, isole la puissance, puis utilise le logarithme (même technique qu'une équation exponentielle).", latex: null };
  }
}

function aideB2(exercice: ExerciceExpoProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): AideAvecLatex {
  switch (phase) {
    case "bEcran1":
      return { texte: "Modèle du reste :", latex: `\\text{reste}(t) = Q_0\\cdot(1-p/100)^t` };
    case "bEcran2":
      return { texte: "Expression du reste rappelée à côté de Q0 (soustraction non faite) :", latex: `Q_0 - \\text{reste}(t) = ${exercice.Q0} - ${exercice.Q0}\\cdot ${formatDecimal(exercice.q, 3)}^{\\,t}` };
    case "bEcran3":
      return { texte: "Substitution faite (soustraction finale non faite) :", latex: `\\text{complément}(${exercice.n}) = ${exercice.Q0} - ${exercice.Q0}\\cdot ${formatDecimal(Math.pow(exercice.q, exercice.n), 4)}` };
    case "bEcran4":
      return { texte: "Équation prête pour le logarithme :", latex: `${formatDecimal(exercice.q, 3)}^{\\,t} = \\dfrac{${formatDecimal(exercice.toleranceSeuil, 1)}}{${exercice.Q0}}` };
  }
}

function formatReponseB(exercice: ExerciceExpoProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): string[] {
  switch (phase) {
    case "bEcran1":
      return [`${exercice.Q0}\\cdot ${formatDecimal(exercice.q, 3)}^{\\,t}`];
    case "bEcran2":
      return [`${exercice.Q0}\\cdot(1-${formatDecimal(exercice.q, 3)}^{\\,t})`];
    case "bEcran3":
      return [formatDecimal(exercice.complementN, 1)];
    case "bEcran4":
      return [formatDecimal(exercice.tSeuil, 1)];
  }
}

// ============================================================================
// Famille C.
// ============================================================================

function consigneGeneraleC(exercice: ExerciceExpoProbC): string {
  return contexteC(exercice).phrase(exercice.t1, exercice.v1, exercice.t2, exercice.v2Affiche);
}

function blocDonneesC(exercice: ExerciceExpoProbC): string[] {
  return [`t_1 = ${exercice.t1}`, `v_1 = ${exercice.v1}`, `t_2 = ${exercice.t2}`, `v_2 \\approx ${formatDecimal(exercice.v2Affiche, 1)}`];
}

// Correctif transversal (voir `etatActuelB` ci-dessus) : `cEcran3` ne montrait QUE le modèle
// confirmé à `cEcran2`, jamais le taux r confirmé à `cEcran1` — ACCUMULE désormais.
function etatActuelC(exercice: ExerciceExpoProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string[] | null {
  if (phase === "cEcran1") return null;
  const lignes = [`r \\approx ${formatDecimal(exercice.r, 3)}\\ \\text{(étape 1)}`];
  if (phase === "cEcran3") lignes.push(`Q(t) \\approx ${formatDecimal(exercice.Q0, 2)}\\cdot ${formatDecimal(exercice.r, 3)}^{\\,t}\\ \\text{(étape 2)}`);
  return lignes;
}

function consigneEcranC(exercice: ExerciceExpoProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string {
  if (phase === "cEcran1") return "Déduis le taux multiplicateur r entre les deux instants connus.";
  if (phase === "cEcran2") return "À partir du taux r CORRECT de l'étape précédente, détermine Q0 (la valeur qui correspondrait à t=0).";
  return `À partir du modèle CORRECT de l'étape précédente, calcule la valeur à chacun des temps suivants : ${exercice.tempsDemandes.map((t) => `t=${t}`).join(", ")}.`;
}

function aideC1(_exercice: ExerciceExpoProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Rappel :", latex: "v_2 = v_1\\cdot r^{\\Delta t} \\ \\Longrightarrow\\ r = \\left(\\dfrac{v_2}{v_1}\\right)^{\\frac{1}{\\Delta t}}" };
  if (phase === "cEcran2") return { texte: "Un point connu et r suffisent à reconstituer Q0.", latex: null };
  return { texte: "Utilise le modèle Q(t)=Q0·r^t confirmé à l'étape précédente, substitue chaque temps demandé.", latex: null };
}

function aideC2(exercice: ExerciceExpoProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Rapport déjà calculé (exposant non appliqué) :", latex: `\\dfrac{v_2}{v_1} \\approx ${formatDecimal(exercice.v2Affiche / exercice.v1, 3)}` };
  if (phase === "cEcran2") return { texte: "Équation à résoudre :", latex: `${exercice.v1} = Q_0\\cdot ${formatDecimal(exercice.r, 3)}^{${exercice.t1}}` };
  return { texte: "Modèle confirmé :", latex: `Q(t) \\approx ${formatDecimal(exercice.Q0, 2)}\\cdot ${formatDecimal(exercice.r, 3)}^{\\,t}` };
}

function formatReponseC(exercice: ExerciceExpoProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string[] {
  if (phase === "cEcran1") return [formatDecimal(exercice.r, 3)];
  if (phase === "cEcran2") return [formatDecimal(exercice.Q0, 2)];
  return exercice.tempsDemandes.map((t, i) => `t=${t}:\\ ${formatDecimal(exercice.valeursDemandees[i], 2)}`);
}

// ============================================================================
// Famille D.
// ============================================================================

function consigneGeneraleD(exercice: ExerciceExpoProbD): string {
  return contexteD(exercice).phrase(exercice.aAffiche, exercice.bAffiche, exercice.cAffiche, exercice.d);
}

function blocDonneesD(exercice: ExerciceExpoProbD): string[] {
  return [`t=0:\\ ${exercice.aAffiche}`, `t=${exercice.d}:\\ ${exercice.bAffiche}`, `t=${2 * exercice.d}:\\ ${exercice.cAffiche}`];
}

// Correctif transversal (voir `etatActuelB` ci-dessus) : chaque écran ne montrait QUE le fait de
// l'écran immédiatement précédent — ACCUMULE désormais (`dEcran4` rappelle rapport/L/T(t), les 3
// écrans précédents, jamais seulement T(t)).
function etatActuelD(exercice: ExerciceExpoProbD, phase: "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4"): string[] | null {
  if (phase === "dEcran1") return null;
  const lignes = [`\\text{rapport} \\approx ${formatDecimal(exercice.rapport, 3)}\\ \\text{(étape 1)}`];
  if (phase === "dEcran2") return lignes;
  lignes.push(`L \\approx ${formatDecimal(exercice.L, 1)}\\ \\text{(étape 2)}`);
  if (phase === "dEcran3") return lignes;
  lignes.push(`T(t) \\approx ${formatModeleD(exercice)}\\ \\text{(étape 3)}`);
  return lignes;
}

function consigneEcranD(exercice: ExerciceExpoProbD, phase: "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4"): string {
  switch (phase) {
    case "dEcran1":
      return "Calcule les deux différences consécutives (a−b) et (b−c), puis leur rapport.";
    case "dEcran2":
      return "À partir du rapport CORRECT de l'étape précédente, détermine la valeur de stabilisation L.";
    case "dEcran3":
      return "Complète le modèle : donne l'expression complète T(t), en fonction de t, à partir du L CORRECT de l'étape précédente.";
    case "dEcran4":
      return `Évalue le modèle CORRECT à t=${exercice.tSuppl}.`;
  }
}

function aideD1(_exercice: ExerciceExpoProbD, phase: "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4"): AideAvecLatex {
  switch (phase) {
    case "dEcran1":
      return { texte: "Pour L+C·r^t, la différence entre 2 valeurs équidistantes est une suite géométrique de raison r^d — même si L est encore inconnu.", latex: null };
    case "dEcran2":
      return { texte: "Rappel :", latex: "a-L = \\dfrac{a-b}{1-r^{d}}" };
    case "dEcran3":
      return { texte: "C=a−L, et r s'obtient depuis le rapport r^d (racine d-ième).", latex: null };
    case "dEcran4":
      return { texte: "Substitue t dans le modèle complet CORRECT de l'étape précédente.", latex: null };
  }
}

function aideD2(exercice: ExerciceExpoProbD, phase: "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4"): AideAvecLatex {
  switch (phase) {
    case "dEcran1":
      return { texte: "Les deux différences, côte à côte (rapport non calculé) :", latex: `(a-b) \\approx ${formatDecimal(exercice.a - exercice.b, 2)}, \\quad (b-c) \\approx ${formatDecimal(exercice.b - exercice.c, 2)}` };
    case "dEcran2":
      return { texte: "Valeur calculée (soustraction finale non faite) :", latex: `\\dfrac{a-b}{1-\\text{rapport}} \\approx ${formatDecimal((exercice.a - exercice.b) / (1 - exercice.rapport), 2)}` };
    case "dEcran3":
      return { texte: "Valeurs déjà connues :", latex: `C = a-L \\approx ${formatDecimal(exercice.C, 2)}, \\quad r \\approx ${formatDecimal(exercice.r, 3)}` };
    case "dEcran4":
      return { texte: "Modèle confirmé :", latex: `T(t) \\approx ${formatModeleD(exercice)}` };
  }
}

function formatReponseD(exercice: ExerciceExpoProbD, phase: "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4"): string[] {
  switch (phase) {
    case "dEcran1":
      return [formatDecimal(exercice.rapport, 3)];
    case "dEcran2":
      return [formatDecimal(exercice.L, 1)];
    case "dEcran3":
      return [formatModeleD(exercice)];
    case "dEcran4":
      return [formatDecimal(exercice.valeurSuppl, 1)];
  }
}

// ============================================================================
// Famille E.
// ============================================================================

function consigneGeneraleE(exercice: ExerciceExpoProbE): string {
  return contexteE(exercice).phrase();
}

function blocDonneesE(exercice: ExerciceExpoProbE): string[] {
  return [`f(t) = ${exercice.k}\\cdot t^{${exercice.n}}\\cdot e^{-${formatDecimal(exercice.a, 1)}t}`];
}

// Correctif transversal (même bug que `etatActuelB` ci-dessus, voir CLAUDE.md/`docs/historique-6e.md`) :
// `eEcran3` ne montrait QUE t_max (écran 2), jamais la dérivée factorisée CONFIRMÉE à `eEcran1` —
// ACCUMULE désormais, plus ancien en premier.
function etatActuelE(exercice: ExerciceExpoProbE, phase: "eEcran1" | "eEcran2" | "eEcran3"): string[] | null {
  if (phase === "eEcran1") return null;
  const { k, n, a } = exercice;
  const derivee = `f'(t) = ${k}\\cdot ${formatPuissance("t", n - 1)}\\cdot e^{-${a}t}\\cdot(${n}-${a}t)\\ \\text{(étape 1)}`;
  if (phase === "eEcran2") return [derivee];
  const tMax = `t_{max} = ${formatDecimal(exercice.tMax, 2)}\\ \\text{(étape 2)}`;
  return [derivee, tMax];
}

function consigneEcranE(_exercice: ExerciceExpoProbE, phase: "eEcran1" | "eEcran2" | "eEcran3"): string {
  if (phase === "eEcran1") return "Calcule f'(t) et factorise-la complètement.";
  if (phase === "eEcran2") return "À partir de la forme factorisée CORRECTE de l'étape précédente, détermine le temps t du maximum.";
  return "Évalue f au temps t du maximum trouvé à l'étape précédente.";
}

function aideE1(_exercice: ExerciceExpoProbE, phase: "eEcran1" | "eEcran2" | "eEcran3"): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Règle du produit, puis dérivée de e^(−at) — factorise ensuite par le terme commun.", latex: null };
  if (phase === "eEcran2") return { texte: "Un zéro de f' n'est pas automatiquement le maximum — vérifie le changement de signe autour de chaque zéro.", latex: null };
  return { texte: "Substitue le temps trouvé dans f(t).", latex: null };
}

function aideE2(exercice: ExerciceExpoProbE, phase: "eEcran1" | "eEcran2" | "eEcran3"): AideAvecLatex {
  const { k, n, a } = exercice;
  if (phase === "eEcran1") return { texte: "Les deux termes non factorisés :", latex: `f'(t) = ${k}\\cdot ${n}\\cdot ${formatPuissance("t", n - 1)}\\cdot e^{-${a}t} \\ -\\ ${k}\\cdot ${a}\\cdot t^{${n}}\\cdot e^{-${a}t}` };
  if (phase === "eEcran2") return { texte: "Les deux zéros de f' (sans indiquer lequel est le bon) :", latex: `t=0 \\ \\text{ou}\\ t=\\dfrac{${n}}{${a}}` };
  return { texte: "Temps du maximum confirmé :", latex: `t = ${formatDecimal(exercice.tMax, 2)}` };
}

function formatReponseE(exercice: ExerciceExpoProbE, phase: "eEcran1" | "eEcran2" | "eEcran3"): string[] {
  const { k, n, a } = exercice;
  if (phase === "eEcran1") return [`${k}\\cdot ${formatPuissance("t", n - 1)}\\cdot e^{-${a}t}\\cdot(${n}-${a}t)`];
  if (phase === "eEcran2") return [formatDecimal(exercice.tMax, 2)];
  return [formatDecimal(exercice.fMax, 2)];
}

// ============================================================================
// Famille F.
// ============================================================================

function consigneGeneraleF(exercice: ExerciceExpoProbF): string {
  return contexteF(exercice).phrase(exercice.N, exercice.g, exercice.F, exercice.V);
}

function blocDonneesF(exercice: ExerciceExpoProbF): string[] {
  return [`k = ${formatDecimal(exercice.k, 2)}`, `n_1 = ${exercice.n1}`, `n_2 = ${exercice.n2}`];
}

// Correctif transversal (même bug que `etatActuelB`/`etatActuelE` ci-dessus, voir CLAUDE.md/
// `docs/historique-6e.md`) : `fEcran2` ne rappelait RIEN (retournait `null` alors qu'un écran
// précédent CONFIRMÉ existe déjà), et `fEcran3`/`fEcran4` ne montraient respectivement que le
// modèle p(t) (jamais une réponse confirmée) et la seule réponse de `fEcran3` — ACCUMULE
// désormais VRAIMENT les réponses confirmées des écrans précédents, plus ancien en premier.
function etatActuelF(exercice: ExerciceExpoProbF, phase: "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4"): string[] | null {
  if (phase === "fEcran1") return null;
  const limite = `p(t) \\to 1\\ \\text{(étape 1)}`;
  if (phase === "fEcran2") return [limite];
  const pN1 = `p(${exercice.n1}) \\approx ${formatDecimal(exercice.pN1, 3)}\\ \\text{(étape 2)}`;
  if (phase === "fEcran3") return [limite, pN1];
  const personnes = `\\text{personnes touchées} \\approx ${formatDecimal(exercice.personnesN2, 0)}\\ \\text{(étape 3)}`;
  return [limite, pN1, personnes];
}

function consigneEcranF(exercice: ExerciceExpoProbF, phase: "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4"): string {
  switch (phase) {
    case "fEcran1":
      return "Quelle est la limite de p(t) quand t devient très grand ?";
    case "fEcran2":
      return `Calcule p(${exercice.n1}).`;
    case "fEcran3":
      return `Calcule le nombre de personnes touchées après t=${exercice.n2} — recalcule p(${exercice.n2}), n'utilise PAS p(${exercice.n1}).`;
    case "fEcran4":
      return `Calcule le bénéfice net après t=${exercice.n2} : bénéfice = revenu − (coûts fixes + coûts variables).`;
  }
}

function aideF1(_exercice: ExerciceExpoProbF, phase: "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4"): AideAvecLatex {
  switch (phase) {
    case "fEcran1":
      return { texte: "e^(−kt) tend vers 0 quand t devient très grand.", latex: null };
    case "fEcran2":
      return { texte: "Substitue directement t=n1 dans p(t)=1−e^(−kt).", latex: null };
    case "fEcran3":
      return { texte: "N'utilise jamais p(n1) ici — recalcule p au bon temps (n2), puis multiplie par N.", latex: null };
    case "fEcran4":
      return { texte: "Rappel : bénéfice net = revenu − (coûts fixes + coûts variables).", latex: null };
  }
}

function aideF2(exercice: ExerciceExpoProbF, phase: "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4"): AideAvecLatex {
  switch (phase) {
    case "fEcran1":
      return { texte: "Valeur limite :", latex: "p(t) \\to 1" };
    case "fEcran2":
      return { texte: "Calcul intermédiaire :", latex: `e^{-${formatDecimal(exercice.k, 2)}\\cdot ${exercice.n1}} \\approx ${formatDecimal(Math.exp(-exercice.k * exercice.n1), 4)}` };
    case "fEcran3":
      return { texte: "Proportion déjà calculée (multiplication par N non faite) :", latex: `p(${exercice.n2}) \\approx ${formatDecimal(exercice.pN2, 4)}` };
    case "fEcran4":
      return { texte: "Les trois quantités, séparément (combinaison non faite) :", latex: `\\text{revenu} \\approx ${formatDecimal(exercice.g * exercice.personnesN2, 0)}, \\quad \\text{coûts} = ${exercice.F}+${exercice.V}\\times ${exercice.n2}` };
  }
}

function formatReponseF(exercice: ExerciceExpoProbF, phase: "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4"): string[] {
  switch (phase) {
    case "fEcran1":
      return ["1"];
    case "fEcran2":
      return [formatDecimal(exercice.pN1, 3)];
    case "fEcran3":
      return [formatDecimal(exercice.personnesN2, 0)];
    case "fEcran4":
      return [formatDecimal(exercice.beneficeN2, 0)];
  }
}

// ============================================================================
// Famille G.
// ============================================================================

function consigneGeneraleG(exercice: ExerciceExpoProbG): string {
  return contexteG(exercice).phrase(exercice.sAffiche);
}

function blocDonneesG(exercice: ExerciceExpoProbG): string[] {
  return [`f(t) = ${formatModeleG(exercice.c, exercice.k, formatDecimal(exercice.a, 1))}`, `S = ${formatDecimal(exercice.sAffiche, 1)}`, `D = ${exercice.duree}\\ (${contexteG(exercice).unite})`];
}

// Correctif transversal (même bug que `etatActuelB`/`etatActuelE`/`etatActuelF` ci-dessus, voir
// CLAUDE.md/`docs/historique-6e.md`) : `gEcran2` ne rappelait RIEN (retournait `null` malgré un
// écran précédent CONFIRMÉ) et `gEcran3` sautait purement et simplement les évaluations
// CONFIRMÉES à `gEcran1`, en affichant à la place `D` (une DONNÉE de l'énoncé, déjà présente dans
// `blocDonnees`, jamais une réponse validée) — ACCUMULE désormais les réponses réellement
// confirmées, plus ancienne en premier ; `D` n'a plus sa place ici (déjà dans le bloc données).
function etatActuelG(exercice: ExerciceExpoProbG, phase: "gEcran1" | "gEcran2" | "gEcran3"): string[] | null {
  if (phase === "gEcran1") return null;
  const evaluations = `f(${exercice.tEval1}) \\approx ${formatDecimal(exercice.fEval1, 2)},\\ f(${exercice.tEval2}) \\approx ${formatDecimal(exercice.fEval2, 2)}\\ \\text{(étape 1)}`;
  if (phase === "gEcran2") return [evaluations];
  const tSeuil = `t_{seuil} \\approx ${formatDecimal(exercice.tSeuil, 2)}\\ \\text{(étape 2)}`;
  return [evaluations, tSeuil];
}

function consigneEcranG(exercice: ExerciceExpoProbG, phase: "gEcran1" | "gEcran2" | "gEcran3"): string {
  switch (phase) {
    case "gEcran1":
      return `Évalue f(${exercice.tEval1}) et f(${exercice.tEval2}).`;
    case "gEcran2":
      return `Résous f(t)=${formatDecimalTexte(exercice.sAffiche, 1)} (isole l'exponentielle puis passe au logarithme).`;
    case "gEcran3":
      return `Compare le temps seuil CORRECT de l'étape précédente à D=${exercice.duree} : l'objectif est-il atteignable ?`;
  }
}

function aideG1(_exercice: ExerciceExpoProbG, phase: "gEcran1" | "gEcran2" | "gEcran3"): AideAvecLatex {
  switch (phase) {
    case "gEcran1":
      return { texte: "Substitue directement chaque temps dans f(t)=c+e^(k−at).", latex: null };
    case "gEcran2":
      return { texte: "Isole e^(k−at)=S−c avant de passer au logarithme.", latex: null };
    case "gEcran3":
      return { texte: "La grandeur est décroissante : le seuil est franchi puis dépassé, jamais retrouvé.", latex: null };
  }
}

function aideG2(exercice: ExerciceExpoProbG, phase: "gEcran1" | "gEcran2" | "gEcran3"): AideAvecLatex {
  switch (phase) {
    case "gEcran1":
      return { texte: "Modèle rappelé :", latex: `f(t) = ${formatModeleG(exercice.c, exercice.k, formatDecimal(exercice.a, 1))}` };
    case "gEcran2":
      return { texte: "Équation prête pour le logarithme (non résolue) :", latex: `${formatExposantG(exercice.k, formatDecimal(exercice.a, 1))} = \\ln(${formatSoustraction(formatDecimal(exercice.sAffiche, 1), exercice.c)})` };
    case "gEcran3":
      return { texte: "Temps seuil et durée, côte à côte :", latex: `t_{seuil} \\approx ${formatDecimal(exercice.tSeuil, 2)}, \\quad D = ${exercice.duree}` };
  }
}

function formatReponseG(exercice: ExerciceExpoProbG, phase: "gEcran1" | "gEcran2" | "gEcran3"): string[] {
  if (phase === "gEcran1") return [`f(${exercice.tEval1})=${formatDecimal(exercice.fEval1, 2)}`, `f(${exercice.tEval2})=${formatDecimal(exercice.fEval2, 2)}`];
  if (phase === "gEcran2") return [formatDecimal(exercice.tSeuil, 2)];
  return [exercice.duree >= exercice.tSeuil ? "Atteignable" : "Non atteignable"];
}

// ============================================================================
// Dispatch public.
// ============================================================================

export function consigneGenerale(exercice: ExerciceExponentiellesProblemes): string {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB(exercice);
    case "C":
      return consigneGeneraleC(exercice);
    case "D":
      return consigneGeneraleD(exercice);
    case "E":
      return consigneGeneraleE(exercice);
    case "F":
      return consigneGeneraleF(exercice);
    case "G":
      return consigneGeneraleG(exercice);
  }
}

export function blocDonnees(exercice: ExerciceExponentiellesProblemes): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
    case "F":
      return blocDonneesF(exercice);
    case "G":
      return blocDonneesG(exercice);
  }
}

/** Bloc "état actuel" — `null` sur le premier écran de chaque famille (rien à rappeler), un
 * tableau de fragments LaTeX sinon (convention CLAUDE.md : structure d'écran consigne générale →
 * bloc données → bloc "état actuel" → bloc de travail). */
export function etatActuel(exercice: ExerciceExponentiellesProblemes, phase: PhaseExponentiellesProblemes): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return etatActuelB(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return etatActuelC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return etatActuelD(exercice, phase as "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4");
    case "E":
      return etatActuelE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "F":
      return etatActuelF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4");
    case "G":
      return etatActuelG(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3");
  }
}

export function consigneEcran(exercice: ExerciceExponentiellesProblemes, phase: PhaseExponentiellesProblemes): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return consigneEcranB(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return consigneEcranC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return consigneEcranD(exercice, phase as "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4");
    case "E":
      return consigneEcranE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "F":
      return consigneEcranF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4");
    case "G":
      return consigneEcranG(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3");
  }
}

export function aideNiveau1(exercice: ExerciceExponentiellesProblemes, phase: PhaseExponentiellesProblemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA1(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return aideB1(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return aideC1(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return aideD1(exercice, phase as "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4");
    case "E":
      return aideE1(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "F":
      return aideF1(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4");
    case "G":
      return aideG1(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3");
  }
}

export function aideNiveau2(exercice: ExerciceExponentiellesProblemes, phase: PhaseExponentiellesProblemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA2(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return aideB2(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return aideC2(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return aideD2(exercice, phase as "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4");
    case "E":
      return aideE2(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "F":
      return aideF2(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4");
    case "G":
      return aideG2(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3");
  }
}

/** Réponse RÉELLEMENT attendue d'un écran donné — un fragment LaTeX par élément, jamais dérivée de
 * ce que l'élève a soumis (toujours reconstruite depuis les champs déjà résolus de `exercice`). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceExponentiellesProblemes, phase: PhaseExponentiellesProblemes): string[] {
  switch (exercice.famille) {
    case "A":
      return formatReponseA(exercice, phase as "aEcran1" | "aEcran2");
    case "B":
      return formatReponseB(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return formatReponseC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return formatReponseD(exercice, phase as "dEcran1" | "dEcran2" | "dEcran3" | "dEcran4");
    case "E":
      return formatReponseE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3");
    case "F":
      return formatReponseF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3" | "fEcran4");
    case "G":
      return formatReponseG(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3");
  }
}

/** Libellé court d'écran pour le récapitulatif final (`LigneRecap`). */
export const LIBELLE_PHASE: Record<PhaseExponentiellesProblemes, string> = {
  aEcran1: "Étape 1 (modèle)",
  aEcran2: "Étape 2 (calcul)",
  bEcran1: "Étape 1 (reste)",
  bEcran2: "Étape 2 (complément)",
  bEcran3: "Étape 3 (évaluation)",
  bEcran4: "Étape 4 (seuil)",
  cEcran1: "Étape 1 (taux r)",
  cEcran2: "Étape 2 (Q0)",
  cEcran3: "Étape 3 (évaluations)",
  dEcran1: "Étape 1 (rapport)",
  dEcran2: "Étape 2 (stabilisation L)",
  dEcran3: "Étape 3 (modèle complet)",
  dEcran4: "Étape 4 (évaluation)",
  eEcran1: "Étape 1 (dérivée factorisée)",
  eEcran2: "Étape 2 (temps du maximum)",
  eEcran3: "Étape 3 (valeur maximale)",
  fEcran1: "Étape 1 (limite)",
  fEcran2: "Étape 2 (évaluation n1)",
  fEcran3: "Étape 3 (personnes touchées)",
  fEcran4: "Étape 4 (bénéfice net)",
  gEcran1: "Étape 1 (évaluations)",
  gEcran2: "Étape 2 (temps seuil)",
  gEcran3: "Étape 3 (décision)",
};

/** Phases réellement traversées, PAR FAMILLE — pilote l'affichage du récapitulatif final
 * (`ResultatPanelExponentiellesProblemes.tsx`), même principe que `PHASES` dans
 * `ResultatPanelEtudeFonctionExponentielle.tsx` (6gen11), généralisé aux 7 familles. */
export const PHASES_PAR_FAMILLE: Record<ExerciceExponentiellesProblemes["famille"], PhaseExponentiellesProblemes[]> = {
  A: ["aEcran1", "aEcran2"],
  B: ["bEcran1", "bEcran2", "bEcran3", "bEcran4"],
  C: ["cEcran1", "cEcran2", "cEcran3"],
  D: ["dEcran1", "dEcran2", "dEcran3", "dEcran4"],
  E: ["eEcran1", "eEcran2", "eEcran3"],
  F: ["fEcran1", "fEcran2", "fEcran3", "fEcran4"],
  G: ["gEcran1", "gEcran2", "gEcran3"],
};

/**
 * Total points du récapitulatif final — complément AJOUTÉ à côté de la liste `LigneRecap` colorée
 * (jamais à sa place, voir CLAUDE.md/`docs/conventions-transversales.md`). Somme les scores DÉJÀ
 * calculés par `sessionExponentiellesProblemes.ts` — le nombre d'écrans varie PAR FAMILLE
 * (`maximum = 100 × nombre d'écrans` : 200 pour A/E/C... voir `PHASES_PAR_FAMILLE`).
 */
export function calculerTotalPointsExponentiellesProblemes(resultat: ResultatExerciceExponentiellesProblemes): { total: number; maximum: number } {
  const phases = PHASES_PAR_FAMILLE[resultat.famille];
  const scores = resultat as unknown as Record<string, number>;
  const cles: Record<PhaseExponentiellesProblemes, string> = {
    aEcran1: "scoreEcran1",
    aEcran2: "scoreEcran2",
    bEcran1: "scoreEcran1",
    bEcran2: "scoreEcran2",
    bEcran3: "scoreEcran3",
    bEcran4: "scoreEcran4",
    cEcran1: "scoreEcran1",
    cEcran2: "scoreEcran2",
    cEcran3: "scoreEcran3",
    dEcran1: "scoreEcran1",
    dEcran2: "scoreEcran2",
    dEcran3: "scoreEcran3",
    dEcran4: "scoreEcran4",
    eEcran1: "scoreEcran1",
    eEcran2: "scoreEcran2",
    eEcran3: "scoreEcran3",
    fEcran1: "scoreEcran1",
    fEcran2: "scoreEcran2",
    fEcran3: "scoreEcran3",
    fEcran4: "scoreEcran4",
    gEcran1: "scoreEcran1",
    gEcran2: "scoreEcran2",
    gEcran3: "scoreEcran3",
  };
  const total = phases.reduce((s, p) => s + (scores[cles[p]] ?? 0), 0);
  return { total, maximum: 100 * phases.length };
}
