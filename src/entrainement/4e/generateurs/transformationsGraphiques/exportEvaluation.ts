import type { ExerciceTransformationGraphique } from "../../core/transformationsGraphiques.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { aTransformation, correctionDetailleeTransformationsGraphiques, equationTransformationLatex } from "./corrigeDetaille";
import { svgParabole } from "../../ui/figureParabole";
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
 * (abscisse p + 1, où l'argument du carré vaut 1 — `pointUnitaire`). Sur papier (décision de
 * l'utilisateur) : la courbe SEULE, sans point marqué ni coordonnée, sur un quadrillage dont le pas
 * fait tomber le sommet et ce point sur des intersections (`cadrageLisible`), avec la consigne
 * globale « détermine l'équation » ; la lecture des paramètres (premier
 * volet de l'écran) devient l'étape 1 du corrigé, l'équation l'étape 2. EV et CV ne sont jamais
 * demandés séparément : seul leur rapport |a| compte (plusieurs réglages possibles à l'écran).
 *
 * Toutes les valeurs viennent des fonctions de l'écran : `formatEquationTransformationLatex`
 * (réponse attendue), `pointUnitaire`/`evaluerCourbe`/`calculerViewBoxTransformation` (graphique).
 */

const FORME_GENERALE = "f(x) = a(x-x_S)^2 + y_S";

/** Graphique papier (décision de l'utilisateur, audit 4e ch. 1, G5) : UNE seule échelle pour x et y
 * (`figureParabole.ts`), sommet et point croix sur des intersections. Énoncé : la courbe seule ;
 * corrigé : sommet et point croix étiquetés, y = x² en pointillés. */
function graphe(exercice: ExerciceTransformationGraphique, estCorrige: boolean): string {
  return svgParabole(aTransformation(exercice), exercice.p, exercice.q, { annote: estCorrige });
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

const PHRASE_GRAPHIQUE = "Le graphique ci-dessous représente une parabole, obtenue en transformant la parabole de référence ";

/** Équation de l'écran, en `\\displaystyle` : la fraction de a reste lisible sur papier. */
function equationLatex(exercice: ExerciceTransformationGraphique): string {
  return `\\displaystyle ${equationTransformationLatex(exercice)}`;
}


function construireEnonceTransformationsGraphiques(exercice: ExerciceTransformationGraphique): SectionExercice {
  return {
    enteteFragments: [texte(PHRASE_GRAPHIQUE), latex("y = x^2"), texte(".")],
    enteteHtml: graphe(exercice, false),
    questions: [
      {
        consigne: [
          texte("Lis les paramètres de la transformation (translations, étirement ou compression, symétrie d'axe Ox), puis écris l'équation complète de la parabole sous la forme "),
          latex(FORME_GENERALE),
          texte("."),
        ],
      },
    ],
  };
}

/** Énoncé papier : le graphique (courbe seule) et la consigne globale (les deux volets de l'écran
 * deviennent les étapes du corrigé). */
function enoncePapierTransformationsGraphiques(exercice: ExerciceTransformationGraphique): EnoncePapier {
  return {
    section: {
      enteteFragments: [
        texte(PHRASE_GRAPHIQUE),
        latex("y = x^2"),
        texte(". Détermine l'équation de cette parabole sous la forme "),
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
    { type: "paragraphe", fragments: [texte("Sommet lu sur le graphique : "), latex(`S(${exercice.p} ; ${exercice.q})`), texte(" : les translations TH et TV sont connues.")] },
    { type: "html", html: graphe(exercice, true) },
    { type: "paragraphe", fragments: [texte("Équation : "), latex(equationLatex(exercice)), texte(".")] },
  ];
}

function reponseBreveTransformationsGraphiques(exercice: ExerciceTransformationGraphique): FragmentConsigne[] {
  return [latex(equationLatex(exercice))];
}

function baremeTransformationsGraphiques(exercice: ExerciceTransformationGraphique): BaremeExercice {
  const erreurs: ErreurFrequente[] = [];
  if (exercice.p !== 0) {
    erreurs.push({
      description: [texte("Signe de l'abscisse du sommet inversé dans la parenthèse : "), latex(exercice.p > 0 ? `(x + ${exercice.p})^2` : `(x - ${-exercice.p})^2`), texte(" au lieu de "), latex(exercice.p > 0 ? `(x - ${exercice.p})^2` : `(x + ${-exercice.p})^2`)],
      cout: "−1",
    });
  }
  if (exercice.ev !== exercice.cv) erreurs.push({ description: [texte("a lu comme l'ordonnée du point croix (sans retrancher l'ordonnée du sommet) ou inversé (CV/EV au lieu de EV/CV)")], cout: "−1" });
  if (exercice.sox) erreurs.push({ description: [texte("Signe « − » de a oublié (parabole tournée vers le bas)")], cout: "−1" });
  return {
    reponseFinale: [latex(equationLatex(exercice))],
    criteres: [
      { sousQuestion: "a", critere: [texte("Translations lues au sommet "), latex(coordonneesLatex(exercice.p, exercice.q))], points: 1 },
      { sousQuestion: "a", critere: [texte("Valeur absolue de a déduite du point croix (une unité à droite du sommet) : "), latex(`|a| = ${nombreLatex(Math.abs(calculerA(exercice)))}`)], points: 1 },
      { sousQuestion: "a", critere: [texte(exercice.sox ? "Signe de a négatif (symétrie d'axe Ox) justifié" : "Signe de a positif (pas de symétrie) justifié")], points: 0.5 },
      { sousQuestion: "a", critere: [texte("Équation complète et correcte (signes dans la parenthèse et translation verticale compris)")], points: 1.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute écriture équivalente de a (fraction non réduite, décimal exact)")], [texte("Forme développée correcte, si la forme demandée est aussi donnée")]],
  };
}

/** Critères du niveau : un seul écran (lecture puis équation, une lettre) ; méthode 0 (imposée) ;
 * piège dans les données : sommet d'abscisse négative (un « + » dans la parenthèse). */
function criteresDifficulteTransformationsGraphiques(exercice: ExerciceTransformationGraphique): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeTransformationsGraphiques(exercice)), methode: 0, piege: exercice.p < 0 ? 1 : 0 };
}

export const adaptateurEvaluationTransformationsGraphiques: AdaptateurFeuilleExercices<ExerciceTransformationGraphique> = {
  profilInstance: profilTransformationsGraphiques,
  parametresAuChoix: PARAMETRES_PARABOLE,
  titreDocument: "Transformations graphiques d'une parabole — Évaluation",
  nomFichierBase: "transformations-graphiques",
  genererInstance: genererExerciceTransformationGraphique,
  construireEnonce: construireEnonceTransformationsGraphiques,
  construireCorrection: construireCorrectionTransformationsGraphiques,
  criteresDifficulte: criteresDifficulteTransformationsGraphiques,
  reponseBreve: reponseBreveTransformationsGraphiques,
  correctionDetaillee: correctionDetailleeTransformationsGraphiques,
  bareme: baremeTransformationsGraphiques,
  enoncePapier: enoncePapierTransformationsGraphiques,
};
