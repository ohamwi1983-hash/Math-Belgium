import type { ExerciceFormeCanoniqueTransformation } from "../../core/formeCanoniqueTransformations.types";
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
import { consigneEtapeFormeCanonique, correctionDetailleeFormeCanoniqueTransformations, formeCanoniqueFinaleLatex, PHASES_FORME_CANONIQUE } from "./corrigeDetaille";
import { formatFormeGeneraleLatex } from "../../ui/formatFormeCanoniqueTransformations";
import { formatFractionIrreductible } from "../../ui/formatFraction";
import { genererExerciceFormeCanoniqueTransformation } from "./index";
import { PARAMETRES_PARABOLE, profilFormeCanoniqueTransformations } from "../profilsEvaluation4eCh1";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFormeCanoniqueTransformation>` pour gen9 (Forme
 * canonique et transformations, chapitre 1, `AppFormeCanoniqueTransformations.tsx`) — feuille
 * d'exercices et évaluation.
 *
 * Les 4 écrans : (1) sommet et forme canonique, (2) translation horizontale → (x − x_S)²,
 * (3) EV/CV/SOX → a(x − x_S)², (4) translation verticale → a(x − x_S)² + y_S. Sur papier, deux VRAIES
 * questions distinctes (le titre du générateur) : a) la forme canonique et le sommet (écran 1),
 * b) les transformations qui mènent de y = x² à la parabole de f (écrans 2 à 4, uniques ici : seul le
 * rapport EV/CV compte, jamais EV et CV séparément). Les fonctions intermédiaires des écrans 2 à 4
 * sont des étapes de guidage : elles passent dans le corrigé.
 *
 * Toutes les valeurs viennent des fonctions de l'écran : `formatFormeGeneraleLatex` (énoncé),
 * `formatFonctionCanoniqueLatex` (réponses et fonctions intermédiaires), `calculerFormeGenerale`
 * (coefficients exacts), `evaluerCourbe`/`calculerViewBoxTransformation` (graphique du corrigé).
 */

/** Nombre en TEXTE (« − » typographique). */
function t(valeur: number): string {
  return String(valeur).replace("-", "−");
}

const CONSIGNE_A: FragmentConsigne[] = [texte("Écris f sous forme canonique "), latex("f(x) = a(x-x_S)^2 + y_S"), texte(" et donne les coordonnées de son sommet.")];
const CONSIGNE_B: FragmentConsigne[] = [
  texte("Décris les transformations (translation horizontale, étirement ou compression verticale, symétrie d'axe Ox, translation verticale) qui permettent d'obtenir la parabole de f à partir de celle de "),
  latex("y = x^2"),
  texte("."),
];

function entete(exercice: ExerciceFormeCanoniqueTransformation): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(`\\displaystyle ${formatFormeGeneraleLatex(exercice)}`), texte(".")];
}

/** Étapes = les 4 écrans du générateur. */
function construireEnonceFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): SectionExercice {
  return {
    enteteFragments: entete(exercice),
    questions: PHASES_FORME_CANONIQUE.map((phase) => ({ consigne: consigneEtapeFormeCanonique(phase) })),
  };
}

function enoncePapierFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): EnoncePapier {
  return {
    section: { enteteFragments: entete(exercice), questions: [{ consigne: CONSIGNE_A }, { consigne: CONSIGNE_B }] },
    etapesParQuestion: [["a"], ["b", "c", "d"]],
    reponseBreve: reponseBreveParQuestion(exercice),
  };
}

function construireCorrectionFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): BlocCorrection[] {
  return [
    { type: "paragraphe", fragments: [texte(`Sommet : S(${t(exercice.xS)} ; ${t(exercice.yS)}).`)] },
    { type: "paragraphe", fragments: [texte("Forme canonique : "), latex(formeCanoniqueFinaleLatex(exercice))] },
  ];
}

function texteFacteur(exercice: ExerciceFormeCanoniqueTransformation): string {
  const r = exercice.ev / exercice.cv;
  if (r > 1) return `étirement vertical de rapport ${formatFractionIrreductible(r)}`;
  if (r < 1) return `compression verticale de rapport ${formatFractionIrreductible(r)}`;
  return "ni étirement ni compression";
}

function translation(valeur: number, sens: string, positif: string, negatif: string): string {
  if (valeur === 0) return `pas de translation ${sens}`;
  return `translation ${sens} de ${Math.abs(valeur)} vers ${valeur > 0 ? positif : negatif}`;
}

function texteTransformations(exercice: ExerciceFormeCanoniqueTransformation): string {
  return [
    translation(exercice.xS, "horizontale", "la droite", "la gauche"),
    texteFacteur(exercice),
    exercice.sox ? "symétrie d'axe Ox" : "pas de symétrie",
    translation(exercice.yS, "verticale", "le haut", "le bas"),
  ].join(", ");
}

function reponseBreveParQuestion(exercice: ExerciceFormeCanoniqueTransformation): FragmentConsigne[] {
  return [texte("a) "), latex(formeCanoniqueFinaleLatex(exercice)), texte(`, S(${t(exercice.xS)} ; ${t(exercice.yS)}) ; b) ${texteTransformations(exercice)}.`)];
}

function reponseBreveFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): FragmentConsigne[] {
  return reponseBreveParQuestion(exercice);
}

function baremeFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): BaremeExercice {
  const erreurs: ErreurFrequente[] = [];
  if (exercice.xS !== 0) erreurs.push({ description: [texte("Signe de l'abscisse du sommet inversé dans la parenthèse")], cout: "−0,5 sur a), −0,5 sur la translation horizontale" });
  if (exercice.ev % exercice.cv !== 0) erreurs.push({ description: [texte("Rapport EV/CV inversé (étirement au lieu de compression)")], cout: "−0,5" });
  erreurs.push({ description: [texte("Coefficient a modifié en passant à la forme canonique")], cout: "−1" });
  return {
    reponseFinale: reponseBreveParQuestion(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte(`Sommet S(${t(exercice.xS)} ; ${t(exercice.yS)}) : `), latex("x_S = -\\dfrac{b}{2a}"), texte(" puis "), latex("y_S = f(x_S)")], points: 1 },
      { sousQuestion: "a", critere: [texte("Forme canonique "), latex(formeCanoniqueFinaleLatex(exercice))], points: 1 },
      { sousQuestion: "b", critere: [texte(`Translations horizontale (${t(exercice.xS)}) et verticale (${t(exercice.yS)})`)], points: 1 },
      { sousQuestion: "c", critere: [texte(`${texteFacteur(exercice)[0].toUpperCase()}${texteFacteur(exercice).slice(1)} et ${exercice.sox ? "symétrie d'axe Ox" : "absence de symétrie"}`)], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Coefficient a écrit sous une autre forme exacte (fraction non réduite, décimal exact)")],
      [texte("Sommet obtenu en complétant le carré plutôt qu'avec la formule "), latex("x_S = -\\dfrac{b}{2a}")],
      [texte("Étirement et compression décrits ensemble par le rapport EV/CV")],
    ],
  };
}

/** Critères du niveau : étapes = écrans du corrigé ; lectures : TH = x_S et TV = y_S (b, d), relus sur
 * la forme canonique trouvée en a) ; méthode 0 (imposée) ; piège dans les données : x_S < 0 (un
 * « + » dans la parenthèse). */
function criteresDifficulteFormeCanonique(exercice: ExerciceFormeCanoniqueTransformation): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeFormeCanoniqueTransformations(exercice), ["b", "d"]), methode: 0, piege: exercice.xS < 0 ? 1 : 0 };
}

export const adaptateurEvaluationFormeCanoniqueTransformations: AdaptateurFeuilleExercices<ExerciceFormeCanoniqueTransformation> = {
  profilInstance: profilFormeCanoniqueTransformations,
  parametresAuChoix: PARAMETRES_PARABOLE,
  titreDocument: "Forme canonique et transformations — Évaluation",
  nomFichierBase: "forme-canonique-transformations",
  genererInstance: genererExerciceFormeCanoniqueTransformation,
  construireEnonce: construireEnonceFormeCanoniqueTransformations,
  construireCorrection: construireCorrectionFormeCanoniqueTransformations,
  criteresDifficulte: criteresDifficulteFormeCanonique,
  reponseBreve: reponseBreveFormeCanoniqueTransformations,
  correctionDetaillee: correctionDetailleeFormeCanoniqueTransformations,
  bareme: baremeFormeCanoniqueTransformations,
  enoncePapier: enoncePapierFormeCanoniqueTransformations,
};
