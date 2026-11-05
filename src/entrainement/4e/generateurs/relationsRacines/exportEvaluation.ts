import type { ExerciceRelationsRacines } from "../../core/relationsRacines.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatEnonceLatex, formatFormeFactoriseeDepuisRacines, formatMembreGauche } from "../../ui/formatEquation";
import { sommeEtProduitAttendus } from "../../moteur/verificationRelationsRacines";
import { genererExerciceRelationsRacines } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceRelationsRacines>` pour gen67 (relations entre
 * racines et coefficients, `AppRelationsRacines.tsx`).
 *
 * Les trois écrans de l'appli sont trois compétences DISTINCTES du cours (relations de Viète,
 * factorisation à partir des racines, équation à partir des racines), pas des étapes de guidage
 * d'un même calcul : sur papier ce sont donc trois vraies questions a) b) c) (voir
 * `.claude/rules/feuilles-evaluations.md`), chacune couvrant l'étape de même lettre. b) donne
 * les racines, comme l'écran (`formatRacinesRevelees`, réécrit ici avec « et »). Toutes les valeurs viennent de l'instance et des mêmes
 * fonctions que l'appli (`sommeEtProduitAttendus`, `formatFormeFactoriseeDepuisRacines`,
 * `formatMembreGauche`) — jamais recalculées à part. Racines toujours entières (voir le générateur).
 */

function equationLatex(exercice: ExerciceRelationsRacines): string {
  return formatEnonceLatex(exercice.enonce);
}

function factorisationLatex(exercice: ExerciceRelationsRacines): string {
  return `${formatFormeFactoriseeDepuisRacines(exercice.enonce, exercice.racines)} = 0`;
}

function equationUnitaireLatex(exercice: ExerciceRelationsRacines): string {
  const { s, p } = sommeEtProduitAttendus(exercice);
  return `${formatMembreGauche({ a: 1, b: -s, c: p })} = 0`;
}

/** Consignes des trois questions (= des trois écrans) — utilisées telles quelles par l'énoncé
 * papier ET comme étapes du corrigé. */
function consignes(exercice: ExerciceRelationsRacines): FragmentConsigne[][] {
  const [x1, x2] = exercice.racines;
  const racines: FragmentConsigne[] =
    x1 === x2 ? [texte("Cette équation a une racine double, "), latex(`x_1 = x_2 = ${x1}`)] : [texte("Les racines de cette équation sont "), latex(`x_1 = ${x1}`), texte(" et "), latex(`x_2 = ${x2}`)];
  return [
    [texte("Calcule la somme S et le produit P des racines de cette équation, sans calculer les racines elles-mêmes.")],
    [...racines, texte(". Écris la factorisation de l'équation à partir de ces racines.")],
    [texte("Écris l'équation du second degré la plus simple (de coefficient a = 1) qui admet ces mêmes racines.")],
  ];
}

function enteteFragments(exercice: ExerciceRelationsRacines): FragmentConsigne[] {
  return [texte("On considère l'équation "), latex(equationLatex(exercice)), texte(".")];
}

function construireEnonce(exercice: ExerciceRelationsRacines): SectionExercice {
  return { enteteFragments: enteteFragments(exercice), questions: consignes(exercice).map((consigne) => ({ consigne })) };
}

function enoncePapier(exercice: ExerciceRelationsRacines): EnoncePapier {
  return {
    section: { enteteFragments: enteteFragments(exercice), questions: consignes(exercice).map((consigne) => ({ consigne })) },
    etapesParQuestion: [["a"], ["b"], ["c"]],
  };
}

function lignesCorrection(exercice: ExerciceRelationsRacines): EtapeCorrection[] {
  const { a, b, c } = exercice.enonce;
  const { s, p } = sommeEtProduitAttendus(exercice);
  const par = (n: number) => (n < 0 ? `(${n})` : String(n));
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Relations de Viète : "), latex("S = -\\dfrac{b}{a}"), texte(" et "), latex("P = \\dfrac{c}{a}"), texte(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`S = -\\dfrac{${b}}{${par(a)}} = ${s}`), texte(" ; "), latex(`P = \\dfrac{${c}}{${par(a)}} = ${p}`)] },
    { label: "Piège", sousQuestion: "a", fragments: [texte("Le signe moins de "), latex("S = -\\dfrac{b}{a}"), texte(" : S n'est pas "), latex("\\dfrac{b}{a}"), texte(".")] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Factorisation à partir des racines : "), latex("a(x - x_1)(x - x_2) = 0"), texte(", avec le même coefficient a que l'équation.")] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(factorisationLatex(exercice))] },
    { label: "Piège", sousQuestion: "b", fragments: [texte(a === 1 ? "Une racine négative donne un facteur avec un signe plus : " : "Oublier le coefficient a devant le produit change l'équation : "), latex(a === 1 ? "x - (-3) = x + 3" : `a = ${a}`), texte(".")] },
    { label: "Méthode", sousQuestion: "c", fragments: [texte("L'équation de coefficient 1 qui a ces racines est "), latex("x^2 - Sx + P = 0"), texte(", avec S et P de la question a).")] },
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(equationUnitaireLatex(exercice))] },
  ];
}

function construireCorrection(exercice: ExerciceRelationsRacines): BlocCorrection[] {
  return lignesCorrection(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l): BlocCorrection => ({ type: "paragraphe", fragments: [texte(`${l.sousQuestion}) `), ...l.fragments] }));
}

function reponseBreve(exercice: ExerciceRelationsRacines): FragmentConsigne[] {
  const { s, p } = sommeEtProduitAttendus(exercice);
  return [texte("a) "), latex(`S = ${s}`), texte(", "), latex(`P = ${p}`), texte(" ; b) "), latex(factorisationLatex(exercice)), texte(" ; c) "), latex(equationUnitaireLatex(exercice))];
}

function bareme(exercice: ExerciceRelationsRacines): BaremeExercice {
  const { s, p } = sommeEtProduitAttendus(exercice);
  return {
    reponseFinale: reponseBreve(exercice),
    criteres: [
      { sousQuestion: "a", critere: [latex(`S = ${s}`), texte(" (avec le signe de "), latex("-\\dfrac{b}{a}"), texte(")")], points: 0.75 },
      { sousQuestion: "a", critere: [latex(`P = ${p}`)], points: 0.75 },
      { sousQuestion: "b", critere: [texte("Factorisation avec le coefficient a : "), latex(factorisationLatex(exercice))], points: 1.25 },
      { sousQuestion: "c", critere: [texte("Équation "), latex("x^2 - Sx + P = 0"), texte(" correctement remplie : "), latex(equationUnitaireLatex(exercice))], points: 1.25 },
    ],
    erreursFrequentes: [
      { description: [latex("S = \\dfrac{b}{a}"), texte(" (signe oublié)")], cout: "0 pt sur S en a)" },
      ...(exercice.enonce.a === 1 ? [] : [{ description: [texte("Factorisation sans le coefficient a")], cout: "moitié des points en b)" }]),
      { description: [latex("x^2 + Sx + P = 0"), texte(" (signe devant S)")], cout: "0 pt en c)" },
    ],
    reponsesAcceptees: [[texte("Facteurs écrits dans un autre ordre en b)")], [texte("En a), S et P obtenus en calculant d'abord les racines (la consigne demande de ne pas le faire : accepter le résultat, signaler la méthode)")]],
  };
}

/** ★ si a = 1 (S et P se lisent presque directement) ; ★★ sinon. */
function difficulte(exercice: ExerciceRelationsRacines): 1 | 2 | 3 {
  return exercice.enonce.a === 1 ? 1 : 2;
}

export const adaptateurEvaluationRelationsRacines: AdaptateurFeuilleExercices<ExerciceRelationsRacines> = {
  titreDocument: "Relations entre racines et coefficients — Évaluation",
  nomFichierBase: "relations-racines-coefficients",
  genererInstance: genererExerciceRelationsRacines,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee: lignesCorrection,
  bareme,
  enoncePapier,
  dureeMinutes: 4,
};
