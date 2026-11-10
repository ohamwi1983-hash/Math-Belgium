import type { ExerciceTransformationGraphique } from "../../core/transformationsGraphiques.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { construireSvgFonction, type PointMarqueSvg } from "../../../export/svgGraph";
import { calculerViewBoxTransformation, evaluerCourbe, parametresDepuisExercice, pointUnitaire, RATIO_GRAPHE } from "../../ui/mafsTransformation";
import { formatEquationTransformationLatex } from "../../ui/formatTransformationsGraphiques";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { calculerA } from "../../moteur/verificationTransformationsGraphiques";
import { genererExerciceTransformationGraphique } from "./index";
import { PARAMETRES_PARABOLE, profilTransformationsGraphiques } from "../profilsEvaluation4eCh1";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceTransformationGraphique>` pour gen8
 * (Transformations graphiques d'une parabole, chapitre 1, `AppTransformationsGraphiques.tsx`) —
 * feuille d'exercices et évaluation.
 *
 * L'écran unique fait lire TH/TV/EV/CV/SOX avec des curseurs, puis écrire l'équation, sur le
 * graphique de la parabole dont la légende donne les coordonnées du sommet et du « point croix »
 * (abscisse p + 1, où l'argument du carré vaut 1 — `pointUnitaire`). Sur papier : l'énoncé reprend
 * le graphique et ces deux points (coordonnées souvent fractionnaires, illisibles sur un quadrillage
 * imprimé), avec la consigne globale « détermine l'équation » ; la lecture des paramètres (premier
 * volet de l'écran) devient l'étape 1 du corrigé, l'équation l'étape 2. EV et CV ne sont jamais
 * demandés séparément : seul leur rapport |a| compte (plusieurs réglages possibles à l'écran).
 *
 * Toutes les valeurs viennent des fonctions de l'écran : `formatEquationTransformationLatex`
 * (réponse attendue), `pointUnitaire`/`evaluerCourbe`/`calculerViewBoxTransformation` (graphique).
 */

const FORME_GENERALE = "f(x) = a(x-p)^2 + q";

function graphe(exercice: ExerciceTransformationGraphique, estCorrige: boolean): string {
  const params = parametresDepuisExercice(exercice);
  const reference = { p: 0, q: 0, a: 1 };
  const viewBox = estCorrige ? calculerViewBoxTransformation(params, reference) : calculerViewBoxTransformation(params);
  const croix = pointUnitaire(params);
  const largeur = estCorrige ? 420 : 320;
  const points: PointMarqueSvg[] = [
    { x: params.p, y: params.q, forme: "point", label: estCorrige ? `S(${params.p} ; ${params.q})` : undefined, labelPosition: croix.y >= params.q ? "dessous" : "dessus" },
    {
      x: croix.x,
      y: croix.y,
      forme: "croix",
      label: estCorrige ? `(${formatFractionIrreductible(croix.x)} ; ${formatFractionIrreductible(croix.y)})` : undefined,
      labelPosition: croix.y >= params.q ? "dessus" : "dessous",
    },
  ];
  return construireSvgFonction((x) => evaluerCourbe(params, x), { xMin: viewBox.x[0], xMax: viewBox.x[1], yMin: viewBox.y[0], yMax: viewBox.y[1] }, {
    largeur,
    hauteur: largeur / RATIO_GRAPHE,
    classe: estCorrige ? "figure-corrige" : "graphe-transformation",
    points,
    courbesSecondaires: estCorrige ? [{ evaluer: (x) => evaluerCourbe(reference, x) }] : undefined,
    legende: estCorrige
      ? [
          { texte: "parabole donnée", couleur: "#1971c2" },
          { texte: "référence y = x²", couleur: "#8a8f98", pointilles: true },
        ]
      : undefined,
  });
}

/** Nombre exact (entier ou fraction irréductible) en LaTeX. */
function nombreLatex(valeur: number): string {
  const brut = formatFractionIrreductible(valeur);
  const m = /^(-?)(\d+)\/(\d+)$/.exec(brut);
  return m ? `${m[1]}\\dfrac{${m[2]}}{${m[3]}}` : brut;
}

function coordonneesLatex(x: number, y: number): string {
  return `\\left(${nombreLatex(x)}\\,;\\,${nombreLatex(y)}\\right)`;
}

/** Données lues sur le graphique, comme dans la légende de l'écran (`MafsGraphTransformation`). */
function donneesGraphique(exercice: ExerciceTransformationGraphique): FragmentConsigne[] {
  const params = parametresDepuisExercice(exercice);
  const croix = pointUnitaire(params);
  return [texte("Sommet (•) : "), latex(coordonneesLatex(params.p, params.q)), texte(" ; point croix (×) : "), latex(coordonneesLatex(croix.x, croix.y)), texte(".")];
}

const PHRASE_GRAPHIQUE = "Le graphique ci-dessous représente une parabole, obtenue en transformant la parabole de référence ";

function equationLatex(exercice: ExerciceTransformationGraphique): string {
  return formatEquationTransformationLatex(exercice);
}

function aLatex(exercice: ExerciceTransformationGraphique): string {
  return nombreLatex(calculerA(exercice));
}

function construireEnonceTransformationsGraphiques(exercice: ExerciceTransformationGraphique): SectionExercice {
  return {
    enteteFragments: [texte(PHRASE_GRAPHIQUE), latex("y = x^2"), texte(". "), ...donneesGraphique(exercice)],
    enteteHtml: graphe(exercice, false),
    questions: [
      { consigne: [texte("Lis les paramètres de la transformation : les translations (TH, TV) au sommet, puis l'étirement ou la compression (rapport EV/CV) et la symétrie d'axe Ox (SOX) à l'aide du point croix.")] },
      { consigne: [texte("Écris l'équation complète de la parabole sous la forme "), latex(FORME_GENERALE), texte(".")] },
    ],
  };
}

/** Énoncé papier : le graphique, ses deux points et la consigne globale (les deux volets de l'écran
 * deviennent les étapes du corrigé). */
function enoncePapierTransformationsGraphiques(exercice: ExerciceTransformationGraphique): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte(PHRASE_GRAPHIQUE),
        latex("y = x^2"),
        texte(". "),
        ...donneesGraphique(exercice),
        texte(" Détermine l'équation de cette parabole sous la forme "),
        latex(FORME_GENERALE),
        texte("."),
      ],
      enteteHtml: graphe(exercice, false),
      questions: [],
    },
  };
}

function construireCorrectionTransformationsGraphiques(exercice: ExerciceTransformationGraphique): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte("Sommet lu sur le graphique : "), latex(`S(${exercice.p} ; ${exercice.q})`), texte(", donc p et q sont connus.")] },
    { type: "html", html: graphe(exercice, true) },
    { type: "paragraphe", fragments: [texte("Équation : "), latex(equationLatex(exercice)), texte(".")] },
  ];
}

function translationTexte(valeur: number, sens: string, positif: string, negatif: string): string {
  if (valeur === 0) return `pas de translation ${sens}`;
  return `translation ${sens} de ${Math.abs(valeur)} unité${Math.abs(valeur) > 1 ? "s" : ""} vers ${valeur > 0 ? positif : negatif}`;
}

function lectureFacteur(exercice: ExerciceTransformationGraphique): FragmentConsigne[] {
  const a = Math.abs(calculerA(exercice));
  const morceaux: FragmentConsigne[] = [latex(`|a| = ${nombreLatex(a)}`)];
  if (a > 1) morceaux.push(texte(` : étirement vertical (EV/CV = ${formatFractionIrreductible(a)})`));
  else if (a < 1) morceaux.push(texte(` : compression verticale (EV/CV = ${formatFractionIrreductible(a)})`));
  else morceaux.push(texte(" : ni étirement ni compression"));
  morceaux.push(texte(exercice.sox ? " ; le point croix est SOUS le sommet : symétrie d'axe Ox, a < 0." : " ; le point croix est au-dessus du sommet : pas de symétrie, a > 0."));
  return morceaux;
}

function difficulteTransformationsGraphiques(exercice: ExerciceTransformationGraphique): 1 | 2 | 3 {
  if (exercice.ev % exercice.cv !== 0) return 3;
  if (exercice.ev !== exercice.cv || exercice.sox) return 2;
  return 1;
}

function reponseBreveTransformationsGraphiques(exercice: ExerciceTransformationGraphique): FragmentConsigne[] {
  return [latex(equationLatex(exercice))];
}

function correctionDetailleeTransformationsGraphiques(exercice: ExerciceTransformationGraphique): EtapeCorrection[] {
  const params = parametresDepuisExercice(exercice);
  const croix = pointUnitaire(params);
  const dy = croix.y - params.q;
  return [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("Le sommet "), latex("(0\\,;\\,0)"), texte(" de "), latex("y = x^2"), texte(" a été amené en S par les translations : TH = p et TV = q.")],
    },
    {
      label: "Lecture",
      sousQuestion: "a",
      fragments: [
        texte("Sommet "),
        latex(coordonneesLatex(exercice.p, exercice.q)),
        texte(` : ${translationTexte(exercice.p, "horizontale", "la droite", "la gauche")}, ${translationTexte(exercice.q, "verticale", "le haut", "le bas")}.`),
      ],
      figureHtml: graphe(exercice, true),
    },
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("Pour "), latex("y = x^2"), texte(", le point d'abscisse 1 est "), latex("(1\\,;\\,1)"), texte(" : 1 unité au-dessus du sommet. Ici, le point croix (1 unité à droite du sommet) est à "), latex("a"), texte(" unité(s) du sommet en hauteur.")],
    },
    { label: "Calcul", sousQuestion: "a", fragments: [texte("Point croix "), latex(coordonneesLatex(croix.x, croix.y)), texte(" : "), latex(`a = ${nombreLatex(croix.y)} - ${exercice.q < 0 ? `(${exercice.q})` : exercice.q} = ${nombreLatex(dy)}`), texte(".")] },
    { label: "Lecture", sousQuestion: "a", fragments: lectureFacteur(exercice) },
    { label: "Conclusion", sousQuestion: "b", fragments: [texte("Avec "), latex(`a = ${aLatex(exercice)}`), texte(", "), latex(`p = ${exercice.p}`), texte(" et "), latex(`q = ${exercice.q}`), texte(" : "), latex(equationLatex(exercice)), texte(".")] },
    {
      label: "Piège",
      sousQuestion: "b",
      fragments: [texte("Dans la parenthèse, on soustrait l'abscisse du sommet : un sommet en x = 3 donne "), latex("(x - 3)^2"), texte(", un sommet en x = −2 donne "), latex("(x + 2)^2"), texte(" (et non "), latex("(x - 2)^2"), texte(").")],
    },
  ];
}

function baremeTransformationsGraphiques(exercice: ExerciceTransformationGraphique): BaremeExercice {
  const erreurs: ErreurFrequente[] = [];
  if (exercice.p !== 0) {
    erreurs.push({
      description: [texte("Signe de p inversé : "), latex(exercice.p > 0 ? `(x + ${exercice.p})^2` : `(x - ${-exercice.p})^2`), texte(" au lieu de "), latex(exercice.p > 0 ? `(x - ${exercice.p})^2` : `(x + ${-exercice.p})^2`)],
      cout: "−1",
    });
  }
  if (exercice.ev !== exercice.cv) erreurs.push({ description: [texte("a lu comme l'ordonnée du point croix (sans retrancher q) ou inversé (CV/EV au lieu de EV/CV)")], cout: "−1" });
  if (exercice.sox) erreurs.push({ description: [texte("Signe « − » de a oublié (parabole tournée vers le bas)")], cout: "−1" });
  return {
    reponseFinale: [latex(equationLatex(exercice))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Translations lues au sommet "), latex(coordonneesLatex(exercice.p, exercice.q))], points: 1 },
      { sousQuestion: "a", critere: [texte("Valeur absolue de a déduite du point croix : "), latex(`|a| = ${nombreLatex(Math.abs(calculerA(exercice)))}`)], points: 1 },
      { sousQuestion: "a", critere: [texte(exercice.sox ? "Signe de a négatif (symétrie d'axe Ox) justifié" : "Signe de a positif (pas de symétrie) justifié")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Équation complète et correcte (signes de p et q compris)")], points: 1.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute écriture équivalente de a (fraction non réduite, décimal exact, fraction devant ou dans la parenthèse)")], [texte("Forme développée correcte, si la forme demandée est aussi donnée")]],
  };
}

export const adaptateurEvaluationTransformationsGraphiques: AdaptateurFeuilleExercices<ExerciceTransformationGraphique> = {
  profilInstance: profilTransformationsGraphiques,
  parametresAuChoix: PARAMETRES_PARABOLE,
  titreDocument: "Transformations graphiques d'une parabole — Évaluation",
  nomFichierBase: "transformations-graphiques",
  genererInstance: genererExerciceTransformationGraphique,
  construireEnonce: construireEnonceTransformationsGraphiques,
  construireCorrection: construireCorrectionTransformationsGraphiques,
  difficulte: difficulteTransformationsGraphiques,
  reponseBreve: reponseBreveTransformationsGraphiques,
  correctionDetaillee: correctionDetailleeTransformationsGraphiques,
  bareme: baremeTransformationsGraphiques,
  enoncePapier: enoncePapierTransformationsGraphiques,
  dureeMinutes: 5,
};
