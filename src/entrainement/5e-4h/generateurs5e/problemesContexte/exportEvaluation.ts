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
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import {
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
  latexFormuleCuB,
  nombreFr,
} from "../../ui5e/formatProblemesContexte";
import { grapheA1, grapheA2, grapheC } from "./graphes";
import { correctionDetailleeProblemesContexte, lettresLectureContexte } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
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

const STYLE_TABLE = 'style="border-collapse:collapse;margin:6px auto;font-size:13px"';
const STYLE_CASE = 'style="border:1px solid #868e96;padding:3px 10px;text-align:center"';
const STYLE_ENTETE = 'style="border:1px solid #868e96;padding:3px 10px;text-align:center;background:#f1f3f5;font-weight:600"';

function tableauHtml(entetes: string[], lignes: string[][]): string {
  const tetes = entetes.map((t) => `<th ${STYLE_ENTETE}>${t}</th>`).join("");
  const corps = lignes.map((l) => `<tr>${l.map((c) => `<td ${STYLE_CASE}>${c}</td>`).join("")}</tr>`).join("");
  return `<table ${STYLE_TABLE}><thead><tr>${tetes}</tr></thead><tbody>${corps}</tbody></table>`;
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
    const rayons = e.lignesTableau.map((l) => l.r);
    return [
      { id: "tableau", consigne: riche(`Pour ${rayons.map((r) => `$r = ${r}$`).join(rayons.length > 2 ? ", " : " et ").replace(/, ([^,]*)$/, " et $1")} cm, calcule la hauteur $h$, l'aire des deux bases et l'aire latérale (arrondies à l'unité).`) },
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
        `On fabrique ${e.contexte.nomObjetIndefini}${e.contexte.nomObjetIndefini.includes("cylindre") ? "" : " en forme de cylindre"}, de rayon $x$ et de hauteur $h$ (en cm), dont la contenance est fixée à $V = ${e.volumeCm3}$ cm³ ($V = \\pi x^2 h$). On note $f(x)$ l'aire latérale et $g(x)$ l'aire des deux bases, en cm². Le graphique ci-dessous représente $f$, $g$ et $f + g$.`,
      ),
    ],
    html: grapheA1(e, false),
    questions: [
      riche("Exprime $h(x)$, $f(x)$ et $g(x)$ en fonction de $x$, en gardant $V$ comme paramètre."),
      riche("Détermine par calcul le rayon pour lequel l'aire latérale est égale à l'aire des bases (arrondi au centimètre)."),
      riche("Lis sur le graphique le rayon qui minimise la quantité totale de matériau $(f+g)(x)$, puis calcule la hauteur correspondante (arrondie au centimètre). Que constates-tu ?"),
    ],
    etapesParQuestion: [["a", "b"], ["c"], ["d", "e"]],
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
        { description: [texte("Calculer k par "), latex("\\dfrac{g(x)}{x}"), texte(" au lieu de "), latex("x\\cdot g(x)")], cout: "−0,5" },
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

/** Critères du niveau (grille commune), jugés sur l'énoncé papier (vraies questions) :
 * - écrans de lecture : minimum lu (A1 « graphique », A2), expressions de CV et CP lues (allure +
 *   ligne x = 1), seuil lu (C) — `lettresLectureContexte` ;
 * - méthode : 2 quand l'élève construit le modèle (A1 : h, f et g, sans formule d'aire donnée), 1 sinon (B : forme de
 *   cu(x) et f = cu × x données ; A2 et C :
 *   formes données) ;
 * - piège dans les données : A2 solution négative à rejeter ; C conversion des milliers d'euros ;
 *   B coût UNITAIRE relevé (à multiplier par x) ; A1 0 (le minimum n'est pas l'égalité des aires :
 *   c'est la méthode) ;
 * - nombres : 1 pour A1 (π, racine cubique, calculatrice), 1 si une valeur est arrondie (≈), 0 sinon. */
function criteresDifficulteProblemesContexte(e: ExerciceProblemeContexte): CriteresDifficulte {
  const corrige = correctionDetailleeProblemesContexte(e);
  const etapes = etapesDuCorrige(corrige, lettresLectureContexte(e));
  if (e.scenario === "A" && e.combo === "kInverseXAxCarre") return { ...etapes, methode: 2, piege: 0, nombres: 1 };
  if (e.scenario === "A") return { ...etapes, methode: 1, piege: 1 };
  if (e.scenario === "B") return { ...etapes, methode: 1, piege: 1 };
  return { ...etapes, methode: 1, piege: 1 };
}

/** Repli (documents Word) : les lignes du corrigé détaillé, en paragraphes. */
function construireCorrectionProblemesContexte(e: ExerciceProblemeContexte): BlocCorrection[] {
  return correctionDetailleeProblemesContexte(e)
    .filter((l) => l.type !== "piege")
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
  criteresDifficulte: criteresDifficulteProblemesContexte,
  reponseBreve: reponseBreveProblemesContexte,
  correctionDetaillee: correctionDetailleeProblemesContexte,
  bareme: baremeProblemesContexte,
  enoncePapier: sectionPapier,
  profilInstance: profilProblemesContexte,
  calculatriceIndispensable: ["A1"],
};
