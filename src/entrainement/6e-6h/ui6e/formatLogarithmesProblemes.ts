import type { ExerciceLogarithmesProblemes, ExerciceLogProbA, ExerciceLogProbB, ExerciceLogProbC, ExerciceLogProbD, ExerciceLogProbE, ExerciceLogProbF, ExerciceLogProbG } from "../core6e/logarithmesProblemes.types";
import {
  CONTEXTES_A_CROISSANCE,
  CONTEXTES_A_DECROISSANCE,
  CONTEXTES_A_TAUX,
  CONTEXTES_A_TAUX_DECROISSANCE,
  CONTEXTES_B,
  CONTEXTES_C,
  CONTEXTES_D,
  CONTEXTES_F,
  CONTEXTES_G,
} from "../generateurs6e/logarithmesProblemes/contextes";
import type { PhaseLogarithmesProblemes, ResultatExerciceLogarithmesProblemes } from "../moteur6e/typesLogarithmesProblemes";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen22`. `src/ui6e/` peut
 * dépendre de `src/generateurs6e/` (même principe que `formatExponentiellesProblemes.ts`, 6gen12).
 * Dispatch PAR FAMILLE PUIS PAR PHASE/SOUS-TYPE. Toute aide qui embarque un symbole LaTeX est
 * retournée en `AideAvecLatex {texte, latex}` — jamais interpolée en texte brut.
 */

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

function formatDecimal(v: number, decimales = 2): string {
  const f = Math.pow(10, decimales);
  const r = Math.round(v * f) / f;
  return String(r).replace(".", "{,}").replace("-{,}", "-0{,}");
}

function formatDecimalTexte(v: number, decimales = 2): string {
  const f = Math.pow(10, decimales);
  const r = Math.round(v * f) / f;
  return String(r).replace(".", ",");
}

/** `± b` (avec espace de tête), OMIS si `b=0` — cas réel pour les contextes pH/décibels (famille
 * E), où `b` est une constante DE DÉFINITION fixée à 0 (`generateurs6e/logarithmesProblemes/
 * familles/E.ts::CONFIGS`), jamais une valeur générique à comparer à 0 par hasard. */
function formatPlusB(b: number, decimales: number): string {
  if (b === 0) return "";
  return ` ${b >= 0 ? "+" : "-"} ${formatDecimal(Math.abs(b), decimales)}`;
}

/** Notation scientifique LaTeX pour une valeur potentiellement extrême (plusieurs ordres de
 * grandeur) — jamais un nombre décimal brut illisible (ex. famille E, `X1e4`/`X2e4` reconvertis
 * depuis une échelle log, uniquement utilisés en AIDE, jamais tapés par l'élève). */
function formatScientifique(v: number, decimales = 2): string {
  if (v === 0) return "0";
  const exposant = Math.floor(Math.log10(Math.abs(v)));
  if (exposant > -3 && exposant < 5) return formatDecimal(v, decimales);
  const mantisse = v / Math.pow(10, exposant);
  return `${formatDecimal(mantisse, decimales)} \\times 10^{${exposant}}`;
}

// ============================================================================
// Famille A.
// ============================================================================

type PhaseA = "aEcran1" | "aEcran2" | "aEcran3";

function contexteACroissance(id: string) {
  return CONTEXTES_A_CROISSANCE.find((c) => c.id === id)!;
}
function contexteADecroissance(id: string) {
  return CONTEXTES_A_DECROISSANCE.find((c) => c.id === id)!;
}
function contexteATaux(id: string) {
  return CONTEXTES_A_TAUX.find((c) => c.id === id)!;
}
function contexteATauxDecroissance(id: string) {
  return CONTEXTES_A_TAUX_DECROISSANCE.find((c) => c.id === id)!;
}

function consigneGeneraleA(ex: ExerciceLogProbA): string {
  if (ex.sousType === "resoudreT") return (ex.croissance ? contexteACroissance(ex.contexteId) : contexteADecroissance(ex.contexteId)).phrase(ex.Q0, ex.p);
  if (ex.sousType === "resoudreTaux") return contexteATaux(ex.contexteId).phrase(ex.Q0, ex.n, ex.cibleAffiche);
  return contexteATauxDecroissance(ex.contexteId).phrase(ex.Q0, Math.round((1 - ex.fraction) * 100), ex.h);
}

function blocDonneesA(ex: ExerciceLogProbA): string[] {
  if (ex.sousType === "resoudreT") {
    const base = [`Q_0 = ${ex.Q0}`, `p = ${ex.p}\\,\\%`];
    if (ex.variante === "simple") return [...base, `\\text{seuil} = ${ex.cible1Affiche}`];
    return [...base, `\\text{seuil}_1 = ${ex.cible1Affiche}`, `\\text{seuil}_2 = ${ex.cible2Affiche}`];
  }
  if (ex.sousType === "resoudreTaux") return [`Q_0 = ${ex.Q0}`, `n = ${ex.n}`, `\\text{cible} = ${ex.cibleAffiche}`];
  return [`Q_0 = ${ex.Q0}`, `h = ${ex.h}`, `\\text{fraction restante} = ${formatDecimal(ex.fraction, 2)}`];
}

function equationA1(ex: ExerciceLogProbA & { sousType: "resoudreT" }): string {
  return `${ex.Q0}\\cdot ${formatDecimal(ex.r, 4)}^{\\,t} ${ex.sens.replace(">=", "\\geq").replace("<=", "\\leq")} ${ex.cible1Affiche}`;
}
function equationA2(ex: ExerciceLogProbA & { sousType: "resoudreT" }): string {
  return `${formatDecimal(ex.r, 4)}^{\\,t} ${ex.sens.replace(">=", "\\geq").replace("<=", "\\leq")} ${formatDecimal(ex.cible1Affiche / ex.Q0, 4)}`;
}

function etatActuelA(ex: ExerciceLogProbA, phase: PhaseA): string[] | null {
  if (phase === "aEcran1") return null;
  if (ex.sousType === "resoudreT") {
    if (phase === "aEcran2") return [equationA1(ex)];
    return [equationA1(ex), equationA2(ex)];
  }
  if (ex.sousType === "resoudreTaux") {
    const eq1 = `${ex.Q0}\\cdot(1+i)^{${ex.n}} = ${ex.cibleAffiche}`;
    if (phase === "aEcran2") return [eq1];
    return [eq1, `(1+i)^{${ex.n}} = ${formatDecimal(ex.cibleAffiche / ex.Q0, 4)}`];
  }
  const eq1 = `${ex.Q0}\\cdot e^{-kh} = ${formatDecimal(ex.fraction * ex.Q0, 2)}`;
  if (phase === "aEcran2") return [eq1];
  return [eq1, `e^{-kh} = ${formatDecimal(ex.fraction, 2)}`];
}

function consigneEcranA(ex: ExerciceLogProbA, phase: PhaseA): string {
  if (phase === "aEcran1") {
    if (ex.sousType === "resoudreT") return "Pose l'équation ou l'inéquation qui traduit cette situation.";
    if (ex.sousType === "resoudreTaux") return "Pose l'équation qui traduit cette situation (l'inconnue est le taux i).";
    return "Pose l'équation qui traduit cette situation (l'inconnue est le taux k).";
  }
  if (phase === "aEcran2") {
    if (ex.sousType === "resoudreT") return "À partir de la forme CORRECTE de l'étape précédente, isole le terme exponentiel.";
    return "À partir de la forme CORRECTE de l'étape précédente, isole le terme élevé à une puissance.";
  }
  if (ex.sousType === "resoudreT") {
    return ex.variante === "simple"
      ? "Résous : donne le nombre ENTIER de périodes à partir duquel ce seuil est atteint (arrondi au-dessus, on ne peut pas compter une période partielle)."
      : "Résous les 2 seuils : donne, pour chacun, le nombre ENTIER de périodes à partir duquel il est atteint (arrondi au-dessus).";
  }
  if (ex.sousType === "resoudreTaux") return "Résous pour i à partir de la forme CORRECTE de l'étape précédente (utilise une racine n-ième — l'inconnue est la BASE, pas l'exposant).";
  return "Résous pour k à partir de la forme CORRECTE de l'étape précédente (utilise le logarithme népérien).";
}

function aideA1(ex: ExerciceLogProbA, phase: PhaseA): AideAvecLatex {
  if (phase === "aEcran1") {
    if (ex.sousType === "resoudreT") return { texte: `Rappel : ${ex.croissance ? "une hausse" : "une baisse"} de p % correspond à un facteur ${ex.croissance ? "r=1+p/100" : "r=1-p/100"}.`, latex: null };
    if (ex.sousType === "resoudreTaux") return { texte: "Modèle Q0·(1+i)^n=cible — ici, contrairement à un taux fixe, c'est le TAUX i qui est l'inconnue.", latex: null };
    return { texte: "Modèle Q0·e^(-kh)=fraction·Q0 — l'inconnue est le taux de décroissance k.", latex: null };
  }
  if (phase === "aEcran2") {
    if (ex.sousType === "resoudreT") return { texte: "Divise les deux membres par Q0 pour isoler le terme en r.", latex: null };
    if (ex.sousType === "resoudreTaux") return { texte: "Divise les deux membres par Q0 pour isoler (1+i)^n.", latex: null };
    return { texte: "Divise les deux membres par Q0 pour isoler e^(-kh).", latex: null };
  }
  if (ex.sousType === "resoudreT") return { texte: "Passe au logarithme (népérien ou décimal) des deux membres, puis isole t.", latex: null };
  if (ex.sousType === "resoudreTaux")
    return { texte: "Ici l'inconnue i est dans la BASE (1+i), pas dans l'exposant — contrairement au sous-type précédent, on utilise une racine n-ième, PAS un logarithme.", latex: null };
  return { texte: "Passe au logarithme népérien des deux membres, puis isole k.", latex: null };
}

function aideA2(ex: ExerciceLogProbA, phase: PhaseA): AideAvecLatex {
  if (phase === "aEcran1") {
    if (ex.sousType === "resoudreT") return { texte: "Facteur déjà calculé (équation non posée) :", latex: `r = ${formatDecimal(ex.r, 4)}` };
    if (ex.sousType === "resoudreTaux") return { texte: "Forme attendue (non posée) :", latex: "Q_0\\cdot(1+i)^{n} = \\text{cible}" };
    return { texte: "Forme attendue (non posée) :", latex: "Q_0\\cdot e^{-kh} = \\text{fraction}\\cdot Q_0" };
  }
  if (phase === "aEcran2") {
    if (ex.sousType === "resoudreT") return { texte: "Équation prête pour le logarithme :", latex: equationA1(ex) };
    if (ex.sousType === "resoudreTaux") return { texte: "Équation prête pour la racine n-ième :", latex: `${ex.Q0}\\cdot(1+i)^{${ex.n}} = ${ex.cibleAffiche}` };
    return { texte: "Équation prête pour le logarithme :", latex: `${ex.Q0}\\cdot e^{-kh} = ${formatDecimal(ex.fraction * ex.Q0, 2)}` };
  }
  if (ex.sousType === "resoudreT") return { texte: "Terme isolé, logarithme non appliqué :", latex: equationA2(ex) };
  if (ex.sousType === "resoudreTaux") return { texte: "Équation racine n-ième affichée, non résolue :", latex: `1+i = \\sqrt[${ex.n}]{${formatDecimal(ex.cibleAffiche / ex.Q0, 4)}}` };
  return { texte: "Terme isolé, logarithme non appliqué :", latex: `e^{-kh} = ${formatDecimal(ex.fraction, 2)}` };
}

function reponseA(ex: ExerciceLogProbA, phase: PhaseA): string[] {
  if (phase === "aEcran1") {
    if (ex.sousType === "resoudreT") return [equationA1(ex)];
    if (ex.sousType === "resoudreTaux") return [`${ex.Q0}\\cdot(1+i)^{${ex.n}} = ${ex.cibleAffiche}`];
    return [`${ex.Q0}\\cdot e^{-kh} = ${formatDecimal(ex.fraction * ex.Q0, 2)}`];
  }
  if (phase === "aEcran2") {
    if (ex.sousType === "resoudreT") return [equationA2(ex)];
    if (ex.sousType === "resoudreTaux") return [`(1+i)^{${ex.n}} = ${formatDecimal(ex.cibleAffiche / ex.Q0, 4)}`];
    return [`e^{-kh} = ${formatDecimal(ex.fraction, 2)}`];
  }
  if (ex.sousType === "resoudreT") return ex.variante === "simple" ? [`t = ${ex.t1Reponse}`] : [`t_1 = ${ex.t1Reponse}`, `t_2 = ${ex.t2Reponse}`];
  if (ex.sousType === "resoudreTaux") return [`i \\approx ${formatDecimal(ex.i, 4)}`];
  return [`k \\approx ${formatDecimal(ex.k, 4)}`];
}

// ============================================================================
// Famille B.
// ============================================================================

function contexteB(id: string) {
  return CONTEXTES_B.find((c) => c.id === id)!;
}

function consigneGeneraleB(ex: ExerciceLogProbB): string {
  return contexteB(ex.contexteId).phrase(ex.t1, ex.v1, ex.t2, ex.v2Affiche);
}
function blocDonneesB(ex: ExerciceLogProbB): string[] {
  return [`t_1 = ${ex.t1}`, `v_1 = ${ex.v1}`, `t_2 = ${ex.t2}`, `v_2 \\approx ${formatDecimal(ex.v2Affiche, 1)}`];
}
function etatActuelB(ex: ExerciceLogProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): string[] | null {
  if (phase === "bEcran1") return null;
  if (phase === "bEcran2") return [`r \\approx ${formatDecimal(ex.r, 3)}`];
  const modele = `Q(t) \\approx ${formatDecimal(ex.Q0, 2)}\\cdot ${formatDecimal(ex.r, 3)}^{\\,t}`;
  if (phase === "bEcran3") return [modele];
  return [modele, `Q(${ex.tRef}) \\approx ${formatDecimal(ex.valeurRef, 2)}`];
}
function consigneEcranB(ex: ExerciceLogProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): string {
  switch (phase) {
    case "bEcran1":
      return "Déduis le taux multiplicateur r entre les deux instants connus.";
    case "bEcran2":
      return "À partir du taux r CORRECT de l'étape précédente, détermine Q0 (la valeur qui correspondrait à t=0).";
    case "bEcran3":
      return `À partir du modèle CORRECT, calcule la valeur au temps t=${ex.tRef}.`;
    case "bEcran4":
      return `À partir de la valeur CORRECTE de l'étape précédente, détermine le temps t auquel ${contexteB(ex.contexteId).multiple(ex.k)} (par rapport à t=${ex.tRef}).`;
  }
}
function aideB1(ex: ExerciceLogProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): AideAvecLatex {
  switch (phase) {
    case "bEcran1":
      return { texte: "Rappel :", latex: "v_2 = v_1\\cdot r^{\\Delta t} \\ \\Longrightarrow\\ r = \\left(\\dfrac{v_2}{v_1}\\right)^{\\frac{1}{\\Delta t}}" };
    case "bEcran2":
      return { texte: "Un point connu et r suffisent à reconstituer Q0.", latex: null };
    case "bEcran3":
      return { texte: "Substitue directement t dans le modèle Q(t)=Q0·r^t confirmé.", latex: null };
    case "bEcran4":
      return { texte: `Pose l'équation Q0·r^t=${ex.k}·Q(${ex.tRef}), isole r^t, PUIS logarithme.`, latex: null };
  }
}
function aideB2(ex: ExerciceLogProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): AideAvecLatex {
  switch (phase) {
    case "bEcran1":
      return { texte: "Rapport déjà calculé (exposant non appliqué) :", latex: `\\dfrac{v_2}{v_1} \\approx ${formatDecimal(ex.v2Affiche / ex.v1, 3)}` };
    case "bEcran2":
      return { texte: "Équation à résoudre :", latex: `${ex.v1} = Q_0\\cdot ${formatDecimal(ex.r, 3)}^{${ex.t1}}` };
    case "bEcran3":
      return { texte: "Substitution faite (calcul final non fait) :", latex: `Q(${ex.tRef}) = ${formatDecimal(ex.Q0, 2)}\\cdot ${formatDecimal(ex.r, 3)}^{${ex.tRef}}` };
    case "bEcran4":
      return { texte: "Équation posée, non résolue :", latex: `${formatDecimal(ex.Q0, 2)}\\cdot ${formatDecimal(ex.r, 3)}^{\\,t} = ${ex.k}\\cdot ${formatDecimal(ex.valeurRef, 2)}` };
  }
}
function reponseB(ex: ExerciceLogProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): string[] {
  switch (phase) {
    case "bEcran1":
      return [formatDecimal(ex.r, 3)];
    case "bEcran2":
      return [formatDecimal(ex.Q0, 2)];
    case "bEcran3":
      return [formatDecimal(ex.valeurRef, 2)];
    case "bEcran4":
      return [formatDecimal(ex.tCible, 2)];
  }
}

// ============================================================================
// Famille C.
// ============================================================================

function contexteC(id: string) {
  return CONTEXTES_C.find((c) => c.id === id)!;
}

function consigneGeneraleC(ex: ExerciceLogProbC): string {
  const ctx = contexteC(ex.contexteId);
  return `${ctx.phraseIntro()} ${ex.sens === "versT" ? `Sa constante de désintégration vaut λ ≈ ${formatDecimalTexte(ex.lambda, 3)} par unité de temps.` : `Sa demi-vie vaut T = ${ex.T} (unité arbitraire).`}`;
}
function blocDonneesC(ex: ExerciceLogProbC): string[] {
  return ex.sens === "versT" ? [`\\lambda \\approx ${formatDecimal(ex.lambda, 3)}`] : [`T = ${ex.T}`];
}
function etatActuelC(ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string[] | null {
  if (phase === "cEcran1") return null;
  if (phase === "cEcran2") return [`T \\approx ${formatDecimal(ex.T, 2)}`];
  return null;
}
function consigneEcranC(ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string {
  if (phase === "cEcran1") return ex.sens === "versT" ? "Déduis la demi-vie T depuis λ." : "Déduis la constante de désintégration λ depuis T.";
  if (phase === "cEcran2") return `À partir du T CORRECT de l'étape précédente, détermine le temps t nécessaire pour qu'il ne reste plus que ${formatDecimalTexte(ex.fractionEcran2 * 100, 1)} % de la quantité initiale.`;
  return `Deux estimations de la demi-vie de cet élément ont été publiées : T₁ = ${ex.T1} et T₂ = ${ex.T2}. Calcule le facteur correctif entre les deux (à appliquer à tout âge publié avec l'ancienne estimation).`;
}
function aideC1(_ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Rappel — définition N(T)=N0/2 :", latex: "T = \\dfrac{\\ln 2}{\\lambda} \\quad \\Longleftrightarrow \\quad \\lambda = \\dfrac{\\ln 2}{T}" };
  if (phase === "cEcran2") return { texte: "N(t)=N0·(1/2)^(t/T) est équivalente à N0·e^(−λt), mais plus pratique ici : elle évite de calculer λ séparément.", latex: null };
  return { texte: "Tous les âges publiés sont proportionnels à la demi-vie utilisée pour les calculer.", latex: null };
}
function aideC2(ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Valeur numérique de ln(2) :", latex: "\\ln 2 \\approx 0{,}693" };
  if (phase === "cEcran2") return { texte: "Équation posée, non résolue :", latex: `${formatDecimal(ex.fractionEcran2, 3)} = \\left(\\dfrac{1}{2}\\right)^{t/${formatDecimal(ex.T, 2)}}` };
  return { texte: "Facteur correctif :", latex: `\\dfrac{T_2}{T_1} = \\dfrac{${ex.T2}}{${ex.T1}}` };
}
function reponseC(ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string[] {
  if (phase === "cEcran1") return [ex.sens === "versT" ? `T \\approx ${formatDecimal(ex.T, 2)}` : `\\lambda \\approx ${formatDecimal(ex.lambda, 4)}`];
  if (phase === "cEcran2") return [formatDecimal(ex.tEcran2, 2)];
  return [formatDecimal(ex.facteurCorrectif, 3)];
}

// ============================================================================
// Famille D.
// ============================================================================

function contexteD(id: string) {
  return CONTEXTES_D.find((c) => c.id === id)!;
}

function consigneGeneraleD(ex: ExerciceLogProbD): string {
  return contexteD(ex.contexteId).phrase(ex.Ta, ex.T0);
}
function blocDonneesD(ex: ExerciceLogProbD): string[] {
  return [`T_a = ${ex.Ta}`, `T_0 = ${ex.T0}`];
}
function etatActuelD(ex: ExerciceLogProbD, phase: "dEcran1" | "dEcran2"): string[] | null {
  if (phase === "dEcran1") return null;
  return [`T(t) = ${ex.Ta}+(${ex.T0}-${ex.Ta})\\cdot e^{kt}`];
}
function consigneEcranD(_ex: ExerciceLogProbD, phase: "dEcran1" | "dEcran2"): string {
  if (phase === "dEcran1") return "Pose le modèle T(t) décrivant cette situation (k reste symbolique — pas assez de données pour le déterminer).";
  return "À partir du modèle CORRECT de l'étape précédente, exprime t en fonction de T (k reste dans ta réponse).";
}
function aideD1(_ex: ExerciceLogProbD, phase: "dEcran1" | "dEcran2"): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "Le modèle général à asymptote non nulle est T(t)=Ta+(T0−Ta)·e^(kt), avec Ta l'asymptote et T0 la valeur initiale.", latex: null };
  return { texte: "Isole d'abord e^(kt), puis passe au logarithme, avant de diviser par k.", latex: null };
}
function aideD2(ex: ExerciceLogProbD, phase: "dEcran1" | "dEcran2"): AideAvecLatex {
  if (phase === "dEcran1") return { texte: "Valeurs à substituer :", latex: `T_a=${ex.Ta}, \\quad T_0=${ex.T0}` };
  return { texte: "e^(kt) isolé, logarithme non appliqué :", latex: `e^{kt} = \\dfrac{T-${ex.Ta}}{${ex.T0}-${ex.Ta}}` };
}
function reponseD(ex: ExerciceLogProbD, phase: "dEcran1" | "dEcran2"): string[] {
  if (phase === "dEcran1") return [`T(t) = ${ex.Ta}+(${ex.T0}-${ex.Ta})\\cdot e^{kt}`];
  return [`t = \\dfrac{1}{k}\\ln\\!\\left(\\dfrac{T-${ex.Ta}}{${ex.T0}-${ex.Ta}}\\right)`];
}

// ============================================================================
// Famille E.
// ============================================================================

const LABEL_CONTEXTE_E: Record<ExerciceLogProbE["contexteE"], { nom: string; grandeur: string; symboleL: string }> = {
  pH: { nom: "le pH d'une solution", grandeur: "la concentration en ions H⁺ (en mol/L)", symboleL: "\\text{pH}" },
  decibels: { nom: "le niveau sonore (en décibels)", grandeur: "l'intensité sonore relative", symboleL: "L" },
  magnitude: { nom: "la magnitude de Richter d'un séisme", grandeur: "l'énergie libérée (en joules)", symboleL: "M" },
};

function consigneGeneraleE(ex: ExerciceLogProbE): string {
  const label = LABEL_CONTEXTE_E[ex.contexteE];
  return `On étudie ${label.nom}, une échelle logarithmique liée à ${label.grandeur} par L = a·log₁₀(X) + b.`;
}
function blocDonneesE(ex: ExerciceLogProbE): string[] {
  if (ex.deduireAB) return [`X_1 = 10^{${Math.log10(ex.X1).toFixed(0)}}, \\ L_1 = ${formatDecimal(ex.L1, 1)}`, `X_2 = 10^{${Math.log10(ex.X2).toFixed(0)}}, \\ L_2 = ${formatDecimal(ex.L2, 1)}`];
  return [`a = ${formatDecimal(ex.a, 3)}`, `b = ${formatDecimal(ex.b, 3)}`];
}
function etatActuelE(ex: ExerciceLogProbE, phase: "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4"): string[] | null {
  if (phase === "eEcran1") return null;
  const modele = `L = ${formatDecimal(ex.a, 3)}\\cdot \\log_{10}(X)${formatPlusB(ex.b, 3)}`;
  if (phase === "eEcran2") return [modele];
  if (phase === "eEcran3") return [modele];
  return [modele];
}
function consigneEcranE(ex: ExerciceLogProbE, phase: "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4"): string {
  if (phase === "eEcran1") return "Déduis a et b à partir des 2 points donnés (système de 2 équations).";
  if (phase === "eEcran2") {
    return ex.sensEcran2 === "versL" ? `À partir de a, b CORRECTS, calcule L pour X = 10^{${Math.log10(ex.X0).toFixed(0)}}.` : `À partir de a, b CORRECTS, calcule X pour L = ${formatDecimalTexte(ex.L0Affiche, 1)}.`;
  }
  if (phase === "eEcran3") {
    return ex.sensEcran3 === "versDeltaL"
      ? `Si X est multiplié par un facteur k=${ex.kEcran3}, de combien varie L (ΔL) ?`
      : `Si L varie de ΔL=${formatDecimalTexte(ex.deltaLDonnee, 2)}, par quel facteur k est multiplié X ?`;
  }
  return `Deux sources combinées valent L₁ = ${formatDecimalTexte(ex.L1e4, 1)} et L₂ = ${formatDecimalTexte(ex.L2e4, 1)} séparément. Quelle est la valeur d'échelle L_total de leur combinaison (PIÈGE : L₁+L₂ n'est PAS la bonne réponse) ?`;
}
function aideE1(_ex: ExerciceLogProbE, phase: "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4"): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Pose L1=a·log10(X1)+b et L2=a·log10(X2)+b, puis résous ce système de 2 équations à 2 inconnues.", latex: null };
  if (phase === "eEcran2") return { texte: "Substitue directement la valeur donnée dans le modèle L=a·log10(X)+b confirmé.", latex: null };
  if (phase === "eEcran3") return { texte: "Attention : un facteur MULTIPLICATIF sur X correspond à un écart ADDITIF sur L (ΔL=a·log10(k)) — ne confonds pas les deux opérations.", latex: null };
  return { texte: "L'échelle logarithmique n'est PAS additive — deux valeurs de L ne s'additionnent JAMAIS directement.", latex: null };
}
function aideE2(ex: ExerciceLogProbE, phase: "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4"): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Valeurs connues du contexte (à titre de vérification, non fournies telles quelles à l'élève dans un vrai exercice) :", latex: `a \\approx ${formatDecimal(ex.a, 3)}, \\quad b \\approx ${formatDecimal(ex.b, 3)}` };
  if (phase === "eEcran2")
    return {
      texte: "Substitution faite, calcul final non fait :",
      latex: ex.sensEcran2 === "versL" ? `L = ${formatDecimal(ex.a, 3)}\\cdot ${Math.log10(ex.X0).toFixed(0)}${formatPlusB(ex.b, 3)}` : `X = 10^{(${formatDecimalTexte(ex.L0Affiche, 1)}-${formatDecimal(ex.b, 2)})/${formatDecimal(ex.a, 3)}}`,
    };
  if (phase === "eEcran3") return { texte: "Formule de propriété d'échelle :", latex: "\\Delta L = a\\cdot \\log_{10}(k) \\quad \\Longleftrightarrow \\quad k = 10^{\\Delta L / a}" };
  return {
    texte: "X1 et X2 reconvertis (somme et reconversion finale non faites) :",
    latex: `X_1 \\approx ${formatScientifique(ex.X1e4)}, \\quad X_2 \\approx ${formatScientifique(ex.X2e4)}`,
  };
}
function reponseE(ex: ExerciceLogProbE, phase: "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4"): string[] {
  if (phase === "eEcran1") return [`a = ${formatDecimal(ex.a, 3)}`, `b = ${formatDecimal(ex.b, 3)}`];
  if (phase === "eEcran2") return [ex.sensEcran2 === "versL" ? `L \\approx ${formatDecimal(ex.reponseEcran2, 2)}` : `X \\approx ${formatScientifique(ex.reponseEcran2)}`];
  if (phase === "eEcran3") return [ex.sensEcran3 === "versDeltaL" ? `\\Delta L \\approx ${formatDecimal(ex.reponseEcran3, 2)}` : `k \\approx ${formatDecimal(ex.reponseEcran3, 2)}`];
  return [`L_{total} \\approx ${formatDecimal(ex.Ltotal, 2)}`];
}

// ============================================================================
// Famille F.
// ============================================================================

function contexteF(id: string) {
  return CONTEXTES_F.find((c) => c.id === id)!;
}

function consigneGeneraleF(ex: ExerciceLogProbF): string {
  return contexteF(ex.contexteId).phrase(ex.k, ex.y0);
}
function blocDonneesF(ex: ExerciceLogProbF): string[] {
  return [`k = ${ex.k}`, `r = ${formatDecimal(ex.r, 4)}`, `y(0) = ${formatDecimal(ex.y0, 1)}`];
}
function etatActuelF(ex: ExerciceLogProbF, phase: "fEcran1" | "fEcran2" | "fEcran3"): string[] | null {
  if (phase === "fEcran1") return null;
  const aLigne = `a \\approx ${formatDecimal(ex.a, 3)}`;
  if (phase === "fEcran2") return [aLigne, `y(t) = \\dfrac{${ex.k}}{1+${formatDecimal(ex.a, 3)}\\cdot e^{-${formatDecimal(ex.r, 4)}t}}`];
  return [aLigne, `t \\approx ${formatDecimal(ex.t, 2)}`];
}
function consigneEcranF(_ex: ExerciceLogProbF, phase: "fEcran1" | "fEcran2" | "fEcran3"): string {
  if (phase === "fEcran1") return "Détermine la constante a à partir de la valeur initiale donnée.";
  if (phase === "fEcran2") return "À partir du a CORRECT de l'étape précédente, détermine le temps t où la croissance est maximale (y(t)=k/2).";
  return "Que vaut la limite de y(t) quand t devient très grand ?";
}
function aideF1(_ex: ExerciceLogProbF, phase: "fEcran1" | "fEcran2" | "fEcran3"): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "Substitue t=0 dans le modèle et résous pour a.", latex: null };
  if (phase === "fEcran2") return { texte: "La croissance maximale d'une courbe logistique se situe exactement à la moitié de la capacité k.", latex: null };
  return { texte: "Quand t→+∞, le terme e^(−rt) tend vers 0.", latex: null };
}
function aideF2(ex: ExerciceLogProbF, phase: "fEcran1" | "fEcran2" | "fEcran3"): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "Équation posée, non résolue :", latex: `${formatDecimal(ex.y0, 1)} = \\dfrac{${ex.k}}{1+a}` };
  if (phase === "fEcran2") return { texte: "Équation posée, non résolue :", latex: `\\dfrac{${ex.k}}{2} = \\dfrac{${ex.k}}{1+${formatDecimal(ex.a, 3)}\\cdot e^{-${formatDecimal(ex.r, 4)}t}}` };
  return { texte: "Valeur limite :", latex: `y(t) \\to ${ex.k}` };
}
function reponseF(ex: ExerciceLogProbF, phase: "fEcran1" | "fEcran2" | "fEcran3"): string[] {
  if (phase === "fEcran1") return [formatDecimal(ex.a, 3)];
  if (phase === "fEcran2") return [formatDecimal(ex.t, 2)];
  return [String(ex.k)];
}

// ============================================================================
// Famille G.
// ============================================================================

function contexteG() {
  return CONTEXTES_G[0];
}

function consigneGeneraleG(_ex: ExerciceLogProbG): string {
  return contexteG().phrase();
}
function blocDonneesG(ex: ExerciceLogProbG): string[] {
  return [`o(x) = ${ex.A}\\cdot(e^{${ex.m}x}-1)`, `d(x) = \\dfrac{${ex.B}}{e^{${ex.m}x}+1}`];
}
function etatActuelG(ex: ExerciceLogProbG, phase: "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4"): string[] | null {
  if (phase === "gEcran1") return null;
  const ligne1 = `o(${formatDecimalTexte(ex.x0, 2)}) \\approx ${formatDecimal(ex.oX0, 0)}, \\quad d(${formatDecimalTexte(ex.x0, 2)}) \\approx ${formatDecimal(ex.dX0, 0)}`;
  if (phase === "gEcran2") return [ligne1];
  const ligne2 = `${ex.A}\\cdot u^2-${ex.A + ex.B} = 0`;
  if (phase === "gEcran3") return [ligne1, ligne2];
  return [ligne1, ligne2, `x_{équilibre} \\approx ${formatDecimal(ex.xEquilibre, 3)}`];
}
function consigneEcranG(ex: ExerciceLogProbG, phase: "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4"): string {
  if (phase === "gEcran1") return `Évalue o(${formatDecimalTexte(ex.x0, 2)}) et d(${formatDecimalTexte(ex.x0, 2)}).`;
  if (phase === "gEcran2") return "Pose le changement de variable u=e^(mx) pour l'équation d'équilibre o(x)=d(x), et réécris-la en équation polynomiale en u.";
  if (phase === "gEcran3") return "À partir de l'équation en u CORRECTE de l'étape précédente, résous-la (filtre u>0), puis reconvertis en x (le prix d'équilibre).";
  return ex.sensEcran4 === "offre" ? `Résous o(x)=${ex.cibleEcran4} (équation exponentielle simple).` : `Résous d(x)=${ex.cibleEcran4} (équation exponentielle simple).`;
}
function aideG1(_ex: ExerciceLogProbG, phase: "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4"): AideAvecLatex {
  if (phase === "gEcran1") return { texte: "Substitue directement x0 dans o(x) et dans d(x).", latex: null };
  if (phase === "gEcran2") return { texte: "Pose u=e^(mx), puis réécris chaque membre de l'équation d'équilibre en fonction de u.", latex: null };
  if (phase === "gEcran3") return { texte: "Cette équation n'a pas de terme linéaire en u — isole directement u², puis prends la racine carrée POSITIVE (u=e^(mx)>0).", latex: null };
  return { texte: "Isole e^(mx), puis passe au logarithme népérien.", latex: null };
}
function aideG2(ex: ExerciceLogProbG, phase: "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4"): AideAvecLatex {
  if (phase === "gEcran1") return { texte: "Modèles rappelés :", latex: `o(x) = ${ex.A}(e^{${ex.m}x}-1), \\quad d(x) = \\dfrac{${ex.B}}{e^{${ex.m}x}+1}` };
  if (phase === "gEcran2") return { texte: "Développement partiel (non terminé) :", latex: `${ex.A}(u-1) = \\dfrac{${ex.B}}{u+1}` };
  if (phase === "gEcran3") return { texte: "Valeur de u (reconversion en x non faite) :", latex: `u = \\sqrt{\\dfrac{${ex.A + ex.B}}{${ex.A}}} \\approx ${formatDecimal(ex.uEquilibre, 3)}` };
  return {
    texte: "Équation isolée, logarithme non appliqué :",
    latex: ex.sensEcran4 === "offre" ? `e^{${ex.m}x} = ${formatDecimal(ex.cibleEcran4 / ex.A + 1, 3)}` : `e^{${ex.m}x} = ${formatDecimal(ex.B / ex.cibleEcran4 - 1, 3)}`,
  };
}
function reponseG(ex: ExerciceLogProbG, phase: "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4"): string[] {
  if (phase === "gEcran1") return [`o(${formatDecimalTexte(ex.x0, 2)}) \\approx ${formatDecimal(ex.oX0, 0)}`, `d(${formatDecimalTexte(ex.x0, 2)}) \\approx ${formatDecimal(ex.dX0, 0)}`];
  if (phase === "gEcran2") return [`${ex.A}\\cdot u^2-${ex.A + ex.B} = 0`];
  if (phase === "gEcran3") return [`x \\approx ${formatDecimal(ex.xEquilibre, 3)}`];
  return [`x \\approx ${formatDecimal(ex.xEcran4, 3)}`];
}

// ============================================================================
// Dispatch public.
// ============================================================================

export function consigneGenerale(exercice: ExerciceLogarithmesProblemes): string {
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

export function blocDonnees(exercice: ExerciceLogarithmesProblemes): string[] {
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

export function etatActuel(exercice: ExerciceLogarithmesProblemes, phase: PhaseLogarithmesProblemes): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase as PhaseA);
    case "B":
      return etatActuelB(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return etatActuelC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return etatActuelD(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return etatActuelE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return etatActuelF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
    case "G":
      return etatActuelG(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4");
  }
}

export function consigneEcran(exercice: ExerciceLogarithmesProblemes, phase: PhaseLogarithmesProblemes): string {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase as PhaseA);
    case "B":
      return consigneEcranB(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return consigneEcranC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return consigneEcranD(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return consigneEcranE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return consigneEcranF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
    case "G":
      return consigneEcranG(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4");
  }
}

export function aideNiveau1(exercice: ExerciceLogarithmesProblemes, phase: PhaseLogarithmesProblemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA1(exercice, phase as PhaseA);
    case "B":
      return aideB1(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return aideC1(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return aideD1(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return aideE1(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return aideF1(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
    case "G":
      return aideG1(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4");
  }
}

export function aideNiveau2(exercice: ExerciceLogarithmesProblemes, phase: PhaseLogarithmesProblemes): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA2(exercice, phase as PhaseA);
    case "B":
      return aideB2(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return aideC2(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return aideD2(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return aideE2(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return aideF2(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
    case "G":
      return aideG2(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4");
  }
}

/** Réponse RÉELLEMENT attendue d'un écran donné — jamais dérivée de ce que l'élève a soumis. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceLogarithmesProblemes, phase: PhaseLogarithmesProblemes): string[] {
  switch (exercice.famille) {
    case "A":
      return reponseA(exercice, phase as PhaseA);
    case "B":
      return reponseB(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return reponseC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "D":
      return reponseD(exercice, phase as "dEcran1" | "dEcran2");
    case "E":
      return reponseE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return reponseF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
    case "G":
      return reponseG(exercice, phase as "gEcran1" | "gEcran2" | "gEcran3" | "gEcran4");
  }
}

/** Libellé court d'écran pour le récapitulatif final (`LigneRecap`). */
export const LIBELLE_PHASE: Record<PhaseLogarithmesProblemes, string> = {
  aEcran1: "Étape 1 (équation posée)",
  aEcran2: "Étape 2 (terme isolé)",
  aEcran3: "Étape 3 (résolution)",
  bEcran1: "Étape 1 (taux r)",
  bEcran2: "Étape 2 (Q0)",
  bEcran3: "Étape 3 (évaluation)",
  bEcran4: "Étape 4 (extrapolation)",
  cEcran1: "Étape 1 (demi-vie)",
  cEcran2: "Étape 2 (application)",
  cEcran3: "Étape 3 (facteur correctif)",
  dEcran1: "Étape 1 (modèle)",
  dEcran2: "Étape 2 (inversion)",
  eEcran1: "Étape 1 (a, b)",
  eEcran2: "Étape 2 (évaluation)",
  eEcran3: "Étape 3 (propriété d'échelle)",
  eEcran4: "Étape 4 (non-additivité)",
  fEcran1: "Étape 1 (constante a)",
  fEcran2: "Étape 2 (croissance maximale)",
  fEcran3: "Étape 3 (limite)",
  gEcran1: "Étape 1 (évaluations)",
  gEcran2: "Étape 2 (équation en u)",
  gEcran3: "Étape 3 (prix d'équilibre)",
  gEcran4: "Étape 4 (résolution ciblée)",
};

/**
 * Écrans RÉELLEMENT traversés pour UN exercice donné — jamais une simple table PAR FAMILLE
 * (contrairement à `PHASES_PAR_FAMILLE` de 6gen12) : la famille E a un nombre d'écrans VARIABLE
 * PAR INSTANCE (`eEcran1` absent quand `deduireAB===false`), voir `moteur6e/typesLogarithmesProblemes.ts`.
 */
export function phasesPourExercice(exercice: ExerciceLogarithmesProblemes): PhaseLogarithmesProblemes[] {
  switch (exercice.famille) {
    case "A":
      return ["aEcran1", "aEcran2", "aEcran3"];
    case "B":
      return ["bEcran1", "bEcran2", "bEcran3", "bEcran4"];
    case "C":
      return ["cEcran1", "cEcran2", "cEcran3"];
    case "D":
      return ["dEcran1", "dEcran2"];
    case "E":
      return exercice.deduireAB ? ["eEcran1", "eEcran2", "eEcran3", "eEcran4"] : ["eEcran2", "eEcran3", "eEcran4"];
    case "F":
      return ["fEcran1", "fEcran2", "fEcran3"];
    case "G":
      return ["gEcran1", "gEcran2", "gEcran3", "gEcran4"];
  }
}

/** Clé de score, dans `ResultatExerciceLogarithmesProblemes`, correspondant à chaque phase. */
const CLE_SCORE: Record<PhaseLogarithmesProblemes, string> = {
  aEcran1: "scoreEcran1",
  aEcran2: "scoreEcran2",
  aEcran3: "scoreEcran3",
  bEcran1: "scoreEcran1",
  bEcran2: "scoreEcran2",
  bEcran3: "scoreEcran3",
  bEcran4: "scoreEcran4",
  cEcran1: "scoreEcran1",
  cEcran2: "scoreEcran2",
  cEcran3: "scoreEcran3",
  dEcran1: "scoreEcran1",
  dEcran2: "scoreEcran2",
  eEcran1: "scoreEcran1",
  eEcran2: "scoreEcran2",
  eEcran3: "scoreEcran3",
  eEcran4: "scoreEcran4",
  fEcran1: "scoreEcran1",
  fEcran2: "scoreEcran2",
  fEcran3: "scoreEcran3",
  gEcran1: "scoreEcran1",
  gEcran2: "scoreEcran2",
  gEcran3: "scoreEcran3",
  gEcran4: "scoreEcran4",
};

/**
 * Total points du récapitulatif final — complément AJOUTÉ à côté de la liste `LigneRecap` colorée
 * (jamais à sa place, voir CLAUDE.md). Somme les scores DÉJÀ calculés par
 * `sessionLogarithmesProblemes.ts`, pilotée par `phasesPourExercice` (variable PAR INSTANCE pour la
 * famille E, jamais seulement par famille).
 */
export function calculerTotalPointsLogarithmesProblemes(resultat: ResultatExerciceLogarithmesProblemes): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const scores = resultat as unknown as Record<string, number | null>;
  const total = phases.reduce((s, p) => s + (scores[CLE_SCORE[p]] ?? 0), 0);
  return { total, maximum: 100 * phases.length };
}
