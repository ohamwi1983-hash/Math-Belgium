import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeNatureQuadrilatere } from "./corrigeDetaille";
import type { ExerciceNatureQuadrilatere } from "../../core/natureQuadrilatere.types";
import { natureDe } from "../../moteur/modeleNatureQuadrilatere";
import { figureNatureQuadrilatereSvg } from "../../ui/figureNatureQuadrilatere";
import {
  consigneGenerale,
  consignesEcrans,
  consignesPapier,
  donneesFragments,
  libelleNature,
  pointLatex,
} from "../../ui/formatNatureQuadrilatere";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceNatureQuadrilatere } from "./index";
import { profilNatureQuadrilatere } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen84. Énoncé papier = points + figure (repère,
 * quadrilatère tracé, SANS codage) + consigne globale ; les vraies questions distinctes restent en
 * a) b) (« quatrième sommet » : trouver D, puis la nature ; « montrer » : montrer l'affirmation,
 * puis est-ce un carré). Les 4 écrans deviennent les étapes a, b, c, d du corrigé ; la figure codée
 * (angles droits, côtés égaux) est dans le corrigé (`figureHtml`, étape d). Séries équilibrées :
 * `profil.ts` (la nature, verdict, n'est jamais imposée entre séries).
 */

function enteteHtml(e: ExerciceNatureQuadrilatere): string {
  return figureNatureQuadrilatereSvg(e, "enonce");
}

function entete(e: ExerciceNatureQuadrilatere): FragmentConsigne[] {
  return [texte(consigneGenerale(e)), texte(" "), ...donneesFragments(e)];
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceNatureQuadrilatere): SectionExercice {
  return {
    enteteFragments: entete(e),
    enteteHtml: enteteHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceNatureQuadrilatere): EnoncePapier {
  const questions = consignesPapier(e).map((consigne) => ({ consigne }));
  return {
    section: {
      enteteFragments: [texte("Dans un repère orthonormé, on donne les points "), ...donneesFragments(e)],
      enteteHtml: enteteHtml(e),
      questions,
    },
    etapesParQuestion: etapesParQuestion(e),
    reponseBreve: reponseBreve(e),
  };
}

/** Étapes du corrigé couvertes par chaque question papier. « Montrer que c'est un rectangle » :
 * parallélogramme (a) + angle droit (c), puis « est-ce un carré ? » : côtés consécutifs (b) + d. */
function etapesParQuestion(e: ExerciceNatureQuadrilatere): string[][] {
  if (e.variante === "nature") return [["a", "b", "c", "d"]];
  if (e.variante === "quatrieme") return [["a"], ["b", "c", "d"]];
  return e.affirmation === "rectangle" ? [["a", "c"], ["b", "d"]] : [["a", "b"], ["c", "d"]];
}

function reponseBreve(e: ExerciceNatureQuadrilatere): FragmentConsigne[] {
  const n = natureDe(e);
  const nature = libelleNature(n).toLowerCase();
  if (e.variante === "quatrieme") return [texte("a) "), latex(pointLatex("D", e.D)), texte(` ; b) ABCD est un ${nature}.`)];
  if (e.variante === "montrer") {
    const preuve = e.affirmation === "rectangle" ? "parallélogramme avec un angle droit : c'est un rectangle" : "parallélogramme à côtés consécutifs égaux : c'est un losange";
    return [texte(`a) ABCD est un ${preuve}. b) ${n === "carre" ? "Oui, c'est même un carré." : "Non, ce n'est pas un carré."}`)];
  }
  return [texte(n === "quelconque" ? "ABCD est un quadrilatère quelconque (pas un parallélogramme)." : `ABCD est un ${nature}.`)];
}

function correctionDetaillee(e: ExerciceNatureQuadrilatere): EtapeCorrection[] {
  return correctionDetailleeNatureQuadrilatere(e);
}

/** Niveau : 4 écrans qui transforment (d combine les trois tests : une décision), méthode imposée
 * par la consigne d'écran mais choisie sur papier (« justifie par des calculs vectoriels ») → 1 ;
 * piège 0 (la nature est le verdict : constant, jamais lu dans l'instance). */
function criteresDifficulte(e: ExerciceNatureQuadrilatere): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeNatureQuadrilatere(e)), sansCharge: true, methode: 1, piege: 0, nombres: 0 };
}

function construireCorrection(e: ExerciceNatureQuadrilatere): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceNatureQuadrilatere): BaremeExercice {
  const erreurs: ErreurFrequente[] = [
    e.variante === "quatrieme"
      ? { description: [texte("D calculé avec "), latex("\\vec{AB} = \\vec{CD}"), texte(" (ordre des sommets)")], cout: "0 pt sur l'étape 1" }
      : { description: [texte("Comparaison de "), latex("\\vec{AB}"), texte(" avec "), latex("\\vec{CD}"), texte(" au lieu de "), latex("\\vec{DC}")], cout: "0 pt sur l'étape 1" },
    { description: [texte("Losange testé sur deux côtés opposés (toujours égaux dans un parallélogramme)")], cout: "0 pt sur l'étape 2" },
    { description: [texte("Rectangle ou losange conclu sans avoir montré le parallélogramme")], cout: "0 pt sur l'étape 4" },
    { description: [texte("Losange (ou rectangle) déclaré carré, ou carré réduit à losange ou rectangle")], cout: "moitié des points de l'étape 4" },
    { description: [texte("Norme laissée au carré (racine oubliée)")], cout: "0,5 pt" },
  ];
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      {
        sousQuestion: "a",
        critere: e.variante === "quatrieme" ? [texte("Composantes de "), latex("\\vec{AB}"), texte(" et coordonnées de D justes")] : [texte("Composantes de "), latex("\\vec{AB}"), texte(" et "), latex("\\vec{DC}"), texte(", comparaison correcte")],
        points: 1.5,
      },
      { sousQuestion: "b", critere: [texte("Normes de deux côtés consécutifs exactes et comparées")], points: 1 },
      { sousQuestion: "c", critere: [texte("Produit scalaire de "), latex("\\vec{AB}"), texte(" et "), latex("\\vec{BC}"), texte(" juste")], points: 1 },
      { sousQuestion: "d", critere: [texte("Nature exacte, déduite des trois tests dans le bon ordre")], points: 0.5 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Test du rectangle par Pythagore ou par l'égalité des diagonales ; losange par des diagonales perpendiculaires")]],
  };
}

export const adaptateurEvaluationNatureQuadrilatere: AdaptateurFeuilleExercices<ExerciceNatureQuadrilatere> = {
  profilInstance: profilNatureQuadrilatere,
  titreDocument: "Nature d'un quadrilatère — Évaluation",
  nomFichierBase: "nature-quadrilatere",
  genererInstance: genererExerciceNatureQuadrilatere,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
