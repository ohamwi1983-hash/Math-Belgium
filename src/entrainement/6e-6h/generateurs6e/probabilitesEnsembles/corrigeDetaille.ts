import type { EvenementTableauA, ExerciceFamilleA, ExerciceFamilleB, ExerciceProbabilitesEnsembles } from "../../core6e/probabilitesEnsembles.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { phasesPourExercice } from "../../moteur6e/typesProbabilitesEnsembles";
import type { PhaseProbabilitesEnsembles } from "../../moteur6e/typesProbabilitesEnsembles";
import { comparaisonConditionnellesA, effectifEvenementA, effectifIntersectionA, independantsB, relationPaireEcran3 } from "../../moteur6e/verificationProbabilitesEnsembles";
import { formatReponseAttenduePhaseLatex, libelleChoixCorrect } from "../../ui6e/formatProbabilitesEnsembles";
import {
  COURS_ENSEMBLES,
  brute,
  calcul,
  finaliser,
  frac,
  latex,
  ligne,
  lignesFraction,
  lignesSimplifier,
  listeEt,
  piege,
  resultat,
  tableauDoubleHtml,
  texte,
  utiliseCours,
  valeur,
  vennDeuxHtml,
  verification,
} from "../../ui6e/corrigeProbabilites";

/**
 * Corrigé détaillé « comme au tableau » de `6gen30` (Probabilités et ensembles) — partagé par
 * l'adaptateur papier (`exportEvaluation.ts`) et le générateur interactif (`App6gen30.tsx`, étape
 * révélée). Une lettre `sousQuestion` par écran (ordre de `phasesPourExercice`). Valeurs tirées des
 * effectifs entiers de l'instance ; résultats = réponses de l'écran (`formatReponseAttenduePhaseLatex`).
 */

type Ex = ExerciceProbabilitesEnsembles;
type Fragments = FragmentConsigne[];

const LETTRES = "abcdefghij";

export function lettreEcranProbabilitesEnsembles(e: Ex, phase: PhaseProbabilitesEnsembles): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

export const LATEX_EVENEMENT_A: Record<EvenementTableauA, string> = {
  A: "A",
  Abar: "\\overline{A}",
  B: "B",
  Bbar: "\\overline{B}",
  AetB: "A\\cap B",
  AetBbar: "A\\cap\\overline{B}",
  AbaretB: "\\overline{A}\\cap B",
  AbaretBbar: "\\overline{A}\\cap\\overline{B}",
};

export function latexIntersectionA(x: EvenementTableauA, y: EvenementTableauA): string {
  const p = (ev: EvenementTableauA) => (ev.length > 4 ? `(${LATEX_EVENEMENT_A[ev]})` : LATEX_EVENEMENT_A[ev]);
  return `${p(x)}\\cap ${p(y)}`;
}

/** Effectifs des quatre cases du tableau (famille A). */
export function casesA(e: ExerciceFamilleA) {
  return { AB: e.nAetB, ABb: e.nA - e.nAetB, AbB: e.nB - e.nAetB, AbBb: e.denominateur - e.nA - e.nB + e.nAetB, AouB: e.nA + e.nB - e.nAetB };
}

/** Réponse de l'écran, en formules (« a, b et c »). */
function reponseEcran(e: Ex, phase: PhaseProbabilitesEnsembles): Fragments {
  return listeEt(formatReponseAttenduePhaseLatex(e, phase));
}

// ============================================================================
// Figures
// ============================================================================

const ENTETES_LIGNES = ["A", "\\overline{A}", "\\text{Total}"];
const ENTETES_COLONNES = ["B", "\\overline{B}", "\\text{Total}"];

/** Tableau de l'ÉNONCÉ : P(A), P(B), le total 1 et la case donnée ; le reste « ? ». */
export function tableauEnonceA(e: ExerciceFamilleA): string {
  const N = e.denominateur;
  const c = casesA(e);
  const AB = e.troisiemeDonnee === "PAetB" ? frac(c.AB, N) : null;
  const AbBb = e.troisiemeDonnee === "PniAniB" ? frac(c.AbBb, N) : null;
  return tableauDoubleHtml(ENTETES_LIGNES, ENTETES_COLONNES, [
    [AB, null, frac(e.nA, N)],
    [null, AbBb, null],
    [frac(e.nB, N), null, "1"],
  ]);
}

export function tableauCompletA(e: ExerciceFamilleA): string {
  const N = e.denominateur;
  const c = casesA(e);
  return tableauDoubleHtml(ENTETES_LIGNES, ENTETES_COLONNES, [
    [frac(c.AB, N), frac(c.ABb, N), frac(e.nA, N)],
    [frac(c.AbB, N), frac(c.AbBb, N), frac(N - e.nA, N)],
    [frac(e.nB, N), frac(N - e.nB, N), "1"],
  ]);
}

function vennA(e: ExerciceFamilleA): string {
  const N = e.denominateur;
  const c = casesA(e);
  return vennDeuxHtml({ aSeul: frac(c.ABb, N), ab: frac(c.AB, N), bSeul: frac(c.AbB, N), dehors: frac(c.AbBb, N) }, "Diagramme de Venn des probabilités");
}

function vennB(e: ExerciceFamilleB): string {
  const ab = e.countAetB;
  return vennDeuxHtml(
    { aSeul: String(e.eventA.count - ab), ab: String(ab), bSeul: String(e.eventB.count - ab), dehors: String(e.denominateur - e.eventA.count - e.eventB.count + ab) },
    "Diagramme de Venn des effectifs",
  );
}

// ============================================================================
// Briques de calcul
// ============================================================================

/** « P(X) = P(Y) ∓ P(Z) » remplie sur le dénominateur commun N, puis simplifiée. */
function lignesDifference(gauche: string, formule: string, a: number, b: number, N: number, justification: string, signe: "-" | "+" = "-"): LigneCalcul[] {
  const r = signe === "-" ? a - b : a + b;
  return [ligne(`${gauche}=${formule}`, justification), ligne(`=${brute(a, N)}${signe}${brute(b, N)}`, "valeurs sur le dénominateur commun"), ...lignesFraction("", r, N).map((l, i) => (i === 0 ? { ...l, justification: undefined } : l))];
}

/** Quotient de deux probabilités de même dénominateur N : « P(X|Y) = P(X∩Y)/P(Y) », remplie, N
 * simplifié, puis la fraction des effectifs. */
function lignesConditionnelle(gauche: string, formule: string, num: number, den: number, N: number): LigneCalcul[] {
  return [
    ligne(`${gauche}=${formule}`, "définition"),
    ligne(`=${brute(num, N)}\\div ${brute(den, N)}`, "valeurs du tableau"),
    ...lignesFraction("", num, den, `on simplifie par ${N}`),
  ];
}

/** Comparaison exacte P(X∩Y) / P(X)·P(Y), sur le dénominateur N². */
function lignesTestProduit(X: string, Y: string, inter: string, nX: number, nY: number, nXY: number, N: number): LigneCalcul[] {
  const N2 = N * N;
  return [
    ligne(`P(${X})\\cdot P(${Y})=${brute(nX, N)}\\cdot ${brute(nY, N)}`, "probabilités lues"),
    ligne(`=${brute(nX * nY, N2)}`, "produit des fractions"),
    nXY === 0 ? ligne(`P(${inter})=0`, "intersection vide") : ligne(`P(${inter})=${brute(nXY, N)}`, "issues communes"),
    ...(nXY === 0 ? [] : [ligne(`=${brute(nXY * N, N2)}`, `même dénominateur ${N2}`)]),
  ];
}

/** Comparaison finale, en nombres : P(X∩Y) (sur N²) face à P(X)·P(Y). */
function ligneComparaison(nX: number, nY: number, nXY: number, N: number, x = "X", y = "Y"): LigneCalcul {
  const N2 = N * N;
  if (nXY === 0) return ligne(`0\\neq ${brute(nX * nY, N2)}`, [texte("donc "), latex(`P(${x}\\cap ${y})\\neq P(${x})\\cdot P(${y})`)]);
  const egal = nXY * N === nX * nY;
  return ligne(`${brute(nXY * N, N2)}${egal ? "=" : "\\neq "}${brute(nX * nY, N2)}`, egal ? [texte("donc "), latex(`P(${x}\\cap ${y})=P(${x})\\cdot P(${y})`)] : [texte("donc "), latex(`P(${x}\\cap ${y})\\neq P(${x})\\cdot P(${y})`)]);
}

// ============================================================================
// Famille A
// ============================================================================

function etapeA1(e: ExerciceFamilleA): EtapeCorrection[] {
  const L = lettreEcranProbabilitesEnsembles(e, "aEcran1");
  const N = e.denominateur;
  const c = casesA(e);
  const fA = frac(e.nA, N);
  const fB = frac(e.nB, N);
  const lignes: LigneCalcul[] = [];
  if (e.troisiemeDonnee === "PAetB") {
    lignes.push(
      ligne(`P(A\\cup B)=P(A)+P(B)-P(A\\cap B)`, "inclusion-exclusion"),
      ligne(`=${fA}+${fB}-${frac(c.AB, N)}`, "données"),
      ligne(`=${brute(e.nA, N)}+${brute(e.nB, N)}-${brute(c.AB, N)}`, `dénominateur commun ${N}`),
      ligne(`=${brute(c.AouB, N)}`),
      ...lignesSimplifier(c.AouB, N),
    );
  } else {
    if (e.troisiemeDonnee === "PniAniB") {
      lignes.push(
        ligne(`P(A\\cup B)=1-P(\\overline{A}\\cap\\overline{B})`, "« ni A ni B » est le contraire de « A ou B »"),
        ligne(`=1-${frac(c.AbBb, N)}`, "donnée"),
        ligne(`=${brute(c.AouB, N)}`, [texte("car "), latex(`1=${brute(N, N)}`)]),
        ...lignesSimplifier(c.AouB, N).filter((l) => !l.latex.includes("{,}")),
      );
    }
    lignes.push(
      ligne(`P(A\\cap B)=P(A)+P(B)-P(A\\cup B)`, "inclusion-exclusion, résolue en P(A∩B)"),
      ligne(`=${fA}+${fB}-${frac(c.AouB, N)}`, e.troisiemeDonnee === "PAouB" ? "données" : "valeur trouvée"),
      ligne(`=${brute(e.nA, N)}+${brute(e.nB, N)}-${brute(c.AouB, N)}`, `dénominateur commun ${N}`),
      ligne(`=${brute(c.AB, N)}`),
      ...lignesSimplifier(c.AB, N),
    );
  }
  const cases: LigneCalcul[] = [
    ...lignesDifference("P(A\\cap\\overline{B})", "P(A)-P(A\\cap B)", e.nA, c.AB, N, "ligne A du tableau"),
    ...lignesDifference("P(\\overline{A}\\cap B)", "P(B)-P(A\\cap B)", e.nB, c.AB, N, "colonne B du tableau"),
  ];
  if (e.troisiemeDonnee !== "PniAniB") cases.push(...lignesDifference("P(\\overline{A}\\cap\\overline{B})", "1-P(A\\cup B)", N, c.AouB, N, "contraire de « A ou B »"));
  const donnee = e.troisiemeDonnee === "PAetB" ? "A\\cap B" : e.troisiemeDonnee === "PniAniB" ? "\\overline{A}\\cap\\overline{B}" : null;
  return [
    utiliseCours(
      L,
      [texte("Relation d'inclusion-exclusion "), latex("P(A\\cup B)=P(A)+P(B)-P(A\\cap B)"), texte(" ; dans le tableau, les deux cases d'une ligne (ou d'une colonne) ont pour somme le total de cette ligne (ou colonne), et les quatre cases ont pour somme 1")],
      COURS_ENSEMBLES,
    ),
    calcul(L, lignes),
    calcul(L, cases, [texte("Les cases du tableau"), ...(donnee ? [texte(" (la case "), latex(donnee), texte(" est donnée)")] : []), texte(" :")], "Tableau"),
    resultat(L, reponseEcran(e, "aEcran1")),
    { ...resultat(L, [texte("Le tableau complet :")], "Tableau complet"), figureHtml: tableauCompletA(e) },
    {
      ...verification(L, [texte("Les quatre cases (diagramme de Venn) ont pour somme 1 :")], [ligne(`${brute(c.AB, N)}+${brute(c.ABb, N)}+${brute(c.AbB, N)}+${brute(c.AbBb, N)}=${brute(N, N)}`), ligne("=1")]),
      figureHtml: vennA(e),
    },
    piege(L, [latex("P(A\\cup B)=P(A)+P(B)"), texte(" est faux : la case "), latex("A\\cap B"), texte(" serait comptée deux fois.")]),
  ];
}

function etapeA2(e: ExerciceFamilleA): EtapeCorrection[] {
  const L = lettreEcranProbabilitesEnsembles(e, "aEcran2");
  const N = e.denominateur;
  const c = casesA(e);
  const res = resultat(L, reponseEcran(e, "aEcran2"));
  switch (e.demandeEcran2) {
    case "AetBbar":
      return [
        utiliseCours(L, [texte("Lecture du tableau : la probabilité d'une intersection est la case au croisement de sa ligne et de sa colonne (ici ligne "), latex("A"), texte(", colonne "), latex("\\overline{B}"), texte(")")], COURS_ENSEMBLES),
        calcul(L, lignesFraction("P(A\\cap\\overline{B})", c.ABb, N, "case lue (étape 1)")),
        res,
        piege(L, [texte("Prendre la case "), latex("A\\cap B"), texte(" : la barre sur "), latex("B"), texte(" désigne la colonne « non B ».")]),
      ];
    case "AbaretB":
      return [
        utiliseCours(L, [texte("Lecture du tableau : la probabilité d'une intersection est la case au croisement de sa ligne et de sa colonne (ici ligne "), latex("\\overline{A}"), texte(", colonne "), latex("B"), texte(")")], COURS_ENSEMBLES),
        calcul(L, lignesFraction("P(\\overline{A}\\cap B)", c.AbB, N, "case lue (étape 1)")),
        res,
        piege(L, [texte("Prendre la case "), latex("A\\cap B"), texte(" : la barre sur "), latex("A"), texte(" désigne la ligne « non A ».")]),
      ];
    case "condAsachantB":
      return [
        utiliseCours(L, [texte("Probabilité conditionnelle "), latex("P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}"), texte(" : on ne choisit que dans la colonne "), latex("B"), texte(" (case "), latex("A\\cap B"), texte(" divisée par le total de la colonne)")], COURS_ENSEMBLES),
        calcul(L, lignesConditionnelle("P(A|B)", "\\dfrac{P(A\\cap B)}{P(B)}", c.AB, e.nB, N)),
        res,
        piege(L, [texte("Diviser par 1 (prendre "), latex("P(A\\cap B)"), texte(") ou par "), latex("P(A)"), texte(" : la condition, écrite après la barre, est "), latex("B"), texte(".")]),
      ];
    case "condBsachantA":
      return [
        utiliseCours(L, [texte("Probabilité conditionnelle "), latex("P(B|A)=\\dfrac{P(A\\cap B)}{P(A)}"), texte(" : on ne choisit que dans la ligne "), latex("A"), texte(" (case "), latex("A\\cap B"), texte(" divisée par le total de la ligne)")], COURS_ENSEMBLES),
        calcul(L, lignesConditionnelle("P(B|A)", "\\dfrac{P(A\\cap B)}{P(A)}", c.AB, e.nA, N)),
        res,
        piege(L, [texte("Diviser par 1 (prendre "), latex("P(A\\cap B)"), texte(") ou par "), latex("P(B)"), texte(" : la condition, écrite après la barre, est "), latex("A"), texte(".")]),
      ];
  }
}

const TEXTE_RELATION = { incompatibles: "incompatibles", independants: "indépendants", ni_l_un_ni_l_autre: "ni incompatibles, ni indépendants" } as const;

function etapeA3(e: ExerciceFamilleA): EtapeCorrection[] {
  const L = lettreEcranProbabilitesEnsembles(e, "aEcran3");
  const N = e.denominateur;
  const c = casesA(e);
  if (e.sousTypeEcran3 === "relation" && e.paireEcran3) {
    const [x, y] = e.paireEcran3;
    const X = LATEX_EVENEMENT_A[x];
    const Y = LATEX_EVENEMENT_A[y];
    const inter = latexIntersectionA(x, y);
    const relation = relationPaireEcran3(e);
    const nX = effectifEvenementA(e, x);
    const nY = effectifEvenementA(e, y);
    const nXY = effectifIntersectionA(e, x, y);
    const lignes: LigneCalcul[] = [];
    if (nXY === 0) lignes.push(ligne(`${inter}=\\varnothing`, "aucune case commune aux deux événements"));
    lignes.push(...lignesTestProduit(X, Y, inter, nX, nY, nXY, N));
    lignes.push(ligneComparaison(nX, nY, nXY, N));
    return [
      utiliseCours(
        L,
        [texte("Incompatibles : l'intersection est vide. Indépendants : "), latex(`P(${x}\\cap ${y})=P(${x})\\cdot P(${y})`), texte(" (égalité exacte). Deux événements incompatibles de probabilités non nulles ne sont jamais indépendants")],
        COURS_ENSEMBLES,
      ),
      calcul(L, lignes),
      resultat(L, [latex(X), texte(" et "), latex(Y), texte(` sont ${TEXTE_RELATION[relation]}.`)]),
      ...(relation === "ni_l_un_ni_l_autre" && nXY > 0 ? [verification(L, [texte("Intersection non vide ("), latex(`${nXY}\\neq 0`), texte(") : ils ne sont pas incompatibles non plus.")])] : []),
      piege(L, [texte("Ne pas confondre incompatibles et indépendants : deux événements incompatibles (de probabilités non nulles) ne sont jamais indépendants, puisque "), latex("0\\neq P(X)\\cdot P(Y)"), texte(".")]),
    ];
  }
  const comp = comparaisonConditionnellesA(e);
  const nBb = N - e.nB;
  const signe = comp === "egal" ? "=" : comp === "superieur" ? ">" : "<";
  const g = c.ABb * e.nB;
  const d = c.AB * nBb;
  return [
    utiliseCours(L, [texte("Chaque probabilité conditionnelle se calcule dans sa colonne : "), latex("P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}"), texte(" ; deux fractions se comparent par leurs produits en croix")], COURS_ENSEMBLES),
    calcul(L, [...lignesConditionnelle("P(A|\\overline{B})", "\\dfrac{P(A\\cap\\overline{B})}{P(\\overline{B})}", c.ABb, nBb, N), ...lignesConditionnelle("P(A|B)", "\\dfrac{P(A\\cap B)}{P(B)}", c.AB, e.nB, N)]),
    calcul(
      L,
      [ligne(`${c.ABb}\\times ${e.nB}=${g}`, [texte("produit en croix de "), latex(brute(c.ABb, nBb))]), ligne(`${c.AB}\\times ${nBb}=${d}`, [texte("produit en croix de "), latex(brute(c.AB, e.nB))]), ligne(`${g}${signe}${d}`, comp === "egal" ? "produits égaux" : "on compare")],
      [],
      "Comparaison",
    ),
    resultat(L, [latex(`P(A|\\overline{B})${signe}P(A|B)`), ...(comp === "egal" ? [texte(" : savoir si "), latex("B"), texte(" est réalisé ne change pas la probabilité de "), latex("A"), texte(" (A et B sont indépendants).")] : [texte(".")])]),
    piege(L, [texte("Le dénominateur de "), latex("P(A|\\overline{B})"), texte(" est "), latex("P(\\overline{B})=1-P(B)"), texte(", pas "), latex("P(B)"), texte(" ni 1.")]),
  ];
}

// ============================================================================
// Famille B
// ============================================================================

/** Issues listées (≤ 8) ou comptage expliqué. */
function justificationComptage(issues: string[] | undefined, explication: string | undefined, n: number): string {
  if (issues && issues.length > 0 && issues.length <= 8) return issues.join(", ");
  if (explication) return explication;
  return n === 0 ? "aucune issue" : "issues comptées une à une";
}

function etapesB(e: ExerciceFamilleB): EtapeCorrection[] {
  const N = e.denominateur;
  const nA = e.eventA.count;
  const nB = e.eventB.count;
  const nAB = e.countAetB;
  const nAouB = nA + nB - nAB;
  const [L1, L2, L3, L4] = (["bEcran1", "bEcran2", "bEcran3", "bEcran4"] as const).map((p) => lettreEcranProbabilitesEnsembles(e, p));
  const univers = e.sousType === "cartes" ? "les 52 cartes sont équiprobables" : `les ${N} couples (premier dé ; second dé) sont équiprobables`;
  const indep = independantsB(e);
  const etapes: EtapeCorrection[] = [
    utiliseCours(L1, [texte(`Équiprobabilité (${univers}) : `), latex("P(A)=\\dfrac{n(A)}{n(\\Omega)}"), texte(", nombre d'issues favorables sur nombre d'issues")], COURS_ENSEMBLES),
    calcul(L1, [
      ligne(`n(\\Omega)=${N}`, e.sousType === "cartes" ? "jeu de 52 cartes" : `${e.facesParDe} × ${e.facesParDe} couples`),
      ligne(`n(A)=${nA}`, justificationComptage(e.eventA.issues, e.eventA.explication, nA)),
      ...lignesFraction("P(A)", nA, N, "équiprobabilité"),
      ligne(`n(B)=${nB}`, justificationComptage(e.eventB.issues, e.eventB.explication, nB)),
      ...lignesFraction("P(B)", nB, N, "équiprobabilité"),
    ]),
    resultat(L1, reponseEcran(e, "bEcran1")),
    piege(L1, [texte("Diviser par le nombre de valeurs possibles au lieu du nombre d'issues équiprobables de "), latex("\\Omega"), texte(e.sousType === "des" ? " : avec deux dés, ce sont les couples qui sont équiprobables, pas les sommes." : ".")]),
  ];
  const communes = justificationComptage(e.issuesAetB, undefined, nAB);
  if (e.demandeEcran2 === "intersection") {
    etapes.push(
      utiliseCours(L2, [latex("A\\cap B"), texte(" regroupe les issues qui réalisent A et B à la fois, et "), latex("P(A\\cap B)=\\dfrac{n(A\\cap B)}{n(\\Omega)}")], COURS_ENSEMBLES),
      calcul(L2, [ligne(`n(A\\cap B)=${nAB}`, communes), ...lignesFraction("P(A\\cap B)", nAB, N, "équiprobabilité")]),
    );
  } else {
    etapes.push(
      utiliseCours(L2, [texte("Relation d'inclusion-exclusion "), latex("P(A\\cup B)=P(A)+P(B)-P(A\\cap B)")], COURS_ENSEMBLES),
      calcul(L2, [
        ligne(`n(A\\cap B)=${nAB}`, communes),
        ligne("P(A\\cup B)=P(A)+P(B)-P(A\\cap B)", "inclusion-exclusion"),
        ligne(`=${brute(nA, N)}+${brute(nB, N)}-${brute(nAB, N)}`, "on remplace"),
        ligne(`=${brute(nAouB, N)}`),
        ...lignesSimplifier(nAouB, N),
      ]),
    );
  }
  etapes.push(
    { ...resultat(L2, reponseEcran(e, "bEcran2")), figureHtml: vennB(e) },
    piege(L2, e.demandeEcran2 === "union" ? [texte("Additionner "), latex("P(A)+P(B)"), texte(" sans retirer "), latex("P(A\\cap B)"), texte(" : les issues communes seraient comptées deux fois.")] : [texte("Multiplier "), latex("P(A)\\cdot P(B)"), texte(" : ce produit n'est égal à "), latex("P(A\\cap B)"), texte(" que si A et B sont indépendants, ce qu'on ignore encore.")]),
    utiliseCours(L3, [latex("P(A|B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{n(A\\cap B)}{n(B)}"), texte(" : on ne choisit que parmi les issues de B")], COURS_ENSEMBLES),
    calcul(L3, [ligne("P(A|B)=\\dfrac{n(A\\cap B)}{n(B)}", "équiprobabilité dans B"), ...lignesFraction("", nAB, nB, "on remplace")]),
    resultat(L3, reponseEcran(e, "bEcran3")),
    piege(L3, [texte("Diviser par "), latex(`n(\\Omega)=${N}`), texte(" : ce serait "), latex("P(A\\cap B)"), texte(".")]),
    utiliseCours(L4, [latex("A"), texte(" et "), latex("B"), texte(" sont indépendants lorsque "), latex("P(A\\cap B)=P(A)\\cdot P(B)"), texte(" exactement")], COURS_ENSEMBLES),
    calcul(L4, [...lignesTestProduit("A", "B", "A\\cap B", nA, nB, nAB, N), ligneComparaison(nA, nB, nAB, N, "A", "B")]),
    resultat(L4, [texte(indep ? "A et B sont indépendants." : "A et B ne sont pas indépendants.")]),
    verification(L4, [texte("Autre écriture : "), latex(`P(A|B)=${frac(nAB, nB)}`), texte(indep ? " est égale à " : " est différente de "), latex(`P(A)=${frac(nA, N)}`), texte(".")]),
    piege(
      L4,
      nAB === 0
        ? [texte("A et B ne peuvent pas se produire ensemble : ils sont incompatibles, et c'est justement pour cela qu'ils ne sont pas indépendants.")]
        : [texte("L'indépendance ne se devine pas (« les deux événements n'ont rien à voir ») : seul le calcul tranche, et l'égalité doit être exacte — comparer des valeurs arrondies ne suffit pas.")],
    ),
  );
  return etapes;
}

// ============================================================================
// Point d'entrée
// ============================================================================

export function correctionDetailleeProbabilitesEnsembles(e: Ex): EtapeCorrection[] {
  if (e.famille === "A") return finaliser([...etapeA1(e), ...etapeA2(e), ...etapeA3(e)]);
  return finaliser(etapesB(e));
}

/** Verdict de la dernière étape, en minuscules au fil d'une phrase. */
export function verdictProbabilitesEnsembles(e: Ex): Fragments {
  if (e.famille === "A" && e.sousTypeEcran3 === "comparaisonConditionnelle") {
    const comp = comparaisonConditionnellesA(e);
    return [latex(`P(A|\\overline{B})${comp === "egal" ? "=" : comp === "superieur" ? ">" : "<"}P(A|B)`)];
  }
  const phase: PhaseProbabilitesEnsembles = e.famille === "A" ? "aEcran3" : "bEcran4";
  return [texte((libelleChoixCorrect(e, phase) ?? "").toLowerCase())];
}

export { valeur as valeurProbabilite };
