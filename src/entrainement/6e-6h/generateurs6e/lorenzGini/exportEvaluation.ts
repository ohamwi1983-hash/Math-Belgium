import { aireConcentration, coefficientGini, courbesSeCroisent } from "../../core6e/lorenzGini";
import type { ExerciceLorenzComparaison, ExerciceLorenzGini, ExerciceLorenzLecture, ExerciceLorenzParametre } from "../../core6e/lorenzGini";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { phasesPourExercice } from "../../moteur6e/typesLorenzGini";
import type { PhaseLorenz } from "../../moteur6e/typesLorenzGini";
import {
  aireEnALatex,
  aireEgaleLatex,
  aireSousCourbeLatex,
  blocDonnees,
  calculAireLatex,
  consigneEcran,
  consigneGenerale,
  formatReponseAttenduePhaseLatex,
  giniEgalLatex,
  giniEnALatex,
  indiceCourbe,
  phraseCroisement,
  reponseChoix,
  substitutionLatex,
} from "../../ui6e/formatLorenzGini";
import { decimalLatex, decimalTexte } from "../../ui6e/nombresExactsIntegrales";
import { figuresCorrigeSvg, figureEnonceSvg } from "../../ui6e/figureLorenzGini";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLorenzGini } from "./index";
import type { IdVarianteLorenzGini } from "./index";
import { VARIANTES_CALCULATRICE_LORENZ, profilLorenzGini } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceLorenzGini>` de `6gen82` « Courbe de Lorenz et
 * coefficient de Gini » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : le contexte (consigne générale de l'écran), le modèle, la figure SANS aire
 *   colorée (`enteteHtml`) et la consigne globale. Lecture : deux VRAIES questions (a) lire et
 *   interpréter L(p), b) coefficient de Gini) ; comparaison et paramètre : une seule demande.
 * - Corrigé : une étape par écran (lettres a, b, c… dans l'ordre des écrans), valeurs tirées des
 *   MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`, `reponseChoix`), une ligne
 *   « Piège » ciblée, la région entre la diagonale et la courbe colorée en `figureHtml`.
 * - Version aménagée : même énoncé (seule la mise en page change).
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcdefgh";

function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

function reponseEtape(e: ExerciceLorenzGini, phase: PhaseLorenz): FragmentConsigne[] {
  return phase === "interpretation" || phase === "verdict" ? reponseChoix(e, phase) : liste(formatReponseAttenduePhaseLatex(e, phase));
}

// ============================================================================
// Énoncés.
// ============================================================================

function donnees(e: ExerciceLorenzGini): FragmentConsigne[] {
  return [t(" "), ...liste(blocDonnees(e)), t(".")];
}

function demandeGlobale(e: ExerciceLorenzGini): FragmentConsigne[] {
  switch (e.variante) {
    case "lecture":
      return [];
    case "comparaison": {
      const question = e.contexte === "pays" ? "Dans quel pays les revenus sont-ils répartis de la façon la plus inégalitaire ?" : "La réforme a-t-elle réduit ou accru les inégalités de revenus ?";
      return [t(` Calcule le coefficient de Gini de chaque répartition (valeurs exactes, puis arrondies au millième). Selon ce coefficient, ${question.charAt(0).toLowerCase()}${question.slice(1)}`)];
    }
    case "parametre":
      return [t(" Détermine la valeur de a qui permet d'atteindre ce coefficient de Gini.")];
  }
}

function entetePapier(e: ExerciceLorenzGini): FragmentConsigne[] {
  return [...consigneGenerale(e), ...donnees(e), ...demandeGlobale(e)];
}

/** Titres des étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceLorenzGini, phase: PhaseLorenz): FragmentConsigne[] {
  if (phase === "interpretation") return [t("Interprète ce résultat par une phrase.")];
  if (phase === "verdict") return [t("Conclus à l'aide des deux coefficients de Gini.")];
  return consigneEcran(e, phase);
}

function construireEnonce(e: ExerciceLorenzGini): SectionExercice {
  return { enteteFragments: entetePapier(e), enteteHtml: figureEnonceSvg(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceLorenzGini): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({ type: "paragraphe", fragments: [t(`${LETTRES[i]}) `), ...reponseEtape(e, phase)] }));
}

function questionsLecture(e: ExerciceLorenzLecture) {
  const p = decimalLatex(e.p, 1);
  return [{ consigne: [t("Calcule "), f(`L(${p})`), t(" (valeur exacte, puis arrondie au millième si nécessaire) et interprète ce résultat par une phrase.")] }, { consigne: [t("Calcule le coefficient de Gini de cette répartition (valeur exacte, puis arrondie au millième).")] }];
}

function minusculeInitiale(fs: FragmentConsigne[]): FragmentConsigne[] {
  return fs.map((x, i) => (i === 0 && x.type === "texte" ? { ...x, valeur: x.valeur.charAt(0).toLowerCase() + x.valeur.slice(1) } : x));
}

function reponseBreve(e: ExerciceLorenzGini): FragmentConsigne[] {
  switch (e.variante) {
    case "lecture":
      return [t("a) "), ...reponseEtape(e, "valeur"), t(" : "), ...minusculeInitiale(reponseChoix(e, "interpretation")), t(" b) "), ...reponseEtape(e, "gini"), t(".")];
    case "comparaison":
      return [...reponseEtape(e, "ginis"), t(". "), ...reponseChoix(e, "verdict")];
    case "parametre":
      return [...reponseEtape(e, "valeurA"), t(".")];
  }
}

function enoncePapier(e: ExerciceLorenzGini): EnoncePapier {
  if (e.variante === "lecture") {
    return { section: { enteteFragments: entetePapier(e), enteteHtml: figureEnonceSvg(e), questions: questionsLecture(e) }, etapesParQuestion: [["a", "b"], ["c", "d"]], reponseBreve: reponseBreve(e) };
  }
  return { section: { enteteFragments: entetePapier(e), enteteHtml: figureEnonceSvg(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

const METHODE_AIRE: FragmentConsigne[] = [
  t("Sur [0 ; 1], la diagonale "),
  f("y=x"),
  t(" est au-dessus de la courbe de Lorenz : l'aire de la région comprise entre elles est "),
  f("\\displaystyle\\int_0^1\\left(x-L(x)\\right)dx"),
  t("."),
];

const METHODE_GINI: FragmentConsigne[] = [
  t("Le coefficient de Gini rapporte cette aire à celle du triangle sous la diagonale, qui vaut "),
  f("\\frac{1}{2}"),
  t(" : "),
  f("G=2\\displaystyle\\int_0^1\\left(x-L(x)\\right)dx"),
  t(", toujours compris entre 0 (égalité parfaite) et 1."),
];

function lignesLecture(e: ExerciceLorenzLecture): EtapeCorrection[] {
  const c = e.courbe;
  const p = decimalLatex(e.p, 1);
  const figure = figuresCorrigeSvg(e)[0];
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [t(`La part des revenus détenue par les ${decimalTexte(e.p * 100, 0)} % ${e.contexte === "pays" ? "les plus pauvres" : "les moins bien payés"} est l'image de `), f(p), t(" par L.")] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(substitutionLatex(e))] },
    { label: "Conclusion", sousQuestion: "a", fragments: reponseEtape(e, "valeur") },
    { label: "Conclusion", sousQuestion: "b", fragments: reponseChoix(e, "interpretation") },
    { label: "Piège", sousQuestion: "b", fragments: [t("Lire à l'envers : "), f(p), t(" est une part de la POPULATION (en abscisse), "), f(`L(${p})`), t(" une part des REVENUS (en ordonnée). Les plus riches détiennent le reste, "), f(`1-L(${p})`), t(".")] },
    { label: "Méthode", sousQuestion: "c", fragments: METHODE_AIRE },
    { label: "Calcul", sousQuestion: "c", fragments: [f(calculAireLatex(c))] },
    { label: "Conclusion", sousQuestion: "c", fragments: reponseEtape(e, "aire"), figureHtml: figure },
    {
      label: "Piège",
      sousQuestion: "c",
      fragments: [
        t("Intégrer L au lieu de x − L(x) : on obtient l'aire SOUS la courbe, "),
        f(`\\displaystyle\\int_0^1 L(x)\\,dx=${aireSousCourbeLatex(c)}`),
        t(Math.abs(aireConcentration(c) - 0.25) < 1e-9 ? " — ici égale à l'aire cherchée par pure coïncidence (les deux aires valent un quart du carré), mais la méthode est fausse." : ", et non l'aire entre la diagonale et la courbe."),
      ],
    },
    { label: "Méthode", sousQuestion: "d", fragments: METHODE_GINI },
    { label: "Calcul", sousQuestion: "d", fragments: [f(`G=2\\times\\mathcal{A}${giniEgalLatex(c)}`)] },
    { label: "Conclusion", sousQuestion: "d", fragments: [...reponseEtape(e, "gini"), t(" : valeur bien comprise entre 0 et 1.")] },
    { label: "Piège", sousQuestion: "d", fragments: [t("Oublier le facteur 2 (donner l'aire "), f(`\\mathcal{A}${aireEgaleLatex(c)}`), t(" comme coefficient de Gini). Un coefficient supérieur à 1 ou négatif signale toujours une erreur.")] },
  ];
}

/** « = » devant un décimal exact au millième, « ≈ » devant un arrondi. */
function rel(v: number): string {
  return Math.abs(Math.round(v * 1000) / 1000 - v) < 1e-12 ? "=" : "\\approx ";
}

function lignesComparaison(e: ExerciceLorenzComparaison): EtapeCorrection[] {
  const figures = figuresCorrigeSvg(e);
  const ind = (i: number) => indiceCourbe(e, i as 0 | 1);
  const [g1, g2] = e.courbes.map(coefficientGini);
  const croisent = courbesSeCroisent(e.courbes[0], e.courbes[1]);
  const signe = g1 > g2 ? ">" : "<";
  return [
    { label: "Méthode", sousQuestion: "a", fragments: METHODE_AIRE },
    ...e.courbes.map((c, i) => ({ label: "Calcul", sousQuestion: "a", fragments: [f(`\\mathcal{A}_{${ind(i)}}=${calculAireLatex(c)}`)], figureHtml: figures[i] })),
    { label: "Conclusion", sousQuestion: "a", fragments: reponseEtape(e, "aires") },
    { label: "Méthode", sousQuestion: "b", fragments: METHODE_GINI },
    { label: "Calcul", sousQuestion: "b", fragments: liste(e.courbes.map((c, i) => `G_{${ind(i)}}=2\\,\\mathcal{A}_{${ind(i)}}${giniEgalLatex(c)}`)) },
    { label: "Piège", sousQuestion: "b", fragments: [t("Oublier le facteur 2 : on compare alors les aires, ce qui donne le même classement, mais les coefficients de Gini sont faux.")] },
    { label: "Méthode", sousQuestion: "c", fragments: [t("Plus le coefficient de Gini est grand, plus la répartition est inégalitaire. "), t(phraseCroisement(e))] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`G_{${ind(0)}}${rel(g1)}${decimalLatex(g1)}${signe}${decimalLatex(g2)}${rel(g2)}G_{${ind(1)}}`)] },
    { label: "Conclusion", sousQuestion: "c", fragments: [...reponseChoix(e, "verdict")] },
    {
      label: "Piège",
      sousQuestion: "c",
      fragments: croisent
        ? [t("Comparer les deux courbes en un seul point (par exemple en x = 0,5) : comme elles se croisent, la comparaison en un point peut donner la conclusion inverse.")]
        : [t("Croire que la courbe la plus éloignée de la diagonale est la plus égalitaire : c'est l'inverse, plus elle s'en éloigne, plus l'aire et G sont grands.")],
    },
  ];
}

function lignesParametre(e: ExerciceLorenzParametre): EtapeCorrection[] {
  const n = e.famille === "mixte2" ? 2 : 3;
  const primitive = n === 2 ? "\\dfrac{x^{3}}{3}" : "\\dfrac{x^{4}}{4}";
  const facteur = n === 2 ? "\\dfrac{1}{6}" : "\\dfrac{1}{4}";
  const multiplicateur = n === 2 ? 3 : 2;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [t("On met a en évidence dans la différence entre la diagonale et la courbe : "), f(`x-L(x)=x-ax^{${n}}-(1-a)x=a\\left(x-x^{${n}}\\right)`), t(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [f(`\\mathcal{A}(a)=a\\displaystyle\\int_0^1\\left(x-x^{${n}}\\right)dx=a\\left[\\dfrac{x^{2}}{2}-${primitive}\\right]_0^1=a\\times ${facteur}`)] },
    { label: "Conclusion", sousQuestion: "a", fragments: reponseEtape(e, "aireA") },
    { label: "Méthode", sousQuestion: "b", fragments: METHODE_GINI },
    { label: "Conclusion", sousQuestion: "b", fragments: [f(`G(a)=2\\times ${aireEnALatex(e)}=${giniEnALatex(e)}`)] },
    { label: "Calcul", sousQuestion: "c", fragments: [f(`${giniEnALatex(e)}=${decimalLatex(e.giniVise)}\\iff a=${multiplicateur}\\times ${decimalLatex(e.giniVise)}=${decimalLatex(e.a, 6)}`)] },
    { label: "Condition", sousQuestion: "c", fragments: [f(`0\\leq ${decimalLatex(e.a, 6)}\\leq 1`), t(" : la courbe obtenue est bien une courbe de Lorenz.")] },
    { label: "Conclusion", sousQuestion: "c", fragments: reponseEtape(e, "valeurA"), figureHtml: figuresCorrigeSvg(e)[0] },
    {
      label: "Piège",
      sousQuestion: "c",
      fragments: [
        t("Égaler l'aire (et non G) à la valeur visée : "),
        f(`${aireEnALatex(e)}=${decimalLatex(e.giniVise)}`),
        t(" donne "),
        f(`a=${decimalLatex(2 * e.a, 6)}`),
        ...(2 * e.a > 1
          ? [t(", impossible : avec a > 1, L n'est plus une courbe de Lorenz.")]
          : [t(", pour lequel le coefficient de Gini vaut en réalité "), f(decimalLatex(2 * e.giniVise)), t(", le double de la valeur visée.")]),
      ],
    },
  ];
}

function correctionDetaillee(e: ExerciceLorenzGini): EtapeCorrection[] {
  switch (e.variante) {
    case "lecture":
      return lignesLecture(e);
    case "comparaison":
      return lignesComparaison(e);
    case "parametre":
      return lignesParametre(e);
  }
}

function difficulte(e: ExerciceLorenzGini): 1 | 2 | 3 {
  if (e.variante === "lecture") return e.courbe.famille === "expo" ? 3 : 2;
  return 3;
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

function bareme(e: ExerciceLorenzGini): BaremeExercice {
  const r = (phase: PhaseLorenz) => reponseEtape(e, phase);
  const piegeFacteur2 = { description: [t("Facteur 2 oublié (aire donnée comme coefficient de Gini)")], cout: "−1" };
  const piegeSousCourbe = { description: [t("Aire sous la courbe de Lorenz au lieu de l'aire entre la diagonale et la courbe")], cout: "−1" };
  const accepte = [[t("Valeur exacte ou arrondie au millième ; pourcentage équivalent")]];
  switch (e.variante) {
    case "lecture":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: r("valeur"), points: 0.75 },
          { sousQuestion: "b", critere: [t("Phrase : "), ...r("interpretation")], points: 0.75 },
          { sousQuestion: "c", critere: [t("Aire posée "), f("\\int_0^1\\left(x-L(x)\\right)dx"), t(" et calculée : "), ...r("aire")], points: 1.5 },
          { sousQuestion: "d", critere: r("gini"), points: 1 },
        ],
        erreursFrequentes: [
          { description: [t("Interprétation à l'envers (part de la population et part des revenus échangées)")], cout: "0 pt sur l'interprétation" },
          piegeSousCourbe,
          piegeFacteur2,
          { description: [t("Coefficient de Gini supérieur à 1 ou négatif, sans réaction")], cout: "−0,5" },
        ],
        reponsesAcceptees: accepte,
      };
    case "comparaison":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          ...e.courbes.map((_, i) => ({ sousQuestion: "a", critere: [f(formatReponseAttenduePhaseLatex(e, "aires")[i])], points: 1 })),
          ...e.courbes.map((_, i) => ({ sousQuestion: "b", critere: [f(formatReponseAttenduePhaseLatex(e, "ginis")[i])], points: 0.5 })),
          { sousQuestion: "c", critere: [t("Conclusion justifiée par les deux coefficients : "), ...r("verdict")], points: 1 },
        ],
        erreursFrequentes: [
          piegeSousCourbe,
          piegeFacteur2,
          { description: [t("Conclusion inversée (le plus grand coefficient de Gini pris pour le plus égalitaire)")], cout: "0 pt sur la conclusion" },
          { description: [t("Conclusion tirée de la figure seule, sans les coefficients")], cout: "−0,5" },
        ],
        reponsesAcceptees: accepte,
      };
    case "parametre":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: r("aireA"), points: 1.5 },
          { sousQuestion: "b", critere: r("giniA"), points: 1 },
          { sousQuestion: "c", critere: [...r("valeurA"), t(", avec la vérification "), f("0\\leq a\\leq 1")], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [t("Aire égalée à la valeur visée (facteur 2 oublié)")], cout: "−1" },
          { description: [t("Valeur de a hors de [0 ; 1] acceptée sans remarque")], cout: "−0,5" },
          { description: [t("Erreur dans la mise en évidence de a ou dans la primitive")], cout: "−1" },
        ],
        reponsesAcceptees: [[t("Fraction ou décimal équivalent")]],
      };
  }
}

export const adaptateurEvaluationLorenzGini: AdaptateurFeuilleExercices<ExerciceLorenzGini> = {
  titreDocument: "Courbe de Lorenz et coefficient de Gini — Évaluation",
  nomFichierBase: "lorenz-gini",
  genererInstance: genererExerciceLorenzGini,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteLorenzGini),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilLorenzGini,
  calculatriceIndispensable: VARIANTES_CALCULATRICE_LORENZ,
};
