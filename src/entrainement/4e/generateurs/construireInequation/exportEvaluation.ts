import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceConstruireInequation } from "../../core/construireInequation.types";
import { aLatex, ensembleTexteLatex, libelleRelation, relationExemple } from "../../ui/formatConstruireInequation";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceConstruireInequation } from "./index";
import { profilConstruireInequation } from "./profil";
import { correctionDetailleeConstruireInequation } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { nombreLatex } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen120. Les trois écrans sont trois VRAIES
 * questions distinctes (une (in)équation quelconque, puis avec a imposé, puis la parabole par un
 * point) : elles restent en a) b) c) sur papier (exception prévue par la règle), une étape chacune.
 */

type E = ExerciceConstruireInequation;

function consignes(e: E): FragmentConsigne[][] {
  const nom = libelleRelation(e);
  const forme = e.variante === "equation" ? "ax^2+bx+c=0" : "ax^2+bx+c\\lozenge 0";
  return [
    [texte(`Écris une ${nom} du second degré, de la forme `), latex(forme), texte(", dont l'ensemble des solutions est S.")],
    [texte(`Écris une ${nom} de même solution S, de cette forme, avec `), latex(aLatex(e.aImpose)), texte(".")],
    [
      texte("La parabole d'équation "),
      latex("y=ax^2+bx+c"),
      texte(" coupe l'axe des x en "),
      latex(`x=${nombreLatex(e.r1)}`),
      texte(" et en "),
      latex(`x=${nombreLatex(e.r2)}\\text{,}`),
      texte(" et passe par le point "),
      latex(`P(${nombreLatex(e.x0)}\\,;${nombreLatex(e.y0)})\\text{.}`),
      texte(" Détermine a, b et c."),
    ],
  ];
}

function entete(e: E): FragmentConsigne[] {
  return [texte("On donne l'ensemble des solutions "), latex(`${ensembleTexteLatex(e)}\\text{.}`)];
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: entete(e), questions: consignes(e).map((consigne) => ({ consigne })) };
}

function abc(e: E): FragmentConsigne[] {
  return [latex(`a=${nombreLatex(e.a3)}`), texte(", "), latex(`b=${nombreLatex(-e.a3 * (e.r1 + e.r2))}`), texte(", "), latex(`c=${nombreLatex(e.a3 * e.r1 * e.r2)}`)];
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [texte("a) par exemple "), latex(relationExemple(e, e.den)), texte(" ; b) "), latex(relationExemple(e, e.aImpose)), texte(" ; c) "), ...abc(e)];
}

function enoncePapier(e: E): EnoncePapier {
  return { section: construireEnonce(e), etapesParQuestion: [["a"], ["b"], ["c"]], reponseBreve: reponseBreve(e) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const nom = libelleRelation(e);
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte(`${nom.charAt(0).toUpperCase() + nom.slice(1)} de solution S (racines et ${e.variante === "equation" ? "produit nul" : "symbole"})`)], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Coefficient imposé respecté, même solution")], points: 1 },
      { sousQuestion: "c", critere: [texte("a par le point P, puis b et c en développant")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [texte("Facteurs (x + r) au lieu de (x − r)")], cout: "0 pt sur l'étape 1" },
      ...(e.variante === "inequation" ? [{ description: [texte("Symbole non retourné avec a < 0 (ou intérieur et extérieur confondus)")], cout: "−1" }] : []),
      { description: [texte("Erreur de signe dans un facteur en remplaçant les coordonnées de P")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[texte(`a) et b) : toute ${nom} du second degré qui a exactement S pour ensemble de solutions (par exemple un multiple non nul, avec le symbole adapté)`)]],
  };
}

/** Niveau : trois étapes ; méthode 2 (démarche inverse construite par l'élève) ; piège dans les
 * données : coefficient imposé négatif dans une inéquation (sens à retourner). */
function criteresDifficulte(e: E): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeConstruireInequation(e)), methode: 2, piege: e.variante === "inequation" && e.aImpose < 0 ? 1 : 0 };
}

export const adaptateurEvaluationConstruireInequation: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilConstruireInequation,
  titreDocument: "Construire une inéquation à partir de sa solution — Évaluation",
  nomFichierBase: "construire-inequation",
  genererInstance: genererExerciceConstruireInequation,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeConstruireInequation,
  bareme,
  enoncePapier,
};
