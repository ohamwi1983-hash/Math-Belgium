import type { ExerciceLogarithmesProblemes, ExerciceLogProbA, ExerciceLogProbB, ExerciceLogProbC, ExerciceLogProbE, ExerciceLogProbF } from "../core6e/logarithmesProblemes.types";
import {
  CONTEXTES_A_CROISSANCE,
  CONTEXTES_A_DECROISSANCE,
  CONTEXTES_A_TAUX,
  CONTEXTES_A_TAUX_DECROISSANCE,
  CONTEXTES_B,
  CONTEXTES_C,
  CONTEXTES_F,
} from "../generateurs6e/logarithmesProblemes/contextes";
import type { PhaseLogarithmesProblemes } from "../moteur6e/typesLogarithmesProblemes";

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

/** Fragment de consigne mixant prose française et LaTeX inline — jamais de phrase française
 * entière passée à KaTeX (piège documenté, "libellé français brut en mode maths"). Rendu via
 * `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
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

/** Nombre à `chiffres` chiffres significatifs, en LaTeX (notation scientifique pour les très
 * petites/grandes valeurs, virgule décimale). */
function formatSignificatif(v: number, chiffres = 3): string {
  if (v === 0) return "0";
  const exposant = Math.floor(Math.log10(Math.abs(v)));
  if (exposant < -3 || exposant > 5) {
    const mantisse = Math.round((v / Math.pow(10, exposant)) * Math.pow(10, chiffres - 1)) / Math.pow(10, chiffres - 1);
    return `${String(mantisse).replace(".", "{,}")} \\times 10^{${exposant}}`;
  }
  const decimales = Math.max(0, chiffres - 1 - exposant);
  return formatDecimal(v, decimales);
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

function consigneGeneraleA(ex: ExerciceLogProbA): FragmentConsigne[] {
  if (ex.sousType === "resoudreT") return [texte((ex.croissance ? contexteACroissance(ex.contexteId) : contexteADecroissance(ex.contexteId)).phrase(ex.Q0, ex.p))];
  if (ex.sousType === "resoudreTaux") return [texte(contexteATaux(ex.contexteId).phrase(ex.Q0, ex.n, ex.cibleAffiche))];
  return [texte(contexteATauxDecroissance(ex.contexteId).phrase(ex.Q0, Math.round((1 - ex.fraction) * 100), ex.h))];
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
  const eq1 = `${ex.Q0}\\cdot e^{-${ex.h}k} = ${formatDecimal(ex.fraction * ex.Q0, 2)}`;
  if (phase === "aEcran2") return [eq1];
  return [eq1, `e^{-${ex.h}k} = ${formatDecimal(ex.fraction, 2)}`];
}

function consigneEcranA(ex: ExerciceLogProbA, phase: PhaseA): FragmentConsigne[] {
  if (phase === "aEcran1") {
    if (ex.sousType === "resoudreT") return [texte("Pose l'équation ou l'inéquation qui traduit cette situation.")];
    if (ex.sousType === "resoudreTaux") return [texte("Pose l'équation qui traduit cette situation (l'inconnue est le taux i).")];
    return [texte("Pose l'équation qui traduit cette situation (l'inconnue est le taux k).")];
  }
  if (phase === "aEcran2") {
    if (ex.sousType === "resoudreT") return [texte("En partant de l'équation de l'étape précédente, isole le terme exponentiel.")];
    return [texte("En partant de l'équation de l'étape précédente, isole le terme élevé à une puissance.")];
  }
  if (ex.sousType === "resoudreT") {
    return ex.variante === "simple"
      ? [texte("Résous : donne le nombre ENTIER de périodes à partir duquel ce seuil est atteint (arrondi au-dessus, on ne peut pas compter une période partielle).")]
      : [texte("Résous les 2 seuils : donne, pour chacun, le nombre ENTIER de périodes à partir duquel il est atteint (arrondi au-dessus).")];
  }
  if (ex.sousType === "resoudreTaux") return [texte("Résous pour i en partant de l'équation de l'étape précédente (l'inconnue est dans la base : racine n-ième). Donne i en décimal arrondi au dix-millième (ex. 0,0451) ou en pourcentage (4,51 %).")];
  return [texte("Résous pour k en partant de l'équation de l'étape précédente (logarithme népérien). Donne k arrondi au dix-millième.")];
}

function aideA1(ex: ExerciceLogProbA, phase: PhaseA): AideAvecLatex {
  if (phase === "aEcran1") {
    if (ex.sousType === "resoudreT") return { texte: `Rappel : ${ex.croissance ? "une hausse" : "une baisse"} de p % correspond au facteur multiplicatif :`, latex: ex.croissance ? "r=1+\\dfrac{p}{100}" : "r=1-\\dfrac{p}{100}" };
    if (ex.sousType === "resoudreTaux") return { texte: "Modèle des intérêts composés — ici, contrairement à un taux fixe, c'est le TAUX i qui est l'inconnue :", latex: "Q_0\\cdot(1+i)^{n}=\\text{cible}" };
    return { texte: "Modèle de décroissance continue, avec h la durée écoulée — l'inconnue est le taux de décroissance k :", latex: "Q_0\\cdot e^{-k\\,h}=\\text{fraction}\\cdot Q_0" };
  }
  if (phase === "aEcran2") {
    if (ex.sousType === "resoudreT") return { texte: "Divise les deux membres par Q0 pour isoler le terme en r.", latex: null };
    if (ex.sousType === "resoudreTaux") return { texte: "Divise les deux membres par Q₀ pour isoler la puissance :", latex: "(1+i)^{n}" };
    return { texte: "Divise les deux membres par Q0 pour isoler l'exponentielle.", latex: null };
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
    return { texte: "Valeurs à substituer :", latex: `Q_0 = ${ex.Q0},\\quad h = ${ex.h},\\quad \\text{fraction} = ${formatDecimal(ex.fraction, 2)}` };
  }
  if (phase === "aEcran2") {
    if (ex.sousType === "resoudreT") return { texte: "Équation prête pour le logarithme :", latex: equationA1(ex) };
    if (ex.sousType === "resoudreTaux") return { texte: "Équation prête pour la racine n-ième :", latex: `${ex.Q0}\\cdot(1+i)^{${ex.n}} = ${ex.cibleAffiche}` };
    return { texte: "Équation prête pour le logarithme :", latex: `${ex.Q0}\\cdot e^{-${ex.h}k} = ${formatDecimal(ex.fraction * ex.Q0, 2)}` };
  }
  if (ex.sousType === "resoudreT") return { texte: "Terme isolé, logarithme non appliqué :", latex: equationA2(ex) };
  if (ex.sousType === "resoudreTaux") return { texte: "Équation racine n-ième affichée, non résolue :", latex: `1+i = \\sqrt[${ex.n}]{${formatDecimal(ex.cibleAffiche / ex.Q0, 4)}}` };
  return { texte: "Terme isolé, logarithme non appliqué :", latex: `e^{-${ex.h}k} = ${formatDecimal(ex.fraction, 2)}` };
}

function reponseA(ex: ExerciceLogProbA, phase: PhaseA): string[] {
  if (phase === "aEcran1") {
    if (ex.sousType === "resoudreT") return [equationA1(ex)];
    if (ex.sousType === "resoudreTaux") return [`${ex.Q0}\\cdot(1+i)^{${ex.n}} = ${ex.cibleAffiche}`];
    return [`${ex.Q0}\\cdot e^{-${ex.h}k} = ${formatDecimal(ex.fraction * ex.Q0, 2)}`];
  }
  if (phase === "aEcran2") {
    if (ex.sousType === "resoudreT") return [equationA2(ex)];
    if (ex.sousType === "resoudreTaux") return [`(1+i)^{${ex.n}} = ${formatDecimal(ex.cibleAffiche / ex.Q0, 4)}`];
    return [`e^{-${ex.h}k} = ${formatDecimal(ex.fraction, 2)}`];
  }
  if (ex.sousType === "resoudreT") return ex.variante === "simple" ? [`t = ${ex.t1Reponse}`] : [`t_1 = ${ex.t1Reponse}`, `t_2 = ${ex.t2Reponse}`];
  if (ex.sousType === "resoudreTaux") return [`i \\approx ${formatDecimal(ex.i, 4)} \\quad (\\approx ${formatDecimal(100 * ex.i, 2)}\\,\\%)`];
  return [`k \\approx ${formatDecimal(ex.k, 4)}`];
}

// ============================================================================
// Famille B.
// ============================================================================

function contexteB(id: string) {
  return CONTEXTES_B.find((c) => c.id === id)!;
}

function consigneGeneraleB(ex: ExerciceLogProbB): FragmentConsigne[] {
  return [texte(contexteB(ex.contexteId).phrase(ex.t1, ex.v1, ex.t2, ex.v2Affiche))];
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
function consigneEcranB(ex: ExerciceLogProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): FragmentConsigne[] {
  switch (phase) {
    case "bEcran1":
      return [texte("Déduis le taux multiplicateur r entre les deux instants connus.")];
    case "bEcran2":
      return [texte("À partir du taux r de l'étape précédente, détermine Q0 (la valeur qui correspondrait à "), latex("t=0"), texte(").")];
    case "bEcran3":
      return [texte("À partir du modèle obtenu, calcule la valeur au temps "), latex(`t=${ex.tRef}`), texte(".")];
    case "bEcran4":
      return [
        texte(`À partir de la valeur de l'étape précédente, détermine l'instant t (compté depuis t = 0, comme t₁ et t₂) auquel ${contexteB(ex.contexteId).multiple(ex.k)} par rapport à sa valeur en `),
        latex(`t=${ex.tRef}`),
        texte("."),
      ];
  }
}
function aideB1(ex: ExerciceLogProbB, phase: "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4"): AideAvecLatex {
  switch (phase) {
    case "bEcran1":
      return { texte: "Rappel :", latex: "v_2 = v_1\\cdot r^{\\Delta t} \\ \\Longrightarrow\\ r = \\left(\\dfrac{v_2}{v_1}\\right)^{\\frac{1}{\\Delta t}}" };
    case "bEcran2":
      return { texte: "Un point connu et r suffisent à reconstituer Q0.", latex: null };
    case "bEcran3":
      return { texte: "Substitue directement t dans le modèle obtenu :", latex: "Q(t)=Q_0\\cdot r^{t}" };
    case "bEcran4":
      return { texte: "Pose l'équation ci-dessous, isole la puissance de r, PUIS prends le logarithme :", latex: `Q_0\\cdot r^{t}=${ex.k}\\cdot Q(${ex.tRef})` };
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

const UNITE_SINGULIER: Record<string, string> = { ans: "an", jours: "jour", heures: "heure" };

function consigneGeneraleC(ex: ExerciceLogProbC): FragmentConsigne[] {
  const ctx = contexteC(ex.contexteId);
  if (ex.sens === "versT") {
    return [texte(`${ctx.phraseIntro()} Sa constante de désintégration vaut `), latex(`\\lambda \\approx ${formatSignificatif(ex.lambda)}`), texte(` par ${UNITE_SINGULIER[ex.unite] ?? ex.unite}.`)];
  }
  return [texte(`${ctx.phraseIntro()} Sa demi-vie vaut `), latex(`T = ${formatDecimal(ex.T, 2)}`), texte(` ${ex.unite}.`)];
}
function blocDonneesC(ex: ExerciceLogProbC): string[] {
  return ex.sens === "versT" ? [`\\lambda \\approx ${formatSignificatif(ex.lambda)}`] : [`T = ${formatDecimal(ex.T, 2)}`];
}
function etatActuelC(ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string[] | null {
  if (phase === "cEcran1") return null;
  if (phase === "cEcran2") return [`T \\approx ${formatDecimal(ex.T, 2)}`];
  return null;
}
function consigneEcranC(ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte(ex.sens === "versT" ? `Déduis la demi-vie T (en ${ex.unite}) depuis λ.` : `Déduis la constante de désintégration λ (par ${UNITE_SINGULIER[ex.unite] ?? ex.unite}) depuis T.`)];
  if (phase === "cEcran2") {
    const depart = ex.sens === "versT" ? "À partir de la demi-vie T trouvée à l'étape précédente" : "À partir de la demi-vie T donnée";
    return [texte(`${depart}, détermine le temps t (en ${ex.unite}) nécessaire pour qu'il ne reste plus que ${formatDecimalTexte(ex.fractionEcran2 * 100, 1)} % de la quantité initiale.`)];
  }
  return [
    texte("Une ancienne estimation de la demi-vie valait "),
    latex(`T_1 = ${formatDecimal(ex.T1, 2)}`),
    texte(` ${ex.unite} ; la valeur admise aujourd'hui est `),
    latex(`T_2 = ${formatDecimal(ex.T2, 2)}`),
    texte(` ${ex.unite}. Par quel facteur faut-il multiplier une durée calculée avec l'ancienne estimation ? (arrondi au millième)`),
  ];
}
function aideC1(_ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Rappel — au bout d'une demi-vie T, il reste la moitié de la quantité initiale :", latex: "T = \\dfrac{\\ln 2}{\\lambda} \\quad \\Longleftrightarrow \\quad \\lambda = \\dfrac{\\ln 2}{T}" };
  if (phase === "cEcran2") return { texte: "Les deux écritures du modèle sont équivalentes ; la première est plus pratique ici : elle évite de calculer λ :", latex: "N(t)=N_0\\cdot\\left(\\dfrac{1}{2}\\right)^{t/T}=N_0\\cdot e^{-\\lambda t}" };
  return { texte: "Tous les âges publiés sont proportionnels à la demi-vie utilisée pour les calculer.", latex: null };
}
function aideC2(ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): AideAvecLatex {
  if (phase === "cEcran1") return { texte: "Valeur numérique de ln(2) :", latex: "\\ln 2 \\approx 0{,}693" };
  if (phase === "cEcran2") return { texte: "Équation posée, non résolue :", latex: `${formatDecimal(ex.fractionEcran2, 3)} = \\left(\\dfrac{1}{2}\\right)^{t/${formatDecimal(ex.T, 2)}}` };
  return { texte: "Le facteur correctif est le rapport de la valeur admise aujourd'hui à l'ancienne estimation.", latex: null };
}
function reponseC(ex: ExerciceLogProbC, phase: "cEcran1" | "cEcran2" | "cEcran3"): string[] {
  if (phase === "cEcran1") return [ex.sens === "versT" ? `T \\approx ${formatDecimal(ex.T, 2)}` : `\\lambda \\approx ${formatSignificatif(ex.lambda)}`];
  if (phase === "cEcran2") return [formatDecimal(ex.tEcran2, 2)];
  return [formatDecimal(ex.facteurCorrectif, 3)];
}

// ============================================================================
// Famille E.
// ============================================================================

const LABEL_CONTEXTE_E: Record<ExerciceLogProbE["contexteE"], { nom: string; grandeur: string; symboleL: string }> = {
  pH: { nom: "le pH d'une solution", grandeur: "la concentration en ions H⁺ (en mol/L)", symboleL: "\\text{pH}" },
  decibels: { nom: "le niveau sonore (en décibels)", grandeur: "l'intensité sonore relative", symboleL: "L" },
  magnitude: { nom: "la magnitude de Richter d'un séisme", grandeur: "l'énergie libérée (en joules)", symboleL: "M" },
};

function consigneGeneraleE(ex: ExerciceLogProbE): FragmentConsigne[] {
  const label = LABEL_CONTEXTE_E[ex.contexteE];
  return [texte(`On étudie ${label.nom}, une échelle logarithmique liée à ${label.grandeur} par `), latex("L = a\\cdot\\log_{10}(X) + b"), texte(".")];
}
function blocDonneesE(ex: ExerciceLogProbE): string[] {
  if (ex.deduireAB) return [`X_1 = 10^{${Math.round(Math.log10(ex.X1))}}, \\ L_1 = ${formatDecimal(ex.L1, 1)}`, `X_2 = 10^{${Math.round(Math.log10(ex.X2))}}, \\ L_2 = ${formatDecimal(ex.L2, 1)}`];
  return [`a = ${formatDecimal(ex.a, 3)}`, `b = ${formatDecimal(ex.b, 3)}`];
}
function etatActuelE(ex: ExerciceLogProbE, phase: "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4"): string[] | null {
  if (phase === "eEcran1") return null;
  const modele = `L = ${formatDecimal(ex.a, 3)}\\cdot \\log_{10}(X)${formatPlusB(ex.b, 3)}`;
  if (phase === "eEcran2") return [modele];
  if (phase === "eEcran3") return [modele];
  return [modele];
}
function consigneEcranE(ex: ExerciceLogProbE, phase: "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4"): FragmentConsigne[] {
  if (phase === "eEcran1") return [texte("Déduis a et b à partir des 2 points donnés (système de 2 équations).")];
  if (phase === "eEcran2") {
    if (ex.sensEcran2 === "versL") {
      return [texte("À partir de a et b, calcule L pour "), latex(`X = 10^{${Math.round(Math.log10(ex.X0))}}`), texte(" (arrondi au centième).")];
    }
    return [texte("À partir de a et b, calcule X pour "), latex(`L = ${formatDecimal(ex.L0Affiche, 1)}`), texte(" (en notation scientifique si besoin, par exemple 3,2e-4 pour 3,2·10⁻⁴).")];
  }
  if (phase === "eEcran3") {
    if (ex.sensEcran3 === "versDeltaL") {
      return [texte("Si X est multiplié par un facteur "), latex(`k=${ex.kEcran3}`), texte(", de combien varie L ("), latex("\\Delta L"), texte(") ?")];
    }
    return [texte("Si L varie de "), latex(`\\Delta L=${formatDecimal(ex.deltaLDonnee, 2)}`), texte(", par quel facteur k est multiplié X ?")];
  }
  return [
    texte("Deux sources sonores émettent séparément des niveaux "),
    latex(`L_1 = ${formatDecimal(ex.L1e4, 1)}`),
    texte(" dB et "),
    latex(`L_2 = ${formatDecimal(ex.L2e4, 1)}`),
    texte(" dB. Leurs intensités s'additionnent : quel est le niveau sonore "),
    latex("L_{total}"),
    texte(" des deux sources ensemble (arrondi au dixième) ?"),
  ];
}
function aideE1(_ex: ExerciceLogProbE, phase: "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4"): AideAvecLatex {
  if (phase === "eEcran1") return { texte: "Écris le modèle pour chacun des deux points, puis résous ce système de 2 équations à 2 inconnues :", latex: "L_1=a\\cdot\\log_{10}(X_1)+b\\qquad L_2=a\\cdot\\log_{10}(X_2)+b" };
  if (phase === "eEcran2") return { texte: "Substitue directement la valeur donnée dans le modèle :", latex: "L=a\\cdot\\log_{10}(X)+b" };
  if (phase === "eEcran3") return { texte: "Attention : un facteur MULTIPLICATIF sur X correspond à un écart ADDITIF sur L — ne confonds pas les deux opérations :", latex: "\\Delta L=a\\cdot\\log_{10}(k)" };
  return { texte: "Ce sont les intensités X qui s'additionnent, pas les niveaux L : reconvertis chaque niveau en intensité, additionne, puis repasse à l'échelle logarithmique.", latex: "X = 10^{(L-b)/a}" };
}
function aideE2(ex: ExerciceLogProbE, phase: "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4"): AideAvecLatex {
  if (phase === "eEcran1")
    return {
      texte: "Système posé (il reste à le résoudre — soustrais les deux équations pour éliminer b) :",
      latex: `\\begin{cases} ${formatDecimal(ex.L1, 1)} = a\\cdot ${Math.round(Math.log10(ex.X1))} + b \\\\ ${formatDecimal(ex.L2, 1)} = a\\cdot ${Math.round(Math.log10(ex.X2))} + b \\end{cases}`,
    };
  if (phase === "eEcran2")
    return {
      texte: "Substitution faite, calcul final non fait :",
      latex: ex.sensEcran2 === "versL" ? `L = ${formatDecimal(ex.a, 3)}\\cdot ${Math.round(Math.log10(ex.X0))}${formatPlusB(ex.b, 3)}` : `X = 10^{(${formatDecimalTexte(ex.L0Affiche, 1)}-${formatDecimal(ex.b, 2)})/${formatDecimal(ex.a, 3)}}`,
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

function consigneGeneraleF(ex: ExerciceLogProbF): FragmentConsigne[] {
  return [texte(contexteF(ex.contexteId).phrase(ex.k, ex.y0))];
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
function consigneEcranF(_ex: ExerciceLogProbF, phase: "fEcran1" | "fEcran2" | "fEcran3"): FragmentConsigne[] {
  if (phase === "fEcran1") return [texte("Détermine la constante a à partir de la valeur initiale donnée.")];
  if (phase === "fEcran2") {
    return [texte("À partir de a (étape précédente), détermine le temps t où la croissance est maximale ("), latex("y(t)=k/2"), texte(").")];
  }
  return [texte("Que vaut la limite de "), latex("y(t)"), texte(" quand t devient très grand ?")];
}
function aideF1(_ex: ExerciceLogProbF, phase: "fEcran1" | "fEcran2" | "fEcran3"): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "Substitue t=0 dans le modèle et résous pour a.", latex: null };
  if (phase === "fEcran2") return { texte: "La croissance maximale d'une courbe logistique se situe exactement à la moitié de la capacité k.", latex: null };
  return { texte: "Quand t tend vers +∞, le terme exponentiel tend vers 0 :", latex: "t\\to+\\infty \\Rightarrow e^{-rt}\\to 0" };
}
function aideF2(ex: ExerciceLogProbF, phase: "fEcran1" | "fEcran2" | "fEcran3"): AideAvecLatex {
  if (phase === "fEcran1") return { texte: "Équation posée, non résolue :", latex: `${formatDecimal(ex.y0, 1)} = \\dfrac{${ex.k}}{1+a}` };
  if (phase === "fEcran2") return { texte: "Équation posée, non résolue :", latex: `\\dfrac{${ex.k}}{2} = \\dfrac{${ex.k}}{1+${formatDecimal(ex.a, 3)}\\cdot e^{-${formatDecimal(ex.r, 4)}t}}` };
  return { texte: "Remplace le terme exponentiel par sa limite dans l'expression de y(t) :", latex: `y(t) = \\dfrac{${ex.k}}{1+${formatDecimal(ex.a, 3)}\\cdot e^{-${formatDecimal(ex.r, 4)}t}}` };
}
function reponseF(ex: ExerciceLogProbF, phase: "fEcran1" | "fEcran2" | "fEcran3"): string[] {
  if (phase === "fEcran1") return [formatDecimal(ex.a, 3)];
  if (phase === "fEcran2") return [formatDecimal(ex.t, 2)];
  return [String(ex.k)];
}

// ============================================================================
// Dispatch public.
// ============================================================================

export function consigneGenerale(exercice: ExerciceLogarithmesProblemes): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB(exercice);
    case "C":
      return consigneGeneraleC(exercice);
    case "E":
      return consigneGeneraleE(exercice);
    case "F":
      return consigneGeneraleF(exercice);
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
    case "E":
      return blocDonneesE(exercice);
    case "F":
      return blocDonneesF(exercice);
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
    case "E":
      return etatActuelE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return etatActuelF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
  }
}

export function consigneEcran(exercice: ExerciceLogarithmesProblemes, phase: PhaseLogarithmesProblemes): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(exercice, phase as PhaseA);
    case "B":
      return consigneEcranB(exercice, phase as "bEcran1" | "bEcran2" | "bEcran3" | "bEcran4");
    case "C":
      return consigneEcranC(exercice, phase as "cEcran1" | "cEcran2" | "cEcran3");
    case "E":
      return consigneEcranE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return consigneEcranF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
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
    case "E":
      return aideE1(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return aideF1(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
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
    case "E":
      return aideE2(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return aideF2(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
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
    case "E":
      return reponseE(exercice, phase as "eEcran1" | "eEcran2" | "eEcran3" | "eEcran4");
    case "F":
      return reponseF(exercice, phase as "fEcran1" | "fEcran2" | "fEcran3");
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
  eEcran1: "Étape 1 (a, b)",
  eEcran2: "Étape 2 (évaluation)",
  eEcran3: "Étape 3 (propriété d'échelle)",
  eEcran4: "Étape 4 (non-additivité)",
  fEcran1: "Étape 1 (constante a)",
  fEcran2: "Étape 2 (croissance maximale)",
  fEcran3: "Étape 3 (limite)",
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
    case "E":
      return [...(exercice.deduireAB ? (["eEcran1"] as const) : []), "eEcran2", "eEcran3", ...(exercice.avecEcran4 ? (["eEcran4"] as const) : [])];
    case "F":
      return ["fEcran1", "fEcran2", "fEcran3"];
  }
}

