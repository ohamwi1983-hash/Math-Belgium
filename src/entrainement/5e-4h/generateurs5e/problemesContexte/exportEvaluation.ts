import type {
  ExerciceProblemeContexte,
  ExerciceScenarioAConteneur,
  ExerciceScenarioAStockCommande,
  ExerciceScenarioB,
  ExerciceScenarioC,
} from "../../core5e/problemesContexte.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type ViewBoxSvg } from "../../../export/svgGraph";
import {
  TEXTE_AIDE_BENEFICE_C_1,
  TEXTE_AIDE_COUT_MOYEN_C_1,
  TEXTE_AIDE_EGALITE_AIRES_A_1,
  TEXTE_AIDE_RESOLUTION_B_1,
  formatTermeABLatex,
  formatTermeBeneficeC,
  formatTermeCoutMoyenC,
  formatTermeExtremumSimpleA,
  formatTermeFormuleBLatex,
  formatTermeHJustificationA,
  formatTermeIntersectionSimpleA,
  formatTermeSeuilC,
  formatTermeXEgaliteAiresA,
  formatTermeXOptimalA,
  formatTermesEvaluationBLatex,
  formatTermesFormulesGeneralisationA,
  formatTermesFormulesGeneralisationSimpleA,
  formatTermesLectureC,
  formatTermesReconnaissanceC,
  formatTermesSystemeBLatex,
  latexAideEgaliteAiresA2,
  latexCoutTotalB,
  latexFormuleCuB,
  latexFormuleFB,
  nombreFr,
  nombreLatex,
  texteAideGeneralisationA2F,
  texteAideGeneralisationA2G,
  texteAideGeneralisationA2H,
  texteAideGeneralisationSimpleA1,
  texteAideLectureC1,
  texteAideReconnaissanceC1,
} from "../../ui5e/formatProblemesContexte";
import { domaineGrapheScenarioA } from "../../ui5e/scenarioAGraph";
import { domaineGrapheScenarioAReduit } from "../../ui5e/scenarioAGraphReduit";
import { domaineGrapheScenarioC } from "../../ui5e/scenarioCGraph";
import { aireBasesCylindre, aireLateraleCylindre, fStockCommande, gStockCommande } from "./scenarioA";
import { chiffreAffaires, coutProportionnel, coutTotal, coutVariable } from "./scenarioC";
import { CATALOGUE_PROBLEMES_CONTEXTE, construireProblemeContexteAvecVariante, genererExerciceProblemeContexte } from "./index";
import { profilProblemesContexte } from "../profilsEvaluationFonctions5";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProblemeContexte>` pour 5gen5 (« Problèmes en
 * contexte », chapitre 1 de 5e) — feuille d'exercices et évaluation, selon
 * `.claude/rules/feuilles-evaluations.md` (refonte du chapitre 1 de 5e).
 *
 * Les TROIS scénarios du générateur sont couverts sur papier (catalogue partagé avec l'appli et son
 * `?code=`, `CATALOGUE_PROBLEMES_CONTEXTE`) :
 * - A1 (bidons cylindriques) : données (contenance, V = πx²h) et graphique de f, g et f + g ;
 * - A2 (stock et commande) : nature de f et g, deux relevés en tableau, graphique ;
 * - B (coût unitaire, 5 modèles) : forme de cu(x) et deux relevés ;
 * - C (coûts d'une entreprise, 12 combinaisons) : tableau de valeurs et graphique (allures, seuil).
 * L'énoncé papier = les données + les VRAIES questions du problème ; les écrans du générateur sont
 * les étapes « Étape n » du corrigé (`construireEnonce`). Le tableau numérique de A1 (écran de
 * guidage) n'est pas repris sur papier. Les graphiques à LIRE sont des données de l'énoncé
 * (`enteteHtml`) ; le corrigé les remontre avec la lecture marquée (`figureHtml`).
 * Toutes les valeurs viennent des MÊMES fonctions que l'écran (`ui5e/formatProblemesContexte.ts`).
 */

type ExA1 = ExerciceScenarioAConteneur;
type ExA2 = ExerciceScenarioAStockCommande;

const LETTRES = "abcdefgh";

// ============================================================================
// Outils.
// ============================================================================

/** RichText de l'écran (`$…$`) → fragments texte / LaTeX. */
function riche(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? latex(morceau) : texte(morceau)))
    .filter((f) => f.valeur !== "");
}

function joindre(valeurs: string[], separateur = " ; "): FragmentConsigne[] {
  return valeurs.flatMap((v, i) => (i === 0 ? [latex(v)] : [texte(separateur), latex(v)]));
}

/** « \\text{ €} » en fin de formule (écran) → symbole € hors formule (KaTeX strict : pas d'Unicode dans \\text). */
function sansEuro(latexSource: string): string {
  return latexSource.replace(/\\text\{\s*€\}/g, "");
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function fractionLatex(num: number, den: number): string {
  const g = pgcd(num, den);
  let n = num / g;
  let d = den / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (d === 1) return `${n}`;
  return `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${d}}`;
}

const STYLE_TABLE = 'style="border-collapse:collapse;margin:6px auto;font-size:13px"';
const STYLE_CASE = 'style="border:1px solid #868e96;padding:3px 10px;text-align:center"';
const STYLE_ENTETE = 'style="border:1px solid #868e96;padding:3px 10px;text-align:center;background:#f1f3f5;font-weight:600"';

function tableauHtml(entetes: string[], lignes: string[][]): string {
  const tetes = entetes.map((t) => `<th ${STYLE_ENTETE}>${t}</th>`).join("");
  const corps = lignes.map((l) => `<tr>${l.map((c) => `<td ${STYLE_CASE}>${c}</td>`).join("")}</tr>`).join("");
  return `<table ${STYLE_TABLE}><thead><tr>${tetes}</tr></thead><tbody>${corps}</tbody></table>`;
}

const COULEUR_F = "#1971c2";
const COULEUR_G = "#e8590c";
const COULEUR_SOMME = "#2f9e44";
const COULEUR_CV = "#7048e8";
const COULEUR_CP = "#e8590c";
const COULEUR_CT = "#2f9e44";
const COULEUR_CA = "#d6336c";

function centrer(svg: string): string {
  return `<div style="display:flex;justify-content:center;margin:0.5em 0">${svg}</div>`;
}

/** Une courbe coupée hors du cadre (évite les tracés géants près d'une asymptote). */
function borne(f: (x: number) => number, vb: ViewBoxSvg): (x: number) => number | null {
  return (x) => {
    if (x <= 0) return null;
    const y = f(x);
    return Number.isFinite(y) && y <= vb.yMax * 1.02 && y >= vb.yMin ? y : null;
  };
}

/** Fenêtre avec une marge à gauche et en bas pour les graduations (x ≥ 0, y ≥ 0). */
function fenetre(xMax: number, yMax: number): ViewBoxSvg {
  return { xMin: -0.1 * xMax, xMax, yMin: -0.08 * yMax, yMax };
}

const LARGEUR_GRAPHE = 400;
const HAUTEUR_GRAPHE = 280;

// ============================================================================
// Graphiques (énoncé : données à lire ; corrigé : même graphique, lecture marquée).
// ============================================================================

function grapheA1(e: ExA1, marquerMinimum: boolean): string {
  const { xMax, yMax } = domaineGrapheScenarioA(e);
  const vb = fenetre(xMax, yMax);
  const f = (x: number) => aireLateraleCylindre(e.volumeCm3, x);
  const g = (x: number) => aireBasesCylindre(x);
  const somme = (x: number) => f(x) + g(x);
  const xOpt = Math.round(e.xOptimal);
  return centrer(
    construireSvgFonction(borne(somme, vb), vb, {
      largeur: LARGEUR_GRAPHE,
      hauteur: HAUTEUR_GRAPHE,
      divisionsX: 16,
      divisionsY: 8,
      couleurCourbe: COULEUR_SOMME,
      courbesSecondaires: [
        { evaluer: borne(f, vb), couleur: COULEUR_F, pointilles: false },
        { evaluer: borne(g, vb), couleur: COULEUR_G, pointilles: false },
      ],
      legende: [
        { texte: "f(x) : aire latérale (cm²)", couleur: COULEUR_F },
        { texte: "g(x) : aire des bases (cm²)", couleur: COULEUR_G },
        { texte: "(f + g)(x)", couleur: COULEUR_SOMME },
      ],
      points: marquerMinimum ? [{ x: xOpt, y: somme(xOpt), label: `minimum vers x = ${xOpt}`, couleur: COULEUR_SOMME, labelPosition: "dessous" }] : [],
    }),
  );
}

function grapheA2(e: ExA2, marquerMinimum: boolean): string {
  const { xMax, yMax } = domaineGrapheScenarioAReduit(e);
  const vb = fenetre(xMax, yMax);
  const f = (x: number) => fStockCommande(e.a, e.b, x);
  const g = (x: number) => gStockCommande(e.k, x);
  const somme = (x: number) => f(x) + g(x);
  const xExt = Math.round(e.xExtremum);
  return centrer(
    construireSvgFonction(borne(somme, vb), vb, {
      largeur: LARGEUR_GRAPHE,
      hauteur: HAUTEUR_GRAPHE,
      divisionsX: 16,
      divisionsY: 8,
      couleurCourbe: COULEUR_SOMME,
      courbesSecondaires: [
        { evaluer: borne(f, vb), couleur: COULEUR_F, pointilles: false },
        { evaluer: borne(g, vb), couleur: COULEUR_G, pointilles: false },
      ],
      legende: [
        { texte: `f(x) : ${e.contexte.labelF} (€)`, couleur: COULEUR_F },
        { texte: `g(x) : ${e.contexte.labelG} (€)`, couleur: COULEUR_G },
        { texte: "(f + g)(x) : coût total (€)", couleur: COULEUR_SOMME },
      ],
      points: marquerMinimum ? [{ x: xExt, y: somme(xExt), label: `minimum vers x = ${xExt}`, couleur: COULEUR_SOMME, labelPosition: "dessous" }] : [],
    }),
  );
}

function grapheC(e: ExerciceScenarioC, marquerSeuil: boolean): string {
  const { xMax, yMax } = domaineGrapheScenarioC(e);
  const vb = fenetre(xMax, yMax);
  const ct = (x: number) => coutTotal(e.cf, e.formeCV, e.k, e.m, x);
  const ca = (x: number) => chiffreAffaires(e.formeCA, e.p, x);
  const cv = (x: number) => coutVariable(e.formeCV, e.k, x);
  const cp = (x: number) => coutProportionnel(e.m, x);
  const dansCadre = (f: (x: number) => number) => (x: number) => {
    if (x < 0) return null;
    const y = f(x);
    return Number.isFinite(y) && y <= vb.yMax * 1.02 ? y : null;
  };
  return centrer(
    construireSvgFonction(dansCadre(ct), vb, {
      largeur: LARGEUR_GRAPHE,
      hauteur: HAUTEUR_GRAPHE,
      divisionsX: 16,
      divisionsY: 8,
      couleurCourbe: COULEUR_CT,
      courbesSecondaires: [
        { evaluer: dansCadre(cv), couleur: COULEUR_CV, pointilles: false },
        { evaluer: dansCadre(cp), couleur: COULEUR_CP, pointilles: false },
        { evaluer: dansCadre(ca), couleur: COULEUR_CA, pointilles: false },
      ],
      legende: [
        { texte: "CV(x)", couleur: COULEUR_CV },
        { texte: "CP(x)", couleur: COULEUR_CP },
        { texte: "CT(x)", couleur: COULEUR_CT },
        { texte: "CA(x)", couleur: COULEUR_CA },
      ],
      points: marquerSeuil ? [{ x: e.xSeuil, y: ca(e.xSeuil), label: `seuil vers x = ${nombreFr(e.xSeuil, 1)}`, couleur: COULEUR_CA, labelPosition: "dessus" }] : [],
    }),
  );
}

// ============================================================================
// Étapes (une par écran du générateur repris sur papier) et énoncé papier.
// ============================================================================

interface EtapePapier {
  id: string;
  consigne: FragmentConsigne[];
}

function etapes(e: ExerciceProblemeContexte): EtapePapier[] {
  if (e.scenario === "A" && e.combo === "kInverseXAxCarre") {
    return [
      { id: "generalisation", consigne: riche("Exprime la hauteur $h(x)$, l'aire latérale $f(x)$ et l'aire des deux bases $g(x)$ en fonction du rayon $x$ (garde $V$ comme paramètre).") },
      { id: "egaliteAires", consigne: riche("Résous $f(x) = g(x)$ (arrondi à l'unité).") },
      { id: "graphique", consigne: riche("Lis sur le graphique le rayon qui minimise $(f+g)(x)$.") },
      { id: "justification", consigne: riche("Calcule la hauteur pour ce rayon et compare-la au diamètre.") },
    ];
  }
  if (e.scenario === "A") {
    return [
      { id: "generalisationSimple", consigne: riche("Écris $f(x)$ et $g(x)$ à l'aide des relevés.") },
      { id: "intersectionSimple", consigne: riche("Résous $f(x) = g(x)$.") },
      { id: "extremumSimple", consigne: riche("Lis sur le graphique la taille de lot qui minimise $(f+g)(x)$.") },
    ];
  }
  if (e.scenario === "B") {
    return [
      { id: "systeme", consigne: riche("Écris le système de deux équations en $a$ et $b$ donné par les relevés.") },
      { id: "resolution", consigne: riche("Résous ce système.") },
      { id: "formule", consigne: riche("Écris le coût total de production $f(x)$ avec ces valeurs de $a$ et $b$.") },
      { id: "evaluation", consigne: riche(`Calcule $f(${e.xEval1})$ et $f(${e.xEval2})$.`) },
    ];
  }
  return [
    { id: "lecture", consigne: riche(`Calcule $\\text{CT}(${e.xLecture})$ à l'aide du tableau.`) },
    { id: "coutMoyen", consigne: riche(`Calcule le coût moyen par unité pour $x = ${e.xLecture}$, en euros.`) },
    { id: "reconnaissance", consigne: riche("Donne les expressions de $\\text{CV}(x)$ et de $\\text{CP}(x)$.") },
    { id: "benefice", consigne: riche(`Calcule le bénéfice pour $x = ${e.xBenefice}$.`) },
    { id: "seuil", consigne: riche("Lis sur le graphique le seuil de rentabilité.") },
  ];
}

function lettre(e: ExerciceProblemeContexte, id: string): string {
  return LETTRES[etapes(e).findIndex((x) => x.id === id)] ?? "a";
}

function construireEnonceProblemesContexte(e: ExerciceProblemeContexte): SectionExercice {
  const papier = sectionPapier(e);
  return { enteteFragments: papier.section.enteteFragments, enteteHtml: papier.section.enteteHtml, questions: etapes(e).map((x) => ({ consigne: x.consigne })) };
}

function enonceA1(e: ExA1): { entete: FragmentConsigne[]; html: string; questions: FragmentConsigne[][]; etapesParQuestion: string[][] } {
  return {
    entete: [
      ...riche(
        `On fabrique ${e.contexte.nomObjetIndefini} en forme de cylindre, de rayon $x$ et de hauteur $h$ (en cm), dont la contenance est fixée à $V = ${e.volumeCm3}$ cm³ ($V = \\pi x^2 h$). On note $f(x)$ l'aire latérale et $g(x)$ l'aire des deux bases, en cm². Le graphique ci-dessous représente $f$, $g$ et $f + g$.`,
      ),
    ],
    html: grapheA1(e, false),
    questions: [
      riche("Exprime $h(x)$, $f(x)$ et $g(x)$ en fonction de $x$, en gardant $V$ comme paramètre."),
      riche("Détermine par calcul le rayon pour lequel l'aire latérale est égale à l'aire des bases (arrondi au centimètre)."),
      riche("Lis sur le graphique le rayon qui minimise la quantité totale de matériau $(f+g)(x)$, puis calcule la hauteur correspondante (arrondie au centimètre). Que constates-tu ?"),
    ],
    etapesParQuestion: [["a"], ["b"], ["c", "d"]],
  };
}

function enonceA2(e: ExA2): { entete: FragmentConsigne[]; html: string; questions: FragmentConsigne[][]; etapesParQuestion: string[][] } {
  const intro = e.contexte.intro.replace(/\b([fg])\(x\)/g, "$$$1(x)$$").replace(/ x /g, " $x$ ");
  const tableau = tableauHtml(
    ["Taille du lot x", `f(x) (€)`, `g(x) (€)`],
    e.releves.map((r) => [String(r.x), nombreFr(r.f), nombreFr(r.g)]),
  );
  return {
    entete: riche(
      `${intro} On sait que $f$ est une fonction affine et que $g$ est inversement proportionnelle à $x$. Le tableau donne deux relevés (en euros) et le graphique représente $f$, $g$ et le coût total $f + g$.`,
    ),
    html: tableau + grapheA2(e, false),
    questions: [
      riche("Écris les expressions de $f(x)$ et de $g(x)$."),
      riche("Détermine par calcul la taille de lot pour laquelle les deux coûts sont égaux."),
      riche("Lis sur le graphique la taille de lot qui rend le coût total minimal (arrondie à l'unité)."),
    ],
    etapesParQuestion: [["a"], ["b"], ["c"]],
  };
}

function enonceB(e: ExerciceScenarioB): { entete: FragmentConsigne[]; html?: string; questions: FragmentConsigne[][]; etapesParQuestion: string[][] } {
  const { contexte, point1: p1, point2: p2 } = e;
  return {
    entete: [
      texte(`Pour ${contexte.sujet}, le coût unitaire (en euros par unité, pour une production de `),
      latex("x"),
      texte(` ${contexte.unite}) est de la forme `),
      latex(latexFormuleCuB(e.modele)),
      texte(", où a et b sont deux constantes. Le coût total de production vaut "),
      latex("f(x)=\\text{cu}(x)\\times x"),
      texte(". Un relevé donne : pour "),
      latex(`x=${p1.x}`),
      texte(` ${contexte.unite}, le coût unitaire est de ${nombreFr(p1.coutUnitaire)} € ; pour `),
      latex(`x=${p2.x}`),
      texte(` ${contexte.unite}, il est de ${nombreFr(p2.coutUnitaire)} €.`),
    ],
    questions: [riche("Détermine les constantes $a$ et $b$."), riche(`Exprime $f(x)$, puis calcule le coût total de production pour $x = ${e.xEval1}$ et pour $x = ${e.xEval2}$ (arrondi à l'euro).`)],
    etapesParQuestion: [["a", "b"], ["c", "d"]],
  };
}

function enonceC(e: ExerciceScenarioC): { entete: FragmentConsigne[]; html: string; questions: FragmentConsigne[][]; etapesParQuestion: string[][] } {
  const tableau = tableauHtml(
    ["x", "CV(x)", "CP(x)", "CA(x)"],
    e.tableau.map((l) => [String(l.x), nombreFr(l.cv), nombreFr(l.cp), nombreFr(l.ca)]),
  );
  return {
    entete: riche(
      `Une entreprise a un coût fixe $\\text{CF} = ${e.cf}$ et un coût variable formé de deux parties : $\\text{CV}(x)$ et un coût proportionnel $\\text{CP}(x)$, où $x$ est la quantité produite. Le coût total vaut $\\text{CT}(x) = \\text{CF} + \\text{CV}(x) + \\text{CP}(x)$ et le chiffre d'affaires est $\\text{CA}(x)$. Toutes les valeurs sont en milliers d'euros : le tableau en donne quelques-unes, le graphique représente $\\text{CV}$, $\\text{CP}$, $\\text{CT}$ et $\\text{CA}$.`,
    ),
    html: tableau + grapheC(e, false),
    questions: [
      riche(`Calcule le coût total pour $x = ${e.xLecture}$, puis le coût moyen par unité, en euros.`),
      riche("D'après l'allure des courbes et le tableau, donne les expressions de $\\text{CV}(x)$ et de $\\text{CP}(x)$."),
      riche(`Calcule le bénéfice réalisé pour $x = ${e.xBenefice}$ (en milliers d'euros).`),
      riche("Lis sur le graphique à partir de quelle quantité l'entreprise devient rentable (valeur approchée)."),
    ],
    etapesParQuestion: [["a", "b"], ["c"], ["d"], ["e"]],
  };
}

function donneesPapier(e: ExerciceProblemeContexte): { entete: FragmentConsigne[]; html?: string; questions: FragmentConsigne[][]; etapesParQuestion: string[][] } {
  if (e.scenario === "A") return e.combo === "kInverseXAxCarre" ? enonceA1(e) : enonceA2(e);
  if (e.scenario === "B") return enonceB(e);
  return enonceC(e);
}

function sectionPapier(e: ExerciceProblemeContexte): EnoncePapier {
  const d = donneesPapier(e);
  return {
    section: { enteteFragments: d.entete, ...(d.html ? { enteteHtml: d.html } : {}), questions: d.questions.map((consigne) => ({ consigne })) },
    etapesParQuestion: d.etapesParQuestion,
    reponseBreve: reponseBreveProblemesContexte(e),
  };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

/** Constat de l'étape « justification » : au rayon optimal EXACT, h = 2x (le diamètre) — avec le
 * rayon lu ARRONDI, h et 2x ne sont que voisins (la correction de l'écran,
 * `texteCorrectionJustificationA`, dit « coïncident » sur les valeurs arrondies : faux dès que
 * l'arrondi s'écarte, ex. V = 2 500 : h(7) ≈ 16, 2·7 = 14). */
function constatJustificationA(e: ExA1): string {
  return (
    `La hauteur est (presque) égale au diamètre. Au rayon optimal exact $x = \\sqrt[3]{\\dfrac{V}{2\\pi}} \\approx ${nombreLatex(e.xOptimal, 2)}$ cm, on a $V = 2\\pi x^3$, donc ` +
    "$h(x) = \\dfrac{2\\pi x^3}{\\pi x^2} = 2x$ : la hauteur égale exactement le diamètre, quelle que soit la contenance $V$ (l'écart vient de l'arrondi de la lecture)."
  );
}

function correctionA1(e: ExA1): EtapeCorrection[] {
  const l = (id: string, label: string, fragments: FragmentConsigne[], figureHtml?: string): EtapeCorrection => ({ label, sousQuestion: lettre(e, id), fragments, ...(figureHtml ? { figureHtml } : {}) });
  const xRet = Math.round(e.xOptimal);
  return [
    l("generalisation", "Méthode", [...riche(texteAideGeneralisationA2H()), texte(" "), ...riche(texteAideGeneralisationA2F()), texte(" "), ...riche(texteAideGeneralisationA2G())]),
    l("generalisation", "Conclusion", [...joindre(formatTermesFormulesGeneralisationA()), texte(".")]),
    l("egaliteAires", "Méthode", riche(TEXTE_AIDE_EGALITE_AIRES_A_1)),
    l("egaliteAires", "Calcul", [latex(latexAideEgaliteAiresA2(e)), texte(", d'où "), latex(formatTermeXEgaliteAiresA(e)), texte(" cm.")]),
    l("egaliteAires", "Piège", [texte("Le rayon où les deux aires sont égales n'est pas celui qui minimise la quantité totale de matériau.")]),
    l("graphique", "Lecture", [...riche("Le point le plus bas de la courbe de $f+g$ : "), latex(formatTermeXOptimalA(e)), texte(" cm.")], grapheA1(e, true)),
    l("justification", "Calcul", [
      latex(`h(${xRet})=\\dfrac{${e.volumeCm3}}{\\pi\\times ${xRet}^2}`),
      texte(", donc "),
      latex(formatTermeHJustificationA(e, xRet)),
      texte(" cm, et le diamètre vaut "),
      latex(`2x=${2 * xRet}`),
      texte(" cm."),
    ]),
    l("justification", "Conclusion", riche(constatJustificationA(e))),
  ];
}

function correctionA2(e: ExA2): EtapeCorrection[] {
  const l = (id: string, label: string, fragments: FragmentConsigne[], figureHtml?: string): EtapeCorrection => ({ label, sousQuestion: lettre(e, id), fragments, ...(figureHtml ? { figureHtml } : {}) });
  const [r1, r2] = e.releves;
  const aCalc = `a=\\dfrac{${nombreLatex(r2.f)}-${nombreLatex(r1.f)}}{${r2.x}-${r1.x}}=${e.a}`;
  const bCalc = `b=${nombreLatex(r1.f)}-${e.a}\\times ${r1.x}=${e.b}`;
  const kCalc = `k=${r1.x}\\times ${nombreLatex(r1.g)}=${e.k}`;
  const autreRacine = fractionLatex(-(e.a * e.xIntersection + e.b), e.a);
  return [
    l("generalisationSimple", "Méthode", riche(texteAideGeneralisationSimpleA1(e))),
    l("generalisationSimple", "Calcul", [latex(aCalc), texte(" ; "), latex(bCalc), texte(" ; "), latex(kCalc), texte(".")]),
    l("generalisationSimple", "Conclusion", [...joindre(formatTermesFormulesGeneralisationSimpleA(e)), texte(".")]),
    l("intersectionSimple", "Méthode", riche("On pose $f(x) = g(x)$ et on multiplie les deux membres par $x$ ($x > 0$) : on obtient une équation du second degré.")),
    l("intersectionSimple", "Calcul", [
      latex(`${e.a === 1 ? "" : e.a}x^2+${e.b}x-${e.k}=0`),
      texte(" : solutions "),
      latex(`x=${e.xIntersection}`),
      texte(" et "),
      latex(`x=${autreRacine}`),
      texte(", négative, rejetée (une taille de lot est positive)."),
    ]),
    l("intersectionSimple", "Conclusion", [latex(formatTermeIntersectionSimpleA(e)), texte(` ${e.contexte.unite}.`)]),
    l("extremumSimple", "Lecture", [...riche("Le point le plus bas de la courbe de $f+g$ : "), latex(formatTermeExtremumSimpleA(e)), texte(` ${e.contexte.unite}.`)], grapheA2(e, true)),
    l("extremumSimple", "Piège", [texte("Le lot où les deux coûts sont égaux n'est pas celui qui minimise le coût total : on lit le minimum de f + g, pas l'intersection de f et g.")]),
  ];
}

function correctionB(e: ExerciceScenarioB): EtapeCorrection[] {
  const l = (id: string, label: string, fragments: FragmentConsigne[]): EtapeCorrection => ({ label, sousQuestion: lettre(e, id), fragments });
  const [eq1, eq2] = formatTermesSystemeBLatex(e);
  const a = e.aArrondiAttendu;
  const b = e.bArrondiAttendu;
  return [
    l("systeme", "Méthode", [...riche("Pour chaque relevé, le coût total vaut le coût unitaire multiplié par $x$ : "), latex(latexCoutTotalB(e.modele)), texte(".")]),
    l("systeme", "Calcul", [latex(`\\begin{cases} ${eq1} \\\\ ${eq2} \\end{cases}`)]),
    l("systeme", "Piège", riche("Le relevé donne le coût UNITAIRE : on peut aussi écrire directement $\\text{cu}(x)$ = valeur relevée, mais jamais égaler le coût unitaire au coût total.")),
    l("resolution", "Méthode", riche(TEXTE_AIDE_RESOLUTION_B_1)),
    l("resolution", "Conclusion", [latex(formatTermeABLatex(a, b)), texte(".")]),
    l("formule", "Calcul", [latex(latexFormuleFB(e.modele)), texte(", donc "), latex(formatTermeFormuleBLatex(a, b, e.modele)), texte(".")]),
    l("evaluation", "Conclusion", [...joindre(formatTermesEvaluationBLatex(e, a, b)), texte(" (en euros).")]),
  ];
}

function correctionC(e: ExerciceScenarioC): EtapeCorrection[] {
  const l = (id: string, label: string, fragments: FragmentConsigne[], figureHtml?: string): EtapeCorrection => ({ label, sousQuestion: lettre(e, id), fragments, ...(figureHtml ? { figureHtml } : {}) });
  return [
    l("lecture", "Méthode", riche(texteAideLectureC1(e))),
    l("lecture", "Calcul", [latex(formatTermesLectureC(e)[0]), texte(" milliers d'euros.")]),
    l("coutMoyen", "Méthode", riche(TEXTE_AIDE_COUT_MOYEN_C_1)),
    l("coutMoyen", "Calcul", [latex(sansEuro(formatTermeCoutMoyenC(e))), texte(" €.")]),
    l("coutMoyen", "Piège", [texte("Le tableau est en milliers d'euros : sans la multiplication par 1 000, le coût moyen est mille fois trop petit.")]),
    l("reconnaissance", "Méthode", riche(texteAideReconnaissanceC1(e))),
    l("reconnaissance", "Conclusion", [...joindre(formatTermesReconnaissanceC(e)), texte(".")]),
    l("benefice", "Méthode", riche(TEXTE_AIDE_BENEFICE_C_1)),
    l("benefice", "Calcul", [latex(formatTermeBeneficeC(e)), texte(" milliers d'euros.")]),
    l("seuil", "Lecture", [...riche("Abscisse du point où la courbe de $\\text{CA}$ croise celle de $\\text{CT}$ : "), latex(formatTermeSeuilC(e)), texte(".")], grapheC(e, true)),
  ];
}

function correctionDetailleeProblemesContexte(e: ExerciceProblemeContexte): EtapeCorrection[] {
  if (e.scenario === "A") return e.combo === "kInverseXAxCarre" ? correctionA1(e) : correctionA2(e);
  if (e.scenario === "B") return correctionB(e);
  return correctionC(e);
}

// ============================================================================
// Réponse brève, barème, difficulté.
// ============================================================================

function reponseBreveProblemesContexte(e: ExerciceProblemeContexte): FragmentConsigne[] {
  if (e.scenario === "A" && e.combo === "kInverseXAxCarre") {
    const xRet = Math.round(e.xOptimal);
    return [
      texte("a) "),
      ...joindre(formatTermesFormulesGeneralisationA()),
      texte(" — b) "),
      latex(formatTermeXEgaliteAiresA(e)),
      texte(" cm — c) "),
      latex(formatTermeXOptimalA(e)),
      texte(" cm, "),
      latex(formatTermeHJustificationA(e, xRet)),
      texte(" cm : la hauteur est (presque) égale au diamètre ("),
      latex("h=2x"),
      texte(" au rayon exact)"),
    ];
  }
  if (e.scenario === "A") {
    return [texte("a) "), ...joindre(formatTermesFormulesGeneralisationSimpleA(e)), texte(" — b) "), latex(formatTermeIntersectionSimpleA(e)), texte(" — c) "), latex(formatTermeExtremumSimpleA(e))];
  }
  if (e.scenario === "B") {
    const a = e.aArrondiAttendu;
    const b = e.bArrondiAttendu;
    return [texte("a) "), latex(formatTermeABLatex(a, b)), texte(" — b) "), latex(formatTermeFormuleBLatex(a, b, e.modele)), texte(" ; "), ...joindre(formatTermesEvaluationBLatex(e, a, b)), texte(" €")];
  }
  return [
    texte("a) "),
    latex(formatTermesLectureC(e)[0]),
    texte(" ; "),
    latex(sansEuro(formatTermeCoutMoyenC(e))),
    texte(" € — b) "),
    ...joindre(formatTermesReconnaissanceC(e)),
    texte(" — c) "),
    latex(formatTermeBeneficeC(e)),
    texte(" — d) "),
    latex(formatTermeSeuilC(e)),
  ];
}

function baremeProblemesContexte(e: ExerciceProblemeContexte): BaremeExercice {
  const c = (id: string, t: string, points: number): CritereBareme => ({ sousQuestion: lettre(e, id), critere: riche(t), points });
  const reponseFinale = reponseBreveProblemesContexte(e);
  if (e.scenario === "A" && e.combo === "kInverseXAxCarre") {
    return {
      reponseFinale,
      criteres: [
        c("generalisation", "Expressions de $h(x)$, $f(x)$ et $g(x)$ (en fonction de $V$)", 1.5),
        c("egaliteAires", "Équation $f(x) = g(x)$ ramenée à $x^3 = \\dfrac{V}{\\pi}$ et résolue", 1),
        c("graphique", "Rayon optimal lu sur le graphique", 0.5),
        c("justification", "Hauteur calculée et comparée au diamètre", 1),
      ],
      erreursFrequentes: [
        { description: [texte("Remplacer V par sa valeur dans les expressions générales")], cout: "−0,5" },
        { description: [texte("Lire l'intersection de f et g au lieu du minimum de f + g")], cout: "0 pt sur la lecture" },
      ],
      reponsesAcceptees: [[texte("Lecture du rayon optimal à 1 cm près ; hauteur cohérente avec le rayon lu")]],
    };
  }
  if (e.scenario === "A") {
    return {
      reponseFinale,
      criteres: [
        c("generalisationSimple", "Expressions de $f(x)$ et de $g(x)$ à partir des relevés", 1.5),
        c("intersectionSimple", "Équation $f(x) = g(x)$ résolue, solution négative rejetée", 1.5),
        c("extremumSimple", "Taille de lot du coût total minimal lue sur le graphique", 1),
      ],
      erreursFrequentes: [
        { description: [texte("Calculer k comme g(x)/x au lieu de x·g(x)")], cout: "−0,5" },
        { description: [texte("Donner l'intersection de f et g comme minimum du coût total")], cout: "0 pt sur la lecture" },
      ],
      reponsesAcceptees: [[texte("Lecture du minimum à une unité près")]],
    };
  }
  if (e.scenario === "B") {
    return {
      reponseFinale,
      criteres: [
        c("systeme", "Système de deux équations en $a$ et $b$", 1),
        c("resolution", "Valeurs de $a$ et de $b$", 1),
        c("formule", "Expression du coût total $f(x)$", 1),
        c("evaluation", `Les deux coûts totaux $f(${e.xEval1})$ et $f(${e.xEval2})$`, 1),
      ],
      erreursFrequentes: [
        { description: [texte("Égaler le coût unitaire relevé au coût total")], cout: "0 pt sur le système" },
        { description: [texte("Calculer le coût unitaire au lieu du coût total à la dernière question")], cout: "−0,5" },
      ],
      reponsesAcceptees: [riche("Système écrit sur les coûts unitaires ($\\text{cu}(x)$ = valeur relevée) ou sur les coûts totaux")],
    };
  }
  return {
    reponseFinale,
    criteres: [
      c("lecture", "Coût total $\\text{CT}$ à partir du tableau", 0.5),
      c("coutMoyen", "Coût moyen en euros (conversion des milliers d'euros)", 1),
      c("reconnaissance", "Expressions de $\\text{CV}(x)$ et de $\\text{CP}(x)$", 1),
      c("benefice", "Bénéfice $\\text{CA} - \\text{CT}$", 1),
      c("seuil", "Seuil de rentabilité lu sur le graphique", 0.5),
    ],
    erreursFrequentes: [
      { description: [texte("Oublier le coût fixe dans le coût total")], cout: "−0,5" },
      { description: [texte("Oublier la conversion en euros du coût moyen")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte("Coût moyen arrondi à l'euro ; seuil lu à une graduation près")]],
  };
}

function difficulteProblemesContexte(e: ExerciceProblemeContexte): 1 | 2 | 3 {
  if (e.scenario === "B") return 2;
  if (e.scenario === "A" && e.combo === "stockCommande") return 2;
  return 3;
}

/** Repli (documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionProblemesContexte(e: ExerciceProblemeContexte): BlocCorrection[] {
  return correctionDetailleeProblemesContexte(e)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationProblemesContexte: AdaptateurFeuilleExercices<ExerciceProblemeContexte> = {
  titreDocument: "Problèmes en contexte — Fonctions composées — Évaluation",
  nomFichierBase: "problemes-contexte-fonctions-composees",
  genererInstance: genererExerciceProblemeContexte,
  catalogueVariantes: CATALOGUE_PROBLEMES_CONTEXTE,
  genererInstanceAvecVariante: (id) => construireProblemeContexteAvecVariante(id),
  construireEnonce: construireEnonceProblemesContexte,
  construireCorrection: construireCorrectionProblemesContexte,
  difficulte: difficulteProblemesContexte,
  reponseBreve: reponseBreveProblemesContexte,
  correctionDetaillee: correctionDetailleeProblemesContexte,
  bareme: baremeProblemesContexte,
  enoncePapier: sectionPapier,
  dureeMinutes: 20,
  profilInstance: profilProblemesContexte,
  calculatriceIndispensable: ["A1"],
};
