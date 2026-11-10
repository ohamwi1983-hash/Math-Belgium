import type { ExerciceFormeCanoniqueTransformation } from "../../core/formeCanoniqueTransformations.types";
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
import type { FonctionCanonique } from "../../moteur/verificationFormeCanoniqueTransformations";
import { calculerFormeGenerale, formatFonctionCanoniqueLatex, formatFormeGeneraleLatex } from "../../ui/formatFormeCanoniqueTransformations";
import { calculerViewBoxTransformation, evaluerCourbe, RATIO_GRAPHE } from "../../ui/mafsTransformation";
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

function aSigne(exercice: ExerciceFormeCanoniqueTransformation): number {
  return exercice.sox ? -exercice.ev / exercice.cv : exercice.ev / exercice.cv;
}

function fonctionFinale(exercice: ExerciceFormeCanoniqueTransformation): FonctionCanonique {
  return { numA: exercice.sox ? -exercice.ev : exercice.ev, denA: exercice.cv, p: exercice.xS, q: exercice.yS };
}

function formeCanoniqueLatex(exercice: ExerciceFormeCanoniqueTransformation): string {
  return formatFonctionCanoniqueLatex(fonctionFinale(exercice));
}

/** Fonction intermédiaire d'un écran, rebaptisée (`f_1`, `f_2`) : même formatage que l'écran. */
function intermediaire(nom: string, fonction: FonctionCanonique): string {
  return formatFonctionCanoniqueLatex(fonction).replace(/^f\(x\)/, `${nom}(x)`);
}

/** Nombre exact (entier ou fraction irréductible) en LaTeX. */
function nombreLatex(valeur: number): string {
  const brut = formatFractionIrreductible(valeur);
  const m = /^(-?)(\d+)\/(\d+)$/.exec(brut);
  return m ? `${m[1]}\\dfrac{${m[2]}}{${m[3]}}` : brut;
}

function entreParentheses(valeur: number): string {
  return valeur < 0 ? `\\left(${nombreLatex(valeur)}\\right)` : nombreLatex(valeur);
}

function graphe(exercice: ExerciceFormeCanoniqueTransformation): string {
  const params = { p: exercice.xS, q: exercice.yS, a: aSigne(exercice) };
  const reference = { p: 0, q: 0, a: 1 };
  const viewBox = calculerViewBoxTransformation(params, reference);
  const largeur = 420;
  const points: PointMarqueSvg[] = [{ x: params.p, y: params.q, forme: "point", label: `S(${params.p} ; ${params.q})`, labelPosition: params.a > 0 ? "dessous" : "dessus" }];
  return construireSvgFonction((x) => evaluerCourbe(params, x), { xMin: viewBox.x[0], xMax: viewBox.x[1], yMin: viewBox.y[0], yMax: viewBox.y[1] }, {
    largeur,
    hauteur: largeur / RATIO_GRAPHE,
    classe: "figure-corrige",
    points,
    courbesSecondaires: [{ evaluer: (x) => evaluerCourbe(reference, x) }],
    legende: [
      { texte: "parabole de f", couleur: "#1971c2" },
      { texte: "référence y = x²", couleur: "#8a8f98", pointilles: true },
    ],
  });
}

const CONSIGNE_A: FragmentConsigne[] = [texte("Écris f sous forme canonique "), latex("f(x) = a(x-p)^2 + q"), texte(" et donne les coordonnées de son sommet.")];
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
    questions: [
      { consigne: [texte("Retrouve les coordonnées du sommet de la parabole, puis écris la forme canonique complète de f(x).")] },
      { consigne: [texte("Choisis la translation horizontale (TH) à partir de "), latex("y = x^2"), texte(" et écris la fonction obtenue.")] },
      { consigne: [texte("Choisis l'étirement vertical (EV), la compression verticale (CV) et la symétrie d'axe Ox (SOX), et écris la fonction obtenue.")] },
      { consigne: [texte("Choisis la translation verticale (TV) et écris la fonction finale.")] },
    ],
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
    { type: "paragraphe", fragments: [texte(`Sommet : S(${exercice.xS} ; ${exercice.yS}).`)] },
    { type: "paragraphe", fragments: [texte("Forme canonique : "), latex(formeCanoniqueLatex(exercice))] },
  ];
}

function difficulteFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): 1 | 2 | 3 {
  return exercice.ev % exercice.cv !== 0 ? 3 : 2;
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
  return [texte("a) "), latex(formeCanoniqueLatex(exercice)), texte(`, S(${exercice.xS} ; ${exercice.yS}) ; b) ${texteTransformations(exercice)}.`)];
}

function reponseBreveFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): FragmentConsigne[] {
  return reponseBreveParQuestion(exercice);
}

function correctionDetailleeFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): EtapeCorrection[] {
  const { xS, yS } = exercice;
  const g = calculerFormeGenerale(exercice);
  const a = g.a / g.denominateur;
  const b = g.b / g.denominateur;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Le coefficient de "), latex("x^2"), texte(" est a ; l'abscisse du sommet est "), latex("x_S = -\\dfrac{b}{2a}"), texte(", son ordonnée "), latex("y_S = f(x_S)"), texte(".")] },
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [latex(`a = ${nombreLatex(a)}`), texte(", "), latex(`x_S = -\\dfrac{${nombreLatex(b)}}{2\\cdot ${entreParentheses(a)}} = ${xS}`), texte(", "), latex(`y_S = f(${xS}) = ${yS}`), texte(".")],
    },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(`\\displaystyle ${formeCanoniqueLatex(exercice)}`), texte(`, sommet S(${xS} ; ${yS}).`)] },
    {
      label: "TH",
      sousQuestion: "b",
      fragments: [texte(`${translation(xS, "horizontale", "la droite", "la gauche")[0].toUpperCase()}${translation(xS, "horizontale", "la droite", "la gauche").slice(1)} (TH = ${xS}) : `), latex(intermediaire("f_1", { numA: 1, denA: 1, p: xS, q: 0 })), texte(".")],
    },
    {
      label: "EV/CV/SOX",
      sousQuestion: "c",
      fragments: [
        texte(`${texteFacteur(exercice)[0].toUpperCase()}${texteFacteur(exercice).slice(1)} (EV/CV = ${formatFractionIrreductible(exercice.ev / exercice.cv)}), ${exercice.sox ? "symétrie d'axe Ox (a < 0)" : "pas de symétrie (a > 0)"} : `),
        latex(`\\displaystyle ${intermediaire("f_2", { ...fonctionFinale(exercice), q: 0 })}`),
        texte("."),
      ],
    },
    {
      label: "TV",
      sousQuestion: "d",
      fragments: [texte(`${translation(yS, "verticale", "le haut", "le bas")[0].toUpperCase()}${translation(yS, "verticale", "le haut", "le bas").slice(1)} (TV = ${yS}) : `), latex(`\\displaystyle ${formeCanoniqueLatex(exercice)}`), texte(".")],
      figureHtml: graphe(exercice),
    },
    {
      label: "Piège",
      sousQuestion: "a",
      fragments: [texte("Le coefficient a de la forme canonique est celui de "), latex("x^2"), texte(" dans la forme développée (il ne change pas) ; et le sommet "), latex(`x_S = ${xS}`), texte(xS === 0 ? " donne simplement " : " s'écrit "), latex(formatFonctionCanoniqueLatex({ numA: 1, denA: 1, p: xS, q: 0 }).replace(/^f\(x\) = /, "")), texte(" dans la forme canonique.")],
    },
  ];
}

function baremeFormeCanoniqueTransformations(exercice: ExerciceFormeCanoniqueTransformation): BaremeExercice {
  const erreurs: ErreurFrequente[] = [];
  if (exercice.xS !== 0) erreurs.push({ description: [texte("Signe de l'abscisse du sommet inversé dans la parenthèse")], cout: "−0,5 sur a), −0,5 sur la translation horizontale" });
  if (exercice.ev % exercice.cv !== 0) erreurs.push({ description: [texte("Rapport EV/CV inversé (étirement au lieu de compression)")], cout: "−0,5" });
  erreurs.push({ description: [texte("Coefficient a modifié en passant à la forme canonique")], cout: "−1" });
  return {
    reponseFinale: reponseBreveParQuestion(exercice),
    criteres: [
      { sousQuestion: "a", critere: [texte(`Sommet S(${exercice.xS} ; ${exercice.yS}) : `), latex("x_S = -\\dfrac{b}{2a}"), texte(" puis "), latex("y_S = f(x_S)")], points: 1 },
      { sousQuestion: "a", critere: [texte("Forme canonique "), latex(formeCanoniqueLatex(exercice))], points: 1 },
      { sousQuestion: "b", critere: [texte(`Translations horizontale (${exercice.xS}) et verticale (${exercice.yS})`)], points: 1 },
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

export const adaptateurEvaluationFormeCanoniqueTransformations: AdaptateurFeuilleExercices<ExerciceFormeCanoniqueTransformation> = {
  profilInstance: profilFormeCanoniqueTransformations,
  parametresAuChoix: PARAMETRES_PARABOLE,
  titreDocument: "Forme canonique et transformations — Évaluation",
  nomFichierBase: "forme-canonique-transformations",
  genererInstance: genererExerciceFormeCanoniqueTransformation,
  construireEnonce: construireEnonceFormeCanoniqueTransformations,
  construireCorrection: construireCorrectionFormeCanoniqueTransformations,
  difficulte: difficulteFormeCanoniqueTransformations,
  reponseBreve: reponseBreveFormeCanoniqueTransformations,
  correctionDetaillee: correctionDetailleeFormeCanoniqueTransformations,
  bareme: baremeFormeCanoniqueTransformations,
  enoncePapier: enoncePapierFormeCanoniqueTransformations,
  dureeMinutes: 7,
};
