import type { ExerciceRelationsRacines } from "../../core/relationsRacines.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { formatEnonceLatex } from "../../ui/formatEquation";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeRelationsRacines, equationUnitaireLatex, factorisationLatex } from "./corrigeDetaille";
import { sommeEtProduitAttendus } from "../../moteur/verificationRelationsRacines";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceRelationsRacines, type VarianteRelationsRacinesId } from "./index";
import { profilRelationsRacines, LIBELLE_CAS_RELATIONS_RACINES } from "../profilsEvaluation4eCh2Ch3";

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



/** Consignes des trois questions (= des trois écrans) — utilisées telles quelles par l'énoncé
 * papier ET comme étapes du corrigé. */
/** Consignes de l'ÉCRAN (le générateur révèle les racines à l'écran b, voir EtapeFactorisationRacines). */
function consignes(exercice: ExerciceRelationsRacines): FragmentConsigne[][] {
  const [x1, x2] = exercice.racines;
  const racines: FragmentConsigne[] =
    x1 === x2 ? [texte("Cette équation a une racine double, "), latex(`x_1 = x_2 = ${x1}`)] : [texte("Les racines de cette équation sont "), latex(`x_1 = ${x1}`), texte(" et "), latex(`x_2 = ${x2}`)];
  return [
    [texte("Calcule la somme S et le produit P des racines de cette équation, sans calculer les racines elles-mêmes.")],
    [...racines, texte(". Factorise le membre de gauche à partir de ces racines.")],
    [texte("Écris l'équation du second degré la plus simple (de coefficient a = 1) qui admet ces mêmes racines.")],
  ];
}

/** Consignes PAPIER : b) ne donne plus les racines — elles répondaient à a) (audit P1, 100 % des
 * tirages) ; l'élève les retrouve à partir de S et P. */
function consignesPapier(): FragmentConsigne[][] {
  return [
    [texte("Calcule la somme S et le produit P des racines de cette équation, sans calculer les racines elles-mêmes.")],
    [texte("À l'aide de a), retrouve les racines (deux nombres de somme S et de produit P), puis factorise le membre de gauche.")],
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
    section: { enteteFragments: enteteFragments(exercice), questions: consignesPapier().map((consigne) => ({ consigne })) },
    etapesParQuestion: [["a"], ["b"], ["c"]],
  };
}

function construireCorrection(exercice: ExerciceRelationsRacines): BlocCorrection[] {
  return correctionDetailleeRelationsRacines(exercice)
    .filter((l) => l.type === "resultat")
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

/** Niveau (grille commune) : trois questions, démarche imposée par chacune (méthode 0) ; piège dans
 * les données : un coefficient a ≠ 1 à garder devant la factorisation. */
function criteresDifficulte(exercice: ExerciceRelationsRacines): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeRelationsRacines(exercice)), methode: 0, piege: exercice.enonce.a === 1 ? 0 : 1 };
}

export const adaptateurEvaluationRelationsRacines: AdaptateurFeuilleExercices<ExerciceRelationsRacines> = {
  profilInstance: profilRelationsRacines,
  libelleCasParticulier: LIBELLE_CAS_RELATIONS_RACINES,
  titreDocument: "Relations entre racines et coefficients — Évaluation",
  nomFichierBase: "relations-racines-coefficients",
  genererInstance: genererExerciceRelationsRacines,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as VarianteRelationsRacinesId),
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeRelationsRacines,
  bareme,
  enoncePapier,
};
